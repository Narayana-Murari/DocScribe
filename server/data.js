// Mock patient records — mirrors the MedicProApp mock data style.
export const patients = [
  {
    id: 'pat-001',
    patientUid: 'MP-2024-0117',
    name: 'Ramesh Kumar',
    age: 58,
    gender: 'male',
    bloodGroup: 'B+',
    village: 'Kothapalli',
    allergies: ['Penicillin'],
    conditions: ['Type 2 Diabetes (2018)', 'Hypertension (2020)'],
    currentMedications: ['Metformin 500mg BD', 'Lisinopril 10mg OD'],
    lastVisit: '2026-06-02',
    vitalsHistory: { bp: '150/95', pulse: 82, weight: '74 kg', spo2: '97%' },
  },
  {
    id: 'pat-002',
    patientUid: 'MP-2024-0342',
    name: 'Lakshmi Devi',
    age: 34,
    gender: 'female',
    bloodGroup: 'O+',
    village: 'Peddapuram',
    allergies: [],
    conditions: ['Iron-deficiency anemia (2024)'],
    currentMedications: ['Ferrous sulfate 325mg OD'],
    lastVisit: '2026-05-20',
    vitalsHistory: { bp: '110/70', pulse: 76, weight: '52 kg', spo2: '99%' },
  },
  {
    id: 'pat-003',
    patientUid: 'MP-2025-0089',
    name: 'Abdul Rahman',
    age: 67,
    gender: 'male',
    bloodGroup: 'A+',
    village: 'Rajanagaram',
    allergies: ['Sulfa drugs'],
    conditions: ['Atrial fibrillation (2022)', 'Osteoarthritis (2019)'],
    currentMedications: ['Warfarin 5mg OD', 'Paracetamol 500mg PRN'],
    lastVisit: '2026-07-01',
    vitalsHistory: { bp: '132/84', pulse: 88, weight: '68 kg', spo2: '96%' },
  },
];

// Known dangerous drug pairs for the interaction checker tool.
export const interactionDb = [
  { pair: ['warfarin', 'ibuprofen'], severity: 'HIGH', note: 'NSAIDs increase bleeding risk with warfarin. Prefer paracetamol.' },
  { pair: ['warfarin', 'aspirin'], severity: 'HIGH', note: 'Combined anticoagulant/antiplatelet effect — major bleeding risk.' },
  { pair: ['lisinopril', 'potassium'], severity: 'MODERATE', note: 'ACE inhibitor + potassium supplements can cause hyperkalemia.' },
  { pair: ['lisinopril', 'ibuprofen'], severity: 'MODERATE', note: 'NSAIDs blunt ACE-inhibitor effect and stress renal function.' },
  { pair: ['metformin', 'ciprofloxacin'], severity: 'MODERATE', note: 'Fluoroquinolones can disturb glucose control with metformin.' },
  { pair: ['ferrous', 'ciprofloxacin'], severity: 'MODERATE', note: 'Iron chelates ciprofloxacin — separate doses by 2+ hours.' },
];

// Small ICD-10 lookup for the code-suggestion tool.
export const icdDb = [
  { match: ['type 2 diabetes', 'diabetes'], code: 'E11.9', label: 'Type 2 diabetes mellitus without complications' },
  { match: ['hypertension', 'high blood pressure', 'elevated bp'], code: 'I10', label: 'Essential (primary) hypertension' },
  { match: ['anemia', 'iron deficiency'], code: 'D50.9', label: 'Iron deficiency anemia, unspecified' },
  { match: ['atrial fibrillation', 'afib'], code: 'I48.91', label: 'Unspecified atrial fibrillation' },
  { match: ['osteoarthritis', 'joint pain', 'knee pain'], code: 'M17.9', label: 'Osteoarthritis of knee, unspecified' },
  { match: ['uri', 'upper respiratory', 'cold', 'cough'], code: 'J06.9', label: 'Acute upper respiratory infection, unspecified' },
  { match: ['fever'], code: 'R50.9', label: 'Fever, unspecified' },
  { match: ['dizziness', 'giddiness'], code: 'R42', label: 'Dizziness and giddiness' },
  { match: ['gastritis', 'acidity', 'dyspepsia'], code: 'K29.70', label: 'Gastritis, unspecified' },
  { match: ['back pain', 'low back'], code: 'M54.5', label: 'Low back pain' },
];

// Canned dialogue per patient — demo safety net when no LLM is reachable.
export const cannedDialogues = {
  'pat-001': `Doctor: Good morning Ramesh, how have you been since your last visit?
Patient: Morning doctor. Mostly fine, but I've been getting headaches in the evening and some dizziness when I stand up.
Doctor: How's the sugar control? Are you taking the Metformin twice daily as prescribed?
Patient: Yes doctor, twice daily. But I sometimes forget the blood pressure tablet.
Doctor: That may explain the headaches. Your BP today is 150 over 95, which is higher than we want. Pulse is 82, oxygen is fine at 97 percent.
Patient: Is that dangerous doctor?
Doctor: It needs attention. I want you to take the Lisinopril every morning without fail. I'm also going to increase it to 20 milligrams once daily.
Patient: Okay doctor. Also my knees have been paining, can I take some painkiller?
Doctor: You can take paracetamol for the knee pain, but avoid ibuprofen-type painkillers given your blood pressure medication. Let's also get a fasting sugar and HbA1c test done this week.
Patient: Alright doctor, I'll come Thursday for the tests.
Doctor: Good. Follow up with me in two weeks with the reports. If the dizziness gets worse or you get chest pain, come immediately.`,
  'pat-002': `Doctor: Hello Lakshmi, come in. What brings you today?
Patient: Doctor, I've been feeling very tired again, and short of breath climbing stairs.
Doctor: Are you taking the iron tablets regularly?
Patient: I stopped them two weeks ago, they were upsetting my stomach.
Doctor: That's likely why the tiredness is back. Your pulse is 76, BP 110 over 70. You do look pale. Let's restart iron but take it after food, and I'll add vitamin C to help absorption.
Patient: Okay doctor. Anything else I should do?
Doctor: Include leafy greens and jaggery in your diet. We'll repeat your hemoglobin test in three weeks. If you feel palpitations or severe weakness, come back sooner.`,
  'pat-003': `Doctor: Namaste Abdul bhai, how is the knee treating you?
Patient: The knee is painful again doctor, especially in the mornings. My neighbour gave me ibuprofen tablets and they help.
Doctor: I'm glad the pain eases, but ibuprofen is risky for you — you're on warfarin for your heart rhythm, and together they can cause serious bleeding.
Patient: Oh, I did not know that doctor. I've taken it for four days.
Doctor: Stop the ibuprofen today. Any black stools, blood in urine, or unusual bruising?
Patient: No doctor, nothing like that.
Doctor: Good. Stick to paracetamol for the knee — up to three times a day after food. I'll also order an INR test tomorrow to check the warfarin level, given the ibuprofen use.
Patient: Okay doctor, I will come in the morning for the test.
Doctor: And let's start gentle physiotherapy for the knee. Follow up in one week with the INR report.`,
};
