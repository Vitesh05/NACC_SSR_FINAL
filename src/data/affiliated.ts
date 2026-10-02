import type { InstitutionData, Metric } from './types';
import { NOT_SPECIFIED } from './types';
import { universityData } from './university';

/**
 * AFFILIATED / CONSTITUENT COLLEGE DATASETS — derived from NEW universityData.
 * UG: 31 KIs, 35 QlM + 58 QnM = 93. PG: 32 KIs, 36 QlM + 60 QnM = 96.
 * - KIs 3.1 & 3.5 NA (both); KI 3.3 NA for UG.
 * - KI 1.1(A) replaces 1.1(U). Metric 3.4.1 treated as QlM for affiliated.
 * - 11 QnM excluded (research-intensive / university-specific): listed in REMOVE_QNM.
 * - Metric weights scaled proportionally from university weights to affiliated KI weights (Table 2).
 *   Verify against affiliated manual QIF when available.
 */

const KI_W_UG: Record<string, number> = {
  '1.1': 20, '1.2': 30, '1.3': 30, '1.4': 20,
  '2.1': 40, '2.2': 50, '2.3': 50, '2.4': 60, '2.5': 30, '2.6': 60, '2.7': 60,
  '3.2': 15, '3.4': 15, '3.6': 60, '3.7': 20,
  '4.1': 30, '4.2': 20, '4.3': 30, '4.4': 20,
  '5.1': 50, '5.2': 30, '5.3': 50, '5.4': 10,
  '6.1': 10, '6.2': 10, '6.3': 30, '6.4': 20, '6.5': 30,
  '7.1': 50, '7.2': 30, '7.3': 20,
};
const KI_W_PG: Record<string, number> = {
  ...KI_W_UG, '3.2': 15, '3.3': 10, '3.4': 25, '3.6': 50, '3.7': 20,
  '5.1': 50, '5.2': 25, '5.3': 45, '5.4': 10,
};
const CRIT_W_UG: Record<number, number> = { 1: 100, 2: 350, 3: 110, 4: 100, 5: 140, 6: 100, 7: 100 };
const CRIT_W_PG: Record<number, number> = { 1: 100, 2: 350, 3: 120, 4: 100, 5: 130, 6: 100, 7: 100 };

const REMOVE_KI_UG = new Set(['3.1', '3.3', '3.5']);
const REMOVE_KI_PG = new Set(['3.1', '3.5']);
// 11 QnM not applicable to affiliated (research-intensive / university-specific).
const REMOVE_QNM = new Set(['3.4.2', '3.4.3', '3.4.4', '3.4.7', '3.4.8', '3.4.9', '3.2.3', '4.3.5', '6.3.3', '7.1.6', '7.1.10']);

