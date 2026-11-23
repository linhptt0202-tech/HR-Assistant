/**
 * AI-Assisted Performance & Bonus Hub
 * App Bootstrapper, Router & Global Event Dispatcher
 */

window.App = {
  activeRoute: 'hr-dashboard',

  // Initialize application
  init: function() {
    console.log('Bootstrapping AI-Assisted Performance & Bonus Hub...');

    const data = window.AppStorage.load();
    const session = data.session;
    const currentUser = window.AppStorage.getCurrentUser();

    // Default route per role
    this.setDefaultRouteForRole(session.currentRoleId);

    // Initial render of Topbar & Nav
    window.ShellView.renderTopbar(session, currentUser, data.periods);
    window.ShellView.renderSidebarNav(session.currentRoleId, this.activeRoute);

    // Render initial view
    this.renderCurrentView();

    // Bind event listeners
    this.bindEvents();
  },

  setDefaultRouteForRole: function(role) {
    if (role === 'hr') this.activeRoute = 'hr-dashboard';
    else if (role === 'manager') this.activeRoute = 'mgr-dashboard';
    else if (role === 'employee') this.activeRoute = 'emp-dashboard';
    else if (role === 'director') this.activeRoute = 'dir-approval';
    else if (role === 'accountant') this.activeRoute = 'acc-bonus-sheet';
  },

  // Router dispatcher
  navigateTo: function(routeId) {
    this.activeRoute = routeId;
    const session = window.AppStorage.getSession();

    window.ShellView.renderSidebarNav(session.currentRoleId, this.activeRoute);
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentView: function() {
    const data = window.AppStorage.load();
    const container = document.getElementById('main-content-view');
    if (!container) return;

    switch (this.activeRoute) {
      // HR Routes
      case 'hr-dashboard':
        window.HRViews.renderDashboard(data, container);
        break;
      case 'hr-periods':
        this.renderPeriodsManagement(data, container);
        break;
      case 'hr-calibration':
        window.HRViews.renderCalibration(data, container);
        break;
      case 'hr-bonus':
        window.HRViews.renderBonusCenter(data, container);
        break;
      case 'hr-import':
        window.SharedViews.renderImportWorkspace(data, container);
        break;
      case 'hr-config':
        window.SharedViews.renderSystemConfig(data, container);
        break;

      // Manager Routes
      case 'mgr-dashboard':
      case 'mgr-reviews':
        window.ManagerViews.renderDashboard(data, container);
        break;
      case 'mgr-dept-results':
        window.SharedViews.renderReports(data, container);
        break;

      // Employee Routes
      case 'emp-dashboard':
        window.EmployeeViews.renderDashboard(data, container);
        break;
      case 'emp-self-review':
        window.EmployeeViews.renderSelfReview(data, container);
        break;
      case 'emp-results':
        window.EmployeeViews.renderPublishedResults(data, container);
        break;

      // Director Routes
      case 'dir-dashboard':
      case 'dir-approval':
        window.DirectorViews.renderApprovalView(data, container);
        break;

      // Accountant Routes
      case 'acc-dashboard':
      case 'acc-bonus-sheet':
        window.AccountantViews.renderBonusSheet(data, container);
        break;

      // Shared Routes
      case 'shared-reports':
        window.SharedViews.renderReports(data, container);
        break;
      case 'shared-audit-logs':
        window.SharedViews.renderAuditLogs(data, container);
        break;
      case 'shared-notifications':
        window.SharedViews.renderNotifications(data, container);
        break;

      default:
        window.HRViews.renderDashboard(data, container);
    }
  },

  // Periods Management View (List & Actions)
  renderPeriodsManagement: function(data, container) {
    const periods = data.periods;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="breadcrumb">
            <span>HR</span> / <span>Kỳ đánh giá</span>
          </div>
          <h1 class="page-title">Quản Lý Các Kỳ Đánh Giá</h1>
          <div class="page-subtitle">Khởi tạo kỳ mới (Wizard 6 bước), theo dõi trạng thái và mở lại kỳ (Reopen)</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="App.openCreatePeriodWizard()">
            <span>+ Tạo kỳ đánh giá mới</span>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã kỳ</th>
                <th>Tên kỳ</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Hạn Tự chấm</th>
                <th>Hạn Quản lý</th>
                <th>Quỹ thưởng</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${periods.map(p => `
                <tr>
                  <td class="font-bold text-xs">${p.code}</td>
                  <td class="font-semibold">${p.name}</td>
                  <td>${p.type === 'month' ? 'Tháng' : p.type === 'year' ? 'Năm (Tổng 4 quý)' : 'Quý'}</td>
                  <td class="text-xs">${p.startDate} ➔ ${p.endDate}</td>
                  <td class="text-xs text-muted">${p.selfReviewDeadline}</td>
                  <td class="text-xs text-muted">${p.managerReviewDeadline}</td>
                  <td class="font-bold text-primary">${(p.totalBonusFund / 1000000).toFixed(1)} triệu đ</td>
                  <td><span class="badge badge-${p.status}">${(window.I18N && window.I18N.status[p.status]) || p.status}</span></td>
                  <td style="text-align: right;">
                    <div class="flex justify-end gap-1">
                      <button class="btn btn-sm btn-secondary" onclick="App.selectPeriod('${p.id}')">Chọn kỳ này</button>
                      ${(p.status === 'approved' || p.status === 'published') ? `
                        <button class="btn btn-sm btn-warning" onclick="SharedViews.openReopenModal('${p.id}')">Mở lại kỳ (HR)</button>
                      ` : ''}
                      ${p.status === 'approved' ? `
                        <button class="btn btn-sm btn-success" onclick="App.publishPeriod('${p.id}')">Công bố kỳ</button>
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

  selectPeriod: function(periodId) {
    window.AppStorage.updateSession({ activePeriodId: periodId });
    const data = window.AppStorage.load();
    window.ShellView.renderTopbar(data.session, window.AppStorage.getCurrentUser(), data.periods);
    this.renderCurrentView();
    window.ShellView.showToast('Đã đổi kỳ', 'Đã chuyển sang kỳ đánh giá được chọn.', 'info');
  },

  publishPeriod: function(periodId) {
    if (!confirm('Bạn có chắc chắn muốn CÔNG BỐ KẾT QUẢ kỳ đánh giá này cho toàn thể nhân viên?')) return;
    const data = window.AppStorage.load();
    const period = data.periods.find(p => p.id === periodId);
    period.status = 'published';
    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: period.id,
      periodName: period.name,
      actorName: 'Nguyễn Văn HR',
      actorRole: 'HR / Admin',
      actionType: 'PERIOD_PUBLISHED',
      targetEmployee: 'Toàn bộ nhân sự kỳ',
      oldValue: 'Approved',
      newValue: 'Published',
      reason: 'HR chính thức công bố kết quả đánh giá và đề xuất thưởng cho nhân viên.'
    });

    window.ShellView.showToast('Công bố thành công', 'Kết quả đã được công bố cho nhân viên xem cá nhân!', 'success');
    this.renderCurrentView();
  },

  // Create Period Wizard (Design Prompt Mục 12.2)
  openCreatePeriodWizard: function() {
    const wizardHtml = `
      <div class="modal-backdrop" id="create-period-modal">
        <div class="modal-dialog modal-dialog-lg" style="max-width: 800px;">
          <div class="modal-header">
            <div class="modal-title">Wizard Khởi Tạo Kỳ Đánh Giá Mới (6 Bước Chuẩn BRD)</div>
            <button onclick="document.getElementById('create-period-modal').remove()" style="font-size: 20px;">&times;</button>
          </div>
          <div class="modal-body">
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; font-size: 13px; font-weight: 600;">
              <span class="text-primary">1. Thông tin chung</span> ➔ 
              <span class="text-muted">2. Nhân viên & QL</span> ➔ 
              <span class="text-muted">3. Nhóm tiêu chí</span> ➔ 
              <span class="text-muted">4. Tiêu chí con</span> ➔ 
              <span class="text-muted">5. Quỹ & Xếp hạng</span> ➔ 
              <span class="text-muted">6. Kích hoạt</span>
            </div>

            <div class="form-group">
              <label class="form-label">Tên kỳ đánh giá <span class="required">*</span></label>
              <input type="text" id="wiz-name" class="form-control" value="Kỳ đánh giá Hiệu suất Tháng 12/2026">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-group">
                <label class="form-label">Loại kỳ</label>
                <select id="wiz-type" class="form-control">
                  <option value="quarter">Theo quý (Nhân viên tự đánh giá trước, quản lý chấm)</option>
                  <option value="month">Theo tháng (Quản lý trực tiếp chấm điểm & theo dõi)</option>
                  <option value="year">Theo năm (Đánh giá tổng năm, lấy tổng 4 quý)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Quỹ thưởng dự kiến (VNĐ) <span class="required">*</span></label>
                <input type="number" id="wiz-fund" class="form-control" value="180000000" step="10000000">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label text-xs">Ngày bắt đầu</label>
                <input type="date" id="wiz-start" class="form-control" value="2026-12-01">
              </div>
              <div class="form-group">
                <label class="form-label text-xs">Hạn tự đánh giá</label>
                <input type="date" id="wiz-self-dl" class="form-control" value="2026-12-05">
              </div>
              <div class="form-group">
                <label class="form-label text-xs">Hạn quản lý chấm</label>
                <input type="date" id="wiz-mgr-dl" class="form-control" value="2026-12-12">
              </div>
            </div>

            <div style="padding: 12px; background: #f8fafc; border-radius: 8px; margin-top: 10px;">
              <div class="font-bold text-xs" style="margin-bottom: 6px;">Bộ tiêu chí áp dụng mặc định (BRL-23 & BRL-24: Tổng = 100%):</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">
                • KPI công việc: <b>50%</b> (KPI cá nhân 60%, Tiến độ chất lượng 40%)<br>
                • Chuyên cần & Kỷ luật: <b>20%</b> (Giờ giấc 50%, Nội quy 50%)<br>
                • Thái độ & Team: <b>30%</b> (Hợp tác 50%, Sáng kiến 50%)
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('create-period-modal').remove()">Hủy</button>
            <button class="btn btn-primary" onclick="App.submitCreatePeriod()">Tạo kỳ ở trạng thái Dự thảo</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', wizardHtml);
  },

  submitCreatePeriod: function() {
    const nameInput = document.getElementById('wiz-name');
    const fundInput = document.getElementById('wiz-fund');
    const startInput = document.getElementById('wiz-start');
    const selfDlInput = document.getElementById('wiz-self-dl');
    const mgrDlInput = document.getElementById('wiz-mgr-dl');

    const name = (nameInput.value || '').trim();
    const fund = parseFloat(fundInput.value) || 100000000;

    if (name.length < 5) {
      alert('Vui lòng nhập tên kỳ đánh giá hợp lệ.');
      return;
    }

    const data = window.AppStorage.load();
    const newId = 'PERIOD_' + Date.now();
    const newCode = 'KY-' + new Date().getFullYear() + '-' + (data.periods.length + 1);

    const newPeriod = {
      id: newId,
      code: newCode,
      name: name,
      type: document.getElementById('wiz-type').value,
      startDate: startInput.value,
      endDate: '2026-12-31',
      selfReviewDeadline: selfDlInput.value,
      managerReviewDeadline: mgrDlInput.value,
      closingDate: '2026-12-15',
      status: 'draft',
      totalBonusFund: fund,
      allocatedBonus: 0,
      creatorId: 'USR_HR',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      groupsWeightSum: 100,
      directorConfirmationNeeded: false,
      reopenedReason: null
    };

    data.periods.unshift(newPeriod);
    data.session.activePeriodId = newId;
    window.AppStorage.save(data);

    window.AppStorage.addAuditLog({
      periodId: newId,
      periodName: name,
      actorName: 'Nguyễn Văn HR',
      actorRole: 'Nhân sự / Quản trị viên',
      actionType: 'PERIOD_CREATED',
      targetEmployee: 'Toàn hệ thống',
      oldValue: 'Chưa có kỳ',
      newValue: `Tạo kỳ ${name} (Dự thảo)`,
      reason: 'Nhân sự thiết lập kỳ đánh giá mới.'
    });

    const modal = document.getElementById('create-period-modal');
    if (modal) modal.remove();

    window.ShellView.showToast('Đã tạo kỳ', `Kỳ đánh giá mới "${name}" đã được tạo ở trạng thái Dự thảo.`, 'success');
    this.renderPeriodsManagement(data, document.getElementById('main-content-view'));
  },

  // Bind global event listeners
  bindEvents: function() {
    // Role switcher dropdown
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        const roleUserMap = {
          hr: 'USR_HR',
          manager: 'USR_MGR',
          employee: 'USR_EMP1',
          director: 'USR_DIR',
          accountant: 'USR_ACC'
        };

        const session = window.AppStorage.updateSession({
          currentRoleId: role,
          currentUserId: roleUserMap[role] || 'USR_HR'
        });

        const data = window.AppStorage.load();
        const currentUser = window.AppStorage.getCurrentUser();

        this.setDefaultRouteForRole(role);
        window.ShellView.renderTopbar(session, currentUser, data.periods);
        window.ShellView.renderSidebarNav(role, this.activeRoute);
        this.renderCurrentView();

        window.ShellView.showToast('Chuyển vai trò', `Đang xem giao diện dưới góc nhìn: ${currentUser.title} (${currentUser.name})`, 'info');
      });
    }

    // Period selector dropdown
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.selectPeriod(e.target.value);
      });
    }

    // AI Simulation Offline Toggle
    const aiToggle = document.getElementById('ai-offline-toggle');
    if (aiToggle) {
      aiToggle.addEventListener('change', (e) => {
        const isOffline = e.target.checked;
        window.AppStorage.updateSession({ aiSimulationOffline: isOffline });
        if (isOffline) {
          window.ShellView.showToast('Mô phỏng sự cố AI', 'Đã bật chế độ "AI Timeout/Offline". Quy trình nghiệp vụ vẫn tiếp tục mà không bị gián đoạn (BR-22).', 'warning');
        } else {
          window.ShellView.showToast('AI hoạt động bình thường', 'Dịch vụ AI Assistant đã được kết nối lại.', 'success');
        }
      });
    }

    // Modal Lock, Backdrop click, Escape key, and Scroll Chaining Prevention
    this.initModalController();
  },

  // Modal Lock, Backdrop click, Escape key, and Scroll Chaining Prevention
  initModalController: function() {
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const updateModalState = () => {
        const hasModal = !!document.querySelector('.modal-backdrop');
        if (hasModal) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      };

      const observer = new MutationObserver(updateModalState);
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }

      // Close on backdrop click (when clicking directly on the dark backdrop outside dialog)
      document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('modal-backdrop')) {
          e.target.remove();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modals = document.querySelectorAll('.modal-backdrop');
          if (modals.length > 0) {
            modals[modals.length - 1].remove();
          }
        }
      });

      // Prevent wheel event from leaking to background window when modal is open
      document.addEventListener('wheel', (e) => {
        const modal = document.querySelector('.modal-backdrop');
        if (!modal) return;
        const scrollable = e.target.closest('.modal-body, [style*="overflow-y: auto"], [style*="overflow: auto"]');
        if (!scrollable) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  },

  // Reset demo mock data to defaults
  resetMockData: function() {
    if (confirm('Bạn có chắc chắn muốn KHÔI PHỤC TOÀN BỘ dữ liệu mẫu ban đầu của hệ thống? Toàn bộ các thao tác thử nghiệm sẽ được đưa về mặc định.')) {
      window.AppStorage.reset();
      window.ShellView.showToast('Đã khôi phục', 'Dữ liệu mẫu đã được thiết lập lại thành công.', 'success');
      location.reload();
    }
  }
};

// Auto start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
