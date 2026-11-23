/**
 * AI-Assisted Performance & Bonus Hub
 * Automated Test Suite for BRD Rules & Engines
 */

const fs = require('fs');

// Mock window and browser globals
global.window = global;
global.localStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = v.toString(); },
  removeItem: function(k) { delete this._store[k]; }
};

// Load code modules
eval(fs.readFileSync('./js/data/initial-data.js', 'utf8'));
eval(fs.readFileSync('./js/data/storage.js', 'utf8'));
eval(fs.readFileSync('./js/engine/calculation.js', 'utf8'));
eval(fs.readFileSync('./js/engine/validation.js', 'utf8'));
eval(fs.readFileSync('./js/engine/ai-assistant.js', 'utf8'));
eval(fs.readFileSync('./js/engine/csv-importer.js', 'utf8'));

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('CHẠY BỘ KIỂM THỬ TỰ ĐỘNG: AI-ASSISTED PERFORMANCE & BONUS HUB');
console.log('======================================================\n');

// TC-08: Tính điểm nhóm và điểm tổng có trọng số 2 cấp (BRL-25, 26, 27)
console.log('--- Test Section 1: Engine Tính Điểm & Xếp Hạng ---');
{
  const subCriteria = [
    { id: 'SC1', weight: 60 },
    { id: 'SC2', weight: 40 }
  ];
  const scores = { SC1: 9.0, SC2: 8.0 };
  const groupScore = CalculationEngine.calculateGroupScore(subCriteria, scores);
  // (9 * 60 + 8 * 40) / 100 = (540 + 320) / 100 = 8.6
  assert(Math.abs(groupScore - 8.6) < 0.0001, 'TC-08.1: Điểm nhóm tính chính xác theo trọng số tiêu chí con (8.60)');

  const groups = [
    { id: 'G1', weight: 50, score: 8.6 },
    { id: 'G2', weight: 20, score: 9.0 },
    { id: 'G3', weight: 30, score: 8.0 }
  ];
  // (8.6 * 50 + 9.0 * 20 + 8.0 * 30) / 100 = (430 + 180 + 240) / 100 = 850 / 100 = 8.50
  const totalScore = CalculationEngine.calculateTotalScore(groups);
  assert(totalScore === 8.50, 'TC-08.2: Điểm tổng tính chính xác theo trọng số nhóm và làm tròn 2 chữ số (8.50)');

  // TC-09: Xếp hạng theo ngưỡng S/A/B/C
  const rankS = CalculationEngine.determineRating(9.00).rank;
  const rankA = CalculationEngine.determineRating(8.99).rank;
  const rankB = CalculationEngine.determineRating(7.20).rank;
  const rankC = CalculationEngine.determineRating(6.49).rank;

  assert(rankS === 'S', 'TC-09.1: Điểm 9.00 được xếp hạng S');
  assert(rankA === 'A', 'TC-09.2: Điểm 8.99 được xếp hạng A');
  assert(rankB === 'B', 'TC-09.3: Điểm 7.20 được xếp hạng B');
  assert(rankC === 'C', 'TC-09.4: Điểm 6.49 được xếp hạng C');
}

