import type { SectionItem, ProfileSection } from './types';

// ─── Part A (1–3) + Part B (4–5) info ───────────────────────────────────────
export function getSectionBInfo(inst: string): SectionItem[] {
  const manual = inst === 'university' ? 'Manual for Universities' : inst === 'autonomous' ? 'Manual for Autonomous Colleges' : 'Manual for Affiliated / Constituent UG & PG Colleges';
  return [
    { id: 'b-exec', title: '1. Executive Summary', content: ['Every HEI applying for the A&A process shall prepare an Executive Summary highlighting the main features of the Institution, not more than 5000 words:', '• 1.1 Introductory Note: location, vision, mission, type of the institution etc.', '• 1.2 Criterion-wise Summary in not more than 250 words for each criterion.', '• 1.3 SWOC: Strengths, Weaknesses, Opportunities and Challenges.', '• 1.4 Any additional information not already stated.', '• 1.5 Overall conclusive explication about the functioning.', 'Use the structured form — each criterion summary is capped at 250 words and the total at 5000 words with live counters.'], note: `Source: ${manual} · p. 38` },
    { id: 'b-profile', title: inst === 'university' ? '2. Profile of the University' : '2. Profile of the Institution', content: [inst === 'university' ? 'Basic Information (§2.1), Contacts (§2.2), Nature / Establishment (§2.3), Recognition (§2.4), UPE (§2.5), Campus (§2.6), Affiliated Institutions (§2.7), Colleges under University (§2.8), SRA (§2.9), Teaching / Non-Teaching / Technical Staff (§2.10–2.12), Qualification Details (§2.13), Distinguished Academicians (§2.14), Chairs (§2.15), Students Enrolled (§2.16), Integrated Programmes (§2.17), UGC-HRDC (§2.18) and Department uploads (§2.19) — pp. 39–44.' : inst === 'autonomous' ? 'Basic Information, Contacts, Affiliation, Nature / Establishment, Minority status (§2.1), Recognition (§2.2), New Programmes (§2.3), Professional Programmes (§2.4), Statutory approvals (§2.5), CPE (§2.6), Other recognition (§2.7), Campus (§2.8), Programmes Offered (§2.9), Teaching / Non-Teaching / Technical Staff (§2.10–2.12), Qualifications (§2.13), Visiting Faculty (§2.14), Students Enrolled (§2.15) and Admissions last four years (§2.16) — pp. 39–46.' : '22 items (pp. 39–44): Basic Information, Communication (Principal / Vice-Principal / IQAC), Status, Type, Minority, Funding, Establishment & Recognition (2f / 12B, statutory bodies), Autonomy, CPE / Other recognition, Location & Area, Programmes Offered, Programme Details, Departments, Staff positions, Qualifications, Visiting Faculty, Admissions (4 years), Current Enrollment, Unit Cost, Accreditation history, IQAC and AQARs.'], note: `Source: ${manual}` },
    { id: 'b-extended', title: inst === 'university' ? '3. Extended Profile of the University' : '3. Extended Profile of the Institution', content: [inst === 'university' ? 'Year-wise Year / Number tables — Programme (1.1 programmes offered; 1.2 departments), Student (2.1 enrolled; 2.2 outgoing; 2.3 appeared; 2.4 revaluation), Academic (3.1 courses; 3.2 full-time teachers; 3.3 sanctioned posts), Institution (4.1 applications; 4.2 reserved seats; 4.3 classrooms + halls; 4.4 computers; 4.5 expenditure in INR Lakhs) — pp. 45–46. Denominators for metric formulas.' : inst === 'autonomous' ? 'Year-wise Year / Number tables — Programme (1.1 programmes offered), Student (2.1 enrolled; 2.2 outgoing; 2.3 appeared in institutional exams; 2.4 revaluation), Academic (3.1 courses; 3.2 full-time teachers; 3.3 sanctioned posts), Institution (4.1 applications; 4.2 reserved seats; 4.3 classrooms + halls; 4.4 computers; 4.5 expenditure in INR Lakhs) — pp. 47–48.' : 'Year / Number tables — Programme (1.1 courses across all programs), Student (2.1 enrolled; 2.2 reserved seats; 2.3 outgoing), Academic (3.2 full-time teachers; 3.3 sanctioned posts), Institution (4.1 classrooms + halls; 4.2 expenditure in INR lakhs; 4.3 computers).'], note: `Source: ${manual}` },
    { id: 'b-qif', title: '4. Quality Indicator Framework (QIF)', content: ['The QIF is the core of the SSR – Criteria → Key Indicators → Metrics with data required, formulas and data templates. Navigate criterion-wise in this workspace; each metric provides question, type, weightage, data requirements, tables, documents, evidence and links. Every question can be modified and extended with your own sub-questions.'] },
    { id: 'b-dept', title: '5. Evaluative Report of the Departments', content: ['15-item department report — identification (institution / department / district / state / total departments) plus: 1. Year of Establishment; 2. School / Faculty; 3. Programmes; 4. Teaching posts; 5. Research projects + grants; 6. Inter-institutional collaborations; 7. Funded projects (DST-FIST / UGC-SAP / CAS / DPE / DBT / ICSSR / AICTE); 8. Industry labs; 9. Publications (papers, books, citations, impact, h-index); 10. Patents + income; 11. Consultancy + income; 12. Awards; 13. Competitive-exam qualifiers; 14. Doctoral / post-doctoral / associates; 15. Scholars with financial assistance — compiled for the last five years.'], bullets: ['One report per department with HoD certification', 'Data must reconcile with Criteria II, III and IV responses'], note: `Source: ${manual}` },
  ];
}

