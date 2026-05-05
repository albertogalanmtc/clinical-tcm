export type PatientSex = 'male' | 'female';
export type PatientStatus = 'active' | 'reevaluation' | 'monitoring';

export interface PatientProfileField {
  label: string;
  value: string;
}

export interface PatientAnamnesisGroup {
  title: string;
  summary: string;
  items: Array<{
    label: string;
    value: string;
    note?: string;
  }>;
}

export interface PatientEvaluationEntry {
  id: string;
  date: string;
  kind: 'initial' | 'follow-up' | 'reevaluation';
  title: string;
  summary: string;
  formula: string;
  diagnosis: string;
  progress: number;
  notes: string;
  symptomScores: Array<{
    label: string;
    value: number;
    previous?: number;
  }>;
}

export interface PatientAppointmentEntry {
  id: string;
  date: string;
  time: string;
  duration: string;
  kind: 'primera-vez' | 'seguimiento' | 'reevaluacion';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface PatientChartPoint {
  label: string;
  fatigue: number;
  sleep: number;
  digestion: number;
  stress: number;
}

export interface PatientCase {
  id: string;
  name: string;
  age: number;
  sex: PatientSex;
  city: string;
  phone: string;
  email: string;
  status: PatientStatus;
  progress: number;
  lastVisit: string;
  nextAppointment: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentGoal: string;
  formula: string;
  notes: string;
  alerts: string[];
  profile: PatientProfileField[];
  anamnesisGroups: PatientAnamnesisGroup[];
  evaluations: PatientEvaluationEntry[];
  reevaluations: PatientEvaluationEntry[];
  chartData: PatientChartPoint[];
  appointments: PatientAppointmentEntry[];
}

export const patientCases: PatientCase[] = [
  {
    id: 'p-001',
    name: 'María García López',
    age: 42,
    sex: 'female',
    city: 'Madrid',
    phone: '+34 612 345 678',
    email: 'maria.garcia@example.com',
    status: 'active',
    progress: 78,
    lastVisit: '2026-05-03',
    nextAppointment: '2026-05-10',
    chiefComplaint: 'Fatiga postprandial, distensión abdominal y sueño ligero.',
    diagnosis: 'Deficiencia de Bazo con Humedad',
    treatmentGoal: 'Mejorar la digestión, elevar la energía y estabilizar el descanso.',
    formula: 'Xiao Yao San + Shen Ling Bai Zhu San',
    notes: 'Responde mejor a las pautas digestivas cuando reduce el volumen de las cenas.',
    alerts: ['Revisar tolerancia digestiva', 'Controlar respuesta tras comidas copiosas'],
    profile: [
      { label: 'Profesión', value: 'Diseñadora gráfica' },
      { label: 'Procedencia', value: 'Madrid, ES' },
      { label: 'Hora preferida', value: '17:30' },
    ],
    anamnesisGroups: [
      {
        title: 'Motivo de consulta',
        summary: 'Síntomas que concentran la historia clínica inicial.',
        items: [
          { label: 'Síntoma principal', value: 'Fatiga persistente' },
          { label: 'Digestión', value: 'Pesadez y distensión después de comer' },
          { label: 'Sueño', value: 'Despertares ligeros y sueño poco reparador' },
        ],
      },
      {
        title: 'Hábitos y antecedentes',
        summary: 'Factores que acompañan el patrón clínico.',
        items: [
          { label: 'Apetito', value: 'Irregular', note: 'Mejora con comidas templadas' },
          { label: 'Sed', value: 'Moderada' },
          { label: 'Estrés', value: 'Alto en periodos laborales' },
        ],
      },
      {
        title: 'Observaciones ginecológicas',
        summary: 'Bloque visible por contexto femenino.',
        items: [
          { label: 'Ciclo', value: 'Regular' },
          { label: 'Síntomas previos', value: 'Distensión e irritabilidad premenstrual' },
          { label: 'Notas', value: 'Sin alarma actual' },
        ],
      },
    ],
    evaluations: [
      {
        id: 'mar-ini',
        date: '2026-03-15',
        kind: 'initial',
        title: 'Initial assessment',
        summary: 'Baseline evaluation with the first symptom scoring and diagnostic pattern.',
        formula: 'Xiao Yao San',
        diagnosis: 'Qi stagnation with spleen weakness',
        progress: 32,
        notes: 'Initial plan focused on digestion, sleep regularity and emotional unloading.',
        symptomScores: [
          { label: 'Fatigue', value: 8 },
          { label: 'Bloating', value: 7 },
          { label: 'Sleep', value: 6 },
          { label: 'Stress', value: 7 },
        ],
      },
      {
        id: 'mar-fup',
        date: '2026-04-07',
        kind: 'follow-up',
        title: 'Follow-up review',
        summary: 'Moderate improvement after dietary adjustments and continued formula use.',
        formula: 'Xiao Yao San + Shen Ling Bai Zhu San',
        diagnosis: 'Spleen Qi deficiency with dampness',
        progress: 58,
        notes: 'Sleep consolidates better after reducing late dinners.',
        symptomScores: [
          { label: 'Fatigue', value: 6, previous: 8 },
          { label: 'Bloating', value: 5, previous: 7 },
          { label: 'Sleep', value: 5, previous: 6 },
          { label: 'Stress', value: 5, previous: 7 },
        ],
      },
    ],
    reevaluations: [
      {
        id: 'mar-reev-1',
        date: '2026-04-28',
        kind: 'reevaluation',
        title: 'Reevaluation',
        summary: 'Energy and digestion improve in the morning but still fluctuate after lunch.',
        formula: 'Xiao Yao San + Shen Ling Bai Zhu San',
        diagnosis: 'Spleen deficiency with residual dampness',
        progress: 78,
        notes: 'Keep the same base formula and consider tapering the support if the trend holds.',
        symptomScores: [
          { label: 'Fatigue', value: 4, previous: 6 },
          { label: 'Bloating', value: 3, previous: 5 },
          { label: 'Sleep', value: 4, previous: 5 },
          { label: 'Stress', value: 4, previous: 5 },
        ],
      },
    ],
    chartData: [
      { label: 'W1', fatigue: 8, sleep: 6, digestion: 7, stress: 7 },
      { label: 'W2', fatigue: 7, sleep: 6, digestion: 6, stress: 6 },
      { label: 'W3', fatigue: 6, sleep: 5, digestion: 5, stress: 5 },
      { label: 'W4', fatigue: 5, sleep: 5, digestion: 4, stress: 5 },
      { label: 'W5', fatigue: 4, sleep: 4, digestion: 3, stress: 4 },
      { label: 'W6', fatigue: 4, sleep: 4, digestion: 3, stress: 3 },
    ],
    appointments: [
      {
        id: 'mar-app-1',
        date: '2026-05-10',
        time: '17:30',
        duration: '45 min',
        kind: 'seguimiento',
        status: 'scheduled',
        notes: 'Review digestion after lunch and adjust formula if needed.',
      },
      {
        id: 'mar-app-2',
        date: '2026-05-24',
        time: '17:30',
        duration: '45 min',
        kind: 'reevaluacion',
        status: 'scheduled',
        notes: 'Full reevaluation and chart review.',
      },
    ],
  },
  {
    id: 'p-002',
    name: 'Juan Pérez Martín',
    age: 35,
    sex: 'male',
    city: 'Valencia',
    phone: '+34 623 456 789',
    email: 'juan.perez@example.com',
    status: 'reevaluation',
    progress: 53,
    lastVisit: '2026-05-01',
    nextAppointment: '2026-05-08',
    chiefComplaint: 'Tensión muscular, irritabilidad y cefalea vespertina.',
    diagnosis: 'Estancamiento de Qi de Hígado con calor',
    treatmentGoal: 'Bajar la tensión, regular el sueño y suavizar el ascenso de calor.',
    formula: 'Long Dan Xie Gan Tang',
    notes: 'Buen control del sueño cuando evita pantallas antes de dormir.',
    alerts: ['Vigilar picos de presión', 'Mantener hidratación constante'],
    profile: [
      { label: 'Profesión', value: 'Ingeniero de software' },
      { label: 'Procedencia', value: 'Valencia, ES' },
      { label: 'Hora preferida', value: '19:00' },
    ],
    anamnesisGroups: [
      {
        title: 'Síntomas principales',
        summary: 'Patrón de estrés y calor con marcadores de tensión.',
        items: [
          { label: 'Cefalea', value: 'Al final del día' },
          { label: 'Sueño', value: 'Despertares ocasionales' },
          { label: 'Temperatura', value: 'Sensación de calor en la tarde' },
        ],
      },
      {
        title: 'Contexto laboral',
        summary: 'Elementos de hábito que refuerzan el cuadro.',
        items: [
          { label: 'Pantallas', value: 'Más de 9 h/día' },
          { label: 'Pausas', value: 'Irregulares' },
          { label: 'Ejercicio', value: '2 veces por semana' },
        ],
      },
      {
        title: 'Antecedentes',
        summary: 'Aspectos relevantes para el seguimiento.',
        items: [
          { label: 'Presión arterial', value: 'Ligeramente elevada', note: 'Monitorizar sin alarmismo' },
          { label: 'Digestión', value: 'Estable' },
          { label: 'Estrés', value: 'Moderado-alto' },
        ],
      },
    ],
    evaluations: [
      {
        id: 'juan-ini',
        date: '2026-03-18',
        kind: 'initial',
        title: 'Initial assessment',
        summary: 'Strong liver constraint with rising heat and tight muscle pattern.',
        formula: 'Long Dan Xie Gan Tang',
        diagnosis: 'Liver Qi stagnation with heat',
        progress: 28,
        notes: 'Primary goal was to calm the rise of heat and reduce headache intensity.',
        symptomScores: [
          { label: 'Headache', value: 8 },
          { label: 'Irritability', value: 7 },
          { label: 'Neck tension', value: 8 },
          { label: 'Sleep', value: 6 },
        ],
      },
      {
        id: 'juan-fup',
        date: '2026-04-12',
        kind: 'follow-up',
        title: 'Follow-up review',
        summary: 'Headache intensity lowered but tension still rises on stressful days.',
        formula: 'Long Dan Xie Gan Tang',
        diagnosis: 'Liver Qi constraint with residual heat',
        progress: 48,
        notes: 'Workload remains the main trigger.',
        symptomScores: [
          { label: 'Headache', value: 5, previous: 8 },
          { label: 'Irritability', value: 5, previous: 7 },
          { label: 'Neck tension', value: 6, previous: 8 },
          { label: 'Sleep', value: 5, previous: 6 },
        ],
      },
    ],
    reevaluations: [
      {
        id: 'juan-reev-1',
        date: '2026-05-01',
        kind: 'reevaluation',
        title: 'Reevaluation',
        summary: 'Tension improves with sleep hygiene and regular breaks; heat still appears on deadline weeks.',
        formula: 'Long Dan Xie Gan Tang',
        diagnosis: 'Liver heat with constraint',
        progress: 53,
        notes: 'Consider slightly softening the formula if the trend continues.',
        symptomScores: [
          { label: 'Headache', value: 4, previous: 5 },
          { label: 'Irritability', value: 4, previous: 5 },
          { label: 'Neck tension', value: 5, previous: 6 },
          { label: 'Sleep', value: 5, previous: 5 },
        ],
      },
    ],
    chartData: [
      { label: 'W1', fatigue: 6, sleep: 6, digestion: 7, stress: 8 },
      { label: 'W2', fatigue: 6, sleep: 6, digestion: 7, stress: 7 },
      { label: 'W3', fatigue: 5, sleep: 5, digestion: 7, stress: 7 },
      { label: 'W4', fatigue: 5, sleep: 5, digestion: 6, stress: 6 },
      { label: 'W5', fatigue: 4, sleep: 5, digestion: 6, stress: 5 },
      { label: 'W6', fatigue: 4, sleep: 4, digestion: 6, stress: 5 },
    ],
    appointments: [
      {
        id: 'juan-app-1',
        date: '2026-05-08',
        time: '09:00',
        duration: '30 min',
        kind: 'reevaluacion',
        status: 'scheduled',
        notes: 'Review headache pattern and stress triggers.',
      },
      {
        id: 'juan-app-2',
        date: '2026-05-22',
        time: '09:00',
        duration: '30 min',
        kind: 'seguimiento',
        status: 'scheduled',
        notes: 'Check sustained sleep and muscle tension.',
      },
    ],
  },
  {
    id: 'p-003',
    name: 'Ana Rodríguez Silva',
    age: 28,
    sex: 'female',
    city: 'Sevilla',
    phone: '+34 634 567 890',
    email: 'ana.rodriguez@example.com',
    status: 'monitoring',
    progress: 84,
    lastVisit: '2026-05-02',
    nextAppointment: '2026-05-18',
    chiefComplaint: 'Fatiga crónica, manos frías y menstruación irregular.',
    diagnosis: 'Deficiencia de Sangre con Yin bajo',
    treatmentGoal: 'Nutrir sangre, sostener energía y regular el ciclo.',
    formula: 'Si Wu Tang + Zhi Bai Di Huang Wan',
    notes: 'Muy buena adherencia a las recomendaciones de descanso.',
    alerts: ['Revisar hierro y energía en días de menstruación'],
    profile: [
      { label: 'Profesión', value: 'Arquitecta' },
      { label: 'Procedencia', value: 'Sevilla, ES' },
      { label: 'Hora preferida', value: '08:30' },
    ],
    anamnesisGroups: [
      {
        title: 'Patrón clínico',
        summary: 'Síntomas de vacío con tendencia a frío.',
        items: [
          { label: 'Manos frías', value: 'Sí' },
          { label: 'Fatiga', value: 'Sostenida durante la tarde' },
          { label: 'Menstruación', value: 'Irregular' },
        ],
      },
      {
        title: 'Hábitos de recuperación',
        summary: 'Apoyan la progresión favorable.',
        items: [
          { label: 'Sueño', value: '7-8 horas con rutina estable' },
          { label: 'Comidas', value: 'Más regulares' },
          { label: 'Actividad', value: 'Paseos diarios' },
        ],
      },
      {
        title: 'Seguimiento general',
        summary: 'La mejora es lenta pero consistente.',
        items: [
          { label: 'Estrés', value: 'Moderado' },
          { label: 'Digestión', value: 'Sin distensión' },
          { label: 'Notas', value: 'Mantener el ritmo actual' },
        ],
      },
    ],
    evaluations: [
      {
        id: 'ana-ini',
        date: '2026-03-12',
        kind: 'initial',
        title: 'Initial assessment',
        summary: 'Blood deficiency with low energy and menstrual irregularity.',
        formula: 'Si Wu Tang',
        diagnosis: 'Blood deficiency with mild Yin insufficiency',
        progress: 40,
        notes: 'Goal was to restore nourishment and stabilize menstrual rhythm.',
        symptomScores: [
          { label: 'Fatigue', value: 7 },
          { label: 'Cold hands', value: 7 },
          { label: 'Cycle regularity', value: 6 },
          { label: 'Sleep', value: 6 },
        ],
      },
      {
        id: 'ana-fup',
        date: '2026-04-09',
        kind: 'follow-up',
        title: 'Follow-up review',
        summary: 'Energy improves slightly, especially with steady meals and rest.',
        formula: 'Si Wu Tang + Zhi Bai Di Huang Wan',
        diagnosis: 'Blood deficiency with Yin support needs',
        progress: 65,
        notes: 'Continue same strategy; avoid overworking late into the evening.',
        symptomScores: [
          { label: 'Fatigue', value: 5, previous: 7 },
          { label: 'Cold hands', value: 5, previous: 7 },
          { label: 'Cycle regularity', value: 5, previous: 6 },
          { label: 'Sleep', value: 4, previous: 6 },
        ],
      },
    ],
    reevaluations: [
      {
        id: 'ana-reev-1',
        date: '2026-05-02',
        kind: 'reevaluation',
        title: 'Reevaluation',
        summary: 'Stability improves; fatigue still appears on intense workdays.',
        formula: 'Si Wu Tang + Zhi Bai Di Huang Wan',
        diagnosis: 'Blood deficiency with good response',
        progress: 84,
        notes: 'Keep current rhythm and maintain the supportive formula a little longer.',
        symptomScores: [
          { label: 'Fatigue', value: 3, previous: 5 },
          { label: 'Cold hands', value: 3, previous: 5 },
          { label: 'Cycle regularity', value: 4, previous: 5 },
          { label: 'Sleep', value: 4, previous: 4 },
        ],
      },
    ],
    chartData: [
      { label: 'W1', fatigue: 7, sleep: 6, digestion: 7, stress: 6 },
      { label: 'W2', fatigue: 6, sleep: 6, digestion: 6, stress: 6 },
      { label: 'W3', fatigue: 6, sleep: 5, digestion: 6, stress: 5 },
      { label: 'W4', fatigue: 5, sleep: 5, digestion: 5, stress: 5 },
      { label: 'W5', fatigue: 4, sleep: 4, digestion: 5, stress: 4 },
      { label: 'W6', fatigue: 3, sleep: 4, digestion: 5, stress: 4 },
    ],
    appointments: [
      {
        id: 'ana-app-1',
        date: '2026-05-18',
        time: '08:30',
        duration: '45 min',
        kind: 'seguimiento',
        status: 'scheduled',
        notes: 'Review menstrual rhythm and energy stability.',
      },
      {
        id: 'ana-app-2',
        date: '2026-06-01',
        time: '08:30',
        duration: '45 min',
        kind: 'reevaluacion',
        status: 'scheduled',
        notes: 'Evaluate whether to taper support formula.',
      },
    ],
  },
];

export const patientStatusLabels: Record<PatientStatus, { en: string; es: string }> = {
  active: { en: 'Active follow-up', es: 'Seguimiento activo' },
  reevaluation: { en: 'Reevaluation due', es: 'Reevaluación pendiente' },
  monitoring: { en: 'Monitoring', es: 'En observación' },
};

export const appointmentKindLabels = {
  en: {
    'primera-vez': 'Initial visit',
    seguimiento: 'Follow-up',
    reevaluacion: 'Reevaluation',
  },
  es: {
    'primera-vez': 'Primera vez',
    seguimiento: 'Seguimiento',
    reevaluacion: 'Reevaluación',
  },
} as const;

export const appointmentStatusLabels = {
  en: {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  es: {
    scheduled: 'Programada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  },
} as const;