// TC-14: Phân bổ thưởng làm tròn 1.000 VNĐ & chia phần dư (BRL-08, BRL-15)
console.log('\n--- Test Section 2: Engine Phân Bổ Quỹ Thưởng & Làm Tròn ---');
{
  const totalFund = 100000000; // 100 triệu
  const employees = [
    { id: 'E1', code: 'NV1', name: 'A', seniorityYears: 3.5, isDisqualified: false },
    { id: 'E2', code: 'NV2', name: 'B', seniorityYears: 2.0, isDisqualified: false },
    { id: 'E3', code: 'NV3', name: 'C', seniorityYears: 0.5, isDisqualified: false },
    { id: 'E4', code: 'NV4', name: 'D', seniorityYears: 1.0, isDisqualified: true, disqualifiedReason: 'Kỷ luật' } // Disqualified
  ];
  const evaluations = [
    { employeeId: 'E1', managerReviewStatus: 'completed', managerTotalScore: 9.20 }, // S -> 1.5, Seniority 3.5 -> 1.10 => Weight: 1.65
    { employeeId: 'E2', managerReviewStatus: 'completed', managerTotalScore: 8.50 }, // A -> 1.2, Seniority 2.0 -> 1.05 => Weight: 1.26
    { employeeId: 'E3', managerReviewStatus: 'completed', managerTotalScore: 7.00 }, // B -> 1.0, Seniority 0.5 -> 1.00 => Weight: 1.00
    { employeeId: 'E4', managerReviewStatus: 'completed', managerTotalScore: 8.00 }  // Disqualified -> Weight: 0, Bonus: 0
  ];

  const bonusResult = CalculationEngine.calculateBonusAllocation(totalFund, employees, evaluations, null);

  assert(bonusResult.totalAllocated <= totalFund, 'TC-14.1: Tổng thưởng đã phân bổ tuyệt đối không vượt quỹ (≤ 100M)');
  assert(bonusResult.totalAllocated % 1000 === 0, 'TC-14.2: Mọi số tiền thưởng đều được làm tròn chuẩn đơn vị 1.000 VNĐ');
  assert(bonusResult.eligibleCount === 3, 'TC-14.3: Đếm chính xác 3 nhân viên đủ điều kiện nhận thưởng');
  assert(bonusResult.disqualifiedCount === 1, 'TC-14.4: Đếm chính xác 1 nhân viên bị loại do kỷ luật');

  const disqualifiedEmp = bonusResult.items.find(i => i.employeeId === 'E4');
  assert(disqualifiedEmp.finalBonus === 0, 'TC-13: Nhân viên bị kỷ luật có tiền thưởng = 0 VNĐ và không nằm trong mẫu số');

  // Kiểm tra phần dư làm tròn được chia hết
  assert(bonusResult.remainingFund < 1000, 'TC-14.5: Phần dư quỹ sau khi chia tối đa nhỏ hơn 1.000 VNĐ (đã phân dư hết)');
}

// TC-15: Trường hợp mẫu số tổng trọng số = 0 (BRL-14)
console.log('\n--- Test Section 3: Edge Case Tổng Trọng Số = 0 (BRL-14) ---');
{
  const totalFund = 50000000;
  const employees = [
    { id: 'E1', code: 'NV1', isDisqualified: true },
    { id: 'E2', code: 'NV2', isDisqualified: true }
  ];
  const evaluations = [];
  const zeroResult = CalculationEngine.calculateBonusAllocation(totalFund, employees, evaluations, null);

  assert(zeroResult.hasZeroWeightsError === true, 'TC-15.1: Báo lỗi khi tổng trọng số phân bổ = 0');
  assert(zeroResult.totalAllocated === 0, 'TC-15.2: Không phân bổ đồng nào');
  assert(zeroResult.remainingFund === totalFund, 'TC-15.3: Bảo toàn 100% quỹ thưởng');
}

