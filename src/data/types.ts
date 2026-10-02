export type InstitutionId = 'university' | 'autonomous' | 'affiliated';
export type AffiliatedVariant = 'ug' | 'pg';
export type MetricType = 'QlM' | 'QnM';
export type MetricStatus = 'not-started' | 'in-progress' | 'completed';
export type DocStatus = 'missing' | 'added' | 'verified';

export interface MetricDoc {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MetricTable {
  title: string;
  columns: string[];
  helpText?: string;
  sampleRows?: string[][];
}

export const NOT_SPECIFIED = 'Not specified in provided source.';

/** A numbered sub-question inside a metric, e.g. 1.1.2.1 / 1.1.2.2 — each gets its own module. */
export interface MetricSubQuestion {
  id: string;
  text: string;
}

export interface Metric {
  /** Display ID within manual, e.g. "1.1.1" — unique only within its own institution dataset. */
  id: string;
  /** Globally unique namespaced ID, e.g. "univ:1.1.1" — guarantees no cross-institution contamination. Assigned at dataset build. */
  uid?: string;
  kiId: string;
  criterionId: number;
  /** Exact metric title/question — NEVER shared across metrics. Each metric owns its own copy. */
  title: string;
  type: MetricType;
  /** Metric-level marks/weightage — belongs ONLY to this metric, never a KI/CRITERION total. */
  weightage: number;
  description: string;
  /** Data requirements belonging ONLY to this metric. */
  dataRequired: string[];
  /** Numbered sub-questions (e.g. 1.1.2.1, 1.1.2.2) — each rendered as its own SARGEN-style module. */
  subQuestions?: MetricSubQuestion[];
  /** File Description bullets for QlM (e.g. Upload / Link for Additional information). */
  fileDescription?: string[];
  /** Data Template field list for QnM (e.g. Programme Code, Names of the Programme revised). */
  dataTemplateFields?: string[];
  /** Word limit for descriptive response (default 500). */
  wordLimit?: number;
  /** Option-based answer (A–E). Each metric owns its own options; rendered as radio select. */
  options?: string[];
  formula?: string;
  /** Documents belonging ONLY to this metric. */
  documentsRequired: MetricDoc[];
  /** Evidence checklist belonging ONLY to this metric. Empty = not specified. */
  supportingEvidence: string[];
  /** Tables/templates belonging ONLY to this metric. */
  tables: MetricTable[];
  linksRequired: string[];
  notes: string[];
  dataPeriod: string;
  optional: boolean;
  sourceManual: string;
  sourceSection: string;
  /** Exact page or NOT_SPECIFIED — never auto-generated/guessed. */
  sourcePage: string;
}

export interface KeyIndicator {
  id: string;
  code: string;
  title: string;
  weightage: number;
  description: string;
  metrics: Metric[];
}

export interface Criterion {
  id: number;
  numeral: string;
  code: string;
  title: string;
  description: string;
  weightage: number;
  focusAreas: string[];
  keyIndicators: KeyIndicator[];
}

export interface InstitutionData {
  id: InstitutionId;
  variant?: AffiliatedVariant;
  name: string;
  shortName: string;
  manualName: string;
  manualShort: string;
  totalCriteria: number;
  totalKIs: number;
  totalQlM: number;
  totalQnM: number;
  totalMetrics: number;
  totalScore: number;
  criteria: Criterion[];
  sourceNote: string;
}

export interface SectionItem {
  id: string;
  title: string;
  icon?: string;
  content: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][]; caption?: string };
  note?: string;
}

export interface ProfileField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'checkbox' | 'table';
  options?: string[];
  required?: boolean;
  help?: string;
  columns?: string[];
  /** Max words for textarea (manual word limits, e.g. 250 / 5000). */
  maxWords?: number;
  /** Preset row values for manual tables (e.g. Sanctioned/Recruited rows). */
  presetRows?: string[][];
  /** Lock first column cells as row labels (manual row headers). */
  lockFirstCol?: boolean;
}

export interface ProfileSection {
  id: string;
  title: string;
  description?: string;
  fields: ProfileField[];
}
