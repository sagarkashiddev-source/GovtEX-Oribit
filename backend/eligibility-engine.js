const QUALIFICATION_RANK = {
  '10th': 1,
  '12th': 2,
  'Diploma': 3,
  'Graduate': 4,
  'Post Graduate': 5
};

const AGE_RELAXATION_YEARS = {
  General: 0,
  EWS: 0,
  OBC: 3,
  SC: 5,
  ST: 5
};

function calcAge(dobStr, onDateStr) {
  const dob = new Date(dobStr);
  const on = new Date(onDateStr);
  let age = on.getFullYear() - dob.getFullYear();
  const m = on.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Evaluate one user's profile against one exam and return a detailed breakdown.
 */
function evaluateExam(user, education, physical, exam) {
  const criteria = [];
  const cutoffDate = exam.application_end || exam.exam_date || new Date().toISOString().slice(0, 10);

  // ---- Age ----
  let ageResult = { key: 'age', label: 'Age Limit', status: 'unknown', detail: '' };
  if (!user.dob) {
    ageResult.status = 'incomplete';
    ageResult.detail = 'Date of birth not provided in your profile.';
  } else {
    const age = calcAge(user.dob, cutoffDate);
    const relax = AGE_RELAXATION_YEARS[user.category] ?? 0;
    const effectiveMax = (exam.max_age || 100) + relax;
    const minOk = !exam.min_age || age >= exam.min_age;
    const maxOk = !exam.max_age || age <= effectiveMax;
    ageResult.status = minOk && maxOk ? 'pass' : 'fail';
    ageResult.detail = `You are ${age} yrs (as of ${cutoffDate}). Required: ${exam.min_age}-${exam.max_age} yrs` +
      (relax ? ` (+${relax} yrs relaxation for ${user.category})` : '') + '.';
  }
  criteria.push(ageResult);

  // ---- Education ----
  let eduResult = { key: 'education', label: 'Educational Qualification', status: 'unknown', detail: '' };
  if (!education || !education.highest_qualification) {
    eduResult.status = 'incomplete';
    eduResult.detail = 'Add your highest qualification to check this criterion.';
  } else {
    const userRank = QUALIFICATION_RANK[education.highest_qualification] || 0;
    const reqRank = QUALIFICATION_RANK[exam.min_qualification] || 0;
    eduResult.status = userRank >= reqRank ? 'pass' : 'fail';
    eduResult.detail = `Your qualification: ${education.highest_qualification}. Required: ${exam.min_qualification} or higher.`;
  }
  criteria.push(eduResult);

  // ---- Percentage ----
  if (exam.min_percentage && exam.min_percentage > 0) {
    let pctResult = { key: 'percentage', label: 'Minimum Percentage', status: 'unknown', detail: '' };
    if (!education || education.percentage == null) {
      pctResult.status = 'incomplete';
      pctResult.detail = 'Add your qualifying percentage to check this criterion.';
    } else {
      pctResult.status = education.percentage >= exam.min_percentage ? 'pass' : 'fail';
      pctResult.detail = `Your score: ${education.percentage}%. Required: ${exam.min_percentage}%+.`;
    }
    criteria.push(pctResult);
  }

  // ---- Physical standards ----
  if (exam.requires_physical) {
    let standards = {};
    try { standards = JSON.parse(exam.physical_standards || '{}'); } catch (e) { /* noop */ }
    const genderKey = (user.gender || '').toLowerCase() === 'female' ? 'female' : 'male';
    const req = standards[genderKey] || {};
    let physResult = { key: 'physical', label: 'Physical Standards', status: 'unknown', detail: '' };
    if (!physical || physical.height_cm == null) {
      physResult.status = 'incomplete';
      physResult.detail = 'Add your physical measurements to check this criterion.';
    } else {
      const heightOk = !req.height || physical.height_cm >= req.height;
      const chestOk = !req.chest || (physical.chest_cm && physical.chest_cm >= req.chest);
      physResult.status = heightOk && chestOk ? 'pass' : 'fail';
      physResult.detail = `Height: ${physical.height_cm}cm (req ${req.height || '-'}cm)` +
        (req.chest ? `, Chest: ${physical.chest_cm || '-'}cm (req ${req.chest}cm)` : '') + '.';
    }
    criteria.push(physResult);
  }

  const hasFail = criteria.some(c => c.status === 'fail');
  const hasIncomplete = criteria.some(c => c.status === 'incomplete');
  let overall = 'eligible';
  if (hasFail) overall = 'not_eligible';
  else if (hasIncomplete) overall = 'incomplete';

  return { examId: exam.id, overall, criteria };
}

module.exports = { evaluateExam, calcAge, QUALIFICATION_RANK, AGE_RELAXATION_YEARS };
