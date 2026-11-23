/**
 * AI-Assisted Performance & Bonus Hub
 * Director Views: Period Approval, Adjustments Confirmation & Reject Workflow
 * Strictly adhering to BRD BRL-17, BRL-18, 7.3 & UI/UX Prompt Mục 18 & 38
 */

window.DirectorViews = {
  // Director Approval Dashboard (Design Prompt Mục 18 & 38)
  renderApprovalView: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const employees = data.employees;
    const evaluations = data.evaluations[period.id] || [];
    const warnings = data.aiWarnings.filter(w => w.periodId === period.id);

    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      employees,
      evaluations,
      data.defaultConfig
    );

    // Check items needing Director confirmation (BRL-17: delta > 1.0 or rank changed)
    const adjustmentsNeedingConfirm = evaluations.filter(e => e.needsDirectorConfirm && !e.directorConfirmed);

    // Severe unresolved warnings
    const severePending = warnings.filter(w => w.severity === 'severe' && w.status === 'pending');

    // Validation checklist
    const isFundValid = bonusResult.totalAllocated <= period.totalBonusFund;
    const isSevereResolved = severePending.length === 0;
    const isAdjustmentsConfirmed = adjustmentsNeedingConfirm.length === 0;

    const canApprove = isFundValid && isSevereResolved && isAdjustmentsConfirmed;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Ban giám đốc</span> / <span>Phê duyệt kỳ</span>
          </div>
          <h1 class="page-title">Hội Đồng Phê Duyệt Kết Quả & Quỹ Thưởng</h1>
          <div class="page-subtitle">Kỳ: <b>${period.name}</b> | Trạng thái hiện tại: <span class="badge badge-${period.status}">${(window.I18N && window.I18N.status[period.status]) || period.status}</span></div>
        </div>
        <div class="page-actions">
          ${period.status !== 'approved' && period.status !== 'published' ? `
            <button class="btn btn-danger" onclick="DirectorViews.openRejectModal('${period.id}')">
              <span>✕ Từ chối phê duyệt</span>
            </button>
            <button class="btn btn-success" onclick="DirectorViews.approvePeriod('${period.id}')" ${!canApprove ? 'disabled' : ''}>
              <span>✓ Phê duyệt chính thức</span>
            </button>
          ` : `
            <span class="badge badge-approved" style="font-size: 14px; padding: 6px 14px;">
              ✓ Đã được Giám đốc phê duyệt
            </span>
          `}
        </div>
      </div>

      <!-- Checklist Grid -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <div class="card-title">Checklist điều kiện phê duyệt bắt buộc (AC-06 & BRL-17)</div>
          <span class="badge ${canApprove ? 'badge-approved' : 'badge-warning-severe'}">
            ${canApprove ? 'Đủ điều kiện phê duyệt' : 'Còn nội dung cần xác nhận'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div style="padding: 12px; border-radius: 6px; border: 1px solid ${isFundValid ? '#bbf7d0' : '#fca5a5'}; background: ${isFundValid ? '#f0fdf4' : '#fef2f2'};">
            <div style="font-weight: 700; color: ${isFundValid ? 'var(--color-success)' : 'var(--color-danger)'};">
              ${isFundValid ? '✓' : '✕'} Kiểm soát ngân sách quỹ thưởng
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
              Tổng thưởng (${bonusResult.totalAllocated.toLocaleString()} đ) ${isFundValid ? '≤' : '>'} Quỹ (${period.totalBonusFund.toLocaleString()} đ).
            </div>
          </div>

          <div style="padding: 12px; border-radius: 6px; border: 1px solid ${isSevereResolved ? '#bbf7d0' : '#fca5a5'}; background: ${isSevereResolved ? '#f0fdf4' : '#fef2f2'};">
            <div style="font-weight: 700; color: ${isSevereResolved ? 'var(--color-success)' : 'var(--color-danger)'};">
              ${isSevereResolved ? '✓' : '✕'} Xử lý cảnh báo AI Nghiêm trọng
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
              ${isSevereResolved ? 'Tất cả cảnh báo nghiêm trọng đã được phản hồi.' : `Còn ${severePending.length} cảnh báo nghiêm trọng chưa xử lý!`}
            </div>
          </div>

          <div style="padding: 12px; border-radius: 6px; border: 1px solid ${isAdjustmentsConfirmed ? '#bbf7d0' : '#fed7aa'}; background: ${isAdjustmentsConfirmed ? '#f0fdf4' : '#fffbeb'};">
            <div style="font-weight: 700; color: ${isAdjustmentsConfirmed ? 'var(--color-success)' : 'var(--color-warning)'};">
              ${isAdjustmentsConfirmed ? '✓' : '⚠️'} Xác nhận điều chỉnh điểm lớn (BRL-17)
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
              ${isAdjustmentsConfirmed ? 'Không có điều chỉnh nào tồn đọng.' : `Có ${adjustmentsNeedingConfirm.length} trường hợp đổi hạng / lệch > 1.0 điểm cần xác nhận.`}
            </div>
          </div>
        </div>
      </div>

      <!-- Critical adjustments needing confirm (BRL-17) -->
      ${adjustmentsNeedingConfirm.length > 0 ? `
        <div class="card" style="border-color: #fde68a; background: #fffdf7;">
          <div class="card-header">
            <div class="card-title text-warning" style="font-size: 15px;">
              ⚠️ Trường hợp điều chỉnh điểm cần Giám đốc phê chuẩn lại (BRL-17)
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${adjustmentsNeedingConfirm.map(adj => {
              const emp = employees.find(e => e.id === adj.employeeId);
              return `
                <div style="padding: 14px; border: 1px solid #fde68a; border-radius: 8px; background: #fff; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <div>
                    <div class="font-bold">${emp.name} (${emp.code}) — ${emp.department}</div>
                    <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 4px;">
                      Điểm Quản lý chấm: <b class="text-danger">${adj.originalManagerScore.toFixed(2)}</b> ➔ HR điều chỉnh thành: <b class="text-primary">${adj.adjustedScore.toFixed(2)}</b> 
                      (Lệch ${Math.abs(adj.adjustedScore - adj.originalManagerScore).toFixed(2)} điểm).
                    </div>
                    <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 2px;">
                      <b>Lý do của HR:</b> ${adj.adjustmentReason}
                    </div>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="DirectorViews.confirmAdjustment('${adj.employeeId}')">
                    Chấp thuận điều chỉnh này
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Proposed Bonus Summary Table for Director -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Bảng đề xuất phân bổ quỹ thưởng trình phê duyệt</div>
          <span class="text-xs text-muted">Tổng quỹ: ${period.totalBonusFund.toLocaleString()} VNĐ</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Điểm Tổng</th>
                <th>Xếp hạng</th>
                <th>Thâm niên</th>
                <th>Trọng số PB</th>
                <th>Thưởng Đề xuất</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Xem phiếu</th>
              </tr>
            </thead>
            <tbody>
              ${bonusResult.items.map(b => `
                <tr class="${b.isDisqualified ? 'row-severe' : ''}">
                  <td class="font-bold text-xs">${b.employeeCode}</td>
                  <td class="font-semibold">${b.employeeName}</td>
                  <td>${b.department}</td>
                  <td><b>${b.score.toFixed(2)}</b></td>
                  <td><span class="badge badge-rating badge-rating-${b.rank.toLowerCase()}">${b.rank}</span></td>
                  <td>${b.seniorityYears} năm</td>
                  <td>${b.allocationWeight.toFixed(3)}</td>
                  <td class="font-bold ${b.isDisqualified ? 'text-danger' : 'text-success'}">
                    ${b.finalBonus.toLocaleString()} VNĐ
                  </td>
                  <td>
                    ${b.isDisqualified ? `
                      <span class="badge badge-draft">Kỷ luật (0 đ)</span>
                    ` : `
                      <span class="badge badge-approved">Hợp lệ</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <div class="flex justify-end gap-1">
                      <button class="btn btn-sm btn-secondary" onclick="SharedViews.openSelfReviewModal('${b.employeeId}', '${period.id}')" title="Xem phiếu tự đánh giá của nhân viên">
                        Phiếu tự chấm
                      </button>
                      <button class="btn btn-sm btn-secondary" onclick="SharedViews.openManagerReviewModal('${b.employeeId}', '${period.id}')" title="Xem phiếu quản lý chấm">
                        Phiếu QL
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Confirm specific adjustment
  confirmAdjustment: function(employeeId) {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    const emp = data.employees.find(e => e.id === employeeId);

    if (ev) {
      ev.directorConfirmed = true;
      window.AppStorage.saveEvaluationForPeriod(period.id, ev);

      window.AppStorage.addAuditLog({
        periodId: period.id,
        periodName: period.name,
        actorName: 'Phạm Văn Giám Đốc',
        actorRole: 'Giám đốc Điều hành',
        actionType: 'DIRECTOR_CONFIRMED_ADJUSTMENT',
        targetEmployee: `${emp.name} (${emp.code})`,
        oldValue: 'Chờ Giám đốc phê chuẩn',
        newValue: `Đã xác nhận điểm ${ev.adjustedScore.toFixed(2)}`,
        reason: 'Giám đốc đã xem xét hồ sơ và đồng ý với điều chỉnh điểm của HR.'
      });

      window.ShellView.showToast('Đã xác nhận', `Đã chấp thuận điều chỉnh điểm cho ${emp.name}.`, 'success');
      App.navigateTo('dir-approval');
    }
  },

  // Approve period -> status becomes 'approved' (Locked)
  approvePeriod: function(periodId) {
    if (!confirm('Bạn có chắc chắn muốn PHÊ DUYỆT CHÍNH THỨC kỳ đánh giá này? Dữ liệu sẽ được khóa và chuyển cho HR công bố.')) return;

    const data = window.AppStorage.load();
    const period = data.periods.find(p => p.id === periodId);

    period.status = 'approved';
    period.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    period.approvedBy = 'Phạm Văn Giám Đốc';

    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Phạm Văn Giám Đốc',
      actorRole: 'Giám đốc Điều hành',
      actionType: 'PERIOD_APPROVED',
      targetEmployee: 'Toàn bộ nhân sự kỳ',
      oldValue: 'Calibration',
      newValue: 'Approved',
      reason: 'Ban Giám đốc đã hoàn tất phê duyệt phương án đánh giá và quỹ thưởng.'
    });

    window.AppStorage.addNotification({
      recipientRole: 'hr',
      recipientUserId: 'USR_HR',
      title: 'Kỳ đánh giá đã được Giám đốc phê duyệt',
      message: `Giám đốc đã duyệt ${period.name}. Bạn có thể tiến hành công bố cho nhân viên.`,
      type: 'success'
    });

    window.ShellView.showToast('Phê duyệt thành công', 'Kỳ đánh giá đã được khóa dữ liệu và phê chuẩn chính thức!', 'success');
    App.navigateTo('dir-approval');
  },

  // Reject modal with mandatory reason (BRL-18 & 7.3)
  openRejectModal: function(periodId) {
    const modalHtml = `
      <div class="modal-backdrop" id="reject-period-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title text-danger">Từ Chối Phê Duyệt Kỳ Đánh Giá</div>
            <button onclick="document.getElementById('reject-period-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #991b1b;">
              <b>Quy tắc nghiệp vụ:</b> Khi Giám đốc từ chối phê duyệt, kỳ đánh giá sẽ lập tức quay trở lại trạng thái <b>Cân đối điểm</b> để Nhân sự rà soát lại. Bắt buộc phải nhập lý do cụ thể.
            </div>

            <div class="form-group">
              <label class="form-label">Lý do từ chối phê duyệt <span class="required">*</span></label>
              <textarea id="input-reject-reason" class="form-control" placeholder="Nêu rõ yêu cầu hiệu chỉnh: rà soát lại xếp hạng phòng ban nào, điều chỉnh quỹ, kiểm tra lại nhân sự nào..." style="min-height: 90px;"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('reject-period-modal').remove()">Hủy</button>
            <button class="btn btn-danger" onclick="DirectorViews.submitReject('${periodId}')">Xác nhận từ chối</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  submitReject: function(periodId) {
    const reasonInput = document.getElementById('input-reject-reason');
    const reason = (reasonInput.value || '').trim();

    if (reason.length < 5) {
      alert('Bắt buộc phải nhập lý do từ chối (tối thiểu 5 ký tự).');
      return;
    }

    const data = window.AppStorage.load();
    const period = data.periods.find(p => p.id === periodId);

    period.status = 'calibration';
    period.rejectReason = reason;

    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Phạm Văn Giám Đốc',
      actorRole: 'Giám đốc Điều hành',
      actionType: 'PERIOD_REJECTED',
      targetEmployee: 'Toàn bộ nhân sự kỳ',
      oldValue: 'Chờ duyệt',
      newValue: 'Cân đối điểm (Bị từ chối)',
      reason: reason
    });

    window.AppStorage.addNotification({
      recipientRole: 'hr',
      recipientUserId: 'USR_HR',
      title: 'Giám đốc từ chối phê duyệt kỳ đánh giá',
      message: `Lý do: "${reason}". Kỳ đã được chuyển về trạng thái Cân đối điểm để rà soát.`,
      type: 'danger'
    });

    const modal = document.getElementById('reject-period-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Đã từ chối', 'Đã chuyển kỳ về Cân đối điểm kèm lý do gửi cho Nhân sự.', 'warning');
    App.navigateTo('dir-approval');
  }
};
