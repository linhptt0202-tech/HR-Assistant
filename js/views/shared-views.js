/**
 * AI-Assisted Performance & Bonus Hub
 * Shared Views: Audit Log, CSV Importer, Reopen Period, System Config, Reports & Notifications
 */

window.SharedViews = {
  // 1. Audit Log View (Design Prompt Mục 21 & BRD BRL-10, BRL-16)
  renderAuditLogs: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const logs = data.auditLogs;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Hệ thống</span> / <span>Nhật ký thao tác</span>
          </div>
          <h1 class="page-title">Nhật Ký Thao Tác Nghiệp Vụ (Audit Trail)</h1>
          <div class="page-subtitle">Lưu vết bất biến toàn bộ các hành động sửa điểm, phê duyệt, từ chối, mở lại kỳ và xử lý AI</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="SharedViews.exportAuditCSV()">Xuất file log (CSV)</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="padding: 14px 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="log-search" class="form-control" placeholder="Tìm kiếm theo nhân viên, lý do..." style="width: 280px;" oninput="SharedViews.filterLogs()">
          <select id="log-action-filter" class="form-control" style="width: 200px;" onchange="SharedViews.filterLogs()">
            <option value="ALL">Tất cả loại hành động</option>
            <option value="SCORE_ADJUSTED">Sửa điểm (HR)</option>
            <option value="BONUS_EXCLUSION">Loại thưởng (Kỷ luật)</option>
            <option value="AI_WARNING_RESOLVED">Xử lý cảnh báo AI</option>
            <option value="PERIOD_APPROVED">Phê duyệt kỳ (Giám đốc)</option>
            <option value="PERIOD_REJECTED">Từ chối kỳ (Giám đốc)</option>
            <option value="PERIOD_REOPENED">Mở lại kỳ (HR)</option>
          </select>
        </div>
      </div>

      <!-- Log Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table" id="audit-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Vai trò</th>
                <th>Hành động</th>
                <th>Đối tượng liên quan</th>
                <th>Giá trị trước</th>
                <th>Giá trị sau</th>
                <th>Lý do nghiệp vụ (Bắt buộc)</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td class="text-xs text-muted" style="white-space: nowrap;">${log.timestamp}</td>
                  <td class="font-semibold">${log.actorName}</td>
                  <td><span class="badge badge-draft">${log.actorRole}</span></td>
                  <td><b>${log.actionType}</b></td>
                  <td>${log.targetEmployee}</td>
                  <td class="text-xs text-muted">${log.oldValue || '-'}</td>
                  <td class="text-xs font-semibold text-primary">${log.newValue || '-'}</td>
                  <td class="text-xs" style="max-width: 300px; line-height: 1.4;">${log.reason}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterLogs: function() {
    const searchVal = (document.getElementById('log-search')?.value || '').toLowerCase();
    const actionVal = document.getElementById('log-action-filter')?.value || 'ALL';

    const table = document.getElementById('audit-table');
    if (!table) return;

    table.querySelectorAll('tbody tr').forEach(r => {
      const text = r.textContent.toLowerCase();
      const matchSearch = text.includes(searchVal);
      const matchAction = actionVal === 'ALL' || text.includes(actionVal.toLowerCase());
      r.style.display = (matchSearch && matchAction) ? '' : 'none';
    });
  },

  exportAuditCSV: function() {
    const data = window.AppStorage.load();
    let csv = '\uFEFF';
    csv += 'Thời gian,Người thực hiện,Vai trò,Hành động,Đối tượng,Giá trị cũ,Giá trị mới,Lý do\r\n';
    data.auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.actionType}","${l.targetEmployee}","${l.oldValue || ''}","${l.newValue || ''}","${l.reason}"\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.ShellView.showToast('Đã xuất log', 'File nhật ký thao tác đã được tải về.', 'success');
  },

  // 2. CSV Import Workspace View (Design Prompt Mục 13 & 39)
  renderImportWorkspace: function(data, container) {
    const period = window.AppStorage.getActivePeriod();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Nhân sự</span> / <span>Nhập dữ liệu từ tệp</span>
          </div>
          <h1 class="page-title">Nhập Dữ Liệu Chấm Công & KPI</h1>
          <div class="page-subtitle">Nhập tệp CSV với quy trình kiểm thử xem trước, từ chối dữ liệu trùng lặp và cảnh báo theo từng ô (BRL-19)</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="SharedViews.downloadSampleCSV()">
            <span>📥 Tải tệp CSV mẫu</span>
          </button>
        </div>
      </div>

      <!-- Upload Dropzone Card -->
      <div class="card">
        <div style="border: 2px dashed var(--color-border); border-radius: 8px; padding: 36px 20px; text-align: center; background: #f8fafc; cursor: pointer;" onclick="document.getElementById('csv-file-input').click()">
          <input type="file" id="csv-file-input" accept=".csv" style="display: none;" onchange="SharedViews.handleFileSelected(event)">
          <div style="font-size: 36px; margin-bottom: 8px;">📄</div>
          <div class="font-bold text-base" style="margin-bottom: 4px;">Kéo thả tệp CSV vào đây hoặc bấm để chọn tệp</div>
          <div class="text-xs text-muted" style="margin-bottom: 12px;">Định dạng chuẩn: employee_id, period, working_days, late_count, leave_days, kpi_achievement_pct</div>
          <button type="button" class="btn btn-sm btn-primary">Chọn tệp từ máy tính</button>
          <button type="button" class="btn btn-sm btn-secondary" style="margin-left: 8px;" onclick="event.stopPropagation(); SharedViews.loadSampleForTest()">Nạp dữ liệu mẫu thử nghiệm (Có dòng lỗi & trùng)</button>
        </div>
      </div>

      <!-- Preview Container -->
      <div id="import-preview-container"></div>
    `;
  },

  downloadSampleCSV: function() {
    const blob = new Blob([window.CSVImporter.SAMPLE_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_import_kpi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.ShellView.showToast('Tải về', 'Đã tải file CSV mẫu.', 'info');
  },

  loadSampleForTest: function() {
    this.processCSVContent(window.CSVImporter.SAMPLE_TEMPLATE_CONTENT);
  },

  handleFileSelected: function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      SharedViews.processCSVContent(e.target.result);
    };
    reader.readAsText(file);
  },

  processCSVContent: function(content) {
    const period = window.AppStorage.getActivePeriod();
    const result = window.CSVImporter.parseCSV(content, period.code);
    const container = document.getElementById('import-preview-container');

    if (!result.success) {
      container.innerHTML = `
        <div class="card" style="border-color: var(--color-danger); background: #fef2f2;">
          <div style="font-weight: 700; color: var(--color-danger); margin-bottom: 4px;">Lỗi định dạng file:</div>
          <div style="font-size: 13px; color: var(--color-text-secondary);">${result.error}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card" style="margin-top: 20px;">
        <div class="card-header">
          <div class="card-title">Kết quả kiểm tra dữ liệu trước khi nạp (Preview)</div>
          <div class="flex gap-2">
            <span class="badge badge-draft">Tổng dòng: ${result.totalRows}</span>
            <span class="badge badge-approved">Hợp lệ: ${result.validCount}</span>
            <span class="badge badge-warning-severe">Lỗi: ${result.errorCount}</span>
            <span class="badge badge-manager-review">Trùng lặp: ${result.duplicateCount}</span>
          </div>
        </div>

        <div style="padding: 10px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
          <b>Quy tắc nhập dữ liệu (BRL-19):</b> Các dòng trùng khóa (mã NV + kỳ) sẽ bị từ chối dòng xuất hiện sau. Các dòng thiếu trường hoặc sai định dạng bị bỏ qua và liệt kê chi tiết dưới đây. Chỉ những dòng hợp lệ mới được lưu vào hệ thống.
        </div>

        <!-- Tabs -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--color-border); margin-bottom: 14px;">
          <button class="btn btn-sm btn-secondary" onclick="SharedViews.switchImportTab('all')">Tất cả (${result.totalRows})</button>
          <button class="btn btn-sm btn-success" onclick="SharedViews.switchImportTab('valid')">Dòng Hợp lệ (${result.validCount})</button>
          <button class="btn btn-sm btn-danger" onclick="SharedViews.switchImportTab('error')">Dòng Lỗi (${result.errorCount})</button>
          <button class="btn btn-sm btn-warning" onclick="SharedViews.switchImportTab('duplicate')">Dòng Trùng (${result.duplicateCount})</button>
        </div>

        <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
          <table class="data-table" id="import-preview-table">
            <thead>
              <tr>
                <th>Dòng #</th>
                <th>Mã NV</th>
                <th>Kỳ</th>
                <th>Ngày công</th>
                <th>Đi muộn</th>
                <th>Nghỉ phép</th>
                <th>KPI %</th>
                <th>Trạng thái kiểm tra</th>
                <th>Chi tiết lỗi / Lý do</th>
              </tr>
            </thead>
            <tbody>
              ${result.allRows.map(r => {
                let statusBadge = '<span class="badge badge-approved">Hợp lệ</span>';
                let reason = 'Đạt chuẩn';
                let rowBg = '';

                if (r.status === 'duplicate') {
                  statusBadge = '<span class="badge badge-manager-review">Trùng lặp</span>';
                  reason = r.reason || 'Trùng khóa (Mã NV + Kỳ)';
                  rowBg = 'background: #fffbeb;';
                } else if (r.status === 'error') {
                  statusBadge = '<span class="badge badge-warning-severe">Lỗi ô</span>';
                  reason = r.cellErrors ? r.cellErrors.map(ce => `[${ce.column}]: ${ce.error}`).join('; ') : 'Sai định dạng';
                  rowBg = 'background: #fef2f2;';
                }

                return `
                  <tr style="${rowBg}" class="import-row import-row-${r.status}">
                    <td>${r.rowNumber}</td>
                    <td class="font-bold">${r.data.employee_id}</td>
                    <td>${r.data.period}</td>
                    <td>${r.data.working_days}</td>
                    <td>${r.data.late_count}</td>
                    <td>${r.data.leave_days}</td>
                    <td>${r.data.kpi_achievement_pct}%</td>
                    <td>${statusBadge}</td>
                    <td class="text-xs text-danger">${reason}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
          <button class="btn btn-secondary" onclick="document.getElementById('import-preview-container').innerHTML = ''">Hủy bỏ</button>
          <button class="btn btn-primary" onclick="SharedViews.confirmValidImport(${result.validCount})" ${result.validCount === 0 ? 'disabled' : ''}>
            Xác nhận nạp ${result.validCount} dòng hợp lệ
          </button>
        </div>
      </div>
    `;
  },

  switchImportTab: function(tabName) {
    const rows = document.querySelectorAll('.import-row');
    rows.forEach(r => {
      if (tabName === 'all') {
        r.style.display = '';
      } else {
        r.style.display = r.classList.contains(`import-row-${tabName}`) ? '' : 'none';
      }
    });
  },

  confirmValidImport: function(count) {
    const period = window.AppStorage.getActivePeriod();
    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Nguyễn Văn HR',
      actorRole: 'HR / Admin',
      actionType: 'CSV_DATA_IMPORTED',
      targetEmployee: `${count} nhân viên`,
      oldValue: 'Chưa cập nhật KPI',
      newValue: `Đã nạp ${count} dòng KPI & chấm công`,
      reason: 'HR xác nhận nạp các dòng hợp lệ từ file CSV sau bước preview kiểm thử.'
    });

    document.getElementById('import-preview-container').innerHTML = '';
    window.ShellView.showToast('Nạp thành công', `Đã nhập thành công ${count} bản ghi dữ liệu hợp lệ vào kỳ ${period.name}.`, 'success');
    App.navigateTo('hr-dashboard');
  },

  // 3. Reopen Period Modal (Design Prompt Mục 4.1 & BRL-10)
  openReopenModal: function(periodId) {
    const modalHtml = `
      <div class="modal-backdrop" id="reopen-period-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title text-warning">Mở Lại Kỳ Đánh Giá Về Calibration</div>
            <button onclick="document.getElementById('reopen-period-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #92400e;">
              <b>Quy tắc BRL-10:</b> Sau khi kỳ ở trạng thái Approved hoặc Published, chỉ tài khoản HR mới có quyền mở lại kỳ về trạng thái <b>Calibration</b>. Thao tác này bắt buộc phải nhập lý do giải trình và hệ thống sẽ tự động phát thông báo tới các bên liên quan.
            </div>

            <div class="form-group">
              <label class="form-label">Lý do mở lại kỳ đánh giá <span class="required">*</span></label>
              <textarea id="input-reopen-reason" class="form-control" placeholder="Nêu rõ căn cứ: phát hiện sai sót dữ liệu chấm công, có khiếu nại được chấp thuận, điều chỉnh ngân sách..." style="min-height: 90px;"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('reopen-period-modal').remove()">Hủy</button>
            <button class="btn btn-warning" onclick="SharedViews.submitReopen('${periodId}')">Xác nhận mở lại kỳ</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  submitReopen: function(periodId) {
    const reasonInput = document.getElementById('input-reopen-reason');
    const reason = (reasonInput.value || '').trim();

    if (reason.length < 5) {
      alert('Bắt buộc phải nhập lý do mở lại kỳ đánh giá (tối thiểu 5 ký tự).');
      return;
    }

    const data = window.AppStorage.load();
    const period = data.periods.find(p => p.id === periodId);

    const oldStatus = period.status;
    period.status = 'calibration';
    period.reopenedReason = reason;

    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Nguyễn Văn HR',
      actorRole: 'HR / Admin',
      actionType: 'PERIOD_REOPENED',
      targetEmployee: 'Toàn bộ nhân sự kỳ',
      oldValue: oldStatus,
      newValue: 'Calibration',
      reason: reason
    });

    window.AppStorage.addNotification({
      recipientRole: 'director',
      recipientUserId: 'USR_DIR',
      title: 'Kỳ đánh giá được mở lại về Calibration',
      message: `HR đã mở lại ${period.name} về trạng thái Calibration. Lý do: "${reason}".`,
      type: 'warning'
    });

    const modal = document.getElementById('reopen-period-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Đã mở lại', `Kỳ ${period.name} đã được chuyển về trạng thái Calibration.`, 'warning');
    App.navigateTo('hr-dashboard');
  },

  // 4. System Configuration View (Design Prompt Mục 22 & Phần J)
  renderSystemConfig: function(data, container) {
    const config = data.defaultConfig;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Hệ thống</span> / <span>Cấu hình tham số</span>
          </div>
          <h1 class="page-title">Cấu Hình Ngưỡng Xếp Hạng & Hệ Số</h1>
          <div class="page-subtitle">Các tham số BRD đang chờ Business xác nhận được thể hiện dưới dạng cấu hình linh hoạt theo kỳ (BRL-29)</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);" class="grid-2col">
        <!-- Rating Brackets -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Ngưỡng điểm xếp hạng & Hệ số thưởng</div>
            <span class="badge badge-manager-review">Đề xuất — chờ xác nhận</span>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Điểm tối thiểu</th>
                <th>Tên gọi</th>
                <th>Hệ số thưởng</th>
              </tr>
            </thead>
            <tbody>
              ${config.ratingBrackets.map(b => `
                <tr>
                  <td><span class="badge badge-rating badge-rating-${b.rank.toLowerCase()}">${b.rank}</span></td>
                  <td>≥ ${b.minScore.toFixed(2)}</td>
                  <td>${b.label}</td>
                  <td><b>${b.bonusCoeff}x</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Seniority Brackets -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Hệ số thâm niên công tác (BRD Mục 9.1)</div>
            <span class="badge badge-manager-review">Đề xuất — chờ xác nhận</span>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Khoảng thâm niên</th>
                <th>Mốc thời gian</th>
                <th>Hệ số đề xuất</th>
              </tr>
            </thead>
            <tbody>
              ${config.seniorityBrackets.map(sb => `
                <tr>
                  <td class="font-semibold">${sb.label}</td>
                  <td class="text-xs text-muted">${sb.minYears} đến &lt; ${sb.maxYears} năm</td>
                  <td><b class="text-primary">${sb.coeff}x</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Additional Settings -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Quy chuẩn tính toán & Ngưỡng an toàn</div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.8;">
          <p>• <b>Làm tròn tiền thưởng:</b> <code>1.000 VNĐ</code> (BRL-15).</p>
          <p>• <b>Ngưỡng điều chỉnh điểm cần Giám đốc phê chuẩn lại:</b> <code>Đổi xếp hạng</code> hoặc <code>Độ lệch > 1.0 điểm</code> (BRL-17).</p>
          <p>• <b>Thời hạn nhắc việc:</b> Nhắc nhân viên trước hạn tự đánh giá 1 ngày; nhắc quản lý quá hạn 3 ngày.</p>
        </div>
      </div>
    `;
  },

  // 5. Reports View (Design Prompt Mục 20)
  // Quy tắc mới: Quản lý chỉ được nhìn thấy nhân viên phòng ban mình; Nhân viên chỉ thấy chính mình!
  // Đánh giá tổng năm: lấy tổng/trung bình các quý đánh giá!
  renderReports: function(data, container) {
    const period = window.AppStorage.getActivePeriod();
    const currentUser = window.AppStorage.getCurrentUser();
    const allEmployees = data.employees;
    const evaluations = data.evaluations[period.id] || [];

    // Phân quyền phạm vi nhìn thấy dữ liệu (Role-based Department Scope)
    let visibleEmployees = allEmployees;
    let scopeNotice = 'Phạm vi: Toàn công ty';

    if (currentUser.role === 'manager') {
      visibleEmployees = allEmployees.filter(e => e.department === currentUser.department);
      scopeNotice = `Phạm vi: Chỉ phòng ban ${currentUser.department} (BRL-07)`;
    } else if (currentUser.role === 'employee') {
      visibleEmployees = allEmployees.filter(e => e.userId === currentUser.id || e.id === 'EMP001');
      scopeNotice = 'Phạm vi: Chỉ dữ liệu cá nhân của bạn';
    }

    const isYearPeriod = period.type === 'year';

    // Tính toán thưởng
    let bonusResult;
    if (isYearPeriod) {
      bonusResult = window.CalculationEngine.calculateYearlyEvaluation(
        period.totalBonusFund,
        allEmployees,
        evaluations,
        data.defaultConfig
      );
    } else {
      bonusResult = window.CalculationEngine.calculateBonusAllocation(
        period.totalBonusFund,
        allEmployees,
        evaluations,
        data.defaultConfig
      );
    }

    const visibleItems = bonusResult.items.filter(item => visibleEmployees.some(ve => ve.id === item.employeeId));

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Báo cáo</span> / <span>${isYearPeriod ? 'Tổng kết năm' : 'Tổng hợp kỳ'}</span>
          </div>
          <h1 class="page-title">${isYearPeriod ? 'Báo Cáo Đánh Giá & Thưởng Tổng Kết Năm' : 'Báo Cáo Toàn Diện Kỳ Đánh Giá'}</h1>
          <div class="page-subtitle">Kỳ: <b>${period.name}</b> | <span class="badge badge-manager-review">${scopeNotice}</span></div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="window.print()">In báo cáo (PDF)</button>
          <button class="btn btn-primary" onclick="AccountantViews.exportBonusCSV()">Xuất bảng thưởng (Excel)</button>
        </div>
      </div>

      <!-- Summary metrics -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Nhân sự trong phạm vi xem</div>
          <div class="kpi-value">${visibleItems.length} <span class="text-xs font-normal">nhân viên</span></div>
          <div class="kpi-sub">${currentUser.department || 'Toàn hệ thống'}</div>
        </div>
        <div class="kpi-card kpi-success">
          <div class="kpi-label">${isYearPeriod ? 'Tổng thưởng năm (Phạm vi)' : 'Tổng thưởng đề xuất (Phạm vi)'}</div>
          <div class="kpi-value text-success">${visibleItems.reduce((acc, i) => acc + i.finalBonus, 0).toLocaleString()} đ</div>
          <div class="kpi-sub">Quỹ kỳ: ${(period.totalBonusFund / 1000000).toFixed(0)} triệu đ</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Nhân sự xếp hạng S & A</div>
          <div class="kpi-value">${visibleItems.filter(i => i.rank === 'S' || i.rank === 'A').length} <span class="text-xs font-normal">người</span></div>
          <div class="kpi-sub">Xuất sắc & Tốt</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Nhân sự xếp hạng B & C</div>
          <div class="kpi-value">${visibleItems.filter(i => i.rank === 'B' || i.rank === 'C').length} <span class="text-xs font-normal">người</span></div>
          <div class="kpi-sub">Đạt & Cần cải thiện</div>
        </div>
      </div>

      <!-- Breakdown Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            ${isYearPeriod ? 'Bảng tổng hợp đánh giá tổng năm (Lấy tổng/trung bình 4 quý)' : 'Báo cáo phân bổ chi tiết theo nhân sự'}
          </div>
          <span class="text-xs text-muted">Chỉ hiển thị phạm vi quyền được cấp</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Phòng ban</th>
                ${isYearPeriod ? `
                  <th>Điểm Q1</th>
                  <th>Điểm Q2</th>
                  <th>Điểm Q3</th>
                  <th>Điểm Q4</th>
                  <th>Điểm Tổng Năm</th>
                ` : `
                  <th>Điểm Tổng</th>
                `}
                <th>Hạng</th>
                <th>Thâm niên</th>
                <th>Thưởng Đề xuất</th>
                <th style="text-align: right;">Xem phiếu</th>
              </tr>
            </thead>
            <tbody>
              ${visibleItems.map(b => `
                <tr>
                  <td class="font-bold text-xs">${b.employeeCode}</td>
                  <td class="font-semibold">${b.employeeName}</td>
                  <td>${b.department}</td>
                  ${isYearPeriod ? `
                    <td>${b.q1Score ? b.q1Score.toFixed(2) : '-'}</td>
                    <td>${b.q2Score ? b.q2Score.toFixed(2) : '-'}</td>
                    <td>${b.q3Score ? b.q3Score.toFixed(2) : '-'}</td>
                    <td>${b.q4Score ? b.q4Score.toFixed(2) : '-'}</td>
                    <td class="font-bold text-primary">${b.annualAverageScore ? b.annualAverageScore.toFixed(2) : b.score.toFixed(2)}</td>
                  ` : `
                    <td><b>${b.score.toFixed(2)}</b></td>
                  `}
                  <td><span class="badge badge-rating badge-rating-${b.rank.toLowerCase()}">${b.rank}</span></td>
                  <td class="text-xs">${b.seniorityYears} năm (${b.seniorityCoeff}x)</td>
                  <td class="font-bold ${b.isDisqualified ? 'text-danger' : 'text-success'}">
                    ${b.finalBonus.toLocaleString()} đ
                  </td>
                  <td style="text-align: right;">
                    <div class="flex justify-end gap-1">
                      <button class="btn btn-sm btn-secondary" onclick="SharedViews.openSelfReviewModal('${b.employeeId}', '${period.id}')" title="Xem phiếu tự đánh giá của nhân viên">
                        Phiếu tự chấm
                      </button>
                      ${currentUser.role === 'hr' || currentUser.role === 'director' ? `
                        <button class="btn btn-sm btn-secondary" onclick="SharedViews.openManagerReviewModal('${b.employeeId}', '${period.id}')" title="Xem phiếu quản lý chấm">
                          Phiếu QL chấm
                        </button>
                      ` : ''}
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

  // 6. Notifications View
  // Quy tắc mới: Nhân viên chỉ nhận tin của mình; Quản lý chỉ nhận tin phòng ban mình; Không lộ tin HR/Giám đốc cho cấp dưới
  renderNotifications: function(data, container) {
    const currentUser = window.AppStorage.getCurrentUser();
    const userNotifications = window.AppStorage.getNotificationsForCurrentUser(currentUser);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>Cá nhân</span> / <span>Thông báo</span>
          </div>
          <h1 class="page-title">Trung Tâm Thông Báo Của Bạn</h1>
          <div class="page-subtitle">Người nhận: <b>${currentUser.name}</b> (${currentUser.title}) | Phòng: <b>${currentUser.department || 'Toàn công ty'}</b></div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 20px; background: #f8fafc; border-left: 4px solid var(--color-primary-action);">
        <div style="font-size: 13px; color: var(--color-text-secondary);">
          🔒 <b>Chính sách bảo mật thông báo:</b> Bạn chỉ nhận được thông báo liên quan trực tiếp đến bạn và phạm vi phụ trách. Thông tin của nhân viên phòng ban khác hoặc các thao tác nội bộ của cấp quản lý khác được bảo mật tuyệt đối.
        </div>
      </div>

      <div class="card">
        ${userNotifications.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: var(--color-text-muted);">
            Bạn không có thông báo mới nào.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${userNotifications.map(n => `
              <div style="padding: 14px; border: 1px solid var(--color-border); border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge badge-${n.type === 'warning' ? 'manager-review' : n.type === 'danger' ? 'draft' : 'approved'}">
                      ${(window.I18N && window.I18N.notificationType[n.type]) || n.type}
                    </span>
                    <span class="font-bold text-sm">${n.title}</span>
                    <span class="text-xs text-muted">${n.timestamp}</span>
                  </div>
                  <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">${n.message}</div>
                </div>
                <span class="text-xs text-muted">${n.isRead ? 'Đã xem' : 'Mới'}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  // Modal: Xem phiếu tự đánh giá của nhân viên (Quản lý, HR, Giám đốc)
  openSelfReviewModal: function(employeeId, periodId) {
    const data = window.AppStorage.load();
    const period = periodId ? data.periods.find(p => p.id === periodId) : window.AppStorage.getActivePeriod();
    const employee = data.employees.find(e => e.id === employeeId);
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    const template = data.criteriaTemplate;

    const isSubmitted = ev && ev.selfReviewStatus === 'submitted';
    const isOverdue = ev && ev.selfReviewStatus === 'not_submitted';

    const modalHtml = `
      <div class="modal-backdrop" id="self-review-detail-modal">
        <div class="modal-dialog modal-dialog-lg" style="max-width: 900px; max-height: 88vh;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Phiếu Tự Đánh Giá — ${employee.name} (${employee.code})</div>
              <div class="text-xs text-muted">Chức danh: ${employee.title} | Phòng: ${employee.department} | Kỳ: ${period.name}</div>
            </div>
            <button onclick="document.getElementById('self-review-detail-modal').remove()" style="font-size: 22px;">&times;</button>
          </div>
          <div class="modal-body" style="overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
              <div>
                <span class="text-xs text-muted">Trạng thái tự đánh giá:</span>
                ${isSubmitted ? '<span class="badge badge-approved" style="margin-left: 6px;">Đã nộp phiếu</span>' 
                  : isOverdue ? '<span class="badge badge-draft" style="margin-left: 6px;">Không tự đánh giá (Quá hạn)</span>'
                  : '<span class="badge badge-warning-normal" style="margin-left: 6px;">Chưa nộp phiếu</span>'}
                ${isSubmitted && ev.selfSubmittedAt ? `<span class="text-xs text-muted" style="margin-left: 8px;">(Nộp lúc ${ev.selfSubmittedAt})</span>` : ''}
              </div>
              <div>
                <span class="text-xs text-muted">Tổng điểm tự chấm:</span>
                <span class="font-bold text-primary" style="font-size: 18px; margin-left: 6px;">
                  ${ev && ev.selfTotalScore !== null && ev.selfTotalScore !== undefined ? ev.selfTotalScore.toFixed(2) : '--'}
                </span>
              </div>
            </div>

            ${!isSubmitted ? `
              <div style="text-align: center; padding: 30px; color: var(--color-text-muted);">
                Nhân viên chưa nộp phiếu tự đánh giá cho kỳ này.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${template.groups.map(g => `
                  <div class="card" style="padding: 14px; margin-bottom: 0;">
                    <div style="font-weight: 700; margin-bottom: 8px; color: var(--color-text-primary);">
                      ${g.name} <span class="badge badge-draft text-xs">Trọng số: ${g.weight}%</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      ${g.subCriteria.map(sc => {
                        const score = ev.selfScores ? ev.selfScores[sc.id] : null;
                        const comment = ev.selfComments ? ev.selfComments[sc.id] : '';
                        return `
                          <div style="padding: 10px; background: #f8fafc; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                              <span class="font-semibold">${sc.name} (${sc.weight}%)</span>
                              <span class="font-bold text-primary">Tự chấm: ${score !== null ? score : '-'} / 10</span>
                            </div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">
                              <b>Ghi chú / Dẫn chứng của NV:</b> ${comment || '<i class="text-muted">Không có ghi chú</i>'}
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('self-review-detail-modal').remove()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // Modal: Xem phiếu đánh giá của Quản lý (HR và Giám đốc)
  openManagerReviewModal: function(employeeId, periodId) {
    const data = window.AppStorage.load();
    const period = periodId ? data.periods.find(p => p.id === periodId) : window.AppStorage.getActivePeriod();
    const employee = data.employees.find(e => e.id === employeeId);
    const ev = (data.evaluations[period.id] || []).find(e => e.employeeId === employeeId);
    const template = data.criteriaTemplate;

    if (!ev || ev.managerReviewStatus !== 'completed') {
      alert('Quản lý trực tiếp chưa hoàn tất chấm điểm cho nhân viên này.');
      return;
    }

    const modalHtml = `
      <div class="modal-backdrop" id="manager-review-detail-modal">
        <div class="modal-dialog modal-dialog-lg" style="max-width: 900px; max-height: 88vh;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Phiếu Đánh Giá Của Quản Lý — ${employee.name} (${employee.code})</div>
              <div class="text-xs text-muted">Quản lý chấm: ${employee.managerName} | Phòng: ${employee.department} | Kỳ: ${period.name}</div>
            </div>
            <button onclick="document.getElementById('manager-review-detail-modal').remove()" style="font-size: 22px;">&times;</button>
          </div>
          <div class="modal-body" style="overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
              <div>
                <span class="text-xs text-muted">Điểm Quản lý:</span>
                <div class="font-bold text-primary" style="font-size: 18px;">${ev.managerTotalScore.toFixed(2)}</div>
              </div>
              <div>
                <span class="text-xs text-muted">Xếp hạng:</span>
                <div><span class="badge badge-rating badge-rating-${ev.rank ? ev.rank.toLowerCase() : 'b'}">${ev.rank}</span></div>
              </div>
              <div>
                <span class="text-xs text-muted">Thời gian chấm:</span>
                <div class="font-semibold">${ev.managerReviewedAt || 'Đúng hạn'}</div>
              </div>
              <div>
                <span class="text-xs text-muted">Calibration:</span>
                <div>${ev.isAdjusted ? `<span class="badge badge-warning-normal">Đã sửa: ${ev.adjustedScore.toFixed(2)}</span>` : '<span class="badge badge-approved">Nguyên bản</span>'}</div>
              </div>
            </div>

            ${ev.isAdjusted ? `
              <div style="padding: 10px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
                <b>Lịch sử điều chỉnh của HR:</b> Điểm quản lý ban đầu là <b>${ev.originalManagerScore.toFixed(2)}</b>, HR điều chỉnh thành <b>${ev.adjustedScore.toFixed(2)}</b>.<br>
                <b>Lý do điều chỉnh:</b> ${ev.adjustmentReason}
              </div>
            ` : ''}

            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${template.groups.map(g => `
                <div class="card" style="padding: 14px; margin-bottom: 0;">
                  <div style="font-weight: 700; margin-bottom: 8px; color: var(--color-text-primary);">
                    ${g.name} <span class="badge badge-draft text-xs">Trọng số: ${g.weight}%</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${g.subCriteria.map(sc => {
                      const score = ev.managerScores ? ev.managerScores[sc.id] : null;
                      const comment = ev.managerComments ? ev.managerComments[sc.id] : '';
                      return `
                        <div style="padding: 10px; background: #f8fafc; border-radius: 6px;">
                          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                            <span class="font-semibold">${sc.name} (${sc.weight}%)</span>
                            <span class="font-bold text-primary">Điểm: ${score !== null ? score : '-'} / 10</span>
                          </div>
                          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.4;">
                            <b>Nhận xét của Quản lý:</b> ${comment || '<i class="text-muted">Không có nhận xét</i>'}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('manager-review-detail-modal').remove()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};