// ─── 1. EXECUTIVE SUMMARY — p. 38 (all manuals) ─────────────────────────────
export function getExecutiveSummaryFields(_inst?: string): ProfileSection[] {
  void _inst;
  return [
    { id: 'es-intro', title: '1.1 Introductory Note on the Institution', description: 'Location, Vision, Mission, Type of Institution and other introductory information · p. 38', fields: [
      { id: 'es-location', label: 'Location', type: 'textarea', required: true },
      { id: 'es-vision', label: 'Vision', type: 'textarea', required: true },
      { id: 'es-mission', label: 'Mission', type: 'textarea', required: true },
      { id: 'es-type', label: 'Type of Institution', type: 'text', required: true },
      { id: 'es-intro-other', label: 'Other introductory information about the institution', type: 'textarea' },
    ]},
    { id: 'es-criteria', title: '1.2 Criterion-wise Summary (≤ 250 words each)', description: 'Summary of the institution’s functioning for each criterion — not more than 250 words per criterion.', fields: [
      { id: 'es-c1', label: 'Criterion I – Curricular Aspects (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c2', label: 'Criterion II – Teaching-Learning and Evaluation (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c3', label: 'Criterion III – Research, Innovations and Extension (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c4', label: 'Criterion IV – Infrastructure and Learning Resources (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c5', label: 'Criterion V – Student Support and Progression (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c6', label: 'Criterion VI – Governance, Leadership and Management (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
      { id: 'es-c7', label: 'Criterion VII – Institutional Values and Best Practices (≤ 250 words)', type: 'textarea', required: true, maxWords: 250 },
    ]},
    { id: 'es-swoc', title: '1.3 SWOC Analysis', description: 'Brief note on Strengths, Weaknesses, Opportunities and Challenges.', fields: [
      { id: 'es-swoc-s', label: 'Strengths', type: 'textarea', required: true },
      { id: 'es-swoc-w', label: 'Weaknesses', type: 'textarea', required: true },
      { id: 'es-swoc-o', label: 'Opportunities', type: 'textarea', required: true },
      { id: 'es-swoc-c', label: 'Challenges', type: 'textarea', required: true },
    ]},
    { id: 'es-close', title: '1.4 Additional Information & 1.5 Overall Conclusion', description: 'Maximum Executive Summary length: 5,000 words.', fields: [
      { id: 'es-additional', label: '1.4 Any additional information about the institution not already stated', type: 'textarea' },
      { id: 'es-conclusion', label: '1.5 Overall conclusive explanation of the institution’s functioning', type: 'textarea', required: true },
    ]},
  ];
}

// ─── Shared row presets ─────────────────────────────────────────────────────
const YEAR_ROWS = [['Year 1'], ['Year 2'], ['Year 3'], ['Year 4'], ['Year 5']];
const STAFF4 = [['Sanctioned'], ['Recruited'], ['Yet to Recruit'], ['On Contract']];
const QUAL4 = [['D.Sc / D.Litt'], ['Ph.D.'], ['M.Phil.'], ['PG']];

// ─── 2. PROFILE ─────────────────────────────────────────────────────────────
export function getProfileFields(inst: 'university' | 'autonomous' | 'affiliated', variant?: 'ug' | 'pg'): ProfileSection[] {
  if (inst === 'autonomous') return getAutonomousProfile();
  if (inst === 'affiliated') return getAffiliatedProfile(variant);
  return getUniversityProfile();
}

function getUniversityProfile(): ProfileSection[] {
  return [
    { id: 'p-21', title: '2.1 Basic Information — Name and Address of the University', description: 'p. 39', fields: [
      { id: 'p-name', label: 'Name', type: 'text', required: true },
      { id: 'p-address', label: 'Address', type: 'textarea', required: true },
      { id: 'p-city', label: 'City', type: 'text', required: true },
      { id: 'p-pin', label: 'Pin', type: 'text', required: true },
      { id: 'p-state', label: 'State', type: 'text', required: true },
      { id: 'p-website', label: 'Website', type: 'text', required: true },
    ]},
    { id: 'p-22', title: '2.2 Contacts for Communication', description: 'Add one row per contact person.', fields: [
      { id: 'p-contacts-table', label: 'Designation | Name | Telephone with STD Code | Mobile | Fax | Email', type: 'table', columns: ['Designation', 'Name', 'Telephone with STD Code', 'Mobile', 'Fax', 'Email'] },
    ]},
    { id: 'p-23', title: '2.3 Nature of University / Institution Status / Establishment Details', description: 'pp. 39–40', fields: [
      { id: 'p-type-univ', label: 'Type of University', type: 'select', options: ['Central University', 'State Public University', 'State Private University', 'Deemed to be University', 'Institution of National Importance'], required: true },
      { id: 'p-estd-date', label: 'Establishment Date of the University', type: 'date', required: true },
      { id: 'p-prior-status', label: 'Status Prior to Establishment, if applicable', type: 'select', options: ['Not Applicable', 'Autonomous', 'Constituent', 'PG Centre', 'Any other'] },
      { id: 'p-prior-date', label: 'Establishment date (prior status)', type: 'date', help: 'Date of the prior establishment, if applicable.' },
    ]},
    { id: 'p-24', title: '2.4 Recognition Details', description: 'Date of Recognition as a University by UGC or Any Other National Agency · p. 40', fields: [
      { id: 'p-recog-ugc-date', label: 'Date of recognition by UGC', type: 'date' },
      { id: 'p-recog-other-agency', label: 'Any Other National Agency (name)', type: 'text' },
      { id: 'p-recog-other-date', label: 'Date of recognition by other agency', type: 'date' },
      { id: 'p-recog-table', label: 'Section | Date', type: 'table', columns: ['Section', 'Date'], presetRows: [['Section 2(f) of UGC'], ['Section 12B of UGC']], lockFirstCol: true },
    ]},
    { id: 'p-25', title: '2.5 University with Potential for Excellence', description: 'p. 40', fields: [
      { id: 'p-upe-yn', label: 'Is the University Recognised as a ‘University with Potential for Excellence (UPE)’ by the UGC?', type: 'select', options: ['Yes', 'No'], required: true },
    ]},
    { id: 'p-26', title: '2.6 Location, Area and Activity of Campus', description: 'Location options: Urban, Semi Urban, Rural, Tribal, Hill · p. 40', fields: [
      { id: 'p-campus-table', label: 'Campus Type | Address | Location | Campus Area (Acres) | Built-up Area (sq. mts.) | Programmes Offered | Date of Establishment | Date of Recognition by UGC/MHRD', type: 'table',
        columns: ['Campus Type', 'Address', 'Location', 'Campus Area in Acres', 'Built-up Area in sq. mts.', 'Programmes Offered', 'Date of Establishment', 'Date of Recognition by UGC/MHRD'],
        presetRows: [['Urban'], ['Semi Urban'], ['Rural'], ['Tribal'], ['Hill']], lockFirstCol: true },
    ]},
    { id: 'p-27', title: '2.7 Academic Information — Affiliated Institutions', description: 'Not applicable for private and deemed-to-be Universities · p. 41', fields: [
      { id: 'p-affil-table', label: 'College Type | Permanent | Temporary', type: 'table',
        columns: ['College Type', 'Number with Permanent Affiliation', 'Number with Temporary Affiliation'],
        presetRows: [['Education / Teachers Training'], ['Business Administration / Commerce / Management / Finance'], ['Universal / Common to all Disciplines']], lockFirstCol: true },
    ]},
    { id: 'p-28', title: '2.8 Details of Colleges Under the University', description: 'Counts as on date · p. 41', fields: [
      { id: 'p-c-constituent', label: 'Constituent Colleges', type: 'number' },
      { id: 'p-c-affiliated', label: 'Affiliated Colleges', type: 'number' },
      { id: 'p-c-2f', label: 'Colleges Under 2(f)', type: 'number' },
      { id: 'p-c-2f12b', label: 'Colleges Under 2(f) and 12B', type: 'number' },
      { id: 'p-c-naac', label: 'NAAC Accredited Colleges', type: 'number' },
      { id: 'p-c-cpe', label: 'Colleges with Potential for Excellence (UGC)', type: 'number' },
      { id: 'p-c-auto', label: 'Autonomous Colleges', type: 'number' },
      { id: 'p-c-pg', label: 'Colleges with Postgraduate Departments', type: 'number' },
      { id: 'p-c-res', label: 'Colleges with Research Departments', type: 'number' },
      { id: 'p-c-inst', label: 'University Recognized Research Institutes / Centers', type: 'number' },
    ]},
    { id: 'p-29', title: '2.9 Statutory Regulatory Authority', description: 'p. 41', fields: [
      { id: 'p-sra-yn', label: 'Is the University Offering any Programmes Recognized by any Statutory Regulatory Authority (SRA)?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-sra-details', label: 'If Yes, details of SRA-recognized programmes', type: 'textarea' },
    ]},
    { id: 'p-210', title: '2.10 Teaching Faculty (Professor / Associate / Assistant × M/F/O/Total)', description: 'Rows: Sanctioned, Recruited, Yet to Recruit, On Contract · p. 41', fields: [
      { id: 'p-staff-teach-table', label: 'Teaching Faculty', type: 'table',
        columns: ['Status', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Professor – Total', 'Associate Professor – Male', 'Associate Professor – Female', 'Associate Professor – Others', 'Associate Professor – Total', 'Assistant Professor – Male', 'Assistant Professor – Female', 'Assistant Professor – Others', 'Assistant Professor – Total'],
        presetRows: STAFF4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-211', title: '2.11 Non-Teaching Staff (M/F/O/Total)', description: 'p. 41', fields: [
      { id: 'p-staff-nonteach-table', label: 'Non-Teaching Staff', type: 'table',
        columns: ['Status', 'Male', 'Female', 'Others', 'Total'], presetRows: STAFF4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-212', title: '2.12 Technical Staff (M/F/O/Total)', description: 'p. 41', fields: [
      { id: 'p-staff-tech-table', label: 'Technical Staff', type: 'table',
        columns: ['Status', 'Male', 'Female', 'Others', 'Total'], presetRows: STAFF4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-213a', title: '2.13 Qualification Details — Permanent Teachers', description: 'D.Sc/D.Litt, Ph.D., M.Phil., PG × Professor / Associate / Assistant × M/F/O · p. 42', fields: [
      { id: 'p-qual-perm-table', label: 'Permanent Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others'],
        presetRows: QUAL4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-213b', title: '2.13 Qualification Details — Temporary Teachers', description: 'p. 42', fields: [
      { id: 'p-qual-temp-table', label: 'Temporary Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others'],
        presetRows: QUAL4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-213c', title: '2.13 Qualification Details — Part-Time Teachers', description: 'p. 42', fields: [
      { id: 'p-qual-part-table', label: 'Part-Time Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others'],
        presetRows: QUAL4.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-214', title: '2.14 Distinguished Academicians Appointed', description: 'p. 42', fields: [
      { id: 'p-distinguished-table', label: 'Position | Male | Female | Others | Total', type: 'table',
        columns: ['Position', 'Male', 'Female', 'Others', 'Total'],
        presetRows: [['Emeritus Professor'], ['Adjunct Professor'], ['Visiting Professor']], lockFirstCol: true },
    ]},
    { id: 'p-215', title: '2.15 Chairs Instituted by the University', description: 'p. 43 — add one row per Chair.', fields: [
      { id: 'p-chairs-table', label: 'Sl.No | Department | Chair | Sponsor Organisation / Agency', type: 'table',
        columns: ['Sl.No', 'Name of the Department', 'Name of the Chair', 'Name of the Sponsor Organisation / Agency'] },
    ]},
    { id: 'p-216', title: '2.16 Students Enrolled (Current Academic Year)', description: 'PG / UG / PG Diploma × Male / Female / Others · p. 43', fields: [
      { id: 'p-students-table', label: 'Category | From State | From Other States | NRI | Foreign | Total', type: 'table',
        columns: ['Category', 'From the State Where University is Located', 'From Other States of India', 'NRI Students', 'Foreign Students', 'Total'],
        presetRows: [['PG – Male'], ['PG – Female'], ['PG – Others'], ['UG – Male'], ['UG – Female'], ['UG – Others'], ['PG Diploma (statutory incl. university) – Male'], ['PG Diploma (statutory incl. university) – Female'], ['PG Diploma (statutory incl. university) – Others']], lockFirstCol: true },
    ]},
    { id: 'p-217', title: '2.17 Integrated Programmes', description: 'p. 43', fields: [
      { id: 'p-integ-yn', label: 'Does the university offer any integrated programmes?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-integ-total', label: 'Total Number of Integrated Programmes', type: 'number' },
      { id: 'p-integ-table', label: 'Category | From State | From Other States | NRI | Foreign | Total', type: 'table',
        columns: ['Category', 'From the State Where University is Located', 'From Other States of India', 'NRI Students', 'Foreign Students', 'Total'],
        presetRows: [['Male'], ['Female'], ['Others']], lockFirstCol: true },
    ]},
    { id: 'p-218', title: '2.18 UGC Human Resource Development Centre (if applicable)', description: 'Last five years · p. 44', fields: [
      { id: 'p-hrdc-year', label: 'Year of Establishment', type: 'text' },
      { id: 'p-hrdc-orient', label: 'Number of UGC Orientation Programmes', type: 'number' },
      { id: 'p-hrdc-refresh', label: 'Number of UGC Refresher Courses', type: 'number' },
      { id: 'p-hrdc-own', label: 'Number of University’s own Programmes', type: 'number' },
      { id: 'p-hrdc-total', label: 'Total Number of Programmes Conducted (last five years)', type: 'number' },
    ]},
    { id: 'p-219', title: '2.19 Evaluative Report of Departments — Profile Entry', description: 'Department Name + Upload Report · p. 44. Detailed 15-item reports are compiled under item 5.', fields: [
      { id: 'p-dept-upload-table', label: 'Department Name | Upload Report (file name / link)', type: 'table', columns: ['Department Name', 'Upload Report'] },
    ]},
  ];
}

function getAutonomousProfile(): ProfileSection[] {
  const mgmtRows = [['Sanctioned by UGC / Institution / State Government'], ['Recruited'], ['Yet to Recruit'], ['On Contract'], ['Sanctioned by Management / Society / Other Authorised Body'], ['Recruited (Management)'], ['Yet to Recruit (Management)']];
  return [
    { id: 'p-basic', title: 'A. Basic Information — Name and Address of the College', description: 'p. 39', fields: [
      { id: 'p-name', label: 'Name', type: 'text', required: true },
      { id: 'p-address', label: 'Address', type: 'textarea', required: true },
      { id: 'p-city', label: 'City', type: 'text', required: true },
      { id: 'p-pin', label: 'Pin', type: 'text', required: true },
      { id: 'p-state', label: 'State', type: 'text', required: true },
      { id: 'p-website', label: 'Website', type: 'text', required: true },
    ]},
    { id: 'p-contacts', title: 'Contacts for Communication', description: 'One row per contact person.', fields: [
      { id: 'p-contacts-table', label: 'Designation | Name | Telephone with STD Code | Mobile | Fax | E-mail', type: 'table', columns: ['Designation', 'Name', 'Telephone with STD Code', 'Mobile', 'Fax', 'E-mail'] },
    ]},
    { id: 'p-affil', title: 'Institution to which the College is Affiliated', description: 'p. 39', fields: [
      { id: 'p-affil-state', label: 'State', type: 'text', required: true },
      { id: 'p-affil-name', label: 'Institution Name', type: 'text', required: true },
      { id: 'p-affil-doc', label: 'View Document (file name / link)', type: 'text' },
    ]},
    { id: 'p-nature', title: 'Nature of Institution / Establishment Details', description: 'p. 39', fields: [
      { id: 'p-nature-rel', label: 'Nature of Institution (Religious)', type: 'text' },
      { id: 'p-nature-inst', label: 'Nature of Institution', type: 'text' },
      { id: 'p-inst-status', label: 'Institution Status', type: 'text' },
      { id: 'p-type-gender', label: 'Type of Institution — By Gender', type: 'select', options: ['Co-education', 'For Men', 'For Women'] },
      { id: 'p-type-shift', label: 'Type of Institution — By Shift', type: 'select', options: ['Regular', 'Day', 'Evening'] },
      { id: 'p-estd-prior', label: 'Date of establishment, prior to grant of Autonomy', type: 'date' },
      { id: 'p-autonomy-date', label: 'Date of grant of Autonomy to the College by UGC', type: 'date' },
      { id: 'p-estd-date', label: 'Establishment date', type: 'date' },
      { id: 'p-inst-type-status', label: 'Institution type / status', type: 'select', options: ['Autonomous', 'Constituent', 'PG Centre', 'Any other'] },
    ]},
    { id: 'p-21', title: '2.1 Recognized Minority Institution', description: 'p. 39', fields: [
      { id: 'p-minority-yn', label: 'Is it a recognized minority institution?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-minority-status', label: 'If Yes, minority status', type: 'select', options: ['Religious', 'Linguistic', 'Any Other'] },
    ]},
    { id: 'p-22', title: '2.2 Recognition Details', description: 'Date of Recognition by UGC or any Other National Agency · p. 40', fields: [
      { id: 'p-recog-table', label: 'Section | Date', type: 'table', columns: ['Under Section', 'Date'], presetRows: [['Section 2(f) of UGC'], ['Section 12B of UGC']], lockFirstCol: true },
    ]},
    { id: 'p-23', title: '2.3 New Programmes Introduced During the Last Five Years', description: 'p. 40', fields: [
      { id: 'p-newprog-table', label: 'No. | Name | UG | PG', type: 'table', columns: ['No.', 'Name', 'UG', 'PG'],
        presetRows: [['1'], ['2'], ['3'], ['4'], ['5']], lockFirstCol: true },
      { id: 'p-newprog-nonaut', label: 'Programmes not covered under the Autonomous status of UGC', type: 'textarea' },
      { id: 'p-newprog-aided', label: 'Programmes offered as Aided', type: 'textarea' },
      { id: 'p-newprog-self', label: 'Programmes offered as Self-financed', type: 'textarea' },
    ]},
    { id: 'p-24', title: '2.4 Professional Programmes Offered', description: 'p. 40', fields: [
      { id: 'p-prof-table', label: 'Professional Programmes offered', type: 'table', columns: ['Programme', 'Duration', 'Sanctioned Strength', 'Admitted'] },
    ]},
    { id: 'p-25', title: '2.5 Recognition / Approval by Statutory or Regulatory Bodies', description: 'NCTE, AICTE, DCI, PCI, ICAR, INC, BCI, CCIM, MCI, CCH, VCI, COA, RCI · p. 41', fields: [
      { id: 'p-sra-table', label: 'Statutory Authority | Recognition / Approval | Institution / Department | Programme | Day, Month, Year | Validity (months) | Remarks', type: 'table',
        columns: ['Statutory Authority / Regulatory body', 'Recognition / Approval details', 'Institution / Department', 'Programme', 'Day, Month, Year', 'Validity in months', 'Remarks'] },
    ]},
    { id: 'p-26', title: '2.6 Institution with Potential for Excellence', description: 'p. 41', fields: [
      { id: 'p-cpe-yn', label: 'Is the college recognized by UGC as a College with Potential for Excellence (CPE)?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-cpe-date', label: 'If Yes, date of recognition', type: 'date' },
    ]},
    { id: 'p-27', title: '2.7 Recognition by Other Government Agency', description: 'p. 41', fields: [
      { id: 'p-otherrec-yn', label: 'Is the college recognized for its performance by any other government agency?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-otherrec-agency', label: 'If Yes, name of the agency', type: 'text' },
      { id: 'p-otherrec-date', label: 'Date of recognition', type: 'date' },
    ]},
    { id: 'p-28', title: '2.8 Location, Area and Activity of Campus', description: 'p. 42', fields: [
      { id: 'p-campus-table', label: 'Campus Type | Address | Location | Area (Acres) | Built-up (sq. mts.)', type: 'table',
        columns: ['Campus Type', 'Address', 'Location', 'Campus Area in Acres', 'Built-up Area in sq. mts.'],
        presetRows: [['Urban'], ['Semi Urban'], ['Rural'], ['Tribal'], ['Hill']], lockFirstCol: true },
    ]},
    { id: 'p-29', title: '2.9 Academic Information — Programmes Offered (Current Academic Year)', description: 'p. 42', fields: [
      { id: 'p-prog-table', label: 'Level | Name | Duration | Entry Qualification | Medium | Sanctioned | Admitted', type: 'table',
        columns: ['Level of Programme', 'Name of Programme / Course', 'Duration in Months', 'Entry Qualification', 'Medium of Instruction', 'Sanctioned Strength', 'Number of Students Admitted'] },
    ]},
    { id: 'p-210', title: '2.10 Teaching Faculty', description: 'Professor / Associate / Assistant × M/F/O/Total · pp. 43–44', fields: [
      { id: 'p-staff-teach-table', label: 'Teaching Faculty', type: 'table',
        columns: ['Category', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Professor – Total', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Associate – Total', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others', 'Assistant – Total'],
        presetRows: mgmtRows.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-211', title: '2.11 Non-Teaching Staff', description: 'pp. 43–44', fields: [
      { id: 'p-staff-nonteach-table', label: 'Non-Teaching Staff', type: 'table',
        columns: ['Category', 'Male', 'Female', 'Others', 'Total'],
        presetRows: [['Sanctioned'], ['Recruited'], ['Yet to Recruit'], ['Sanctioned by Management / Society / Other Authorised Body'], ['Recruited (Management)'], ['Yet to Recruit (Management)']], lockFirstCol: true },
    ]},
    { id: 'p-212', title: '2.12 Technical Staff', description: 'pp. 43–44', fields: [
      { id: 'p-staff-tech-table', label: 'Technical Staff', type: 'table',
        columns: ['Category', 'Male', 'Female', 'Others', 'Total'], presetRows: mgmtRows.map((r) => [...r]), lockFirstCol: true },
    ]},
    { id: 'p-213a', title: '2.13 Qualification — Permanent Teachers', description: 'p. 44', fields: [
      { id: 'p-qual-perm-table', label: 'Permanent Teachers', type: 'table',
        columns: ['Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others', 'Total'],
        presetRows: [['D.Sc./D.Litt'], ['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
    ]},
    { id: 'p-213b', title: '2.13 Qualification — Temporary Teachers', description: 'p. 44', fields: [
      { id: 'p-qual-temp-table', label: 'Temporary Teachers', type: 'table',
        columns: ['Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others', 'Total'],
        presetRows: [['D.Sc./D.Litt'], ['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
    ]},
    { id: 'p-213c', title: '2.13 Qualification — Part-Time Teachers', description: 'p. 44', fields: [
      { id: 'p-qual-part-table', label: 'Part-Time Teachers', type: 'table',
        columns: ['Qualification', 'Professor – Male', 'Professor – Female', 'Professor – Others', 'Associate – Male', 'Associate – Female', 'Associate – Others', 'Assistant – Male', 'Assistant – Female', 'Assistant – Others', 'Total'],
        presetRows: [['D.Sc./D.Litt'], ['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
    ]},
    { id: 'p-214', title: '2.14 Visiting / Guest Faculty', description: 'Number engaged with the college · p. 44', fields: [
      { id: 'p-visit-m', label: 'Male', type: 'number' },
      { id: 'p-visit-f', label: 'Female', type: 'number' },
      { id: 'p-visit-o', label: 'Others', type: 'number' },
      { id: 'p-visit-t', label: 'Total', type: 'number' },
    ]},
    { id: 'p-215', title: '2.15 Students Enrolled During Current Academic Year', description: 'pp. 45–46', fields: [
      { id: 'p-students-table', label: 'Category | From State | From Other States | NRI | Foreign | Total', type: 'table',
        columns: ['Category', 'From the State Where College is Located', 'From Other States of India', 'NRI Students', 'Foreign Students', 'Total'],
        presetRows: [['PG – Male'], ['PG – Female'], ['PG – Others'], ['UG – Male'], ['UG – Female'], ['UG – Others']], lockFirstCol: true },
    ]},
    { id: 'p-216', title: '2.16 Students Admitted During Last Four Academic Years', description: 'Year 1–4 × SC/ST/OBC/General/Others × M/F · pp. 45–46', fields: [
      { id: 'p-adm-table', label: 'Category | Y1 M/F | Y2 M/F | Y3 M/F | Y4 M/F', type: 'table',
        columns: ['Category', 'Y1 Male', 'Y1 Female', 'Y2 Male', 'Y2 Female', 'Y3 Male', 'Y3 Female', 'Y4 Male', 'Y4 Female'],
        presetRows: [['SC'], ['ST'], ['OBC'], ['General'], ['Others'], ['Total']], lockFirstCol: true },
    ]},
  ];
}

function getAffiliatedProfile(variant?: 'ug' | 'pg'): ProfileSection[] {
  const vLabel = variant ? ` (${variant.toUpperCase()})` : '';
  return [
    { id: 'p-01', title: `1. Basic Information${vLabel}`, description: 'p. 39', fields: [
      { id: 'p-name', label: 'Name of the College', type: 'text', required: true },
      { id: 'p-address', label: 'Address', type: 'textarea', required: true },
      { id: 'p-city', label: 'City', type: 'text', required: true },
      { id: 'p-pin', label: 'PIN', type: 'text', required: true },
      { id: 'p-state', label: 'State', type: 'text', required: true },
      { id: 'p-website', label: 'Website', type: 'text', required: true },
    ]},
    { id: 'p-02', title: '2. For Communication — Principal / Vice Principal / IQAC Coordinator', description: 'p. 39', fields: [
      { id: 'p-comm-table', label: 'Designation | Name | Tel Office (STD) | Tel Residence | Mobile | Fax | Email', type: 'table',
        columns: ['Designation', 'Name', 'Telephone with STD Code — Office', 'Telephone — Residence', 'Mobile', 'Fax', 'Email'],
        presetRows: [['Principal'], ['Vice Principal'], ['IQAC Coordinator']], lockFirstCol: true },
    ]},
    { id: 'p-03', title: '3. Status of the Institution', description: 'p. 39', fields: [
      { id: 'p-status', label: 'Status', type: 'select', options: ['Affiliated College', 'Constituent College', 'Any other — specify'], required: true },
      { id: 'p-status-other', label: 'If Any other, specify', type: 'text' },
    ]},
    { id: 'p-04', title: '4. Type of Institution', description: 'p. 39', fields: [
      { id: 'p-gender', label: 'By Gender', type: 'select', options: ['For Men', 'For Women', 'Co-education'], required: true },
      { id: 'p-shift', label: 'By Shift', type: 'select', options: ['Regular', 'Day', 'Evening'], required: true },
    ]},
    { id: 'p-05', title: '5. Recognized Minority Institution?', description: 'pp. 39–40', fields: [
      { id: 'p-minority-yn', label: 'Recognized Minority Institution?', type: 'select', options: ['Yes', 'No'], required: true },
    ]},
    { id: 'p-06', title: '6. Sources of Funding', description: 'p. 40', fields: [
      { id: 'p-fund-govt', label: 'Government Grant-in-aid', type: 'select', options: ['Yes', 'No'] },
      { id: 'p-fund-self', label: 'Self-financing', type: 'select', options: ['Yes', 'No'] },
      { id: 'p-fund-other', label: 'Any other (specify)', type: 'text' },
    ]},
    { id: 'p-07', title: '7. Establishment and Recognition', description: 'p. 40. Enclose 2(f) and 12(B) certificates and recognition/approval letters.', fields: [
      { id: 'p-estd', label: '7(a). Date of establishment of the college', type: 'date', required: true },
      { id: 'p-univ', label: '7(b). University to which affiliated / which governs (constituent)', type: 'text', required: true },
      { id: 'p-ugc-table', label: '7(c). UGC Recognition — Section | Date, Month & Year | Remarks', type: 'table',
        columns: ['Section', 'Date, Month & Year', 'Remarks'], presetRows: [['2(f)'], ['12(B)']], lockFirstCol: true },
      { id: 'p-sra-table', label: '7(d). Recognition/approval by statutory/regulatory bodies (AICTE, NCTE, MCI, DCI, PCI, RCI, others)', type: 'table',
        columns: ['Statutory / Regulatory Authority', 'Institution / Department', 'Programme', 'Day, Month and Year', 'Validity', 'Remarks'] },
    ]},
    { id: 'p-08', title: '8. Autonomy', description: 'p. 40', fields: [
      { id: 'p-auto-act', label: 'Does the affiliating university Act provide for conferment of autonomy?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-auto-applied', label: 'If Yes, has the College applied for autonomous status?', type: 'select', options: ['Yes', 'No', 'Not Applicable'] },
    ]},
    { id: 'p-09', title: '9. Recognition', description: 'p. 40', fields: [
      { id: 'p-cpe-yn', label: '9(a). UGC recognition as College with Potential for Excellence (CPE)?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-cpe-date', label: 'If Yes, date of recognition', type: 'date' },
      { id: 'p-oth-yn', label: '9(b). Recognition by any other governmental agency?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'p-oth-agency', label: 'If Yes, name of agency', type: 'text' },
      { id: 'p-oth-date', label: 'Date of recognition', type: 'date' },
    ]},
    { id: 'p-10', title: '10. Location and Area', description: 'p. 41', fields: [
      { id: 'p-location', label: 'Location', type: 'select', options: ['Urban', 'Semi-urban', 'Rural', 'Tribal', 'Hilly Area', 'Any other — specify'] },
      { id: 'p-location-other', label: 'If Any other, specify', type: 'text' },
      { id: 'p-campus-area', label: 'Campus area in sq. mts.', type: 'number' },
      { id: 'p-builtup-area', label: 'Built-up area in sq. mts.', type: 'number' },
    ]},
    { id: 'p-11', title: '11. Details of Programmes Offered (Current Academic Year)', description: 'Complete programme table · p. 41', fields: [
      { id: 'p-prog-table', label: 'Level | Programme/Course | Duration | Entry Qualification | Medium | Sanctioned Strength | Admitted', type: 'table',
        columns: ['Programme Level', 'Programme / Course', 'Duration', 'Entry Qualification', 'Medium of Instruction', 'Sanctioned / Approved Student Strength', 'No. of Students Admitted'],
        presetRows: [['Under-Graduate'], ['Post-Graduate'], ['Integrated Programmes'], ['Ph.D.'], ['M.Phil.'], ['Certificate Courses'], ['UG Diploma'], ['PG Diploma'], ['Any Other']], lockFirstCol: true },
    ]},
    { id: 'p-12', title: '12. Programme Details', description: 'p. 41', fields: [
      { id: 'p-selfin-count', label: 'Number of self-financed programmes offered', type: 'number' },
      { id: 'p-newprog-count', label: 'Number of new programmes introduced during the last five years', type: 'number' },
      { id: 'p-newprog-names', label: 'Names of new programmes introduced', type: 'textarea' },
    ]},
    { id: 'p-13', title: '13. List of Departments', description: 'List academic departments only — not Library / Physical Education unless degree-awarding; not common compulsory subjects. Examples: Physics, Botany, History · p. 42', fields: [
      { id: 'p-dept-table', label: 'Faculty | Departments | UG | PG | Research', type: 'table',
        columns: ['Faculty', 'Departments', 'UG', 'PG', 'Research'],
        presetRows: [['Science'], ['Arts'], ['Commerce'], ['Any Other — Specify']], lockFirstCol: true },
    ]},
    { id: 'p-14', title: '14. Teaching and Non-Teaching Positions (M/F)', description: 'M = Male, F = Female · p. 42', fields: [
      { id: 'p-teach-table', label: 'Teaching Faculty — Professor / Associate / Assistant × M/F', type: 'table',
        columns: ['Category', 'Professor – Male', 'Professor – Female', 'Associate Professor – Male', 'Associate Professor – Female', 'Assistant Professor – Male', 'Assistant Professor – Female'],
        presetRows: [['Sanctioned by UGC / University / State Government'], ['Recruited'], ['Yet to recruit'], ['Sanctioned by Management / Society / Other authorized bodies'], ['Recruited (Management)'], ['Yet to recruit (Management)']], lockFirstCol: true },
      { id: 'p-nonteach-table', label: 'Non-teaching staff × M/F', type: 'table',
        columns: ['Category', 'Male', 'Female'],
        presetRows: [['Sanctioned by UGC / University / State Government'], ['Recruited'], ['Yet to recruit'], ['Sanctioned by Management / Society / Other authorized bodies'], ['Recruited (Management)'], ['Yet to recruit (Management)']], lockFirstCol: true },
      { id: 'p-tech-table', label: 'Technical staff × M/F', type: 'table',
        columns: ['Category', 'Male', 'Female'],
        presetRows: [['Sanctioned by UGC / University / State Government'], ['Recruited'], ['Yet to recruit'], ['Sanctioned by Management / Society / Other authorized bodies'], ['Recruited (Management)'], ['Yet to recruit (Management)']], lockFirstCol: true },
    ]},
    { id: 'p-15', title: '15. Qualifications of Teaching Staff', description: 'p. 43', fields: [
      { id: 'p-qual-perm-table', label: 'Permanent Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor Male', 'Professor Female', 'Associate Professor Male', 'Associate Professor Female', 'Assistant Professor Male', 'Assistant Professor Female'],
        presetRows: [['D.Sc./D.Litt.'], ['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
      { id: 'p-qual-temp-table', label: 'Temporary Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor Male', 'Professor Female', 'Associate Professor Male', 'Associate Professor Female', 'Assistant Professor Male', 'Assistant Professor Female'],
        presetRows: [['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
      { id: 'p-qual-part-table', label: 'Part-time Teachers', type: 'table',
        columns: ['Highest Qualification', 'Professor Male', 'Professor Female', 'Associate Professor Male', 'Associate Professor Female', 'Assistant Professor Male', 'Assistant Professor Female'],
        presetRows: [['Ph.D.'], ['M.Phil.'], ['PG']], lockFirstCol: true },
    ]},
    { id: 'p-16', title: '16. Visiting / Guest Faculty', description: 'Number engaged with the College · p. 43', fields: [
      { id: 'p-visit-total', label: 'Number of Visiting Faculty / Guest Faculty engaged', type: 'number' },
    ]},
    { id: 'p-17', title: '17. Student Admission — Last Four Academic Years', description: 'Year 1–4 × SC/ST/OBC/General/Others × M/F · p. 44', fields: [
      { id: 'p-adm-table', label: 'Category | Y1–Y4 Male / Female', type: 'table',
        columns: ['Category', 'Y1 Male', 'Y1 Female', 'Y2 Male', 'Y2 Female', 'Y3 Male', 'Y3 Female', 'Y4 Male', 'Y4 Female'],
        presetRows: [['SC'], ['ST'], ['OBC'], ['General'], ['Others']], lockFirstCol: true },
    ]},
    { id: 'p-18', title: '18. Current Student Enrollment', description: 'p. 44', fields: [
      { id: 'p-enroll-table', label: 'Type of Students | UG | PG | M.Phil. | Ph.D. | Total', type: 'table',
        columns: ['Type of Students', 'UG', 'PG', 'M.Phil.', 'Ph.D.', 'Total'],
        presetRows: [['Students from same state where college is located'], ['Students from other states of India'], ['NRI students'], ['Foreign students'], ['Total']], lockFirstCol: true },
    ]},
    { id: 'p-19', title: '19. Unit Cost of Education', description: 'Unit Cost = Total annual recurring expenditure (actual) ÷ Total students enrolled · p. 44', fields: [
      { id: 'p-unit-incl', label: 'Unit Cost including Salary Component', type: 'number' },
      { id: 'p-unit-excl', label: 'Unit Cost excluding Salary Component', type: 'number' },
    ]},
    { id: 'p-20', title: '20. Accreditation Details (Cycle 2/3/4, Re-assessment)', description: 'p. 44', fields: [
      { id: 'p-accr-table', label: 'Cycle | Date | Accreditation Outcome / Result', type: 'table',
        columns: ['Cycle', 'Date', 'Accreditation Outcome / Result'],
        presetRows: [['Cycle 1'], ['Cycle 2'], ['Cycle 3'], ['Cycle 4']], lockFirstCol: true },
    ]},
    { id: 'p-21', title: '21. IQAC', description: 'p. 44', fields: [
      { id: 'p-iqac-date', label: 'Date of establishment of Internal Quality Assurance Cell (IQAC)', type: 'date' },
    ]},
    { id: 'p-22', title: '22. AQAR Submission', description: 'Dates of AQAR submission to NAAC · p. 44', fields: [
      { id: 'p-aqar-1', label: 'AQAR (i) — date', type: 'date' },
      { id: 'p-aqar-2', label: 'AQAR (ii) — date', type: 'date' },
      { id: 'p-aqar-3', label: 'AQAR (iii) — date', type: 'date' },
      { id: 'p-aqar-4', label: 'AQAR (iv) — date', type: 'date' },
    ]},
  ];
}

// ─── 3. EXTENDED PROFILE ────────────────────────────────────────────────────
function ynTable(id: string, label: string, secondCol = 'Number'): { id: string; label: string; type: 'table'; columns: string[]; presetRows: string[][]; lockFirstCol: boolean } {
  return { id, label, type: 'table', columns: ['Year', secondCol], presetRows: YEAR_ROWS.map((r) => [...r]), lockFirstCol: true };
}

export function getExtendedProfileFields(inst?: string): ProfileSection[] {
  if (inst === 'autonomous') {
    return [
      { id: 'ep-prog', title: '3.1 Programme', description: 'NAAC Manual · pp. 47–48. Year-wise figures for last five years.', fields: [
        ynTable('ep-1-1', '1.1 Number of programs offered year wise for last five years'),
      ]},
      { id: 'ep-student', title: '3.2 Student', description: 'p. 47', fields: [
        ynTable('ep-2-1', '2.1 Number of students year wise during last five years'),
        ynTable('ep-2-2', '2.2 Number of outgoing / final year students year wise during last five years'),
        ynTable('ep-2-3', '2.3 Number of students appeared in the examination conducted by the Institution, year wise during the last five years'),
        ynTable('ep-2-4', '2.4 Number of revaluation applications year wise during last five years'),
      ]},
      { id: 'ep-academic', title: '3.3 Academic', description: 'p. 47', fields: [
        ynTable('ep-3-1', '3.1 Number of courses in all programs year wise during last five years'),
        ynTable('ep-3-2', '3.2 Number of full time teachers year wise during the last five years'),
        ynTable('ep-3-3', '3.3 Number of sanctioned posts year wise during the last five years'),
      ]},
      { id: 'ep-inst', title: '3.4 Institution', description: 'p. 48', fields: [
        ynTable('ep-4-1', '4.1 Number of eligible applications received for admissions to all the programs year wise during last five years'),
        ynTable('ep-4-2', '4.2 Number of seats earmarked for reserved category as per GOI/State Govt rule year wise during last five years'),
        { id: 'ep-4-3', label: '4.3 Total number of classrooms and seminar halls', type: 'number', required: true },
        { id: 'ep-4-4', label: '4.4 Total number of computers in the campus for academic purpose', type: 'number', required: true },
        ynTable('ep-4-5', '4.5 Total Expenditure excluding salary year wise during the last five years (INR in Lakhs)'),
      ]},
    ];
  }
  if (inst === 'affiliated') {
    return [
      { id: 'ep-prog', title: '1. Programme', description: 'Year-wise figures for last five years.', fields: [
        ynTable('ep-1-1', '1.1 Number of courses offered by the Institution across all programs during the last five years'),
      ]},
      { id: 'ep-student', title: '2. Student', description: 'Year-wise figures for last five years.', fields: [
        ynTable('ep-2-1', '2.1 Number of students year-wise during the last five years'),
        ynTable('ep-2-2', '2.2 Number of seats earmarked for reserved category as per GOI/State Government rule year-wise during the last five years'),
        ynTable('ep-2-3', '2.3 Number of outgoing / final-year students year-wise during the last five years'),
      ]},
      { id: 'ep-academic', title: '3. Academic', description: 'Year-wise figures for last five years.', fields: [
        ynTable('ep-3-2', '3.2 Number of full-time teachers year-wise during the last five years'),
        ynTable('ep-3-3', '3.3 Number of sanctioned posts year-wise during the last five years'),
      ]},
      { id: 'ep-inst', title: '4. Institution', description: 'Single values + year-wise expenditure.', fields: [
        { id: 'ep-4-1', label: '4.1 Total number of Classrooms and Seminar halls', type: 'number', required: true },
        ynTable('ep-4-2', '4.2 Total expenditure excluding salary year-wise during the last five years (INR in lakhs)'),
        { id: 'ep-4-3', label: '4.3 Number of Computers', type: 'number', required: true },
      ]},
    ];
  }
  return [
    { id: 'ep-prog', title: '3.1 Programme', description: 'NAAC Manual · p. 45. Year-wise figures for the last five years.', fields: [
      ynTable('ep-1-1', '1.1 Number of Programmes offered year wise for last five years'),
      { id: 'ep-1-2', label: '1.2 Number of departments offering academic programmes', type: 'number', help: 'Single figure (current).' },
    ]},
    { id: 'ep-student', title: '3.2 Student', description: 'p. 45', fields: [
      ynTable('ep-2-1', '2.1 Number of students year wise during the last five years'),
      ynTable('ep-2-2', '2.2 Number of outgoing / final year students year wise during the last five years'),
      ynTable('ep-2-3', '2.3 Number of students appeared in the University examination year wise during the last five years'),
      ynTable('ep-2-4', '2.4 Number of revaluation applications year wise during the last 5 years'),
    ]},
    { id: 'ep-academic', title: '3.3 Academic', description: 'p. 45', fields: [
      ynTable('ep-3-1', '3.1 Number of courses in all Programmes year wise during the last five years'),
      ynTable('ep-3-2', '3.2 Number of full time teachers year wise during the last five years'),
      ynTable('ep-3-3', '3.3 Number of sanctioned posts year wise during the last five years'),
    ]},
    { id: 'ep-inst', title: '3.4 Institution', description: 'p. 46', fields: [
      ynTable('ep-4-1', '4.1 Number of eligible applications received for admissions to all the Programmes year wise during the last five years'),
      ynTable('ep-4-2', '4.2 Number of seats earmarked for reserved category as per GOI / State Govt rule year wise during the last five years'),
      { id: 'ep-4-3', label: '4.3 Total number of classrooms and seminar halls', type: 'number', required: true },
      { id: 'ep-4-4', label: '4.4 Total number of computers in the campus for academic purpose', type: 'number', required: true },
      { id: 'ep-4-5', label: '4.5 Total Expenditure excluding salary year wise during the last five years (INR in Lakhs)', type: 'table', columns: ['Year', 'Expenditure'], presetRows: YEAR_ROWS.map((r) => [...r]), lockFirstCol: true },
    ]},
  ];
}

// ─── 5. EVALUATIVE REPORT OF THE DEPARTMENTS ─────────────────────────────────
function deptItems(host: string): string[][] {
  return [
    ['1', 'Year of Establishment'],
    ['2', `Is the Department part of a School / Faculty of the ${host}`],
    ['3', 'Names of programmes offered'],
    ['4', 'Number of teaching posts Sanctioned / Filled'],
    ['5', 'Number of Research Projects: Total grants received'],
    ['6', 'Inter-institutional collaborative projects and associated grants received — National collaboration'],
    ['6', 'Inter-institutional collaborative projects and associated grants received — International collaboration'],
    ['7', 'Departmental projects funded by DST-FIST, UGC-SAP / CAS, DPE, DBT, ICSSR, AICTE etc.: Total grants received'],
    ['8', 'Special research laboratories sponsored by / created by industry or corporate bodies'],
    ['9.1', 'Publications: Number of Papers published'],
    ['9.2', 'Publications: Number of Books with ISBN'],
    ['9.3', 'Publications: Number of Citation Index – range / average'],
    ['9.4', 'Publications: Number of Impact Factor – range / average'],
    ['9.5', 'Publications: Number of h-index'],
    ['10', 'Details of patents and income generated'],
    ['11', 'Areas of consultancy and income generated'],
    ['12', 'Awards / Recognitions at National and International level — Faculty'],
    ['12', 'Awards / Recognitions at National and International level — Doctoral / Post-doctoral fellows'],
    ['12', 'Awards / Recognitions at National and International level — Students'],
    ['13', 'Students clearing Civil Services, Defense Services, NET, SET (SLET), GATE and other competitive examinations'],
    ['14', 'Doctoral, post-doctoral students and research associates — From the host institution / university'],
    ['14', 'Doctoral, post-doctoral students and research associates — From other institutions / universities'],
    ['15', 'Research Scholars / PG students getting financial assistance from the University / State / Central'],
  ];
}

export function getDeptReportFields(inst?: string): ProfileSection[] {
  const host = inst === 'university' ? 'University' : inst === 'autonomous' ? 'Autonomous College' : 'institution / university';
  const instLabel = inst === 'university' ? 'Name of the University' : inst === 'autonomous' ? 'Name of the Autonomous College' : 'Name of the College';
  const page = inst === 'university' ? 'p. 99' : inst === 'autonomous' ? 'p. 109' : 'Evaluative Report';
  const items = deptItems(host);
  return [
    { id: 'd-header', title: 'Basic Department Information', description: `NAAC Manual · ${page}`, fields: [
      { id: 'd-univ', label: instLabel, type: 'text', required: true },
      { id: 'd-name', label: 'Name of the Department', type: 'text', required: true },
      { id: 'd-dist', label: 'District', type: 'text' },
      { id: 'd-state', label: 'State', type: 'text' },
      { id: 'd-total', label: 'Total Number of Departments in the Institution', type: 'number' },
    ]},
    ...items.map(([no, label], i) => ({
      id: `d-q${i}`,
      title: `${no}. ${label}`,
      description: i === 0 ? 'Answer each of the 15 department questions below. Compile data for the last five years.' : undefined,
      fields: [{ id: `d-a${i}`, label, type: 'textarea' as const }],
    })),
    { id: 'd-matrix', title: 'Department-wise Matrix (optional)', description: 'Departments in columns as in the manual (English / Zoology / Bio-Technology). Use if reporting multiple departments together.', fields: [
      { id: 'd-matrix-table', label: 'Sl.No | Particulars | Department columns', type: 'table',
        columns: ['Sl.No', 'Particulars', 'English (For Ex)', 'Zoology', 'Bio-Technology'],
        presetRows: items.map((r) => [...r]), lockFirstCol: false },
    ]},
  ];
}
