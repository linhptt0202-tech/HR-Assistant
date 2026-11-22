/**
 * AI-Assisted Performance & Bonus Hub
 * Accountant Views: Bonus Proposal Sheet & Reconciliation Export
 * Strictly adhering to BRD 3.5, Mục 20 & AC-21
 */

window.AccountantViews = {
  renderBonusSheet: function(data, container) {
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
            <span>Kế toán & Tài chính</span> / <span>Bảng đề xuất thưởng</span>
          </div>
          <h1 class="page-title">Bảng Đối Soát & Chi Trả Thưởng Hiệu Suất</h1>
          <div class="page-subtitle">Kỳ: <b>${period.name}</b> | Trạng thái: <span class="badge badge-${period.status}">${(window.I18N && window.I18N.status[period.status]) || period.status}</span></div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="window.print()">In bảng đối soát (PDF)</button>
          <button class="btn btn-primary" onclick="AccountantViews.exportBonusCSV()">
            <span>📥 Xuất bảng tính Excel / CSV (Chuẩn UTF-8)</span>
          </button>
        </div>
      </div>

      <!-- Reconciliation KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Ngân sách quỹ được cấp</div>
          <div class="kpi-value">${period.totalBonusFund.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Theo phê duyệt Ban Giám đốc</div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-label">Tổng tiền chi thưởng thực tế</div>
          <div class="kpi-value text-success">${bonusResult.totalAllocated.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Sau làm tròn xuống 1.000đ & phân dư</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Chênh lệch / Quỹ còn lại</div>
          <div class="kpi-value">${bonusResult.remainingFund.toLocaleString()} <span class="text-xs font-normal">VNĐ</span></div>
          <div class="kpi-sub">Số tiền hoàn nhập quỹ công ty</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Số nhân sự chi trả</div>
          <div class="kpi-value">${bonusResult.eligibleCount} <span class="text-xs font-normal">người</span></div>
          <div class="kpi-sub">Bị loại (Thưởng 0đ): ${bonusResult.disqualifiedCount} người</div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Chi tiết danh sách chi trả thưởng hiệu suất</div>
          <span class="text-xs text-muted">Số liệu chuẩn khớp 100% với báo cáo Hội đồng</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="accountant-bonus-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Chức danh</th>
                <th>Điểm Tổng</th>
                <th>Xếp hạng</th>
                <th>Hệ số Hạng</th>
                <th>Thâm niên</th>
                <th>Hệ số TN</th>
                <th>Trọng số PB</th>
                <th>Số tiền đề xuất</th>
                <th>Ghi chú nghiệp vụ</th>
              </tr>
            </thead>
            <tbody>
              ${bonusResult.items.map((item, idx) => `
                <tr class="${item.isDisqualified ? 'row-severe' : ''}">
                  <td>${idx + 1}</td>
                  <td class="font-bold text-xs">${item.employeeCode}</td>
                  <td class="font-semibold">${item.employeeName}</td>
                  <td>${item.department}</td>
                  <td class="text-xs text-muted">${item.title}</td>
                  <td><b>${item.score.toFixed(2)}</b></td>
                  <td><span class="badge badge-rating badge-rating-${item.rank.toLowerCase()}">${item.rank}</span></td>
                  <td>${item.bonusCoeff}x</td>
                  <td class="text-xs">${item.seniorityYears} năm</td>
                  <td>${item.seniorityCoeff}x</td>
                  <td class="font-bold">${item.allocationWeight.toFixed(3)}</td>
                  <td class="font-bold ${item.isDisqualified ? 'text-danger' : 'text-success'}" style="font-size: 14px;">
                    ${item.finalBonus.toLocaleString()} VNĐ
                  </td>
                  <td class="text-xs">
                    ${item.isDisqualified ? `<span class="text-danger">${item.disqualifiedReason}</span>` : 'Đủ điều kiện chi trả'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: var(--color-surface-subtle); font-weight: 700;">
                <td colspan="11" style="text-align: right;">TỔNG CỘNG TIỀN CHI TRẢ:</td>
                <td class="text-success" style="font-size: 15px;">${bonusResult.totalAllocated.toLocaleString()} VNĐ</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  },

  // Export to CSV with UTF-8 BOM for Microsoft Excel (AC-21)
  exportBonusCSV: function() {
    const data = window.AppStorage.load();
    const period = window.AppStorage.getActivePeriod();
    const bonusResult = window.CalculationEngine.calculateBonusAllocation(
      period.totalBonusFund,
      data.employees,
      data.evaluations[period.id] || [],
      data.defaultConfig
    );

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'STT,Mã nhân viên,Họ và tên,Phòng ban,Chức danh,Điểm tổng,Xếp hạng,Hệ số hạng,Thâm niên (năm),Hệ số thâm niên,Trọng số phân bổ,Số tiền đề xuất (VNĐ),Ghi chú\r\n';

    bonusResult.items.forEach((item, idx) => {
      csv += `"${idx + 1}","${item.employeeCode}","${item.employeeName}","${item.department}","${item.title}","${item.score.toFixed(2)}","${item.rank}","${item.bonusCoeff}","${item.seniorityYears}","${item.seniorityCoeff}","${item.allocationWeight.toFixed(3)}","${item.finalBonus}","${item.isDisqualified ? item.disqualifiedReason : 'Đủ điều kiện'}"\r\n`;
    });

    // Summary line
    csv += `"","","","","","","","","","","TỔNG CỘNG:","${bonusResult.totalAllocated}",""\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_De_Xuat_Thuong_${period.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.ShellView.showToast('Đã xuất file', 'File CSV bảng đề xuất thưởng chuẩn UTF-8 đã được tải về máy.', 'success');
  }
};
