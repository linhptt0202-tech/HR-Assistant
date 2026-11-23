/**
 * AI-Assisted Performance & Bonus Hub
 * Validation Engine
 * Enforces business rules, state transition constraints & permission guards
 */

window.ValidationEngine = {
  /**
   * Kiểm tra điều kiện chuyển trạng thái kỳ đánh giá (BRD Mục 7.3 & UI/UX Prompt Mục 4.1)
   */
  canTransitionPeriod: function(fromStatus, toStatus, period, data) {
    const errors = [];
    const evaluations = data.evaluations[period.id] || [];
    const employees = data.employees;

    if (fromStatus === 'draft' && toStatus === 'self-review') {
      // 1. Tổng trọng số nhóm = 100% (BRL-23)
      if (period.groupsWeightSum !== 100) {
        errors.push('Tổng trọng số các nhóm tiêu chí phải bằng đúng 100% (hiện tại: ' + period.groupsWeightSum + '%).');
      }
      // 2. Có ít nhất 1 nhân viên và 1 quản lý được gán (7.3)
      if (!employees || employees.length === 0) {
        errors.push('Kỳ đánh giá phải có ít nhất 1 nhân viên tham gia.');
      }
      const hasManager = employees.some(e => !!e.managerId);
      if (!hasManager) {
        errors.push('Phải có ít nhất một quản lý trực tiếp được phân công.');
      }
    }

    if (fromStatus === 'self-review' && toStatus === 'manager-review') {
      // Cho phép chuyển nếu đến hạn hoặc tất cả đã nộp
      // Những người chưa nộp sẽ bị gắn nhãn "Không tự đánh giá"
    }

    if (fromStatus === 'manager-review' && toStatus === 'calibration') {
      // Mọi nhân viên có điểm quản lý hoặc HR chủ động đóng kỳ
      const missingScores = employees.filter(emp => {
        const ev = evaluations.find(e => e.employeeId === emp.id);
        return !ev || ev.managerReviewStatus !== 'completed';
      });
      if (missingScores.length > 0) {
        errors.push('Còn ' + missingScores.length + ' nhân viên chưa có điểm đánh giá của Quản lý trực tiếp.');
      }
    }

    if (fromStatus === 'calibration' && toStatus === 'approved') {
      // 1. HR đã xử lý hết cảnh báo mức Nghiêm trọng (BRL-22, 7.3)
      const warnings = data.aiWarnings.filter(w => w.periodId === period.id && w.severity === 'severe');
      const unresolvedSevere = warnings.filter(w => w.status === 'pending');
      if (unresolvedSevere.length > 0) {
        errors.push('Chưa xử lý hết ' + unresolvedSevere.length + ' cảnh báo mức Nghiêm trọng.');
      }

      // 2. Tổng thưởng không vượt quỹ (BRL-08)
      const bonusResult = window.CalculationEngine.calculateBonusAllocation(
        period.totalBonusFund,
        employees,
        evaluations,
        data.defaultConfig
      );
      if (bonusResult.totalAllocated > period.totalBonusFund) {
        errors.push('Tổng thưởng đề xuất (' + bonusResult.totalAllocated.toLocaleString() + ' đ) vượt quá tổng quỹ (' + period.totalBonusFund.toLocaleString() + ' đ).');
      }

      // 3. Các trường hợp điều chỉnh điểm lệch > 1.0 hoặc đổi hạng cần Giám đốc xác nhận (BRL-17)
      const needsConfirm = evaluations.filter(e => e.needsDirectorConfirm && !e.directorConfirmed);
      if (needsConfirm.length > 0) {
        errors.push('Có ' + needsConfirm.length + ' trường hợp điều chỉnh điểm cần Giám đốc xác nhận lại trước khi phê duyệt.');
      }
    }

    if (toStatus === 'calibration' && (fromStatus === 'approved' || fromStatus === 'published')) {
      // Chỉ HR được mở lại, bắt buộc có lý do
      if (!period.reopenedReason || period.reopenedReason.trim().length < 5) {
        errors.push('Bắt buộc phải nhập lý do mở lại kỳ đánh giá (tối thiểu 5 ký tự).');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Kiểm tra validation khi Quản lý nộp đánh giá (BRL-07, Prompt 5.4 & 15.3)
   */
  validateManagerReview: function(scores, comments, subCriteriaList, managerUserId, targetEmployee) {
    const errors = [];

    // Chặn quản lý tự chấm cho chính mình (BRL-07)
    if (targetEmployee.userId === managerUserId) {
      errors.push('Quy định nghiêm ngặt: Quản lý không được tự chấm điểm cho chính bản thân mình.');
    }

    for (const sc of subCriteriaList) {
      if (sc.isNotApplicable) continue;

      const scoreVal = scores[sc.id];
      if (scoreVal === undefined || scoreVal === null || scoreVal === '') {
        errors.push('Tiêu chí "' + sc.name + '" chưa được nhập điểm.');
        continue;
      }

      const numScore = parseFloat(scoreVal);
      if (isNaN(numScore) || numScore < 0 || numScore > 10) {
        errors.push('Điểm của tiêu chí "' + sc.name + '" phải nằm trong thang điểm 0 - 10.');
      }

      // Bắt buộc có nhận xét khi điểm >= 9 hoặc <= 4 (Prompt 5.4, Edge case 6)
      const commentText = (comments[sc.id] || '').trim();
      if ((numScore >= 9.0 || numScore <= 4.0) && commentText.length < 5) {
        errors.push('Bắt buộc phải nhập nhận xét chi tiết (tối thiểu 5 ký tự) cho tiêu chí "' + sc.name + '" khi điểm số từ 9 trở lên hoặc từ 4 trở xuống.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Kiểm tra điều kiện Quản lý được phép chấm điểm nhân viên
   * Quy tắc nghiệp vụ mới: Phải cho nhân viên đánh giá xong, mới cho quản lý đánh giá (ở kỳ Quý)
   */
  canManagerReviewEmployee: function(period, employeeEvaluation) {
    if (!period) return { canReview: true };

    // Kỳ tháng: Quản lý đánh giá trực tiếp hàng tháng, nhân viên không tự đánh giá
    if (period.type === 'month') {
      return { canReview: true, reason: 'Kỳ đánh giá theo tháng do Quản lý trực tiếp chấm điểm.' };
    }

    // Kỳ quý: Nhân viên PHẢI tự đánh giá xong, hoặc bị đánh dấu quá hạn 'not_submitted'
    if (period.type === 'quarter') {
      if (!employeeEvaluation) {
        return {
          canReview: false,
          reason: 'Nhân viên chưa nộp phiếu tự đánh giá. Theo quy trình, nhân viên phải hoàn tất tự đánh giá xong thì Quản lý mới được đánh giá.'
        };
      }
      const status = employeeEvaluation.selfReviewStatus;
      if (status === 'submitted') {
        return { canReview: true, reason: 'Nhân viên đã nộp tự đánh giá hợp lệ.' };
      }
      if (status === 'not_submitted') {
        return { canReview: true, reason: 'Nhân viên quá hạn tự đánh giá (đã đánh dấu Không tự đánh giá).' };
      }
      return {
        canReview: false,
        reason: 'Nhân viên chưa nộp phiếu tự đánh giá. Theo quy trình, nhân viên phải hoàn tất tự đánh giá xong thì Quản lý mới được đánh giá.'
      };
    }

    return { canReview: true };
  },

  /**
   * Kiểm tra điều chỉnh điểm tại Calibration (BRL-16 & BRL-17)
   */
  checkCalibrationAdjustment: function(originalScore, newScore, reason, ratingBrackets) {
    const errors = [];
    if (!reason || reason.trim().length < 5) {
      errors.push('Bắt buộc phải nhập lý do điều chỉnh điểm (tối thiểu 5 ký tự).');
    }

    const numNew = parseFloat(newScore);
    if (isNaN(numNew) || numNew < 0 || numNew > 10) {
      errors.push('Điểm điều chỉnh phải nằm trong khoảng 0 - 10.');
    }

    const delta = Math.abs(numNew - originalScore);
    const oldRating = window.CalculationEngine.determineRating(originalScore, ratingBrackets);
    const newRating = window.CalculationEngine.determineRating(numNew, ratingBrackets);
    const rankChanged = oldRating.rank !== newRating.rank;

    // BRL-17: Đổi hạng hoặc lệch > 1.0 điểm cần Giám đốc xác nhận lại
    const needsDirectorConfirm = rankChanged || delta > 1.0;

    return {
      isValid: errors.length === 0,
      errors: errors,
      delta: Math.round(delta * 100) / 100,
      rankChanged: rankChanged,
      oldRank: oldRating.rank,
      newRank: newRating.rank,
      needsDirectorConfirm: needsDirectorConfirm
    };
  }
};
