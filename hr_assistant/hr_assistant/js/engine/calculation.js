/**
 * AI-Assisted Performance & Bonus Hub
 * Calculation Engine
 * Strictly adhering to BRD v1.0 (BRL-08, BRL-14, BRL-15, BRL-23 to BRL-27, 9.1 & 9.2)
 */

window.CalculationEngine = {
  /**
   * Tính điểm nhóm tiêu chí (BRL-25 & 9.2)
   * DiemNhom = Σ (Diem_i * TrongSo_i) / 100
   * @param {Array} subCriteria List of sub-criteria objects
   * @param {Object} scores Map { subCriteriaId: scoreNumber }
   * @returns {number} Unrounded group score
   */
  calculateGroupScore: function(subCriteria, scores) {
    if (!subCriteria || subCriteria.length === 0) return 0;
    let sumWeighted = 0;
    let validWeightSum = 0;

    for (const sc of subCriteria) {
      // Check if applicable
      if (sc.isNotApplicable) continue;

      const score = scores[sc.id];
      const numScore = (score !== undefined && score !== null && score !== '') ? parseFloat(score) : 0;
      sumWeighted += numScore * parseFloat(sc.weight);
      validWeightSum += parseFloat(sc.weight);
    }

    if (validWeightSum === 0) return 0;
    return (sumWeighted / 100);
  },

  /**
   * Tính điểm tổng (BRL-26 & BRL-27)
   * DiemTong = Σ (DiemNhom_g * TrongSo_g) / 100
   * Giữ nguyên độ chính xác trong các bước, làm tròn thông thường 2 chữ số thập phân ở bước cuối
   * @param {Array} groups Criteria groups with their unrounded scores
   * @returns {number} Score rounded to 2 decimal places
   */
  calculateTotalScore: function(groupsWithScores) {
    let sumTotal = 0;
    for (const g of groupsWithScores) {
      sumTotal += g.score * (parseFloat(g.weight) / 100);
    }
    // Round to 2 decimal places
    return Math.round(sumTotal * 100) / 100;
  },

  /**
   * Xác định xếp hạng S/A/B/C dựa trên điểm 2 chữ số thập phân (BRL-27 & 5.3)
   * @param {number} finalScore Score (2 decimals)
   * @param {Array} ratingBrackets Configurable rating brackets
   * @returns {Object} Bracket matching score
   */
  determineRating: function(finalScore, ratingBrackets) {
    const brackets = ratingBrackets || [
      { rank: 'S', minScore: 9.00, label: 'Xuất sắc', bonusCoeff: 1.5 },
      { rank: 'A', minScore: 8.00, label: 'Tốt', bonusCoeff: 1.2 },
      { rank: 'B', minScore: 6.50, label: 'Đạt yêu cầu', bonusCoeff: 1.0 },
      { rank: 'C', minScore: 0.00, label: 'Cần cải thiện', bonusCoeff: 0.0 }
    ];

    // Sort descending by minScore
    const sorted = [...brackets].sort((a, b) => b.minScore - a.minScore);
    for (const b of sorted) {
      if (finalScore >= b.minScore) {
        return b;
      }
    }
    return sorted[sorted.length - 1];
  },

  /**
   * Lấy hệ số thâm niên đề xuất (9.1)
   * < 1 năm = 1.0; từ 1 đến dưới 3 năm = 1.05; từ 3 năm = 1.10
   */
  getSeniorityCoeff: function(seniorityYears, seniorityBrackets) {
    const brackets = seniorityBrackets || [
      { code: 'LESS_1', label: 'Dưới 1 năm', minYears: 0, maxYears: 1, coeff: 1.0 },
      { code: '1_TO_3', label: 'Từ 1 đến dưới 3 năm', minYears: 1, maxYears: 3, coeff: 1.05 },
      { code: 'ABOVE_3', label: 'Từ 3 năm trở lên', minYears: 3, maxYears: 99, coeff: 1.10 }
    ];

    const yrs = parseFloat(seniorityYears) || 0;
    for (const b of brackets) {
      if (yrs >= b.minYears && yrs < b.maxYears) {
        return b.coeff;
      }
    }
    return 1.0;
  },

  /**
   * Phân bổ quỹ thưởng theo công thức chuẩn BRL-08, BRL-14, BRL-15
   * Thuong_i = Quy * (TrongSoPhanBo_i) / (Σ TrongSoPhanBo_du_dieu_kien)
   * Làm tròn xuống 1.000 VNĐ; phân dư theo thứ tự phần lẻ lớn nhất
   * @param {number} totalFund Quỹ thưởng (VNĐ)
   * @param {Array} employees Danh sách nhân viên
   * @param {Array} evaluations Danh sách phiếu đánh giá
   * @param {Object} config Cấu hình ngưỡng & hệ số
   */
  calculateBonusAllocation: function(totalFund, employees, evaluations, config) {
    const roundUnit = (config && config.roundUnit) ? config.roundUnit : 1000;
    const results = [];
    let sumAllocationWeight = 0;
    let eligibleCount = 0;
    let disqualifiedCount = 0;

    // 1. Phân tích điều kiện nhận thưởng & tính trọng số phân bổ
    for (const emp of employees) {
      const ev = evaluations.find(e => e.employeeId === emp.id);
      const isDisqualified = !!emp.isDisqualified;

      // Has manager score completed?
      const hasManagerScore = ev && ev.managerReviewStatus === 'completed';
      const score = ev ? (ev.isAdjusted ? ev.adjustedScore : (ev.managerTotalScore || 0)) : 0;
      const rating = this.determineRating(score, config ? config.ratingBrackets : null);
      const bonusCoeff = rating.bonusCoeff;
      const seniorityCoeff = this.getSeniorityCoeff(emp.seniorityYears, config ? config.seniorityBrackets : null);

      let isEligible = false;
      let allocationWeight = 0;

      if (isDisqualified) {
        disqualifiedCount++;
        isEligible = false;
        allocationWeight = 0;
      } else if (hasManagerScore) {
        isEligible = true;
        eligibleCount++;
        allocationWeight = Math.round((bonusCoeff * seniorityCoeff) * 1000) / 1000;
        sumAllocationWeight += allocationWeight;
      }

      results.push({
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        department: emp.department,
        title: emp.title,
        seniorityYears: emp.seniorityYears,
        seniorityCoeff: seniorityCoeff,
        score: score,
        rank: rating.rank,
        bonusCoeff: bonusCoeff,
        isEligible: isEligible,
        isDisqualified: isDisqualified,
        disqualifiedReason: emp.disqualifiedReason || '',
        allocationWeight: allocationWeight,
        // Bonus fields
        rawBonus: 0,
        floorBonus: 0,
        fractionRemainder: 0,
        surplusAllocated: 0,
        finalBonus: 0
      });
    }

    sumAllocationWeight = Math.round(sumAllocationWeight * 1000) / 1000;

    // BRL-14: Nếu tổng trọng số phân bổ = 0 (không ai đủ điều kiện), giữ nguyên quỹ
    if (sumAllocationWeight === 0) {
      return {
        totalFund: totalFund,
        totalAllocated: 0,
        remainingFund: totalFund,
        sumAllocationWeight: 0,
        eligibleCount: 0,
        disqualifiedCount: disqualifiedCount,
        hasZeroWeightsError: true,
        errorMessage: 'Tổng trọng số phân bổ bằng 0 (không có nhân viên đủ điều kiện nhận thưởng). Quỹ được bảo toàn nguyên vẹn.',
        items: results
      };
    }

    // 2. Tính thưởng theo tỷ lệ & làm tròn xuống 1.000 VNĐ (BRL-15)
    let totalFloorAllocated = 0;

    for (const r of results) {
      if (r.isEligible && r.allocationWeight > 0) {
        r.rawBonus = (totalFund * r.allocationWeight) / sumAllocationWeight;
        r.floorBonus = Math.floor(r.rawBonus / roundUnit) * roundUnit;
        r.fractionRemainder = r.rawBonus - r.floorBonus;
        r.finalBonus = r.floorBonus;
        totalFloorAllocated += r.floorBonus;
      } else {
        r.rawBonus = 0;
        r.floorBonus = 0;
        r.fractionRemainder = 0;
        r.finalBonus = 0;
      }
    }

    // 3. Phân bổ phần dư do làm tròn theo thứ tự phần lẻ lớn nhất (BRL-15)
    let surplus = totalFund - totalFloorAllocated;

    // Lọc các nhân viên đủ điều kiện và sắp xếp giảm dần theo phần lẻ (fractionRemainder)
    const eligibleList = results
      .filter(r => r.isEligible && r.allocationWeight > 0)
      .sort((a, b) => {
        if (b.fractionRemainder !== a.fractionRemainder) {
          return b.fractionRemainder - a.fractionRemainder;
        }
        return a.employeeCode.localeCompare(b.employeeCode); // deterministic
      });

    let surplusIndex = 0;
    while (surplus >= roundUnit && eligibleList.length > 0) {
      const target = eligibleList[surplusIndex % eligibleList.length];
      target.finalBonus += roundUnit;
      target.surplusAllocated += roundUnit;
      surplus -= roundUnit;
      surplusIndex++;
      // If we made a full loop and still have surplus, continue until surplus < roundUnit
    }

    let actualTotalAllocated = 0;
    results.forEach(r => actualTotalAllocated += r.finalBonus);

    return {
      totalFund: totalFund,
      totalAllocated: actualTotalAllocated,
      remainingFund: totalFund - actualTotalAllocated,
      sumAllocationWeight: sumAllocationWeight,
      eligibleCount: eligibleCount,
      disqualifiedCount: disqualifiedCount,
      hasZeroWeightsError: false,
      items: results
    };
  },

  /**
   * Đánh giá tổng năm: lấy tổng/trung bình các quý đánh giá
   * Điểm tổng năm = (Q1 + Q2 + Q3 + Q4) / 4
   */
  calculateYearlyEvaluation: function(totalAnnualFund, employees, yearEvaluations, config) {
    const roundUnit = (config && config.roundUnit) ? config.roundUnit : 1000;
    const items = [];
    let sumWeight = 0;
    let eligibleCount = 0;

    employees.forEach(emp => {
      const ev = (yearEvaluations || []).find(e => e.employeeId === emp.id) || {};
      const q1 = ev.q1Score !== undefined ? ev.q1Score : 8.0;
      const q2 = ev.q2Score !== undefined ? ev.q2Score : 8.2;
      const q3 = ev.q3Score !== undefined ? ev.q3Score : 8.5;
      const q4 = ev.q4Score !== undefined ? ev.q4Score : 8.6;

      const annualScore = Math.round(((q1 + q2 + q3 + q4) / 4) * 100) / 100;
      const rating = this.determineRating(annualScore, config ? config.ratingBrackets : null);
      const seniorityCoeff = this.getSeniorityCoeff(emp.seniorityYears, config ? config.seniorityBrackets : null);
      const isDisqualified = !!emp.isDisqualified;

      let allocationWeight = 0;
      let isEligible = false;

      if (!isDisqualified) {
        isEligible = true;
        eligibleCount++;
        allocationWeight = Math.round((rating.bonusCoeff * seniorityCoeff) * 1000) / 1000;
        sumWeight += allocationWeight;
      }

      items.push({
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        department: emp.department,
        title: emp.title,
        seniorityYears: emp.seniorityYears,
        seniorityCoeff: seniorityCoeff,
        q1Score: q1,
        q2Score: q2,
        q3Score: q3,
        q4Score: q4,
        annualAverageScore: annualScore,
        score: annualScore,
        rank: rating.rank,
        bonusCoeff: rating.bonusCoeff,
        allocationWeight: allocationWeight,
        isEligible: isEligible,
        isDisqualified: isDisqualified,
        disqualifiedReason: emp.disqualifiedReason || '',
        rawBonus: 0,
        floorBonus: 0,
        fractionRemainder: 0,
        surplusAllocated: 0,
        finalBonus: 0
      });
    });

    sumWeight = Math.round(sumWeight * 1000) / 1000;

    if (sumWeight > 0) {
      let totalFloor = 0;
      items.forEach(it => {
        if (it.isEligible && it.allocationWeight > 0) {
          it.rawBonus = (totalAnnualFund * it.allocationWeight) / sumWeight;
          it.floorBonus = Math.floor(it.rawBonus / roundUnit) * roundUnit;
          it.fractionRemainder = it.rawBonus - it.floorBonus;
          it.finalBonus = it.floorBonus;
          totalFloor += it.floorBonus;
        }
      });

      let surplus = totalAnnualFund - totalFloor;
      const sorted = items.filter(it => it.isEligible && it.allocationWeight > 0)
        .sort((a, b) => b.fractionRemainder - a.fractionRemainder);

      let idx = 0;
      while (surplus >= roundUnit && sorted.length > 0) {
        sorted[idx % sorted.length].finalBonus += roundUnit;
        sorted[idx % sorted.length].surplusAllocated += roundUnit;
        surplus -= roundUnit;
        idx++;
      }
    }

    let actualTotal = 0;
    items.forEach(it => actualTotal += it.finalBonus);

    return {
      totalFund: totalAnnualFund,
      totalAllocated: actualTotal,
      remainingFund: totalAnnualFund - actualTotal,
      sumAllocationWeight: sumWeight,
      eligibleCount: eligibleCount,
      items: items
    };
  }
};
