import type { InstitutionData, Metric } from './types';
import { universityData } from './university';
import { autonomousCollegeData } from './autonomous';
import { affiliatedCollegeData } from './affiliated';

/**
 * THE THREE SEPARATE DATASETS — required names:
 *   universityData · autonomousCollegeData · affiliatedCollegeData
 * UI is common; data is NOT common. Each dataset owns its metric objects.
 */
export { universityData, autonomousCollegeData, affiliatedCollegeData };

export type InstitutionKey = 'university' | 'autonomous' | 'affiliated';
export type VariantKey = 'ug' | 'pg';

export function getInstitutionData(inst: InstitutionKey, variant: VariantKey = 'ug'): InstitutionData {
  if (inst === 'university') return universityData;
  if (inst === 'autonomous') return autonomousCollegeData;
  return variant === 'pg' ? affiliatedCollegeData.pg : affiliatedCollegeData.ug;
}

export function instKey(inst: InstitutionKey, variant: VariantKey): string {
  return inst === 'affiliated' ? `affiliated-${variant}` : inst;
}

export function allMetricsOf(data: InstitutionData): Metric[] {
  const out: Metric[] = [];
  data.criteria.forEach((c) => c.keyIndicators.forEach((ki) => ki.metrics.forEach((m) => out.push(m))));
  return out;
}

/** Metric counts per Table 1 of the manuals. */
const EXPECTED: Record<string, { kis: number; qlm: number; qnm: number; total: number }> = {
  university: { kis: 34, qlm: 36, qnm: 79, total: 115 },
  autonomous: { kis: 34, qlm: 35, qnm: 72, total: 107 },
  'affiliated-ug': { kis: 31, qlm: 35, qnm: 58, total: 93 },
  'affiliated-pg': { kis: 32, qlm: 36, qnm: 60, total: 96 },
};

export interface IntegrityReport {
  key: string;
  ok: boolean;
  kis: number; qlm: number; qnm: number; total: number;
  expected: { kis: number; qlm: number; qnm: number; total: number };
  duplicateIds: string[];
  kiWeightMismatch: string[];
}

export function checkIntegrity(key: string, data: InstitutionData): IntegrityReport {
  const metrics = allMetricsOf(data);
  const kis = data.criteria.reduce((a, c) => a + c.keyIndicators.length, 0);
  const qlm = metrics.filter((m) => m.type === 'QlM').length;
  const qnm = metrics.filter((m) => m.type === 'QnM').length;
  const seen = new Set<string>();
  const dups: string[] = [];
  metrics.forEach((m) => { if (seen.has(m.id)) dups.push(m.id); seen.add(m.id); });
  const kiMm: string[] = [];
  data.criteria.forEach((c) => c.keyIndicators.forEach((ki) => {
    const sum = ki.metrics.reduce((a, m) => a + m.weightage, 0);
    if (sum !== ki.weightage) kiMm.push(`${ki.id} (KI ${ki.weightage} vs Σmetrics ${sum})`);
  }));
  const expected = EXPECTED[key];
  const ok = !!expected && kis === expected.kis && qlm === expected.qlm && qnm === expected.qnm && metrics.length === expected.total && dups.length === 0 && kiMm.length === 0;
  return { key, ok, kis, qlm, qnm, total: metrics.length, expected, duplicateIds: dups, kiWeightMismatch: kiMm };
}

/** Prove no metric object reference is shared between institution datasets. */
export function assertIndependent(): { independent: boolean; shared: number } {
  const sets = [
    new Set<object>(allMetricsOf(universityData)),
    new Set<object>(allMetricsOf(autonomousCollegeData)),
    new Set<object>(allMetricsOf(affiliatedCollegeData.ug)),
    new Set<object>(allMetricsOf(affiliatedCollegeData.pg)),
  ];
  let shared = 0;
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      sets[i].forEach((o) => { if (sets[j].has(o)) shared++; });
    }
  }
  return { independent: shared === 0, shared };
}

export function integrityAll(): IntegrityReport[] {
  return [
    checkIntegrity('university', universityData),
    checkIntegrity('autonomous', autonomousCollegeData),
    checkIntegrity('affiliated-ug', affiliatedCollegeData.ug),
    checkIntegrity('affiliated-pg', affiliatedCollegeData.pg),
  ];
}
