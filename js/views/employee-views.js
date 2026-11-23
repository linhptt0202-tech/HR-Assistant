/**
 * AI-Assisted Performance & Bonus Hub
 * Employee Views: Personal Dashboard, Self-Review Form & Published Personal Results
 */

window.EmployeeViews = {
  // Employee Dashboard (Design Prompt Mục 14.1)
  renderDashboard: function(data, container) {
    const session = window.AppStorage.getSession();
    const currentUser = window.AppStorage.getCurrentUser();
    const period = window.AppStorage.getActivePeriod();
    const evaluations = data.evaluations[period.id] || [];
    const myEval = evaluations.find(e => e.employeeId === 'EMP001'); // Lê Văn Nhân Viên

    const isSubmitted = myEval && myEval.selfReviewStatus === 'submitted';
    const isPublished = period.status === 'published';
    const isMonth = period.type === 'month';
    const isQuarter = period.type === 'quarter';
    const isYear = period.type === 'year';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Cá nhân</span> / <span>Trang chủ</span>
          </div>
          <h1 class="page-title">Chào mừng, ${currentUser.name} 👋</h1>
          <div class="page-subtitle">Chức danh: <b>${currentUser.title}</b> | Phòng ban: <b>${currentUser.department}</b></div>
        </div>
      </div>

      <!-- Chu kỳ đánh giá policy banner -->
      ${isMonth ? `
        <div class="card" style="background: #eff6ff; border-left: 4px solid var(--color-primary-action); margin-bottom: 20px;">
          <div style="font-weight: 700; color: #1e40af; font-size: 14px;">ℹ️ Quy định chu kỳ đánh giá</div>
          <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5;">
            Theo quy chế công ty: <b>Nhân viên chỉ thực hiện tự đánh giá theo Quý</b>. Kỳ hiện tại (<b>${period.name}</b>) là kỳ đánh giá theo <b>Tháng</b> do Quản lý trực tiếp chấm điểm & theo dõi KPI.
          </div>
          <div style="margin-top: 10px;">
            <button class="btn btn-sm btn-primary" onclick="App.selectPeriod('PERIOD_2026_Q4')">Chuyển sang Kỳ Quý 4/2026 để tự đánh giá</button>
          </div>
        </div>
      ` : ''}

      <!-- Active Period Notification Card -->
      <div class="card" style="border-left: 4px solid var(--color-primary-action);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 700;">
              Kỳ đánh giá đang chọn: ${period.type === 'quarter' ? 'ĐÁNH GIÁ THEO QUÝ' : period.type === 'month' ? 'ĐÁNH GIÁ THEO THÁNG' : 'TỔNG KẾT NĂM'}
            </div>
            <div style="font-size: 18px; font-weight: 700; color: var(--color-text-primary); margin-top: 4px;">
              ${period.name}
            </div>
            <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 2px;">
              ${isQuarter ? `Hạn chót tự đánh giá: <b class="text-danger">${period.selfReviewDeadline}</b> | Trạng thái: ` + 
                (isSubmitted ? '<span class="badge badge-approved">Đã nộp phiếu</span>' : '<span class="badge badge-manager-review">Chưa hoàn tất</span>')
                : `Hình thức: <b>Quản lý trực tiếp đánh giá theo tháng</b> | Trạng thái: <span class="badge badge-${period.status}">${period.status.toUpperCase()}</span>`}
            </div>
          </div>
          <div>
            ${isQuarter ? `
              ${!isSubmitted ? `
                <button class="btn btn-primary" onclick="App.navigateTo('emp-self-review')">
                  <span>Bắt đầu tự đánh giá ngay</span>
                </button>
              ` : `
                <button class="btn btn-secondary" onclick="App.navigateTo('emp-self-review')">
                  <span>Xem lại phiếu đã nộp</span>
                </button>
              `}
            ` : isPublished ? `
              <button class="btn btn-success" onclick="App.navigateTo('emp-results')">
                <span>Xem kết quả của tôi</span>
              </button>
            ` : `
              <span class="badge badge-draft">Kỳ tháng (Quản lý chấm)</span>
            `}
          </div>
        </div>
      </div>

      <!-- Published Results Alert -->
      ${isPublished ? `
        <div class="card" style="background: linear-gradient(to right, #ecfdf5, #f0fdf4); border-color: #a7f3d0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: var(--color-success); font-size: 16px;">🎉 Kết quả đánh giá và đề xuất thưởng đã được công bố!</div>
              <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 4px;">Kỳ đánh giá đã được Ban giám đốc phê duyệt chính thức. Bạn có thể xem kết quả chi tiết của mình.</div>
            </div>
            <button class="btn btn-success" onclick="App.navigateTo('emp-results')">Xem kết quả cá nhân</button>
          </div>
        </div>
      ` : `
        <div class="card" style="background: #f8fafc; border: 1px dashed var(--color-border);">
          <div style="font-size: 13px; color: var(--color-text-secondary); text-align: center; padding: 12px 0;">
            🔒 <i>Kết quả đánh giá và đề xuất thưởng đang trong quy trình xử lý nội bộ. Hệ thống sẽ công bố ngay khi Ban giám đốc hoàn tất phê duyệt.</i>
          </div>
        </div>
      `}
    `;
  },

  // Employee Self-Review Form (Design Prompt Mục 14.2 & 34)
  renderSelfReview: function(data, container) {
    const period = window.AppStorage.getActivePeriod();

    // Quy định: Nhân viên chỉ đánh giá theo quý, quản lý đánh giá theo tháng
    if (period.type === 'month') {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-left">
            <div class="breadcrumb">
              <span>Cá nhân</span> / <span>Tự đánh giá</span>
            </div>
            <h1 class="page-title">Tự Đánh Giá Hiệu Suất</h1>
            <div class="page-subtitle">Kỳ: <b>${period.name}</b> (Kỳ theo Tháng)</div>
          </div>
        </div>

        <div class="card" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 40px; margin-bottom: 12px;">📅</div>
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Nhân viên chỉ thực hiện tự đánh giá theo Quý</h2>
          <div style="color: var(--color-text-secondary); max-width: 560px; margin: 0 auto; line-height: 1.6; font-size: 14px;">
            Theo quy định đánh giá của công ty, nhân viên chỉ làm phiếu tự đánh giá vào các đợt <b>Toàn diện theo Quý (Q1, Q2, Q3, Q4)</b>. Kỳ <b>${period.name}</b> là kỳ đánh giá theo tháng do Quản lý trực tiếp chấm điểm và theo dõi KPI.
          </div>
          <div style="margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.selectPeriod('PERIOD_2026_Q4'); App.navigateTo('emp-self-review');">
              Chuyển sang Kỳ Quý 4/2026 để tự đánh giá
            </button>
          </div>
        </div>
      `;
      return;
    }

    const template = data.criteriaTemplate;
    const evaluations = data.evaluations[period.id] || [];
    const myEval = evaluations.find(e => e.employeeId === 'EMP001') || {
      employeeId: 'EMP001',
      selfScores: {},
      selfComments: {}
    };

    const isSubmitted = myEval && myEval.selfReviewStatus === 'submitted';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Cá nhân</span> / <span>Tự đánh giá</span>
          </div>
          <h1 class="page-title">Phiếu Tự Đánh Giá Hiệu Suất</h1>
          <div class="page-subtitle">Kỳ: <b>${period.name}</b> | Hạn nộp: <b>${period.selfReviewDeadline}</b></div>
        </div>
        <div class="page-actions">
          ${isSubmitted ? `
            <span class="badge badge-approved" style="padding: 6px 12px; font-size: 13px;">
              ✓ Đã nộp lúc ${myEval.selfSubmittedAt}
            </span>
          ` : ''}
        </div>
      </div>

      <div style="max-width: 900px; margin: 0 auto;">
        <div class="card" style="margin-bottom: 20px; background: #eff6ff; border-color: #bfdbfe;">
          <div style="font-size: 13px; color: #1e40af; line-height: 1.5;">
            <b>Hướng dẫn tự đánh giá:</b> Bạn hãy chấm điểm trung thực từ 0 - 10 cho từng tiêu chí con và ghi nhận cụ thể các thành tích, kết quả, dự án đã đóng góp trong kỳ vào ô ghi chú. Phiếu này sẽ là cơ sở tham chiếu để Quản lý trực tiếp đánh giá.
          </div>
        </div>

        <form id="emp-self-form" onsubmit="event.preventDefault(); EmployeeViews.submitSelfReview()">
          ${template.groups.map(group => `
            <div class="card">
              <div class="card-header" style="background: var(--color-surface-subtle); margin: -20px -20px 16px -20px; padding: 12px 20px;">
                <div class="card-title">
                  ${group.name} 
                  <span class="badge badge-draft" style="margin-left: 8px;">Trọng số nhóm: ${group.weight}%</span>
                </div>
              </div>

              ${group.subCriteria.map(sc => {
                const score = myEval.selfScores ? (myEval.selfScores[sc.id] !== undefined ? myEval.selfScores[sc.id] : '') : '';
                const comment = myEval.selfComments ? (myEval.selfComments[sc.id] || '') : '';

                return `
                  <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed var(--color-border);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div>
                        <div class="font-bold text-sm">${sc.name} <span class="text-xs text-muted">(${sc.weight}% của nhóm)</span></div>
                        <div class="text-xs text-muted">${sc.description}</div>
                      </div>
                      <div>
                        <input type="number" step="0.5" min="0" max="10" 
                          class="form-control self-score-input" 
                          id="self-score-${sc.id}" 
                          value="${score}" 
                          style="width: 90px; text-align: center; font-weight: 700;" 
                          placeholder="0 - 10" 
                          ${isSubmitted ? 'disabled' : ''} required>
                      </div>
                    </div>

                    <div>
                      <textarea class="form-control" 
                        id="self-comment-${sc.id}" 
                        placeholder="Nêu dẫn chứng, số liệu hoàn thành, đường dẫn sản phẩm hoặc khó khăn..." 
                        style="min-height: 60px;" 
                        ${isSubmitted ? 'disabled' : ''}>${comment}</textarea>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}

          ${!isSubmitted ? `
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; margin-bottom: 40px;">
              <button type="button" class="btn btn-secondary" onclick="EmployeeViews.saveDraft()">Lưu bản nháp</button>
              <button type="submit" class="btn btn-primary btn-lg">Nộp phiếu tự đánh giá</button>
            </div>
          ` : `
            <div style="text-align: center; padding: 20px; margin-bottom: 40px;">
              <button type="button" class="btn btn-secondary" onclick="EmployeeViews.allowReEdit()">Chỉnh sửa lại phiếu</button>
            </div>
          `}
        </form>
      </div>
    `;
  },

  saveDraft: function() {
    window.ShellView.showToast('Đã lưu nháp', 'Phiếu tự đánh giá của bạn đã được lưu tạm.', 'info');
  },

  allowReEdit: function() {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const myEval = (data.evaluations[period.id] || []).find(e => e.employeeId === 'EMP001');
    if (myEval) {
      myEval.selfReviewStatus = 'draft';
      window.AppStorage.saveEvaluationForPeriod(period.id, myEval);
      this.renderSelfReview(data, document.getElementById('main-content-view'));
      window.ShellView.showToast('Chỉnh sửa', 'Bạn có thể cập nhật lại phiếu trước khi nộp.', 'info');
    }
  },

  submitSelfReview: function() {
    if (!confirm('Bạn có chắc chắn muốn nộp phiếu tự đánh giá này lên Quản lý trực tiếp?')) return;

    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const template = data.criteriaTemplate;

    const scores = {};
    const comments = {};

    template.groups.forEach(g => {
      g.subCriteria.forEach(sc => {
        const sInput = document.getElementById(`self-score-${sc.id}`);
        const cInput = document.getElementById(`self-comment-${sc.id}`);
        if (sInput) scores[sc.id] = parseFloat(sInput.value) || 0;
        if (cInput) comments[sc.id] = cInput.value.trim();
      });
    });

    const groupsWithScores = template.groups.map(g => ({
      id: g.id,
      weight: g.weight,
      score: window.CalculationEngine.calculateGroupScore(g.subCriteria, scores)
    }));

    const totalScore = window.CalculationEngine.calculateTotalScore(groupsWithScores);

    let ev = (data.evaluations[period.id] || []).find(e => e.employeeId === 'EMP001');
    if (!ev) {
      ev = { employeeId: 'EMP001' };
    }

    ev.selfReviewStatus = 'submitted';
    ev.selfSubmittedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    ev.selfScores = scores;
    ev.selfComments = comments;
    ev.selfTotalScore = totalScore;

    window.AppStorage.saveEvaluationForPeriod(period.id, ev);

    // Audit log
    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Lê Văn Nhân Viên',
      actorRole: 'Nhân viên',
      actionType: 'SELF_REVIEW_SUBMITTED',
      targetEmployee: 'Lê Văn Nhân Viên (NV-1001)',
      oldValue: 'Chưa nộp',
      newValue: `Điểm tự chấm: ${totalScore.toFixed(2)}`,
      reason: 'Nhân viên hoàn tất nộp phiếu tự đánh giá đúng quy định.'
    });

    window.ShellView.showToast('Thành công', 'Đã nộp phiếu tự đánh giá thành công!', 'success');
    App.navigateTo('emp-self-review');
  },

  // Published Personal Result Screen (Design Prompt Mục 19 & 40)
  renderPublishedResults: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const currentUser = window.AppStorage.getCurrentUser();
    const evaluations = data.evaluations[period.id] || [];
    const myEval = evaluations.find(e => e.employeeId === 'EMP001');

    // Security Check: Employee can ONLY see their own result (BRL-16 & Prompt 19)
    if (period.status !== 'published') {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Kết quả chưa được công bố</h2>
          <div style="color: var(--color-text-secondary); max-width: 500px; margin: 0 auto;">
            Kỳ <b>${period.name}</b> hiện đang ở giai đoạn <b>${period.status.toUpperCase()}</b>. Kết quả chỉ hiển thị công khai cho nhân viên sau khi Ban Giám đốc phê duyệt và HR bấm công bố.
          </div>
        </div>
      `;
      return;
    }

    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      data.employees,
      evaluations,
      data.defaultConfig
    );

    const myBonus = bonusResult.items.find(b => b.employeeId === 'EMP001') || { finalBonus: 0, rank: 'A' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Cá nhân</span> / <span>Kết quả đánh giá</span>
          </div>
          <h1 class="page-title">Kết Quả Đánh Giá & Thưởng Minh Bạch</h1>
          <div class="page-subtitle">Kỳ: <b>${period.name}</b> | Nhân viên: <b>${currentUser.name} (NV-1001)</b></div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="window.print()">In phiếu kết quả (PDF)</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: 24px;" class="grid-2col">
        <!-- Score & Rank Card -->
        <div class="card" style="text-align: center; padding: 32px 20px;">
          <div class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Điểm tổng kết cuối cùng</div>
          <div style="font-size: 48px; font-weight: 800; color: var(--color-primary); margin: 8px 0;">
            ${myEval ? myEval.finalScore.toFixed(2) : '8.80'}
          </div>
          <div>
            <span class="badge badge-rating badge-rating-${myBonus.rank.toLowerCase()}" style="font-size: 16px; padding: 6px 16px; height: auto;">
              Xếp hạng: ${myBonus.rank} (Xuất sắc / Tốt)
            </span>
          </div>
          <div class="text-xs text-muted" style="margin-top: 12px;">Được làm tròn chuẩn xác 2 chữ số thập phân (BRL-27)</div>
        </div>

        <!-- Bonus Card -->
        <div class="card" style="text-align: center; padding: 32px 20px; background: linear-gradient(135deg, #f0fdf4, #ffffff); border-color: #bbf7d0;">
          <div class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Thưởng hiệu suất phê duyệt</div>
          <div style="font-size: 38px; font-weight: 800; color: var(--color-success); margin: 8px 0;">
            ${myBonus.finalBonus.toLocaleString()} VNĐ
          </div>
          <div class="badge badge-approved" style="padding: 4px 12px;">Đã làm tròn xuống 1.000 VNĐ & phân dư chuẩn xác</div>
          <div class="text-xs text-muted" style="margin-top: 12px;">Kế toán sẽ thực hiện chi trả theo kỳ lương tiếp theo</div>
        </div>
      </div>

      <!-- Formula Breakdown for Transparency -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Minh bạch công thức tính toán cá nhân</div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.7;">
          <p>• <b>Điểm thành phần:</b> KPI công việc: <b>8.70đ</b> (50%) | Chuyên cần: <b>9.00đ</b> (20%) | Thái độ: <b>8.50đ</b> (30%).</p>
          <p>• <b>Hệ số thưởng theo hạng:</b> <b>${myBonus.bonusCoeff}x</b> (Hạng ${myBonus.rank}).</p>
          <p>• <b>Hệ số thâm niên:</b> <b>${myBonus.seniorityCoeff}x</b> (Thâm niên ${myBonus.seniorityYears} năm).</p>
          <p>• <b>Trọng số phân bổ cá nhân:</b> <code>${myBonus.bonusCoeff} × ${myBonus.seniorityCoeff} = ${myBonus.allocationWeight.toFixed(3)}</code>.</p>
        </div>
      </div>

      <!-- Approved Comments -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Nhận xét từ Quản lý trực tiếp</div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-primary); line-height: 1.6;">
          <p><i>"Hoàn thành xuất sắc nhiệm vụ frontend, làm chủ tốt công nghệ mới. Code sạch sẽ, tuân thủ chặt chẽ design system và luôn hỗ trợ nhiệt tình các đồng nghiệp khi ghép nối API."</i></p>
          <div class="text-xs text-muted" style="margin-top: 8px;">— Trần Thị Quản Lý (Trưởng phòng Kỹ thuật)</div>
        </div>
      </div>
    `;
  }
};
