/**
 * AI-Assisted Performance & Bonus Hub
 * AI Assistant Module (Summarizer, Bias Detector, Bonus Allocator & Simulation)
 * Strictly adhering to BRD BRL-11, BRL-12, BRL-13, BRL-22, 11.4 - 11.6
 */

window.AIAssistant = {
  /**
   * Ẩn danh hóa dữ liệu trước khi gửi sang AI (BRL-12)
   */
  anonymizeEmployeeData: function(employee, evaluation) {
    return {
      anonymousId: employee.code, // Mã NV thay cho họ tên
      department: employee.department,
      seniorityYears: employee.seniorityYears,
      selfScore: evaluation ? evaluation.selfTotalScore : null,
      managerScore: evaluation ? (evaluation.isAdjusted ? evaluation.adjustedScore : evaluation.managerTotalScore) : null,
      managerComments: evaluation ? evaluation.managerComments : {},
      selfComments: evaluation ? evaluation.selfComments : {}
    };
  },

  /**
   * AI Review Summarizer (11.4 & 7.1)
   * Tóm tắt thành tích nổi bật kèm trích dẫn nguồn căn cứ cụ thể
   */
  summarizeReview: function(employee, evaluation, callback) {
    const session = window.AppStorage.getSession();

    // Giả lập lỗi hoặc timeout AI (BR-22, 7.4)
    if (session.aiSimulationOffline) {
      setTimeout(() => {
        callback({
          success: false,
          error: 'Dịch vụ AI đang gặp sự cố gián đoạn kết nối hoặc quá thời gian chờ (Timeout). Hệ thống cho phép người dùng tiếp tục các thao tác không phụ thuộc AI.',
          isOffline: true
        });
      }, 500);
      return;
    }

    // Giả lập phân tích AI
    setTimeout(() => {
      const anon = this.anonymizeEmployeeData(employee, evaluation);
      const highlights = [];

      if (evaluation && evaluation.managerComments) {
        Object.keys(evaluation.managerComments).forEach(key => {
          const comment = evaluation.managerComments[key];
          if (comment && comment.length > 20) {
            highlights.push({
              text: comment,
              source: 'Đánh giá Quản lý tại tiêu chí ' + key,
              type: 'achievement'
            });
          }
        });
      }

      if (highlights.length === 0) {
        highlights.push({
          text: 'Nhân sự hoàn thành các nhiệm vụ cơ bản trong kỳ, duy trì kỷ luật giờ giấc.',
          source: 'Dữ liệu chấm công & KPI kỳ',
          type: 'general'
        });
      }

      callback({
        success: true,
        summary: 'Tổng hợp thành tích nổi bật của nhân sự mã ' + anon.anonymousId + ' trong kỳ:',
        highlights: highlights,
        disclaimer: 'Gợi ý AI dựa trên dữ liệu nhận xét và KPI — cần con người rà soát và quyết định.'
      });
    }, 400);
  },

  /**
   * AI Bias Detector (11.4, 7.2 & BRL-22)
   * Quét tín hiệu cần rà soát (Mức Bất thường hoặc Nghiêm trọng), KHÔNG BAO GIỜ gán nhãn "Kết luận thiên vị"
   */
  detectBiases: function(employee, evaluation) {
    const signals = [];
    if (!evaluation) return signals;

    const mgrScore = evaluation.managerTotalScore;
    const selfScore = evaluation.selfTotalScore;

    // 1. Điểm cao nhưng nhận xét mang tính tiêu cực
    let hasHarshComment = false;
    if (evaluation.managerComments) {
      const allText = Object.values(evaluation.managerComments).join(' ').toLowerCase();
      if (allText.includes('thiếu động lực') || allText.includes('phàn nàn') || allText.includes('bất hợp tác') || allText.includes('cộc lốc')) {
        hasHarshComment = true;
      }
    }

    if (mgrScore >= 9.0 && hasHarshComment) {
      signals.push({
        id: 'SIGNAL_' + Date.now() + '_1',
        severity: 'severe', // Nghiêm trọng
        label: 'Tín hiệu cần rà soát: Điểm rất cao nhưng nhận xét có nội dung tiêu cực',
        evidence: 'Quản lý cho điểm ' + mgrScore + ' (Xếp hạng S) nhưng nhận xét phản ánh thái độ thiếu hợp tác, giao tiếp cộc lốc.',
        suggestedAction: 'Xem xét lại biên bản làm việc và đối thoại cùng Quản lý trực tiếp để điều chỉnh điểm phản ánh đúng thực tế.'
      });
    }

    // 2. Chênh lệch lớn giữa tự đánh giá và quản lý đánh giá
    if (selfScore !== null && selfScore !== undefined) {
      const diff = Math.abs(mgrScore - selfScore);
      if (diff >= 0.70) {
        signals.push({
          id: 'SIGNAL_' + Date.now() + '_2',
          severity: 'anomaly', // Bất thường
          label: 'Tín hiệu cần rà soát: Chênh lệch đáng kể giữa tự đánh giá (' + selfScore + ') và Quản lý chấm (' + mgrScore + ')',
          evidence: 'Khoảng cách điểm số là ' + diff.toFixed(2) + ' điểm. Cần đối chiếu chứng từ KPI và sản phẩm bàn giao thực tế.',
          suggestedAction: 'HR nên đối thoại ngắn giữa nhân viên và quản lý để làm rõ kỳ vọng công việc.'
        });
      }
    }

    // 3. Nhân viên không tự đánh giá do quá hạn
    if (evaluation.selfReviewStatus === 'not_submitted') {
      signals.push({
        id: 'SIGNAL_' + Date.now() + '_3',
        severity: 'anomaly',
        label: 'Tín hiệu cần rà soát: Phiếu tự đánh giá của nhân viên bị khuyết do quá hạn',
        evidence: 'Nhân sự không nộp phiếu tự đánh giá đúng deadline. Quản lý chấm điểm độc lập không có dữ liệu đối chiếu.',
        suggestedAction: 'Ghi nhận lý do chậm nộp và nhắc nhở kỷ luật quy trình.'
      });
    }

    return signals;
  },

  /**
   * AI Bonus Allocator: Giải thích số tiền thưởng (11.5 & 7.3)
   * AI không thay đổi số tiền chính thức, chỉ giải thích logic công thức chuẩn BRL-08
   */
  explainBonus: function(targetItem, comparisonItem, totalFund, sumWeights) {
    const explanations = [];

    explanations.push('Số tiền thưởng ' + targetItem.finalBonus.toLocaleString() + ' đ của mã ' + targetItem.employeeCode + ' được phân bổ theo công thức chuẩn:');
    explanations.push('• Xếp hạng ' + targetItem.rank + ' (Điểm: ' + targetItem.score + ') ➔ Hệ số xếp hạng: ' + targetItem.bonusCoeff);
    explanations.push('• Thâm niên ' + targetItem.seniorityYears + ' năm ➔ Hệ số thâm niên: ' + targetItem.seniorityCoeff);
    explanations.push('• Trọng số phân bổ cá nhân: ' + targetItem.bonusCoeff + ' × ' + targetItem.seniorityCoeff + ' = ' + targetItem.allocationWeight);
    explanations.push('• Tỷ lệ thụ hưởng trên toàn công ty: (' + targetItem.allocationWeight + ' / ' + sumWeights + ') = ' + ((targetItem.allocationWeight / sumWeights) * 100).toFixed(2) + '% quỹ.');

    if (comparisonItem) {
      explanations.push('---');
      explanations.push('So sánh với mã ' + comparisonItem.employeeCode + ' (Nhận ' + comparisonItem.finalBonus.toLocaleString() + ' đ):');
      if (targetItem.rank !== comparisonItem.rank) {
        explanations.push('• Chênh lệch chủ yếu do Xếp hạng năng lực: ' + targetItem.rank + ' (Hệ số ' + targetItem.bonusCoeff + ') so với ' + comparisonItem.rank + ' (Hệ số ' + comparisonItem.bonusCoeff + ').');
      }
      if (targetItem.seniorityCoeff !== comparisonItem.seniorityCoeff) {
        explanations.push('• Chênh lệch thâm niên cống hiến: ' + targetItem.seniorityYears + ' năm (Hệ số ' + targetItem.seniorityCoeff + ') so với ' + comparisonItem.seniorityYears + ' năm (Hệ số ' + comparisonItem.seniorityCoeff + ').');
      }
    }

    return explanations;
  },

  /**
   * AI Mô phỏng kịch bản giả định (What-If Simulation)
   * Tách biệt rõ ràng với phương án chính thức (BRL-13 & 7.3)
   */
  simulateScenario: function(simulatedFund, simulatedCoeffs, employees, evaluations) {
    const mockConfig = {
      ratingBrackets: [
        { rank: 'S', minScore: 9.00, bonusCoeff: simulatedCoeffs.s },
        { rank: 'A', minScore: 8.00, bonusCoeff: simulatedCoeffs.a },
        { rank: 'B', minScore: 6.50, bonusCoeff: simulatedCoeffs.b },
        { rank: 'C', minScore: 0.00, bonusCoeff: simulatedCoeffs.c }
      ],
      roundUnit: 1000
    };

    const simResult = window.CalculationEngine.calculateBonusAllocation(
      simulatedFund,
      employees,
      evaluations,
      mockConfig
    );

    return {
      isSimulation: true,
      label: 'Kịch bản giả định (Không phải kết quả chính thức)',
      result: simResult
    };
  }
};
