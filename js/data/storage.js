/**
 * AI-Assisted Performance & Bonus Hub
 * Storage & State Persistence Manager
 */

const STORAGE_KEY = 'HR_BONUS_HUB_DB_v1';

window.AppStorage = {
  // Load whole state from localStorage or initialize from defaults
  load: function() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Cannot read localStorage, fallback to initial data', e);
    }
    const fresh = JSON.parse(JSON.stringify(window.DEFAULT_DATA));
    this.save(fresh);
    return fresh;
  },

  // Save whole state
  save: function(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Cannot save to localStorage', e);
    }
  },

  // Reset to default mock data
  reset: function() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset', e);
    }
    const fresh = JSON.parse(JSON.stringify(window.DEFAULT_DATA));
    this.save(fresh);
    return fresh;
  },

  // Helper getters/setters
  getSession: function() {
    const data = this.load();
    return data.session;
  },

  updateSession: function(updates) {
    const data = this.load();
    data.session = Object.assign({}, data.session, updates);
    this.save(data);
    return data.session;
  },

  getCurrentUser: function() {
    const data = this.load();
    const user = data.users.find(u => u.id === data.session.currentUserId);
    return user || data.users[0];
  },

  getPeriods: function() {
    const data = this.load();
    return data.periods;
  },

  getActivePeriod: function() {
    const data = this.load();
    return data.periods.find(p => p.id === data.session.activePeriodId) || data.periods[0];
  },

  getEmployees: function() {
    const data = this.load();
    return data.employees;
  },

  getEvaluationsForPeriod: function(periodId) {
    const data = this.load();
    return data.evaluations[periodId] || [];
  },

  saveEvaluationForPeriod: function(periodId, evaluationData) {
    const data = this.load();
    if (!data.evaluations[periodId]) {
      data.evaluations[periodId] = [];
    }
    const idx = data.evaluations[periodId].findIndex(e => e.employeeId === evaluationData.employeeId);
    if (idx >= 0) {
      data.evaluations[periodId][idx] = evaluationData;
    } else {
      data.evaluations[periodId].push(evaluationData);
    }
    this.save(data);
  },

  addAuditLog: function(log) {
    const data = this.load();
    const newLog = Object.assign({
      id: 'LOG_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, log);
    data.auditLogs.unshift(newLog);
    this.save(data);
    return newLog;
  },

  addNotification: function(notif) {
    const data = this.load();
    const newNotif = Object.assign({
      id: 'NOTIF_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    }, notif);
    data.notifications.unshift(newNotif);
    this.save(data);
    return newNotif;
  },

  // Lọc thông báo nghiêm ngặt theo đúng đối tượng người dùng (Notification Privacy)
  getNotificationsForCurrentUser: function(currentUser) {
    const data = this.load();
    if (!currentUser) return [];
    const role = currentUser.role;
    const employees = data.employees;

    return (data.notifications || []).filter(n => {
      // 1. Gửi đích danh cho người dùng
      if (n.recipientUserId && n.recipientUserId === currentUser.id) return true;

      // 2. Nhân viên: CHỈ nhận thông báo liên quan đến bản thân mình
      if (role === 'employee') {
        return (n.recipientUserId === currentUser.id) || (n.targetUserId === currentUser.id);
      }

      // 3. Quản lý: CHỈ nhận thông báo về nhân viên thuộc phòng ban mình
      if (role === 'manager') {
        if (n.recipientRole === 'manager') {
          if (n.targetDepartment && n.targetDepartment === currentUser.department) return true;
          if (n.targetUserId) {
            const targetEmp = employees.find(e => e.id === n.targetUserId || e.userId === n.targetUserId);
            if (targetEmp && targetEmp.department === currentUser.department) return true;
          }
        }
        return false;
      }

      // 4. HR: Nhận thông báo vai trò HR
      if (role === 'hr') {
        return n.recipientRole === 'hr';
      }

      // 5. Giám đốc: Nhận thông báo vai trò Giám đốc
      if (role === 'director') {
        return n.recipientRole === 'director';
      }

      // 6. Kế toán: Nhận thông báo vai trò Kế toán
      if (role === 'accountant') {
        return n.recipientRole === 'accountant';
      }

      return false;
    });
  }
};
