/**
 * AI-Assisted Performance & Bonus Hub
 * Shell View: Header, Navigation, Role Switcher, Period Selector, Toasts & Modals
 */

window.ShellView = {
  // Toast notifications manager
  showToast: function(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="flex: 1;">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="color: var(--color-text-muted); font-size: 16px;">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 250ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 4500);
  },

  // Render navigation according to current role (BRD Mục 10 & Design Prompt Phần E)
  renderSidebarNav: function(currentRole, activeNavId) {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    let items = [];

    if (currentRole === 'hr') {
      items = [
        { section: 'Quản trị nghiệp vụ' },
        { id: 'hr-dashboard', label: 'Tổng quan Nhân sự', icon: 'layout' },
        { id: 'hr-periods', label: 'Kỳ đánh giá', icon: 'calendar' },
        { id: 'hr-import', label: 'Nhập dữ liệu chấm công', icon: 'upload-cloud' },
        { id: 'hr-calibration', label: 'Cân đối điểm đánh giá', icon: 'sliders', badge: '1' },
        { id: 'hr-bonus', label: 'Phân bổ quỹ thưởng', icon: 'dollar-sign' },
        { section: 'Báo cáo & Giám sát' },
        { id: 'shared-reports', label: 'Báo cáo & Xuất dữ liệu', icon: 'file-text' },
        { id: 'shared-audit-logs', label: 'Nhật ký thao tác', icon: 'shield' },
        { id: 'hr-config', label: 'Cấu hình hệ thống', icon: 'settings' }
      ];
    } else if (currentRole === 'manager') {
      items = [
        { section: 'Quản lý trực tiếp' },
        { id: 'mgr-dashboard', label: 'Tổng quan quản lý', icon: 'layout' },
        { id: 'mgr-reviews', label: 'Nhân viên cần chấm', icon: 'check-square', badge: '1' },
        { id: 'mgr-dept-results', label: 'Kết quả phòng ban', icon: 'users' },
        { section: 'Cá nhân' },
        { id: 'shared-notifications', label: 'Thông báo', icon: 'bell' }
      ];
    } else if (currentRole === 'employee') {
      items = [
        { section: 'Không gian cá nhân' },
        { id: 'emp-dashboard', label: 'Trang chủ cá nhân', icon: 'home' },
        { id: 'emp-self-review', label: 'Tự đánh giá', icon: 'edit-3' },
        { id: 'emp-results', label: 'Kết quả của tôi', icon: 'award' },
        { section: 'Thông tin' },
        { id: 'shared-notifications', label: 'Thông báo', icon: 'bell' }
      ];
    } else if (currentRole === 'director') {
      items = [
        { section: 'Ban giám đốc' },
        { id: 'dir-dashboard', label: 'Tổng quan điều hành', icon: 'pie-chart' },
        { id: 'dir-approval', label: 'Phê duyệt kỳ đánh giá', icon: 'check-circle', badge: 'Cần duyệt' },
        { id: 'shared-reports', label: 'Báo cáo toàn công ty', icon: 'file-text' },
        { id: 'shared-audit-logs', label: 'Nhật ký phê duyệt', icon: 'shield' }
      ];
    } else if (currentRole === 'accountant') {
      items = [
        { section: 'Kế toán & Tài chính' },
        { id: 'acc-dashboard', label: 'Tổng quan ngân sách', icon: 'dollar-sign' },
        { id: 'acc-bonus-sheet', label: 'Bảng đề xuất thưởng', icon: 'table' },
        { id: 'shared-reports', label: 'Xuất dữ liệu chi trả', icon: 'download' }
      ];
    }

    let html = '';
    items.forEach(item => {
      if (item.section) {
        html += `<div class="nav-section-title">${item.section}</div>`;
      } else {
        const isActive = item.id === activeNavId ? 'active' : '';
        const isWarningBadge = item.badge === 'Cần duyệt';
        const badgeType = isWarningBadge ? 'nav-badge-warning' : 'nav-badge-count';
        const badgeHtml = item.badge ? `<span class="nav-badge ${badgeType}">${item.badge}</span>` : '';
        html += `
          <a class="nav-item ${isActive}" onclick="App.navigateTo('${item.id}')">
            <span>${item.label}</span>
            ${badgeHtml}
          </a>
        `;
      }
    });

    nav.innerHTML = html;
  },

  // Render Topbar elements: period selector, role switcher, user profile
  renderTopbar: function(session, currentUser, periods) {
    // Period selector
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
      const getStatusText = (status) => (window.I18N && window.I18N.status[status]) || status;
      periodSelect.innerHTML = periods.map(p => `
        <option value="${p.id}" ${p.id === session.activePeriodId ? 'selected' : ''}>
          ${p.name} (${getStatusText(p.status)})
        </option>
      `).join('');
    }

    // Role switcher
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.value = session.currentRoleId;
    }

    // AI simulation toggle state
    const aiToggle = document.getElementById('ai-offline-toggle');
    if (aiToggle) {
      aiToggle.checked = !!session.aiSimulationOffline;
    }

    // User profile in topbar
    const userName = document.getElementById('topbar-user-name');
    const userRole = document.getElementById('topbar-user-role');
    const userAvatar = document.getElementById('topbar-user-avatar');
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentUser.title;
    if (userAvatar) userAvatar.textContent = currentUser.avatar;

    // Notification dot for current user (chỉ hiển thị chấm đỏ nếu có tin chưa đọc gửi đến user này)
    const userNotifs = window.AppStorage.getNotificationsForCurrentUser(currentUser);
    const unreadCount = userNotifs.filter(n => !n.isRead).length;
    const notifDot = document.getElementById('topbar-notif-dot');
    if (notifDot) {
      notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Sidebar role indicator
    const roleIndicator = document.getElementById('sidebar-role-indicator');
    if (roleIndicator) {
      const roleText = (window.I18N && window.I18N.role[currentUser.role]) || currentUser.role;
      roleIndicator.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-muted);">VAI TRÒ HIỆN HÀNH</span>
          <span class="badge badge-${currentUser.role}" style="font-size: 11px; padding: 2px 8px;">${roleText}</span>
        </div>
        <div style="font-weight: 700; color: var(--color-primary); font-size: 13px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${currentUser.title}">
          ${currentUser.title}
        </div>
      `;
    }
  }
};
