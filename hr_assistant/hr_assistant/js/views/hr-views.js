/**
 * AI-Assisted Performance & Bonus Hub
 * HR Views: Dashboard, Period Wizard, Calibration Workspace, Bonus Allocation
 */

window.HRViews = {
  // 1. HR Dashboard Control Center (Design Prompt Mục 11 & 33)
  renderDashboard: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const employees = data.employees;
    const evaluations = data.evaluations[period.id] || [];
    const warnings = data.aiWarnings.filter(w => w.periodId === period.id);

    // Compute metrics
    const totalEmployees = employees.length;
    const selfDoneCount = evaluations.filter(e => e.selfReviewStatus === 'submitted').length;
    const selfPct = totalEmployees > 0 ? Math.round((selfDoneCount / totalEmployees) * 100) : 0;
    
    const mgrDoneCount = evaluations.filter(e => e.managerReviewStatus === 'completed').length;
    const mgrPct = totalEmployees > 0 ? Math.round((mgrDoneCount / totalEmployees) * 100) : 0;
    
    const pendingWarnings = warnings.filter(w => w.status === 'pending').length;
    const severeWarnings = warnings.filter(w => w.severity === 'severe' && w.status === 'pending').length;

    // Bonus calculation
    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      employees,
      evaluations,
      data.defaultConfig
    );

    // Stepper status
    const steps = [
      { id: 'draft', label: '1. Dự thảo (Thiết lập)' },
      { id: 'self-review', label: '2. Tự đánh giá' },
      { id: 'manager-review', label: '3. Quản lý đánh giá' },
      { id: 'calibration', label: '4. Cân đối điểm' },
      { id: 'approved', label: '5. Đã duyệt' },
      { id: 'published', label: '6. Công bố' }
    ];

    const currentStepIdx = steps.findIndex(s => s.id === period.status);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Quản trị Nhân sự</span> / <span>Tổng quan</span>
          </div>
          <h1 class="page-title">${period.name}</h1>
          <div class="page-subtitle">Trung tâm điều hành và giám sát quy trình đánh giá hiệu suất & phân bổ quỹ thưởng</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="App.navigateTo('hr-import')">
            <span>Nhập dữ liệu tệp CSV</span>
          </button>
          <button class="btn btn-primary" onclick="App.navigateTo('hr-calibration')">
            <span>Vào Cân đối điểm</span>
          </button>
        </div>
      </div>

      <!-- Stepper -->
      <div class="card" style="padding: 16px 24px;">
        <div class="workflow-stepper">
          ${steps.map((step, idx) => {
            let stateClass = '';
            if (idx < currentStepIdx) stateClass = 'completed';
            else if (idx === currentStepIdx) stateClass = 'active';
            return `
              <div class="step-item ${stateClass}">
                <div class="step-circle">${idx < currentStepIdx ? '✓' : idx + 1}</div>
                <div class="step-label">${step.label}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tổng nhân sự trong kỳ</div>
          <div class="kpi-value">${totalEmployees} <span class="text-sm font-normal text-muted">nhân viên</span></div>
          <div class="kpi-sub">5 phòng ban trực thuộc</div>
        </div>

        <div class="kpi-card ${selfPct < 100 ? 'kpi-warning' : 'kpi-success'}">
          <div class="kpi-label">Tiến độ tự đánh giá</div>
          <div class="kpi-value">${selfPct}%</div>
          <div class="kpi-sub">Đã nộp: ${selfDoneCount}/${totalEmployees} (${totalEmployees - selfDoneCount} chưa nộp)</div>
        </div>

        <div class="kpi-card ${mgrPct < 100 ? 'kpi-warning' : 'kpi-success'}">
          <div class="kpi-label">Quản lý trực tiếp chấm</div>
          <div class="kpi-value">${mgrPct}%</div>
          <div class="kpi-sub">Đã hoàn tất: ${mgrDoneCount}/${totalEmployees}</div>
        </div>

        <div class="kpi-card kpi-ai">
          <div class="kpi-label">Tín hiệu AI cần rà soát</div>
          <div class="kpi-value text-ai">${pendingWarnings}</div>
          <div class="kpi-sub">Trong đó có <b class="text-danger">${severeWarnings}</b> cảnh báo Nghiêm trọng</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Tổng ngân sách quỹ thưởng</div>
          <div class="kpi-value">${(period.totalBonusFund / 1000000).toFixed(1)} <span class="text-sm font-normal text-muted">triệu đ</span></div>
          <div class="kpi-sub">Đề xuất: ${(bonusResult.totalAllocated / 1000000).toFixed(1)} triệu đ</div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-label">Quỹ còn lại sau làm tròn</div>
          <div class="kpi-value text-success">${bonusResult.remainingFund.toLocaleString()} <span class="text-sm font-normal text-muted">VNĐ</span></div>
          <div class="kpi-sub">Tuân thủ ngân sách: 100% quỹ</div>
        </div>
      </div>

      <!-- Action items & distribution -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6);" class="grid-2col">
        <!-- Action list -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Việc cần xử lý ngay tại giai đoạn Cân đối điểm</div>
            <span class="badge badge-warning-normal">${severeWarnings + (totalEmployees - mgrDoneCount)} đầu việc</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${severeWarnings > 0 ? `
              <div style="padding: 12px; border-left: 4px solid var(--color-danger); background-color: #fef2f2; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; color: var(--color-danger);">Cảnh báo AI mức Nghiêm trọng chưa xử lý!</div>
                  <div style="font-size: 13px; color: var(--color-text-secondary);">Nhân viên Ngô Bảo Châu có điểm 9.45 (S) nhưng nhận xét chỉ trích tiêu cực. Bắt buộc HR phải xử lý trước khi gửi duyệt.</div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="App.navigateTo('hr-calibration')">Rà soát ngay</button>
              </div>
            ` : `
              <div style="padding: 12px; border-left: 4px solid var(--color-success); background-color: #f0fdf4; border-radius: 4px;">
                <div style="font-weight: 600; color: var(--color-success);">✓ Tất cả cảnh báo nghiêm trọng đã được phản hồi hợp lệ.</div>
              </div>
            `}

            <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">1 trường hợp quá hạn tự đánh giá: Dương Minh Tú</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">Đã chuyển trạng thái "Không tự đánh giá", Quản lý đã chấm 7.40 điểm.</div>
              </div>
              <span class="badge badge-manager-review">Đã xử lý</span>
            </div>

            <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">1 nhân viên bị loại khỏi danh sách thưởng: Đỗ Hữu Nghĩa</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">Lý do: Vi phạm kỷ luật nghiêm trọng theo QĐ số 45/QĐ-KL. Thưởng = 0 VNĐ.</div>
              </div>
              <span class="badge badge-draft">Kỷ luật</span>
            </div>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Phân bổ xếp hạng dự kiến</div>
            <span class="text-xs text-muted">Kỳ 10/2026</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span><span class="badge badge-rating badge-rating-s">S</span> Xuất sắc (≥ 9.0)</span>
                <span class="font-bold">2 NV (13.3%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 13.3%; height: 100%; background: var(--color-rating-s);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span><span class="badge badge-rating badge-rating-a">A</span> Tốt (8.0 - 8.99)</span>
                <span class="font-bold">6 NV (40.0%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 40%; height: 100%; background: var(--color-rating-a);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span><span class="badge badge-rating badge-rating-b">B</span> Đạt yêu cầu (6.5 - 7.99)</span>
                <span class="font-bold">5 NV (33.3%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 33.3%; height: 100%; background: var(--color-rating-b);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span><span class="badge badge-rating badge-rating-c">C</span> Cần cải thiện (&lt; 6.5)</span>
                <span class="font-bold">2 NV (13.3%)</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: 13.3%; height: 100%; background: var(--color-rating-c);"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 2. Calibration Workspace Center (Design Prompt Mục 16 & 36)
  renderCalibration: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const employees = data.employees;
    const evaluations = data.evaluations[period.id] || [];
    const warnings = data.aiWarnings.filter(w => w.periodId === period.id);

    // Calculate bonus for preview in table
    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      employees,
      evaluations,
      data.defaultConfig
    );

    // Check transition validation
    const canApprove = window.ValidationEngine.canTransitionPeriod('calibration', 'approved', period, data);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Nhân sự</span> / <span>Cân đối điểm đánh giá</span>
          </div>
          <h1 class="page-title">Không Gian Cân Đối Điểm — ${period.name}</h1>
          <div class="page-subtitle">Rà soát điểm đa chiều, xử lý cảnh báo AI, điều chỉnh điểm có lý do & chuẩn bị trình phê duyệt</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="App.navigateTo('hr-bonus')">
            <span>Xem phân bổ quỹ thưởng</span>
          </button>
          <button class="btn btn-primary" onclick="HRViews.openSendToDirectorModal('${period.id}')" ${!canApprove.isValid ? 'disabled' : ''}>
            <span>Trình Giám đốc phê duyệt</span>
          </button>
        </div>
      </div>

      <!-- Checklist alert if cannot transition yet -->
      ${!canApprove.isValid ? `
        <div style="padding: 12px 16px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 700; color: #b45309; margin-bottom: 4px;">⚠️ Điều kiện hoàn tất Cân đối điểm chưa thỏa mãn:</div>
          <ul style="list-style: disc; margin-left: 20px; font-size: 13px; color: #92400e;">
            ${canApprove.errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <div style="padding: 12px 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 700; color: #15803d;">✓ Mọi điều kiện Cân đối điểm đã sẵn sàng để gửi Giám đốc phê duyệt!</div>
        </div>
      `}

      <!-- AI Alerts Section -->
      <div class="card" style="border-color: var(--color-ai-border); background: linear-gradient(to right, #ffffff, #faf5ff);">
        <div class="card-header">
          <div class="card-title">
            <span class="ai-pill">Trợ lý AI Rà Soát Điểm</span>
            <span>Tín hiệu cần rà soát trong kỳ (${warnings.length} phát hiện)</span>
          </div>
          <span class="ai-disclaimer">Gợi ý AI — quyết định cuối cùng thuộc HR và Quản lý</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${warnings.map(w => {
            const isSevere = w.severity === 'severe';
            const isPending = w.status === 'pending';
            return `
              <div style="padding: 12px; border: 1px solid ${isSevere ? '#fecaca' : '#fed7aa'}; background: #fff; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge ${isSevere ? 'badge-warning-severe' : 'badge-warning-normal'}">
                      ${isSevere ? 'Nghiêm trọng (Bắt buộc xử lý)' : 'Bất thường (Cần xem lại)'}
                    </span>
                    <span class="font-bold text-sm">${w.employeeName} (${w.employeeCode}) - ${w.department}</span>
                    <span class="text-xs text-muted">${w.category}</span>
                  </div>
                  <div style="font-size: 13px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px;">${w.label}</div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); background: #f8fafc; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #cbd5e1;">
                    <b>Căn cứ dữ liệu:</b> ${w.evidence}
                  </div>
                  ${!isPending ? `
                    <div style="margin-top: 6px; font-size: 12px; color: var(--color-success); font-weight: 600;">
                      ✓ Đã phản hồi (${w.actionBy} lúc ${w.actionAt}): ${w.actionReason}
                    </div>
                  ` : ''}
                </div>
                <div>
                  ${isPending ? `
                    <button class="btn btn-sm btn-primary" onclick="HRViews.openResolveWarningModal('${w.id}')">Xử lý cảnh báo</button>
                  ` : `
                    <span class="badge badge-approved">Đã xử lý</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Calibration Data Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Bảng tổng hợp điểm & điều chỉnh điểm cân đối</div>
          <div class="flex gap-2">
            <input type="text" id="calib-search" class="form-control" placeholder="Tìm tên, mã nhân viên..." style="width: 220px;" oninput="HRViews.filterCalibrationTable()">
            <select id="calib-dept-filter" class="form-control" style="width: 160px;" onchange="HRViews.filterCalibrationTable()">
              <option value="ALL">Tất cả phòng ban</option>
              <option value="Kỹ thuật">Kỹ thuật</option>
              <option value="Kinh doanh">Kinh doanh</option>
              <option value="Marketing">Marketing</option>
              <option value="Nhân sự">Nhân sự</option>
              <option value="Vận hành">Vận hành</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="calib-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Điểm Tự chấm</th>
                <th>Điểm Quản lý</th>
                <th>Điểm Hiệu chỉnh (HR)</th>
                <th>Xếp hạng</th>
                <th>Thâm niên</th>
                <th>Thưởng dự kiến</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const ev = evaluations.find(e => e.employeeId === emp.id);
                const bonusItem = bonusResult.items.find(b => b.employeeId === emp.id);
                const hasScore = ev && ev.managerReviewStatus === 'completed';
                const score = ev ? (ev.isAdjusted ? ev.adjustedScore : ev.managerTotalScore) : 0;
                const rank = bonusItem ? bonusItem.rank : 'C';

                let rowClass = '';
                if (ev && ev.isAdjusted) rowClass = 'row-flagged';
                if (emp.isDisqualified) rowClass = 'row-severe';

                return `
                  <tr class="${rowClass}">
                    <td class="font-bold text-xs">${emp.code}</td>
                    <td>
                      <div class="font-semibold">${emp.name}</div>
                      <div class="text-xs text-muted">${emp.title}</div>
                    </td>
                    <td>${emp.department}</td>
                    <td>
                      ${ev && ev.selfReviewStatus === 'submitted' 
                        ? `<span class="font-medium">${ev.selfTotalScore.toFixed(2)}</span>`
                        : `<span class="badge badge-manager-review">Không tự chấm</span>`}
                    </td>
                    <td>
                      ${hasScore ? `<span class="font-semibold">${ev.managerTotalScore.toFixed(2)}</span>` : '<span class="text-muted">Chưa chấm</span>'}
                    </td>
                    <td>
                      ${ev && ev.isAdjusted ? `
                        <div>
                          <span class="font-bold text-primary">${ev.adjustedScore.toFixed(2)}</span>
                          <span class="badge badge-warning-normal" title="${ev.adjustmentReason}">Đã sửa</span>
                        </div>
                        <div class="text-xs text-muted">Gốc: ${ev.originalManagerScore.toFixed(2)}</div>
                      ` : `
                        <span class="text-muted">${hasScore ? ev.managerTotalScore.toFixed(2) : '-'}</span>
                      `}
                    </td>
                    <td>
                      <span class="badge badge-rating badge-rating-${rank.toLowerCase()}">${rank}</span>
                    </td>
                    <td class="text-xs">
                      <div>${emp.seniorityYears} năm</div>
                      <div class="text-muted">${bonusItem ? bonusItem.seniorityCoeff : 1.0}x</div>
                    </td>
                    <td>
                      ${emp.isDisqualified ? `
                        <div class="text-danger font-bold text-xs">0 đ (Kỷ luật)</div>
                      ` : `
                        <div class="font-bold text-success">${bonusItem ? bonusItem.finalBonus.toLocaleString() : 0} đ</div>
                      `}
                    </td>
                    <td>
                      ${emp.isDisqualified ? `
                        <span class="badge badge-draft" title="${emp.disqualifiedReason}">Bị loại thưởng</span>
                      ` : ev && ev.needsDirectorConfirm ? `
                        <span class="badge badge-warning-severe">Cần GĐ duyệt</span>
                      ` : `
                        <span class="badge badge-approved">Hợp lệ</span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      <div class="flex justify-end gap-1">
                        <button class="btn btn-sm btn-secondary" onclick="SharedViews.openSelfReviewModal('${emp.id}', '${period.id}')" title="Xem phiếu tự đánh giá của nhân viên">Phiếu tự chấm</button>
                        <button class="btn btn-sm btn-secondary" onclick="SharedViews.openManagerReviewModal('${emp.id}', '${period.id}')" title="Xem phiếu quản lý chấm">Phiếu QL</button>
                        <button class="btn btn-sm btn-secondary" onclick="HRViews.openEditScoreModal('${emp.id}')">Sửa điểm</button>
                        <button class="btn btn-sm ${emp.isDisqualified ? 'btn-success' : 'btn-danger'}" onclick="HRViews.toggleDisqualify('${emp.id}')" title="Loại hoặc khôi phục thưởng">
                          ${emp.isDisqualified ? 'Khôi phục' : 'Kỷ luật'}
                        </button>
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

  // Modal: Điều chỉnh điểm nhân viên tại Calibration (BRL-16 & BRL-17)
  openEditScoreModal: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const employee = data.employees.find(e => e.id === employeeId);
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);

    if (!employee || !ev) {
      window.ShellView.showToast('Lỗi', 'Không tìm thấy dữ liệu đánh giá của nhân viên.', 'danger');
      return;
    }

    const currentScore = ev.isAdjusted ? ev.adjustedScore : ev.managerTotalScore;

    const modalHtml = `
      <div class="modal-backdrop" id="edit-score-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">Điều chỉnh điểm cân đối — ${employee.name} (${employee.code})</div>
            <button onclick="document.getElementById('edit-score-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                <div><b>Phòng ban:</b> ${employee.department}</div>
                <div><b>Chức danh:</b> ${employee.title}</div>
                <div><b>Điểm Quản lý ban đầu:</b> <span class="font-bold">${ev.managerTotalScore.toFixed(2)}</span></div>
                <div><b>Điểm Tự đánh giá:</b> ${ev.selfTotalScore ? ev.selfTotalScore.toFixed(2) : 'Không tự đánh giá'}</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Điểm số điều chỉnh mới (Thang điểm 0 - 10) <span class="required">*</span></label>
              <input type="number" step="0.05" min="0" max="10" id="input-new-score" class="form-control" value="${currentScore.toFixed(2)}" oninput="HRViews.previewScoreImpact(${ev.managerTotalScore})">
              <div id="score-impact-preview" style="margin-top: 8px; font-size: 13px;"></div>
            </div>

            <div class="form-group">
              <label class="form-label">Lý do điều chỉnh điểm (Bắt buộc theo BRL-16 & AC-13) <span class="required">*</span></label>
              <textarea id="input-adjust-reason" class="form-control" placeholder="Nhập căn cứ rõ ràng: biên bản đối thoại, kết quả kiểm tra lại KPI, xử lý tín hiệu AI...">${ev.adjustmentReason || ''}</textarea>
              <div class="text-xs text-muted">Lưu ý: Mọi điều chỉnh làm đổi xếp hạng hoặc lệch > 1.0 điểm sẽ tự động gắn cờ cần Giám đốc xác nhận lại.</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('edit-score-modal').remove()">Hủy</button>
            <button class="btn btn-primary" onclick="HRViews.saveScoreAdjustment('${employeeId}', ${ev.managerTotalScore})">Lưu điều chỉnh</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.previewScoreImpact(ev.managerTotalScore);
  },

  previewScoreImpact: function(originalScore) {
    const input = document.getElementById('input-new-score');
    const preview = document.getElementById('score-impact-preview');
    if (!input || !preview) return;

    const data = window.AppStorage.load();
    const newScore = parseFloat(input.value) || 0;
    const check = window.ValidationEngine.checkCalibrationAdjustment(originalScore, newScore, 'preview', data.defaultConfig.ratingBrackets);

    let html = `Độ lệch: <b>${check.delta.toFixed(2)} điểm</b> | Hạng cũ: <b>${check.oldRank}</b> ➔ Hạng mới: <b>${check.newRank}</b>. `;
    if (check.needsDirectorConfirm) {
      html += `<span class="badge badge-warning-severe">Cần Giám đốc xác nhận lại (BRL-17)</span>`;
    } else {
      html += `<span class="badge badge-approved">Điều chỉnh trong ngưỡng an toàn</span>`;
    }
    preview.innerHTML = html;
  },

  saveScoreAdjustment: function(employeeId, originalScore) {
    const newScoreInput = document.getElementById('input-new-score');
    const reasonInput = document.getElementById('input-adjust-reason');

    const newScore = parseFloat(newScoreInput.value);
    const reason = (reasonInput.value || '').trim();

    const data = window.AppStorage.load();
    const check = window.ValidationEngine.checkCalibrationAdjustment(originalScore, newScore, reason, data.defaultConfig.ratingBrackets);

    if (!check.isValid) {
      alert(check.errors.join('\n'));
      return;
    }

    const period = window.AppStorage.getActivePeriod();
    const currentUser = window.AppStorage.getCurrentUser();
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    const employee = data.employees.find(e => e.id === employeeId);

    // Save adjustment
    ev.isAdjusted = true;
    ev.adjustedScore = newScore;
    ev.finalScore = newScore;
    ev.adjustmentReason = reason;
    ev.adjustedBy = currentUser.name;
    ev.adjustedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    ev.needsDirectorConfirm = check.needsDirectorConfirm;
    ev.directorConfirmed = false;

    // Recalculate rank and coeffs
    const rating = window.CalculationEngine.determineRating(newScore, data.defaultConfig.ratingBrackets);
    ev.rank = rating.rank;
    ev.bonusCoeff = rating.bonusCoeff;

    // Save evaluation
    window.AppStorage.saveEvaluationForPeriod(period.id, ev);

    // Add Audit Log (BRL-16, AC-13)
    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'HR / Admin',
      actionType: 'SCORE_ADJUSTED',
      targetEmployee: `${employee.name} (${employee.code})`,
      oldValue: `Điểm: ${originalScore.toFixed(2)} (Hạng ${check.oldRank})`,
      newValue: `Điểm: ${newScore.toFixed(2)} (Hạng ${check.newRank})`,
      reason: reason
    });

    // Notify Director if needs confirmation
    if (check.needsDirectorConfirm) {
      window.AppStorage.addNotification({
        recipientRole: 'director',
        recipientUserId: 'USR_DIR',
        title: 'Yêu cầu xác nhận điều chỉnh điểm lớn',
        message: `HR đã điều chỉnh điểm của ${employee.name} từ ${originalScore.toFixed(2)} sang ${newScore.toFixed(2)} (Lệch ${check.delta}đ).`,
        type: 'warning'
      });
    }

    // Close modal & re-render
    const modal = document.getElementById('edit-score-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Thành công', 'Đã lưu điều chỉnh điểm và ghi nhận vào Audit Log.', 'success');
    App.navigateTo('hr-calibration');
  },

  // Toggle Disqualify from bonus (BRL-09 & BRL-21)
  toggleDisqualify: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const employee = data.employees.find(e => e.id === employeeId);

    if (employee.isDisqualified) {
      // Re-enable
      if (confirm(`Bạn có chắc chắn muốn khôi phục quyền nhận thưởng cho nhân viên ${employee.name}?`)) {
        employee.isDisqualified = false;
        employee.disqualifiedReason = '';
        window.AppStorage.save(data);
        window.AppStorage.addAuditLog({
          periodId: period.id,
          periodName: period.name,
          actorName: 'Nguyễn Văn HR',
          actorRole: 'HR / Admin',
          actionType: 'BONUS_RESTORED',
          targetEmployee: `${employee.name} (${employee.code})`,
          oldValue: 'Bị loại khỏi danh sách thưởng',
          newValue: 'Đủ điều kiện nhận thưởng',
          reason: 'HR đã xem xét lại và khôi phục quyền nhận thưởng theo kết luận thanh tra.'
        });
        window.ShellView.showToast('Thành công', 'Đã khôi phục quyền nhận thưởng.', 'success');
        App.navigateTo('hr-calibration');
      }
    } else {
      // Prompt reason
      const reason = prompt(`Nhập lý do loại nhân viên ${employee.name} khỏi danh sách thưởng (BRL-09):`, 'Vi phạm kỷ luật lao động nghiêm trọng theo quyết định số...');
      if (!reason || reason.trim().length < 5) {
        alert('Bắt buộc phải nhập lý do loại khỏi danh sách thưởng (tối thiểu 5 ký tự).');
        return;
      }
      employee.isDisqualified = true;
      employee.disqualifiedReason = reason;
      window.AppStorage.save(data);
      window.AppStorage.addAuditLog({
        periodId: period.id,
        periodName: period.name,
        actorName: 'Nguyễn Văn HR',
        actorRole: 'HR / Admin',
        actionType: 'BONUS_EXCLUSION',
        targetEmployee: `${employee.name} (${employee.code})`,
        oldValue: 'Đủ điều kiện nhận thưởng',
        newValue: 'Bị loại khỏi danh sách thưởng (Thưởng = 0 VNĐ)',
        reason: reason
      });
      window.ShellView.showToast('Đã loại', 'Nhân viên đã bị loại khỏi danh sách thưởng. Vẫn giữ điểm và xếp hạng.', 'warning');
      App.navigateTo('hr-calibration');
    }
  },

  // Modal Xử lý cảnh báo AI (Bias Detector action: Chấp nhận, Sửa, Bỏ qua)
  openResolveWarningModal: function(warningId) {
    const data = window.AppStorage.load();
    const warning = data.aiWarnings.find(w => w.id === warningId);

    const modalHtml = `
      <div class="modal-backdrop" id="resolve-warning-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">Xử lý Tín hiệu Rà soát AI — ${warning.employeeName}</div>
            <button onclick="document.getElementById('resolve-warning-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              <div style="font-weight: 700; color: #6d28d9; margin-bottom: 4px;">${warning.label}</div>
              <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;"><b>Căn cứ:</b> ${warning.evidence}</div>
              <div style="font-size: 11px; color: var(--color-text-muted); font-style: italic;">Quy tắc: Không cảnh báo nào của hệ thống được ghi là "kết luận thiên vị". Đây là tín hiệu gợi ý để con người rà soát.</div>
            </div>

            <div class="form-group">
              <label class="form-label">Chọn hành động xử lý <span class="required">*</span></label>
              <select id="select-warn-action" class="form-control" onchange="HRViews.onWarnActionChange()">
                <option value="edited">Chỉnh sửa điểm số (Mở màn hình sửa điểm)</option>
                <option value="accepted">Chấp nhận dữ liệu hiện tại (Có giải trình)</option>
                <option value="ignored">Bỏ qua cảnh báo (Bắt buộc nhập lý do)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Lý do / Phản hồi xử lý của người duyệt <span class="required">*</span></label>
              <textarea id="input-warn-reason" class="form-control" placeholder="Ghi nhận căn cứ xác minh..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('resolve-warning-modal').remove()">Hủy</button>
            <button class="btn btn-primary" onclick="HRViews.submitResolveWarning('${warningId}')">Xác nhận xử lý</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  submitResolveWarning: function(warningId) {
    const actionSelect = document.getElementById('select-warn-action');
    const reasonInput = document.getElementById('input-warn-reason');

    const action = actionSelect.value;
    const reason = (reasonInput.value || '').trim();

    if (reason.length < 5) {
      alert('Bắt buộc phải nhập phản hồi / lý do xử lý tín hiệu AI (tối thiểu 5 ký tự).');
      return;
    }

    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const warning = data.aiWarnings.find(w => w.id === warningId);

    warning.status = 'resolved';
    warning.userAction = action;
    warning.actionReason = reason;
    warning.actionBy = 'Nguyễn Văn HR';
    warning.actionAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Nguyễn Văn HR',
      actorRole: 'HR / Admin',
      actionType: 'AI_WARNING_RESOLVED',
      targetEmployee: `${warning.employeeName} (${warning.employeeCode})`,
      oldValue: `Cảnh báo ${warning.severity}: Chưa phản hồi`,
      newValue: `Đã xử lý (${action})`,
      reason: reason
    });

    const modal = document.getElementById('resolve-warning-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Thành công', 'Đã lưu phản hồi xử lý cảnh báo AI.', 'success');
    App.navigateTo('hr-calibration');
  },

  // Modal: Trình Giám đốc phê duyệt kỳ
  openSendToDirectorModal: function(periodId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const canApprove = window.ValidationEngine.canTransitionPeriod('calibration', 'approved', period, data);

    if (!canApprove.isValid) {
      alert('Không thể gửi duyệt:\n' + canApprove.errors.join('\n'));
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn trình Kỳ đánh giá "${period.name}" lên Giám đốc phê duyệt?`)) {
      // Notify Director
      window.AppStorage.addNotification({
        recipientRole: 'director',
        recipientUserId: 'USR_DIR',
        title: 'Kỳ đánh giá đang chờ bạn phê duyệt',
        message: `Nhân sự đã hoàn tất Cân đối điểm cho ${period.name} và trình duyệt phương án phân bổ quỹ thưởng.`,
        type: 'info'
      });

      window.AppStorage.addAuditLog({
        periodId: period.id,
        periodName: period.name,
        actorName: 'Nguyễn Văn HR',
        actorRole: 'HR / Admin',
        actionType: 'SUBMITTED_FOR_APPROVAL',
        targetEmployee: 'Toàn bộ nhân sự kỳ',
        oldValue: 'Calibration',
        newValue: 'Chờ Giám đốc phê duyệt',
        reason: 'HR đã hoàn tất rà soát và trình đề xuất thưởng lên Giám đốc.'
      });

      window.ShellView.showToast('Đã gửi', 'Đã chuyển đề xuất lên Giám đốc điều hành phê duyệt.', 'success');
      App.navigateTo('hr-dashboard');
    }
  },

  // 3. Bonus Allocation Center (Design Prompt Mục 17 & 37)
  renderBonusCenter: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const employees = data.employees;
    const evaluations = data.evaluations[period.id] || [];

    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      employees,
      evaluations,
      data.defaultConfig
    );

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>HR</span> / <span>Bonus Allocation Center</span>
          </div>
          <h1 class="page-title">Trung tâm Phân bổ Quỹ Thưởng — ${period.name}</h1>
          <div class="page-subtitle">Công thức chuẩn minh bạch BRL-08, làm tròn 1.000 VNĐ, phân dư & AI Simulator</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-ai" onclick="HRViews.openAISimulatorModal()">
            <span>✨ AI Mô phỏng Kịch bản (What-if)</span>
          </button>
          <button class="btn btn-secondary" onclick="App.navigateTo('shared-reports')">
            <span>Xuất file Excel</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tổng quỹ thưởng phê duyệt</div>
          <div class="kpi-value text-primary">${period.totalBonusFund.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Ngân sách chốt đầu kỳ</div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-label">Tổng thưởng đã phân bổ</div>
          <div class="kpi-value text-success">${bonusResult.totalAllocated.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Sau khi làm tròn & phân dư</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Quỹ còn lại (Bảo toàn)</div>
          <div class="kpi-value">${bonusResult.remainingFund.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Không vượt quỹ: 100%</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Mẫu số tổng trọng số phân bổ</div>
          <div class="kpi-value">${bonusResult.sumAllocationWeight.toFixed(3)}</div>
          <div class="kpi-sub">Đủ điều kiện: ${bonusResult.eligibleCount} NV | Bị loại: ${bonusResult.disqualifiedCount} NV</div>
        </div>
      </div>

      <!-- Formula Explainer Box -->
      <div class="card" style="background: #f8fafc; border-left: 4px solid var(--color-primary-action);">
        <div class="card-header" style="border: none; padding-bottom: 0;">
          <div class="card-title" style="font-size: 15px;">Quy tắc phân bổ chuẩn (BRD Mục 9.1 & BRL-08, BRL-15)</div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6;">
          <p>• <b>Trọng số phân bổ nhân viên:</b> <code>Hệ số thưởng theo hạng × Hệ số thâm niên</code>.</p>
          <p>• <b>Thưởng đề xuất:</b> <code>Quỹ thưởng × Trọng số phân bổ của nhân viên / Tổng trọng số phân bổ của các nhân viên đủ điều kiện</code>.</p>
          <p>• <b>Làm tròn & Phần dư:</b> Tiền thưởng làm tròn xuống 1.000 VNĐ. Phần dư do làm tròn được xếp theo thứ tự phần lẻ lớn nhất và cộng lần lượt 1.000 VNĐ cho đến khi hết, đảm bảo tuyệt đối không vượt quỹ.</p>
        </div>
      </div>

      <!-- Allocation Detail Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Bảng chi tiết phân bổ từng nhân viên</div>
          <span class="text-xs text-muted">Đơn vị tiền: VNĐ</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Điểm</th>
                <th>Hạng</th>
                <th>Hệ số Hạng</th>
                <th>Thâm niên</th>
                <th>Hệ số TN</th>
                <th>Trọng số PB</th>
                <th>Thưởng trước làm tròn</th>
                <th>Thưởng sau làm tròn</th>
                <th>Cộng phần dư</th>
                <th>Thưởng Thực nhận</th>
                <th>Trợ lý AI</th>
              </tr>
            </thead>
            <tbody>
              ${bonusResult.items.map(item => `
                <tr class="${item.isDisqualified ? 'row-severe' : ''}">
                  <td class="font-bold text-xs">${item.employeeCode}</td>
                  <td class="font-semibold">${item.employeeName}</td>
                  <td>${item.department}</td>
                  <td><b>${item.score.toFixed(2)}</b></td>
                  <td><span class="badge badge-rating badge-rating-${item.rank.toLowerCase()}">${item.rank}</span></td>
                  <td>${item.bonusCoeff}x</td>
                  <td class="text-xs">${item.seniorityYears} năm</td>
                  <td>${item.seniorityCoeff}x</td>
                  <td class="font-bold">${item.allocationWeight.toFixed(3)}</td>
                  <td class="text-xs text-muted">${item.rawBonus.toLocaleString()} đ</td>
                  <td>${item.floorBonus.toLocaleString()} đ</td>
                  <td>${item.surplusAllocated > 0 ? `+${item.surplusAllocated.toLocaleString()} đ` : '-'}</td>
                  <td>
                    ${item.isDisqualified ? `
                      <span class="text-danger font-bold">0 đ (Kỷ luật)</span>
                    ` : `
                      <span class="text-success font-bold" style="font-size: 14px;">${item.finalBonus.toLocaleString()} đ</span>
                    `}
                  </td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="HRViews.explainEmployeeBonus('${item.employeeId}')">
                      <span>💡 Giải thích</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Modal Giải thích chi tiết thưởng bằng AI (BRL-13, Prompt 17.4)
  explainEmployeeBonus: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      data.employees,
      data.evaluations[period.id] || [],
      data.defaultConfig
    );

    const target = bonusResult.items.find(i => i.employeeId === employeeId);
    const peer = bonusResult.items.find(i => i.employeeId !== employeeId && i.department === target.department && !i.isDisqualified);

    const explanations = window.AIAssistant.explainBonus(target, peer, period.totalBonusFund, bonusResult.sumAllocationWeight);

    const modalHtml = `
      <div class="modal-backdrop" id="explain-bonus-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">AI Giải thích phân bổ thưởng — ${target.employeeName} (${target.employeeCode})</div>
            <button onclick="document.getElementById('explain-bonus-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: linear-gradient(to right, #faf5ff, #f5f3ff); border: 1px solid #c4b5fd; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
              <span class="ai-pill" style="margin-bottom: 8px;">AI Bonus Explainer</span>
              <div style="font-size: 13px; color: var(--color-text-primary); line-height: 1.7; margin-top: 8px;">
                ${explanations.map(line => `<p style="margin-bottom: 4px;">${line}</p>`).join('')}
              </div>
            </div>
            <div class="text-xs text-muted">
              Lưu ý: AI không tự quyết định số tiền hay thay đổi công thức. Số tiền trên hoàn toàn do thuật toán toán học BRL-08 của hệ thống sinh ra.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="document.getElementById('explain-bonus-modal').remove()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // Modal Mô phỏng kịch bản giả định (What-if Simulation)
  openAISimulatorModal: function() {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();

    const modalHtml = `
      <div class="modal-backdrop" id="ai-sim-modal">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <div class="modal-title">✨ AI Mô phỏng Kịch bản Phân bổ Quỹ Thưởng (What-If Analysis)</div>
            <button onclick="document.getElementById('ai-sim-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 13px; color: #1e40af; margin-bottom: 16px;">
              <b>Nguyên tắc an toàn (BRL-13):</b> Đây chỉ là mô phỏng giả định độc lập để HR và Ban giám đốc cân nhắc quyết định. AI không làm thay đổi số liệu phân bổ chính thức.
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label class="form-label">Quỹ thưởng giả định (VNĐ)</label>
                <input type="number" id="sim-fund" class="form-control" value="${period.totalBonusFund}" step="10000000">
              </div>

              <div class="form-group">
                <label class="form-label">Hệ số hạng S giả định</label>
                <input type="number" id="sim-coeff-s" class="form-control" value="1.8" step="0.1">
              </div>
            </div>

            <button class="btn btn-ai w-full" onclick="HRViews.runSimulation()">Chạy mô phỏng</button>

            <div id="sim-results-container" style="margin-top: 16px;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('ai-sim-modal').remove()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.runSimulation();
  },

  runSimulation: function() {
    const fundInput = document.getElementById('sim-fund');
    const coeffSInput = document.getElementById('sim-coeff-s');
    const container = document.getElementById('sim-results-container');
    if (!fundInput || !container) return;

    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();

    const simulatedFund = parseFloat(fundInput.value) || period.totalBonusFund;
    const coeffS = parseFloat(coeffSInput.value) || 1.5;

    const sim = window.AIAssistant.simulateScenario(
      simulatedFund,
      { s: coeffS, a: 1.2, b: 1.0, c: 0 },
      data.employees,
      data.evaluations[period.id] || []
    );

    container.innerHTML = `
      <div style="padding: 12px; border: 1px dashed var(--color-ai-border); background: #faf5ff; border-radius: 8px;">
        <div style="font-weight: 700; color: var(--color-ai); margin-bottom: 6px;">Kết quả kịch bản giả định: Quỹ ${(simulatedFund / 1000000).toFixed(1)} triệu đ (Hạng S = ${coeffS}x)</div>
        <div style="font-size: 13px; margin-bottom: 8px;">
          • Tổng phân bổ giả định: <b>${sim.result.totalAllocated.toLocaleString()} đ</b> | Quỹ dư: <b>${sim.result.remainingFund.toLocaleString()} đ</b>
        </div>
        <div style="max-height: 240px; overflow-y: auto;">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Tên NV</th>
                <th>Hạng</th>
                <th>Thưởng chính thức</th>
                <th>Thưởng giả định</th>
                <th>Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              ${sim.result.items.slice(0, 7).map(item => {
                const official = window.CalculationEngine.calculateBonusAllocation(period.totalBonusFund, data.employees, data.evaluations[period.id] || [], data.defaultConfig).items.find(o => o.employeeId === item.employeeId);
                const diff = item.finalBonus - (official ? official.finalBonus : 0);
                return `
                  <tr>
                    <td>${item.employeeCode}</td>
                    <td>${item.employeeName}</td>
                    <td><span class="badge badge-rating badge-rating-${item.rank.toLowerCase()}">${item.rank}</span></td>
                    <td>${official ? official.finalBonus.toLocaleString() : 0} đ</td>
                    <td class="font-bold text-ai">${item.finalBonus.toLocaleString()} đ</td>
                    <td style="color: ${diff >= 0 ? 'green' : 'red'};">${diff >= 0 ? '+' : ''}${diff.toLocaleString()} đ</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterCalibrationTable: function() {
    const searchVal = (document.getElementById('calib-search')?.value || '').toLowerCase();
    const deptVal = document.getElementById('calib-dept-filter')?.value || 'ALL';

    const table = document.getElementById('calib-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      const matchSearch = text.includes(searchVal);
      const matchDept = deptVal === 'ALL' || text.includes(deptVal.toLowerCase());
      r.style.display = (matchSearch && matchDept) ? '' : 'none';
    });
  }
};
