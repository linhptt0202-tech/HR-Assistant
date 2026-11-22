/**
 * AI-Assisted Performance & Bonus Hub
 * CSV/Excel Importer with Row/Cell Validation Engine
 * Strictly adhering to BRD BRL-19, AC-14, 8.1 & 13
 */

window.CSVImporter = {
  SAMPLE_TEMPLATE_CONTENT: `employee_id,period,working_days,late_count,leave_days,kpi_achievement_pct
EMP001,KY-2026-10,22,0,0,115.5
EMP002,KY-2026-10,22,0,0,120.0
EMP003,KY-2026-10,21,1,1,95.0
EMP004,KY-2026-10,22,0,0,105.0
EMP005,KY-2026-10,20,2,2,75.0
EMP006,KY-2026-10,22,0,0,160.0
EMP007,KY-2026-10,22,0,0,105.0
EMP008,KY-2026-10,21,1,0,90.0
EMP009,KY-2026-10,18,3,4,80.0
EMP010,KY-2026-10,22,0,0,145.0
EMP011,KY-2026-10,22,0,0,100.0
EMP012,KY-2026-10,22,0,0,130.0
EMP013,KY-2026-10,22,0,0,100.0
EMP014,KY-2026-10,21,1,1,95.0
EMP015,KY-2026-10,22,0,0,98.0
EMP001,KY-2026-10,22,0,0,115.5  # Duplicate test line
EMP999,KY-2026-10,-5,abc,null,999.0 # Format error test line`,

  /**
   * Parse CSV content into structured preview & validations
   */
  parseCSV: function(csvContent, validPeriodCode) {
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      return {
        success: false,
        error: 'File CSV rỗng hoặc chỉ có dòng tiêu đề.'
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['employee_id', 'period', 'working_days', 'late_count', 'leave_days', 'kpi_achievement_pct'];
    
    // Check missing headers
    const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: 'File thiếu các cột bắt buộc: ' + missingHeaders.join(', ')
      };
    }

    const allRows = [];
    const validRows = [];
    const errorRows = [];
    const duplicateRows = [];
    const seenKeys = new Set();

    for (let i = 1; i < lines.length; i++) {
      const lineText = lines[i];
      if (lineText.startsWith('#')) continue; // Skip comments

      const values = lineText.split(',').map(v => v.trim());
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });

      const rowNumber = i + 1;
      const key = (rowObj.employee_id || '') + '_' + (rowObj.period || '');
      const cellErrors = [];

      // 1. Kiểm tra trùng lặp khóa (employee_id + period) - BRL-19
      if (seenKeys.has(key)) {
        duplicateRows.push({
          rowNumber: rowNumber,
          data: rowObj,
          reason: 'Trùng lặp mã nhân viên (' + rowObj.employee_id + ') và kỳ đánh giá (' + rowObj.period + '). Dòng xuất hiện sau bị từ chối.'
        });
        allRows.push({
          rowNumber: rowNumber,
          data: rowObj,
          status: 'duplicate',
          reason: 'Trùng lặp khóa'
        });
        continue;
      }
      seenKeys.add(key);

      // 2. Validate từng trường (BRL-19, AC-14)
      if (!rowObj.employee_id) {
        cellErrors.push({ column: 'employee_id', value: '', error: 'Mã nhân viên không được để trống.' });
      }

      if (validPeriodCode && rowObj.period !== validPeriodCode) {
        cellErrors.push({ column: 'period', value: rowObj.period, error: 'Kỳ đánh giá không khớp với kỳ đang chọn (' + validPeriodCode + ').' });
      }

      const workingDays = parseInt(rowObj.working_days, 10);
      if (isNaN(workingDays) || workingDays < 0 || workingDays > 31) {
        cellErrors.push({ column: 'working_days', value: rowObj.working_days, error: 'Ngày làm việc phải là số nguyên từ 0 đến 31.' });
      }

      const lateCount = parseInt(rowObj.late_count, 10);
      if (isNaN(lateCount) || lateCount < 0) {
        cellErrors.push({ column: 'late_count', value: rowObj.late_count, error: 'Số lần đi muộn phải là số nguyên không âm.' });
      }

      const leaveDays = parseInt(rowObj.leave_days, 10);
      if (isNaN(leaveDays) || leaveDays < 0) {
        cellErrors.push({ column: 'leave_days', value: rowObj.leave_days, error: 'Số ngày nghỉ phép phải là số nguyên không âm.' });
      }

      const kpiPct = parseFloat(rowObj.kpi_achievement_pct);
      if (isNaN(kpiPct) || kpiPct < 0 || kpiPct > 300) {
        cellErrors.push({ column: 'kpi_achievement_pct', value: rowObj.kpi_achievement_pct, error: 'Tỷ lệ hoàn thành KPI (%) phải là số từ 0 đến 300.' });
      }

      if (cellErrors.length > 0) {
        errorRows.push({
          rowNumber: rowNumber,
          data: rowObj,
          cellErrors: cellErrors
        });
        allRows.push({
          rowNumber: rowNumber,
          data: rowObj,
          status: 'error',
          cellErrors: cellErrors
        });
      } else {
        validRows.push({
          rowNumber: rowNumber,
          data: rowObj
        });
        allRows.push({
          rowNumber: rowNumber,
          data: rowObj,
          status: 'valid'
        });
      }
    }

    return {
      success: true,
      totalRows: lines.length - 1,
      validCount: validRows.length,
      errorCount: errorRows.length,
      duplicateCount: duplicateRows.length,
      allRows: allRows,
      validRows: validRows,
      errorRows: errorRows,
      duplicateRows: duplicateRows
    };
  }
};