function affiliatedKI11(variant: 'ug' | 'pg'): Metric[] {
  const SM = 'Manual for Affiliated/Constituent UG & PG Colleges';
  const SS = 'Quality Indicator Framework (QIF)';
  const ns = variant === 'ug' ? 'aff-ug' : 'aff-pg';
  const mk = (id: string, title: string, type: 'QlM' | 'QnM', weightage: number, description: string, dataRequired: string[], docs: string[], cols: string[], extra: Partial<Metric> = {}): Metric => ({
    id, uid: `${ns}:${id}`, kiId: '1.1', criterionId: 1,
    title: String(title), type, weightage, description: String(description),
    dataRequired: [...dataRequired],
    subQuestions: extra.subQuestions, fileDescription: extra.fileDescription, dataTemplateFields: extra.dataTemplateFields,
    wordLimit: extra.wordLimit, options: extra.options, formula: extra.formula,
    documentsRequired: docs.map((d, i) => ({ name: String(d), required: i === 0 })),
    supportingEvidence: [], tables: [{ title: `${id} – Supporting Table`, columns: [...cols] }],
    linksRequired: [], notes: [],
    dataPeriod: 'Latest completed academic year / Last five years as specified',
    optional: false, sourceManual: SM, sourceSection: SS, sourcePage: NOT_SPECIFIED,
  });
  return [
    mk('1.1.1', 'The Institution ensures effective curriculum delivery through a well planned and documented process.', 'QlM', 10,
      'Write description in not more than 500 words on academic calendar, teaching plans, time-table, course files, ICT use and monitoring.',
      ['Academic calendar of the college and affiliating university', 'Teaching plans and course files', 'Monitoring mechanism'],
      ['Academic calendar and teaching plans', 'Time-table and course files (sample)', 'Monitoring minutes'],
      ['Department', 'Programme / Course', 'Teacher Assigned', 'Teaching Plan Available', 'Syllabus Completed %', 'CIE Conducted'],
      { wordLimit: 500, fileDescription: ['Upload Additional information', 'Link for Additional information'] }),
    mk('1.1.2', 'The institution adheres to the academic calendar including for the conduct of Continuous Internal Evaluation (CIE).', 'QlM', 5,
      'Write description on adherence for teaching, CIE, examinations and internal marks with evidence.',
      ['Academic calendar vs actual dates', 'CIE schedules, papers and mark registers', 'Grievance redressal'],
      ['Academic calendar with compliance report', 'CIE schedules and sample registers'],
      ['Semester', 'CIE Component', 'Scheduled Date', 'Conducted Date', 'Adherence', 'Grievances Redressed'],
      { wordLimit: 500 }),
    mk('1.1.3', 'Teachers of the Institution participate in curriculum development and assessment activities of the affiliating University: Academic Council / BoS, Setting of question papers, Design and development of curriculum, Assessment / evaluation process.', 'QnM', 5,
      'Select one option. Provide nomination / appointment letters.',
      ['Teacher-wise participation with body / activity and year', 'Nomination / appointment orders'],
      ['Participation details with appointment letters — Data Template'],
      ['Year', 'Teacher Name / ID', 'Activity', 'University / Body', 'Letter Reference'],
      { options: ['A: All 4', 'B: Any 3', 'C: Any 2', 'D: Any 1', 'E: None'] }),
  ];
}

function toCollegeWording(s: string): string {
  return s.replace(/Universities\b/g, 'Colleges').replace(/University’s/g, 'College’s')
    .replace(/(?<!affiliating )(?<!Affiliating )University\b/g, 'College');
}

function localizeMetric(mt: Metric, ns: string): Metric {
  const out: Metric = JSON.parse(JSON.stringify(mt));
  out.uid = `${ns}:${mt.id}`;
  out.title = toCollegeWording(mt.title);
  out.description = toCollegeWording(mt.description);
  out.dataRequired = mt.dataRequired.map(toCollegeWording);
  if (mt.formula) out.formula = toCollegeWording(mt.formula);
  out.documentsRequired = mt.documentsRequired.map((d) => ({ ...d, name: toCollegeWording(d.name) }));
  out.supportingEvidence = (mt.supportingEvidence ?? []).map(toCollegeWording);
  out.tables = mt.tables.map((t) => ({ ...t, title: toCollegeWording(t.title), columns: t.columns.map(toCollegeWording), helpText: t.helpText ? toCollegeWording(t.helpText) : undefined }));
  out.linksRequired = (mt.linksRequired ?? []).map(toCollegeWording);
  out.notes = (mt.notes ?? []).map(toCollegeWording);
  if (mt.subQuestions) out.subQuestions = mt.subQuestions.map((s) => ({ id: s.id, text: toCollegeWording(s.text) }));
  if (mt.fileDescription) out.fileDescription = mt.fileDescription.map(toCollegeWording);
  if (mt.dataTemplateFields) out.dataTemplateFields = mt.dataTemplateFields.map(toCollegeWording);
  if (mt.options) out.options = mt.options.map(toCollegeWording);
  out.sourceManual = 'Manual for Affiliated/Constituent UG & PG Colleges';
  out.sourcePage = NOT_SPECIFIED;
  return out;
}