// Validation Engine Checks
console.log('\n--- Test Section 4: Validation Engine & Business Constraints ---');
{
  // TC-01: Tổng trọng số nhóm != 100%
  const periodInvalidWeight = { id: 'P1', groupsWeightSum: 95 };
  const transCheck1 = ValidationEngine.canTransitionPeriod('draft', 'self-review', periodInvalidWeight, { employees: [{ id: '1', managerId: '2' }], evaluations: {} });
  assert(!transCheck1.isValid && transCheck1.errors[0].includes('phải bằng đúng 100%'), 'TC-01: Chặn mở kỳ khi tổng trọng số nhóm != 100%');

  // TC-06: Nhận xét bắt buộc khi điểm >= 9 hoặc <= 4
  const subCriteria = [{ id: 'SC1', name: 'KPI', weight: 100 }];
  const mgrCheckHighNoComment = ValidationEngine.validateManagerReview({ SC1: 9.5 }, { SC1: '' }, subCriteria, 'MGR1', { userId: 'EMP1' });
  assert(!mgrCheckHighNoComment.isValid && mgrCheckHighNoComment.errors[0].includes('Bắt buộc phải nhập nhận xét'), 'TC-06.1: Chặn nộp đánh giá khi điểm >= 9 mà không có nhận xét');

  const mgrCheckLowNoComment = ValidationEngine.validateManagerReview({ SC1: 3.5 }, { SC1: '   ' }, subCriteria, 'MGR1', { userId: 'EMP1' });
  assert(!mgrCheckLowNoComment.isValid && mgrCheckLowNoComment.errors[0].includes('Bắt buộc phải nhập nhận xét'), 'TC-06.2: Chặn nộp đánh giá khi điểm <= 4 mà không có nhận xét');

  // TC-07: Quản lý không được tự chấm cho mình
  const mgrCheckSelf = ValidationEngine.validateManagerReview({ SC1: 8.0 }, { SC1: 'Tốt' }, subCriteria, 'USER_ME', { userId: 'USER_ME' });
  assert(!mgrCheckSelf.isValid && mgrCheckSelf.errors[0].includes('không được tự chấm điểm cho chính bản thân'), 'TC-07: Chặn quản lý tự chấm điểm cho chính bản thân mình (BRL-07)');

  // TC-12: Calibration điều chỉnh điểm đổi hạng hoặc lệch > 1.0 điểm (BRL-17)
  const adjCheck = ValidationEngine.checkCalibrationAdjustment(9.5, 8.2, 'Lý do rà soát AI', null);
  assert(adjCheck.needsDirectorConfirm === true, 'TC-12.1: Gắn cờ cần Giám đốc xác nhận khi đổi hạng S -> A và lệch 1.30đ (> 1.0đ)');

  const adjCheckNoReason = ValidationEngine.checkCalibrationAdjustment(8.5, 8.0, '', null);
  assert(!adjCheckNoReason.isValid && adjCheckNoReason.errors[0].includes('Bắt buộc phải nhập lý do'), 'TC-12.2: Chặn lưu điều chỉnh nếu thiếu lý do');
}

// CSV Importer Checks
console.log('\n--- Test Section 5: CSV Importer Engine (BRL-19 & AC-14) ---');
{
  const testCSV = `employee_id,period,working_days,late_count,leave_days,kpi_achievement_pct
EMP001,KY-2026-10,22,0,0,115.5
EMP001,KY-2026-10,22,0,0,115.5
EMP002,KY-2026-10,-5,abc,0,100.0`;

  const csvResult = CSVImporter.parseCSV(testCSV, 'KY-2026-10');
  assert(csvResult.validCount === 1, 'TC-19.1: Nhận diện chính xác 1 dòng hợp lệ');
  assert(csvResult.duplicateCount === 1, 'TC-19.2: Phát hiện và từ chối dòng trùng lặp khóa (EMP001)');
  assert(csvResult.errorCount === 1, 'TC-19.3: Bắt lỗi chi tiết từng ô sai định dạng (-5 ngày công, abc lần đi muộn)');
}

