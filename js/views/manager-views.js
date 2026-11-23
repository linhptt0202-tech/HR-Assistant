/**
 * AI-Assisted Performance & Bonus Hub
 * Manager Views: Subordinate Reviews, 2-Column Evaluation Form with Validation & AI Insights
 */

window.ManagerViews = {
  // Manager Dashboard (Design Prompt Mục 15.1 & 35)
  renderDashboard: function(data, container) {
    const session = window.AppStorage.getSession();
    const currentUser = window.AppStorage.getCurrentUser();
    const period = window.AppStorage.getActivePeriod();
    const evaluations = data.evaluations[period.id] || [];

    // Filter subordinates under current manager
    const subordinates = data.employees.filter(e => e.managerId === currentUser.id);

    const completedCount = subordinates.filter(sub => {
      const ev = evaluations.find(e => e.employeeId === sub.id);
      return ev && ev.managerReviewStatus === 'completed';
    }).length;

    const pendingCount = subordinates.length - completedCount;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Quản lý</span> / <span>Tổng quan</span>
          </div>
          <h1 class="page-title">Đánh giá Cấp dưới — ${period.name}</h1>
          <div class="page-subtitle">Đơn vị quản lý: <b>${currentUser.department}</b> | Quản lý: <b>${currentUser.name}</b></div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Nhân sự thuộc phạm vi quản lý</div>
          <div class="kpi-value">${subordinates.length} <span class="text-sm font-normal text-muted">nhân viên</span></div>
          <div class="kpi-sub">Thuộc phòng ${currentUser.department}</div>
        </div>

        <div class="kpi-card ${pendingCount === 0 ? 'kpi-success' : 'kpi-warning'}">
          <div class="kpi-label">Tiến độ chấm điểm của bạn</div>
          <div class="kpi-value">${completedCount}/${subordinates.length}</div>
          <div class="kpi-sub">${pendingCount === 0 ? 'Đã hoàn thành 100%' : `Còn ${pendingCount} nhân viên chưa hoàn tất`}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Hạn chót quản lý chấm</div>
          <div class="kpi-value text-danger" style="font-size: 18px;">${period.managerReviewDeadline}</div>
          <div class="kpi-sub">Quá hạn 3 ngày HR sẽ xử lý thay</div>
        </div>
      </div>

      <!-- Subordinates Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Danh sách nhân viên cần đánh giá</div>
          <span class="badge badge-manager-review">Chỉ hiển thị cấp dưới trực tiếp (BRL-07)</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Chức danh</th>
                <th>Tự đánh giá</th>
                <th>Điểm Tự chấm</th>
                <th>Quản lý đánh giá</th>
                <th>Điểm Quản lý</th>
                <th>Xếp hạng</th>
                <th style="text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${subordinates.map(emp => {
                const ev = evaluations.find(e => e.employeeId === emp.id);
                const isCompleted = ev && ev.managerReviewStatus === 'completed';
                const selfSubmitted = ev && ev.selfReviewStatus === 'submitted';
                const selfOverdue = ev && ev.selfReviewStatus === 'not_submitted';
                const isQuarter = period.type === 'quarter';
                const isMonth = period.type === 'month';

                const canReviewCheck = window.ValidationEngine.canManagerReviewEmployee(period, ev);
                const canReview = canReviewCheck.canReview;

                return `
                  <tr>
                    <td class="font-bold text-xs">${emp.code}</td>
                    <td class="font-semibold">${emp.name}</td>
                    <td>${emp.title}</td>
                    <td>
                      ${isMonth ? `<span class="text-xs text-muted">Kỳ tháng (QL chấm)</span>`
                        : selfSubmitted ? `<span class="badge badge-approved">Đã nộp phiếu</span>` 
                        : selfOverdue ? `<span class="badge badge-draft">Không tự đánh giá</span>`
                        : `<span class="badge badge-warning-normal">Chưa nộp (Chờ NV)</span>`}
                    </td>
                    <td>
                      ${selfSubmitted ? `<b>${ev.selfTotalScore.toFixed(2)}</b>` 
                        : isMonth ? '<span class="text-xs text-muted">-</span>' : '-'}
                    </td>
                    <td>
                      ${isCompleted ? `<span class="badge badge-approved">Đã chấm</span>` 
                        : !canReview ? `<span class="badge badge-warning-normal" title="${canReviewCheck.reason}">Chờ NV nộp trước</span>`
                        : `<span class="badge badge-manager-review">Chờ bạn chấm</span>`}
                    </td>
                    <td>${isCompleted ? `<b>${ev.managerTotalScore.toFixed(2)}</b>` : '-'}</td>
                    <td>
                      ${isCompleted ? `<span class="badge badge-rating badge-rating-${ev.rank ? ev.rank.toLowerCase() : 'b'}">${ev.rank || 'B'}</span>` : '-'}
                    </td>
                    <td style="text-align: right;">
                      <div class="flex justify-end gap-1">
                        ${selfSubmitted ? `
                          <button class="btn btn-sm btn-secondary" onclick="SharedViews.openSelfReviewModal('${emp.id}', '${period.id}')" title="Xem phiếu tự đánh giá của nhân viên">
                            Phiếu tự chấm
                          </button>
                        ` : ''}
                        ${!canReview ? `
                          <button class="btn btn-sm btn-secondary" onclick="alert('${canReviewCheck.reason}')" style="opacity: 0.6;" title="${canReviewCheck.reason}">
                            Chờ NV nộp
                          </button>
                        ` : `
                          <button class="btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}" onclick="ManagerViews.openReviewForm('${emp.id}')">
                            ${isCompleted ? 'Xem lại / Sửa' : 'Chấm điểm ngay'}
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 2-Column Manager Review Form (Design Prompt Mục 15.3 & 35)
  openReviewForm: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const currentUser = window.AppStorage.getCurrentUser();
    const employee = data.employees.find(e => e.id === employeeId);
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId) || {
      employeeId: employeeId,
      selfReviewStatus: 'not_submitted',
      selfScores: {},
      selfComments: {},
      managerScores: {},
      managerComments: {}
    };

    // Permission check (BRL-07)
    if (employee.userId === currentUser.id) {
      alert('Quy định nghiêm ngặt: Quản lý không được tự chấm cho chính mình!');
      return;
    }
    if (employee.managerId !== currentUser.id) {
      alert('Quy định: Bạn chỉ được phép chấm nhân viên thuộc đơn vị mình trực tiếp quản lý!');
      return;
    }

    // Quy tắc: Phải cho nhân viên đánh giá xong, mới cho quản lý đánh giá (kỳ Quý)
    const canReviewCheck = window.ValidationEngine.canManagerReviewEmployee(period, ev);
    if (!canReviewCheck.canReview) {
      alert('Chưa thể thực hiện đánh giá:\n\n' + canReviewCheck.reason);
      return;
    }

    const template = data.criteriaTemplate;

    const modalHtml = `
      <div class="modal-backdrop" id="manager-review-modal">
        <div class="modal-dialog modal-dialog-lg" style="max-width: 1100px; height: 92vh;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Đánh giá Nhân sự: ${employee.name} (${employee.code})</div>
              <div class="text-xs text-muted">Chức danh: ${employee.title} | Phòng: ${employee.department} | Kỳ: ${period.name}</div>
            </div>
            <button onclick="document.getElementById('manager-review-modal').remove()" style="font-size: 22px;">&times;</button>
          </div>

          <div class="modal-body" style="padding: 0; overflow: hidden; display: flex; flex: 1; min-height: 0;">
            <!-- Left Column: Scoring Form -->
            <div style="flex: 3; padding: 20px; overflow-y: auto; border-right: 1px solid var(--color-border); min-height: 0; overscroll-behavior: contain;">
              <div style="margin-bottom: 16px; padding: 10px 14px; background: #f8fafc; border-radius: 6px; font-size: 13px;">
                💡 <b>Lưu ý nghiệp vụ:</b> Thang điểm 0 - 10. Điểm <b>từ 9.0 trở lên</b> hoặc <b>từ 4.0 trở xuống</b> bắt buộc phải có nhận xét chi tiết (tối thiểu 5 ký tự).
              </div>

              <form id="mgr-eval-form" onsubmit="event.preventDefault(); ManagerViews.submitEvaluation('${employeeId}')">
                ${template.groups.map(group => `
                  <div class="card" style="margin-bottom: 20px;">
                    <div class="card-header" style="background: var(--color-surface-subtle); margin: -20px -20px 16px -20px; padding: 12px 20px;">
                      <div class="card-title" style="font-size: 14px;">
                        ${group.name} <span class="badge badge-draft" style="margin-left: 8px;">Trọng số: ${group.weight}%</span>
                      </div>
                    </div>

                    ${group.subCriteria.map(sc => {
                      const selfScore = ev.selfScores ? ev.selfScores[sc.id] : null;
                      const selfComment = ev.selfComments ? ev.selfComments[sc.id] : '';
                      const mgrScore = ev.managerScores ? (ev.managerScores[sc.id] !== undefined ? ev.managerScores[sc.id] : '') : '';
                      const mgrComment = ev.managerComments ? (ev.managerComments[sc.id] || '') : '';

                      return `
                        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border);">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                            <div>
                              <div class="font-bold text-sm">${sc.name} <span class="text-xs text-muted">(${sc.weight}% của nhóm)</span></div>
                              <div class="text-xs text-muted">${sc.description}</div>
                            </div>
                            <div style="text-align: right;">
                              <span class="text-xs text-muted">Tự chấm:</span> <b>${selfScore !== null && selfScore !== undefined ? selfScore : 'Chưa chấm'}</b>
                            </div>
                          </div>

                          <div style="display: grid; grid-template-columns: 140px 1fr; gap: 14px; align-items: flex-start;">
                            <div>
                              <label class="form-label text-xs">Điểm Quản lý (0-10) <span class="required">*</span></label>
                              <input type="number" step="0.5" min="0" max="10" 
                                class="form-control mgr-score-input" 
                                id="score-${sc.id}" 
                                value="${mgrScore}" 
                                oninput="ManagerViews.onScoreChanged('${sc.id}')" required>
                              <div id="diff-${sc.id}" class="text-xs text-muted" style="margin-top: 4px;"></div>
                            </div>

                            <div>
                              <label class="form-label text-xs">Nhận xét chi tiết <span id="req-${sc.id}" class="required" style="display: none;">*</span></label>
                              <textarea class="form-control mgr-comment-input" 
                                id="comment-${sc.id}" 
                                style="min-height: 54px;" 
                                placeholder="Ghi nhận thành tích, dẫn chứng cụ thể hoặc mặt cần khắc phục...">${mgrComment}</textarea>
                              <div id="warn-${sc.id}" class="form-error" style="display: none;">Điểm ≥ 9 hoặc ≤ 4 bắt buộc phải nhập nhận xét!</div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `).join('')}

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px;">
                  <div>
                    <span class="text-sm font-semibold">Điểm tổng tạm tính:</span> 
                    <span id="mgr-live-total-score" class="font-bold text-lg text-primary">--</span>
                    <span id="mgr-live-rank-badge" style="margin-left: 8px;"></span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('manager-review-modal').remove()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Hoàn tất & Nộp đánh giá</button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Right Column: Evidence, Self-Review & AI Insights -->
            <div style="flex: 2; padding: 20px; overflow-y: auto; background-color: var(--color-surface-subtle); min-height: 0; overscroll-behavior: contain;">
              <div style="font-weight: 700; margin-bottom: 12px; font-size: 14px; color: var(--color-text-primary);">
                Tham chiếu Dữ liệu & Hỗ trợ AI
              </div>

              <!-- AI Panel -->
              <div class="ai-panel">
                <div class="ai-header">
                  <span class="ai-pill">Trợ lý Đánh giá AI</span>
                  <span class="ai-disclaimer">Hỗ trợ ra quyết định</span>
                </div>
                <div id="ai-review-content" style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.5;">
                  Đang phân tích các nhận xét và đối chiếu dữ liệu KPI...
                </div>
              </div>

              <!-- Employee Self Review Notes -->
              <div class="card" style="padding: 14px; margin-bottom: 14px;">
                <div class="card-header" style="margin: -14px -14px 10px -14px; padding: 10px 14px;">
                  <div class="card-title" style="font-size: 13px;">Ghi chú tự đánh giá của nhân viên</div>
                </div>
                ${ev.selfReviewStatus === 'submitted' ? `
                  <div style="font-size: 12px; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 8px;">
                    ${Object.keys(ev.selfComments || {}).map(k => `
                      <div>
                        <b>${k}:</b> ${ev.selfComments[k]}
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="text-xs text-muted" style="font-style: italic;">Nhân viên chưa nộp phiếu tự đánh giá trong kỳ này.</div>
                `}
              </div>

              <!-- KPI & Attendance Snapshot -->
              <div class="card" style="padding: 14px;">
                <div class="card-header" style="margin: -14px -14px 10px -14px; padding: 10px 14px;">
                  <div class="card-title" style="font-size: 13px;">Dữ liệu Chấm công & KPI tháng</div>
                </div>
                <div style="font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div>Ngày công: <b>22/22</b></div>
                  <div>Đi muộn: <b>0 lần</b></div>
                  <div>Nghỉ phép: <b>0 ngày</b></div>
                  <div>Đạt KPI: <b class="text-success">115%</b></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.updateLiveScoreAndAI(employeeId);
  },

  onScoreChanged: function(subCriteriaId) {
    const input = document.getElementById(`score-${subCriteriaId}`);
    const req = document.getElementById(`req-${subCriteriaId}`);
    const warn = document.getElementById(`warn-${subCriteriaId}`);
    if (!input) return;

    const val = parseFloat(input.value);
    if (!isNaN(val) && (val >= 9.0 || val <= 4.0)) {
      if (req) req.style.display = 'inline';
      if (warn) warn.style.display = 'block';
    } else {
      if (req) req.style.display = 'none';
      if (warn) warn.style.display = 'none';
    }

    this.updateLiveCalculations();
  },

  updateLiveCalculations: function() {
    const data = window.AppStorage.load();
    const template = data.criteriaTemplate;
    const scores = {};

    document.querySelectorAll('.mgr-score-input').forEach(input => {
      const id = input.id.replace('score-', '');
      scores[id] = input.value !== '' ? parseFloat(input.value) : 0;
    });

    const groupsWithScores = template.groups.map(g => {
      const gScore = window.CalculationEngine.calculateGroupScore(g.subCriteria, scores);
      return {
        id: g.id,
        weight: g.weight,
        score: gScore
      };
    });

    const totalScore = window.CalculationEngine.calculateTotalScore(groupsWithScores);
    const rating = window.CalculationEngine.determineRating(totalScore, data.defaultConfig.ratingBrackets);

    const scoreDisplay = document.getElementById('mgr-live-total-score');
    const rankBadge = document.getElementById('mgr-live-rank-badge');
    if (scoreDisplay) scoreDisplay.textContent = totalScore.toFixed(2);
    if (rankBadge) {
      rankBadge.innerHTML = `<span class="badge badge-rating badge-rating-${rating.rank.toLowerCase()}">${rating.rank} (${rating.label})</span>`;
    }
  },

  updateLiveScoreAndAI: function(employeeId) {
    this.updateLiveCalculations();

    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const employee = data.employees.find(e => e.id === employeeId);
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    const aiBox = document.getElementById('ai-review-content');

    if (!aiBox) return;

    window.AIAssistant.summarizeReview(employee, ev, (res) => {
      if (!res.success) {
        aiBox.innerHTML = `<div class="text-danger">${res.error}</div>`;
        return;
      }
      let html = `<p style="margin-bottom: 6px;"><b>${res.summary}</b></p>`;
      res.highlights.forEach(h => {
        html += `<div style="margin-bottom: 4px;">• ${h.text} <span class="text-muted">(${h.source})</span></div>`;
      });
      aiBox.innerHTML = html;
    });
  },

  submitEvaluation: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const currentUser = window.AppStorage.getCurrentUser();
    const employee = data.employees.find(e => e.id === employeeId);
    const template = data.criteriaTemplate;

    const allSubCriteria = [];
    template.groups.forEach(g => allSubCriteria.push(...g.subCriteria));

    const scores = {};
    const comments = {};

    allSubCriteria.forEach(sc => {
      const scoreInput = document.getElementById(`score-${sc.id}`);
      const commentInput = document.getElementById(`comment-${sc.id}`);
      if (scoreInput) scores[sc.id] = scoreInput.value !== '' ? parseFloat(scoreInput.value) : '';
      if (commentInput) comments[sc.id] = commentInput.value.trim();
    });

    // Validate using engine
    const check = window.ValidationEngine.validateManagerReview(scores, comments, allSubCriteria, currentUser.id, employee);
    if (!check.isValid) {
      alert('Không thể nộp phiếu đánh giá:\n\n' + check.errors.join('\n\n'));
      return;
    }

    // Calculate scores
    const groupsWithScores = template.groups.map(g => ({
      id: g.id,
      weight: g.weight,
      score: window.CalculationEngine.calculateGroupScore(g.subCriteria, scores)
    }));

    const totalScore = window.CalculationEngine.calculateTotalScore(groupsWithScores);
    const rating = window.CalculationEngine.determineRating(totalScore, data.defaultConfig.ratingBrackets);

    // Save evaluation
    let ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    if (!ev) {
      ev = { employeeId: employeeId, selfReviewStatus: 'not_submitted', selfScores: {}, selfComments: {} };
    }

    ev.managerReviewStatus = 'completed';
    ev.managerReviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    ev.managerScores = scores;
    ev.managerComments = comments;
    ev.managerTotalScore = totalScore;
    ev.finalScore = totalScore;
    ev.rank = rating.rank;
    ev.bonusCoeff = rating.bonusCoeff;

    window.AppStorage.saveEvaluationForPeriod(period.id, ev);

    // Audit Log
    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'Quản lý trực tiếp',
      actionType: 'MANAGER_SCORED',
      targetEmployee: `${employee.name} (${employee.code})`,
      oldValue: 'Chưa có điểm quản lý',
      newValue: `Điểm: ${totalScore.toFixed(2)} (Hạng ${rating.rank})`,
      reason: 'Quản lý trực tiếp hoàn tất chấm điểm và nhận xét theo thẩm quyền.'
    });

    const modal = document.getElementById('manager-review-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Thành công', `Đã lưu đánh giá cho ${employee.name}: Điểm ${totalScore.toFixed(2)} (${rating.rank}).`, 'success');
    App.navigateTo('mgr-reviews');
  }
};