/** Scale university metric weights proportionally to affiliated KI weight; adjust to sum exactly. */
function scaleWeights(univWeights: number[], target: number): number[] {
  const sum = univWeights.reduce((a, w) => a + w, 0);
  if (sum <= 0) return univWeights.map(() => 0);
  const raw = univWeights.map((w) => (w / sum) * target);
  const floored = raw.map((r) => Math.max(1, Math.floor(r)));
  let diff = target - floored.reduce((a, w) => a + w, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (diff !== 0 && order.length > 0) {
    const idx = order[k % order.length].i;
    if (diff > 0) { floored[idx]++; diff--; }
    else { if (floored[idx] > 1) { floored[idx]--; diff++; } }
    k++;
    if (k > 1000) break;
  }
  return floored;
}

function buildAffiliated(variant: 'ug' | 'pg'): InstitutionData {
  const base: InstitutionData = JSON.parse(JSON.stringify(universityData));
  const isUG = variant === 'ug';
  const ns = isUG ? 'aff-ug' : 'aff-pg';
  const removeKI = isUG ? REMOVE_KI_UG : REMOVE_KI_PG;
  const kiW = isUG ? KI_W_UG : KI_W_PG;
  const critW = isUG ? CRIT_W_UG : CRIT_W_PG;

  const criteria = base.criteria.map((c) => {
    const kis = c.keyIndicators
      .filter((ki) => !removeKI.has(ki.id))
      .map((ki) => {
        if (ki.id === '1.1') {
          return { id: '1.1', code: '1.1', title: 'Curricular Planning and Implementation', weightage: 20, description: '(A) – Applicable only for the Affiliated / Constituent Colleges.', metrics: affiliatedKI11(variant) };
        }
        const kept = ki.metrics.filter((mt) => !REMOVE_QNM.has(mt.id)).map((mt) => localizeMetric(mt, ns));
        // 3.4.1 is QlM for affiliated (Code of Ethics descriptive).
        kept.forEach((mt) => {
          if (mt.id === '3.4.1') {
            mt.type = 'QlM';
            mt.title = 'Institution ensures implementation of its stated Code of Ethics for research.';
            mt.description = 'Describe implementation of Code of Ethics: research ethics policy, plagiarism policy, Ethics Committee and misconduct procedures. Maximum 500 words.';
            mt.options = undefined;
            mt.wordLimit = 500;
          }
        });
        const target = kiW[ki.id] ?? ki.weightage;
        const scaled = scaleWeights(kept.map((mt) => mt.weightage), target);
        kept.forEach((mt, i) => { mt.weightage = scaled[i]; });
        return { ...ki, description: toCollegeWording(ki.description), weightage: target, metrics: kept };
      });
    return { ...c, description: toCollegeWording(c.description), weightage: critW[c.id] ?? c.weightage, keyIndicators: kis };
  });

  return {
    ...base, id: 'affiliated', variant,
    name: isUG ? 'Affiliated / Constituent College (UG)' : 'Affiliated / Constituent College (PG)',
    shortName: isUG ? 'AFF-UG' : 'AFF-PG',
    manualName: 'Manual for Self-Study Report – Affiliated / Constituent UG & PG Colleges',
    manualShort: isUG ? 'Affiliated Manual (UG)' : 'Affiliated Manual (PG)',
    totalCriteria: 7, totalKIs: isUG ? 31 : 32,
    totalQlM: isUG ? 35 : 36, totalQnM: isUG ? 58 : 60,
    totalMetrics: isUG ? 93 : 96, totalScore: 1000,
    sourceNote: isUG
      ? 'Affiliated UG derived from new University QIF with affiliated applicability (KIs 3.1, 3.3, 3.5 NA; 11 QnM excluded; 1.1(A); 3.4.1 as QlM). 31 KIs, 35 QlM + 58 QnM = 93. Metric weights scaled to Table 2 KI weights — verify against affiliated manual.'
      : 'Affiliated PG derived from new University QIF (KIs 3.1, 3.5 NA; 11 QnM excluded; 1.1(A); 3.4.1 as QlM). 32 KIs, 36 QlM + 60 QnM = 96. Metric weights scaled to Table 2 KI weights — verify against affiliated manual.',
    criteria,
  };
}

export const affiliatedCollegeDataUG: InstitutionData = buildAffiliated('ug');
export const affiliatedCollegeDataPG: InstitutionData = buildAffiliated('pg');
export const affiliatedCollegeData = { ug: affiliatedCollegeDataUG, pg: affiliatedCollegeDataPG };
export const affiliatedUGData = affiliatedCollegeDataUG;
export const affiliatedPGData = affiliatedCollegeDataPG;