// Test Section 6: Các quy tắc nghiệp vụ cập nhật theo yêu cầu người dùng
console.log('\n--- Test Section 6: Quy Tắc Mới Theo Yêu Cầu Người Dùng ---');
{
  // 1. Phải cho nhân viên đánh giá xong, mới cho quản lý đánh giá (Kỳ Quý)
  const quarterPeriod = { id: 'PQ4', type: 'quarter' };
  const monthPeriod = { id: 'PM10', type: 'month' };

  const evalEmpNotDone = { selfReviewStatus: 'in_progress' };
  const checkQuarterNotDone = ValidationEngine.canManagerReviewEmployee(quarterPeriod, evalEmpNotDone);
  assert(!checkQuarterNotDone.canReview && checkQuarterNotDone.reason.includes('phải hoàn tất tự đánh giá xong'), 
    'TC-NEW-01: Chặn quản lý chấm điểm khi nhân viên chưa nộp tự đánh giá (Kỳ Quý)');

  const evalEmpDone = { selfReviewStatus: 'submitted' };
  const checkQuarterDone = ValidationEngine.canManagerReviewEmployee(quarterPeriod, evalEmpDone);
  assert(checkQuarterDone.canReview === true, 
    'TC-NEW-02: Cho phép quản lý chấm sau khi nhân viên đã nộp tự đánh giá (Kỳ Quý)');

  const checkMonthDirect = ValidationEngine.canManagerReviewEmployee(monthPeriod, evalEmpNotDone);
  assert(checkMonthDirect.canReview === true, 
    'TC-NEW-03: Ở kỳ Tháng, quản lý được chấm trực tiếp hàng tháng (nhân viên không tự chấm)');

  // 2. Đánh giá tổng năm lấy tổng/trung bình 4 quý
  const sampleEmps = [
    { id: 'E1', code: 'NV1', name: 'A', seniorityYears: 2.0, isDisqualified: false }
  ];
  const yearEvals = [
    { employeeId: 'E1', q1Score: 8.0, q2Score: 8.5, q3Score: 9.0, q4Score: 8.5 }
  ];
  // Average = (8.0 + 8.5 + 9.0 + 8.5) / 4 = 34 / 4 = 8.50
  const yearlyRes = CalculationEngine.calculateYearlyEvaluation(200000000, sampleEmps, yearEvals, null);
  assert(yearlyRes.items[0].annualAverageScore === 8.50, 
    'TC-NEW-04: Điểm đánh giá tổng năm tính bằng trung bình cộng 4 quý chuẩn xác (8.50)');
  assert(yearlyRes.items[0].rank === 'A', 
    'TC-NEW-05: Điểm năm 8.50 được xếp hạng A');

  // 3. Tên tiêu chí cập nhật
  const sc2_2 = DEFAULT_DATA.criteriaTemplate.groups[1].subCriteria[1];
  assert(sc2_2.name === 'Tuân thủ quy trình, quy định, văn hoá công ty', 
    'TC-NEW-06: Tên tiêu chí con cập nhật đúng thành "Tuân thủ quy trình, quy định, văn hoá công ty"');

  // 4. Bảo mật thông báo: Nhân viên chỉ nhận tin của mình; Quản lý chỉ nhận tin phòng ban mình
  const testNotifs = [
    { id: 'N1', recipientRole: 'director', title: 'Tin GĐ' },
    { id: 'N2', recipientRole: 'manager', targetDepartment: 'Kỹ thuật', title: 'Tin phòng KT' },
    { id: 'N3', recipientRole: 'manager', targetDepartment: 'Kinh doanh', title: 'Tin phòng KD' },
    { id: 'N4', recipientRole: 'employee', recipientUserId: 'USR_EMP1', title: 'Tin của Lê Văn Nhân Viên' },
    { id: 'N5', recipientRole: 'employee', recipientUserId: 'USR_EMP2', title: 'Tin của NV khác' }
  ];

  AppStorage.save(Object.assign({}, DEFAULT_DATA, { notifications: testNotifs }));

  const empUser = { id: 'USR_EMP1', role: 'employee', department: 'Kỹ thuật' };
  const empNotifs = AppStorage.getNotificationsForCurrentUser(empUser);
  assert(empNotifs.length === 1 && empNotifs[0].id === 'N4', 
    'TC-NEW-07: Nhân viên CHỈ nhận thông báo liên quan đến bản thân mình (không thấy tin người khác hay cấp trên)');

  const mgrTech = { id: 'USR_MGR', role: 'manager', department: 'Kỹ thuật' };
  const mgrTechNotifs = AppStorage.getNotificationsForCurrentUser(mgrTech);
  assert(mgrTechNotifs.length === 1 && mgrTechNotifs[0].id === 'N2', 
    'TC-NEW-08: Quản lý CHỈ nhận thông báo về phòng ban mình (không thấy tin phòng ban khác hay tin GĐ/HR)');
}

console.log('\n======================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✓ TOÀN BỘ CÁC TEST CASES ĐÃ ĐẠT CHUẨN 100%!');
}
