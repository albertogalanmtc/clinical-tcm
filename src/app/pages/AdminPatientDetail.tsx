import { useMemo, useState, type ElementType } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import {
  appointmentKindLabels,
  appointmentStatusLabels,
  patientCases,
  patientStatusLabels,
  type PatientCase,
} from '../data/patientCases';

type PatientDetailTab = 'overview' | 'anamnesis' | 'evaluation' | 'reevaluation' | 'charts' | 'appointments';

function formatDate(value: string, isSpanish: boolean) {
  return format(new Date(value), isSpanish ? 'd MMM yyyy' : 'MMM d, yyyy', {
    locale: isSpanish ? es : undefined,
  });
}

function formatShortDateTime(value: string, time?: string, isSpanish?: boolean) {
  const date = formatDate(value, Boolean(isSpanish));
  return time ? `${date} · ${time}` : date;
}

function getPatientStatusTone(status: PatientCase['status']) {
  if (status === 'active') return 'success';
  if (status === 'reevaluation') return 'warning';
  return 'info';
}

function getAlertTone(index: number) {
  return index % 2 === 0 ? 'warning' : 'info';
}

export default function AdminPatientDetail() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState<PatientDetailTab>('overview');

  const patient = useMemo(
    () => patientCases.find((entry) => entry.id === patientId),
    [patientId],
  );

  const combinedTimeline = useMemo(() => {
    if (!patient) return [];

    return [
      ...patient.evaluations.map((entry) => ({
        ...entry,
        type: 'evaluation' as const,
      })),
      ...patient.reevaluations.map((entry) => ({
        ...entry,
        type: 'reevaluation' as const,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patient]);

  if (!patient) {
    return <Navigate to="/admin/patients" replace />;
  }

  const sectionTabs: Array<{ id: PatientDetailTab; label: string; icon: ElementType }> = [
    { id: 'overview', label: isSpanish ? 'Resumen' : 'Overview', icon: UserRound },
    { id: 'anamnesis', label: isSpanish ? 'Anamnesis' : 'Anamnesis', icon: FileText },
    { id: 'evaluation', label: isSpanish ? 'Evaluación' : 'Evaluation', icon: Activity },
    { id: 'reevaluation', label: isSpanish ? 'Reevaluación' : 'Reevaluation', icon: ClipboardList },
    { id: 'charts', label: isSpanish ? 'Gráficas' : 'Charts', icon: BarChart3 },
    { id: 'appointments', label: isSpanish ? 'Citas' : 'Appointments', icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="w-fit px-0 text-gray-500 hover:bg-transparent hover:text-gray-900">
            <Link to="/admin/patients">
              <ArrowLeft className="h-4 w-4" />
              {isSpanish ? 'Volver a pacientes' : 'Back to patients'}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              {isSpanish
                ? 'Ficha clínica visual con anamnesis, evaluaciones, reevaluaciones, gráficas y agenda.'
                : 'Clinical file with anamnesis, evaluations, reevaluations, charts, and appointments.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-gray-200 bg-white">
            <CalendarCheck className="h-4 w-4" />
            {isSpanish ? 'Nueva cita' : 'New appointment'}
          </Button>
          <Button className="bg-teal-600 text-white hover:bg-teal-700">
            <Stethoscope className="h-4 w-4" />
            {isSpanish ? 'Nueva evaluación' : 'New evaluation'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  name={patient.name}
                  size="lg"
                  color={patient.sex === 'female' ? '#0f766e' : '#2563eb'}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">{patient.name}</h2>
                    <Badge variant={getPatientStatusTone(patient.status)}>
                      {patientStatusLabels[patient.status][isSpanish ? 'es' : 'en']}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {patient.age} · {patient.city} · {patient.phone}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isSpanish ? 'Última visita' : 'Last visit'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(patient.lastVisit, isSpanish)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isSpanish ? 'Próxima cita' : 'Next appointment'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(patient.nextAppointment, isSpanish)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isSpanish ? 'Progreso' : 'Progress'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{patient.progress}%</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <Stethoscope className="h-4 w-4" />
                  {isSpanish ? 'Snapshot clínico' : 'Clinical snapshot'}
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {isSpanish ? 'Motivo principal' : 'Chief complaint'}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{patient.chiefComplaint}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {isSpanish ? 'Diagnóstico TCM' : 'TCM diagnosis'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{patient.diagnosis}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {isSpanish ? 'Fórmula actual' : 'Current formula'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{patient.formula}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {isSpanish ? 'Objetivo terapéutico' : 'Treatment goal'}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{patient.treatmentGoal}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{isSpanish ? 'Evolución acumulada' : 'Cumulative progress'}</span>
                      <span>{patient.progress}%</span>
                    </div>
                    <Progress value={patient.progress} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <UserRound className="h-4 w-4 text-teal-600" />
                    {isSpanish ? 'Datos de contacto' : 'Contact details'}
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{patient.city}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <UtensilsCrossed className="h-4 w-4 text-teal-600" />
                    {isSpanish ? 'Alertas clínicas' : 'Clinical alerts'}
                  </div>
                  <div className="mt-4 space-y-2">
                    {patient.alerts.map((alert, index) => (
                      <Badge key={alert} variant={getAlertTone(index)}>
                        {alert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {isSpanish ? 'Línea temporal clínica' : 'Clinical timeline'}
                  </CardTitle>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {combinedTimeline.map((entry) => (
                  <div key={entry.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                      {entry.type === 'evaluation' ? <Activity className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                        <Badge variant={entry.type === 'evaluation' ? 'info' : 'warning'}>
                          {entry.type === 'evaluation'
                            ? (isSpanish ? 'Evaluación' : 'Evaluation')
                            : (isSpanish ? 'Reevaluación' : 'Reevaluation')}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(entry.date, isSpanish)}</p>
                      <p className="mt-2 text-sm text-gray-700">{entry.summary}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Perfil clínico' : 'Clinical profile'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {patient.profile.map((field) => (
                <div key={field.label} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{field.label}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{field.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Plan de seguimiento' : 'Follow-up plan'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-800">
                {patient.notes}
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{isSpanish ? 'Última visita' : 'Last visit'}</span>
                  <span className="font-medium text-gray-900">{formatDate(patient.lastVisit, isSpanish)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{isSpanish ? 'Siguiente cita' : 'Next appointment'}</span>
                  <span className="font-medium text-gray-900">{formatDate(patient.nextAppointment, isSpanish)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {sectionTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-teal-200 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">{isSpanish ? 'Últimas evaluaciones' : 'Latest evaluations'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[...patient.evaluations, ...patient.reevaluations]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <Badge variant={entry.kind === 'reevaluation' ? 'warning' : 'info'}>
                        {entry.kind === 'reevaluation'
                          ? (isSpanish ? 'Reevaluación' : 'Reevaluation')
                          : (isSpanish ? 'Evaluación' : 'Evaluation')}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate(entry.date, isSpanish)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{entry.summary}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {isSpanish ? 'Diagnóstico' : 'Diagnosis'}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">{entry.diagnosis}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {isSpanish ? 'Fórmula' : 'Formula'}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">{entry.formula}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">{isSpanish ? 'Resumen de progreso' : 'Progress summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {isSpanish ? 'Evolución global' : 'Overall evolution'}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{patient.progress}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-600" />
                </div>
                <div className="mt-4">
                  <Progress value={patient.progress} className="h-2" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: isSpanish ? 'Capacidad digestiva' : 'Digestive capacity', value: 76 },
                  { label: isSpanish ? 'Calidad de sueño' : 'Sleep quality', value: 64 },
                  { label: isSpanish ? 'Nivel de energía' : 'Energy level', value: 81 },
                  { label: isSpanish ? 'Tensión emocional' : 'Emotional tension', value: 39 },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{metric.label}</span>
                      <span className="font-medium text-gray-900">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="mt-3 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'anamnesis' && (
        <div className="space-y-6">
          {patient.anamnesisGroups.map((group) => (
            <Card key={group.title} className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <p className="text-sm text-gray-500">{group.summary}</p>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{item.value}</p>
                    {item.note && <p className="mt-2 text-xs text-gray-500">{item.note}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {patient.evaluations.map((entry) => (
            <Card key={entry.id} className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <p className="text-sm text-gray-500">{formatDate(entry.date, isSpanish)}</p>
                  </div>
                  <Badge variant="info">{entry.diagnosis}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{entry.summary}</p>
                  <div className="rounded-2xl bg-teal-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {isSpanish ? 'Fórmula' : 'Formula'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{entry.formula}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {isSpanish ? 'Notas clínicas' : 'Clinical notes'}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{entry.notes}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {entry.symptomScores.map((symptom) => {
                    const delta = symptom.previous !== undefined ? symptom.previous - symptom.value : null;
                    return (
                      <div key={symptom.label} className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{symptom.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{symptom.value}/10</span>
                            {delta !== null && (
                              <span className="text-xs text-teal-700">
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            )}
                          </div>
                        </div>
                        <Progress value={symptom.value * 10} className="mt-3 h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reevaluation' && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Reevaluaciones registradas' : 'Recorded reevaluations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {patient.reevaluations.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(entry.date, isSpanish)}</p>
                    </div>
                    <Badge variant="warning">{entry.progress}%</Badge>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{entry.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Comparativa de evolución' : 'Evolution comparison'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {patient.reevaluations[0]?.symptomScores.map((symptom) => {
                const initialScore = patient.evaluations.at(-1)?.symptomScores.find((item) => item.label === symptom.label)?.value ?? symptom.value;
                return (
                  <div key={symptom.label} className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{symptom.label}</span>
                      <span className="text-gray-500">
                        {initialScore}/10 → {symptom.value}/10
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <div className="rounded-xl bg-white p-3">
                        <p>{isSpanish ? 'Anterior' : 'Previous'}</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{initialScore}/10</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p>{isSpanish ? 'Actual' : 'Current'}</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{symptom.value}/10</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Tendencia de síntomas' : 'Symptom trend'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[340px] p-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patient.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fatigue" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sleep" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="digestion" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Carga emocional y adherencia' : 'Emotional load and adherence'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[340px] p-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patient.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stress" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sleep" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Próximas citas' : 'Upcoming appointments'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {patient.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {appointmentKindLabels[isSpanish ? 'es' : 'en'][appointment.kind]}
                        </h4>
                        <Badge variant={appointment.status === 'scheduled' ? 'success' : 'default'}>
                          {appointmentStatusLabels[isSpanish ? 'es' : 'en'][appointment.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatShortDateTime(appointment.date, appointment.time, isSpanish)} · {appointment.duration}
                      </p>
                    </div>
                    <CalendarClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{appointment.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">
                {isSpanish ? 'Vista de agenda' : 'Agenda view'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <CalendarClock className="h-4 w-4" />
                  {isSpanish ? 'Siguiente cita' : 'Next appointment'}
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900">{formatDate(patient.nextAppointment, isSpanish)}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {isSpanish ? 'Hora preferida' : 'Preferred time'} · {patient.profile[2]?.value}
                </p>
              </div>

              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Diseño de calendario pendiente' : 'Calendar layout pending'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {isSpanish
                    ? 'En la siguiente fase se conectará esta ficha con el calendario real y las citas editables.'
                    : 'In the next phase, this file will connect to the real calendar and editable appointments.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
