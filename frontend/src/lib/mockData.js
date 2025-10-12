export const mockPatientData = {
  id: '1',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  date_of_birth: '1985-05-15',
  gender: 'male',
  phone: '+1-555-0123',
  address: '123 Main St',
};

export const mockAIDiagnostics = {
  id: '1',
  patient_id: '1',
  risk_level: 'moderate',
  diabetes_risk: 45,
  anemia_risk: 25,
  hypertension_risk: 65,
  cardiac_risk: 35,
  suggestions: ['Monitor BP', 'Lifestyle changes', 'Follow-up in 2 weeks'],
  recommended_tests: ['Lipid Profile', 'HbA1c', 'CBC'],
  analyzed_at: new Date().toISOString(),
};

export const mockAlerts = [
  {
    id: '1',
    patient_id: '1',
    alert_type: 'abnormal_vitals',
    severity: 'medium',
    message: 'BP above normal (145/92)',
    is_read: false,
  },
  {
    id: '2',
    patient_id: '1',
    alert_type: 'follow_up',
    severity: 'low',
    message: 'Quarterly checkup due',
    is_read: false,
  },
];

export const mockHealthRecords = [
  {
    id: '1',
    title: 'Annual Exam',
    description: 'Vitals monitored. Headaches reported.',
    recorded_by: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    title: 'Hypertension Stage 1',
    description: 'BP consistently above 130/80.',
    recorded_by: 'Dr. Sarah Johnson',
  },
  {
    id: '3',
    title: 'Lifestyle Plan',
    description: 'Diet, exercise, stress management.',
    recorded_by: 'Dr. Sarah Johnson',
  },
];

export const mockPrescriptions = [
  {
    id: '1',
    medication_name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '90 days',
  },
  {
    id: '2',
    medication_name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    duration: 'Ongoing',
  },
];

export const mockLabReports = [
  {
    id: '1',
    test_name: 'CBC',
    test_type: 'Hematology',
    results: {
      WBC: { value: 7.2, unit: 'K/uL', status: 'normal' },
      RBC: { value: 4.5, unit: 'M/uL', status: 'normal' },
    },
  },
  {
    id: '2',
    test_name: 'Lipid Panel',
    test_type: 'Chemistry',
    results: {
      Cholesterol: { value: 215, unit: 'mg/dL', status: 'high' },
      LDL: { value: 135, unit: 'mg/dL', status: 'high' },
    },
  },
];

export const mockVitals = [
  {
    id: '1',
    blood_pressure_systolic: 145,
    blood_pressure_diastolic: 92,
    heart_rate: 78,
    temperature: 98.6,
    symptoms: 'Mild headache',
  },
  {
    id: '2',
    blood_pressure_systolic: 138,
    blood_pressure_diastolic: 88,
    heart_rate: 72,
    temperature: 98.4,
  },
];

export const mockPatientsList = [
  { id: '1', full_name: 'John Doe', gender: 'male', risk_level: 'moderate' },
  { id: '2', full_name: 'Sarah Williams', gender: 'female', risk_level: 'low' },
  { id: '3', full_name: 'Michael Chen', gender: 'male', risk_level: 'high' },
  { id: '4', full_name: 'Emily Rodriguez', gender: 'female', risk_level: 'low' },
  { id: '5', full_name: 'David Kumar', gender: 'male', risk_level: 'critical' },
];

export const mockAnalyticsData = {
  totalPatients: 1247,
  activePatients: 892,
  highRiskPatients: 53,
  criticalAlerts: 8,
  monthlyTrends: [
    { month: 'Apr', patients: 1180 },
    { month: 'May', patients: 1198 },
  ],
  regionData: [
    { region: 'North', patients: 342 },
    { region: 'South', patients: 298 },
  ],
  ageDistribution: [
    { ageGroup: '0-18', count: 124 },
    { ageGroup: '19-35', count: 287 },
  ],
};