import { useMemo, useState, type ElementType } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Activity,
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Phone,
  Mars,
  Venus,
  Stethoscope,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
  Pencil,
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
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import {
  appointmentKindLabels,
  appointmentStatusLabels,
  patientCases,
  type PatientCase,
  type PatientEvaluationEntry,
} from '../data/patientCases';

type PatientDetailTab = 'overview' | 'history' | 'evaluation' | 'charts' | 'appointments';

type TimelineEntry = PatientEvaluationEntry & {
  timelineType: 'evaluation' | 'reevaluation';
};

function formatDate(value: string, isSpanish: boolean) {
  return format(new Date(value), isSpanish ? 'd MMM yyyy' : 'MMM d, yyyy', {
    locale: isSpanish ? es : undefined,
  });
}

function getTimelineTone(kind: PatientEvaluationEntry['kind']) {
  if (kind === 'reevaluation') return 'warning';
  if (kind === 'follow-up') return 'success';
  return 'info';
}

function getStatusTone(status: 'scheduled' | 'completed' | 'cancelled') {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'info';
}

export default function PatientDetail() {
  const { language } = useLanguage();
  const { isAdmin } = useUser();
  const isSpanish = language === 'es';
  const { patientId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<PatientDetailTab>('overview');

  const isAdminRoute = location.pathname.startsWith('/admin/');
  const basePath = isAdminRoute ? '/admin/patients' : '/patients';

  const patient = useMemo(
    () => patientCases.find((entry) => entry.id === patientId),
    [patientId],
  );

  const combinedTimeline = useMemo<TimelineEntry[]>(() => {
    if (!patient) return [];

    return [
      ...patient.evaluations.map((entry) => ({
        ...entry,
        timelineType: 'evaluation' as const,
      })),
      ...patient.reevaluations.map((entry) => ({
        ...entry,
        timelineType: 'reevaluation' as const,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patient]);

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  if (!patient) {
    return <Navigate to={basePath} replace />;
  }

  const sectionTabs: Array<{ id: PatientDetailTab; label: string; icon: ElementType }> = [
    { id: 'overview', label: isSpanish ? 'Datos personales' : 'Personal data', icon: UserRound },
    { id: 'history', label: isSpanish ? 'Historia clínica' : 'Clinical history', icon: FileText },
    { id: 'evaluation', label: isSpanish ? 'Evaluación' : 'Evaluation', icon: Stethoscope },
    { id: 'charts', label: isSpanish ? 'Gráficas' : 'Charts', icon: BarChart3 },
    { id: 'appointments', label: isSpanish ? 'Citas' : 'Appointments', icon: CalendarClock },
  ];

  const activeSection = sectionTabs.find((tab) => tab.id === activeTab) ?? sectionTabs[0];
  const PatientAvatarIcon =
    patient.sex === 'female'
      ? Venus
      : patient.sex === 'male'
        ? Mars
        : UserRound;

  const sectionActionLabel = (() => {
    if (activeTab === 'overview') return isSpanish ? 'Editar' : 'Edit';
    if (activeTab === 'history') return isSpanish ? 'Añadir' : 'Add';
    if (activeTab === 'evaluation') return isSpanish ? 'Nueva evaluación' : 'New evaluation';
    if (activeTab === 'charts') return isSpanish ? 'Exportar' : 'Export';
    return isSpanish ? 'Nueva cita' : 'New appointment';
  })();

  const sectionDescriptions: Record<PatientDetailTab, string> = {
    overview: isSpanish
      ? 'Resumen rápido con datos de contacto, estado clínico y objetivo terapéutico.'
      : 'Quick summary with contact details, clinical status, and treatment goal.',
    history: isSpanish
      ? 'Recoge la anamnesis y los bloques principales de la historia clínica.'
      : 'Review the anamnesis and the main blocks of the clinical history.',
    evaluation: isSpanish
      ? 'Consulta la evolución, las puntuaciones de síntomas y los cambios en el plan.'
      : 'Review evolution, symptom scores, and changes in the plan.',
    charts: isSpanish
      ? 'Sigue la progresión visual de la sintomatología a lo largo del tiempo.'
      : 'Follow the visual progression of symptoms over time.',
    appointments: isSpanish
      ? 'Consulta las citas programadas y su estado.'
      : 'Review scheduled appointments and their status.',
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden p-4 pb-[86px] sm:pb-4 lg:p-6 lg:pb-6">
        <div className="grid gap-6 xl:min-h-[calc(100vh-12rem)] xl:grid-cols-[360px_minmax(0,1fr)] xl:items-stretch">
          <Card className="h-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <CardContent className="flex h-full flex-col p-0">
              <div className="border-b border-gray-200 px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <PatientAvatarIcon className="h-8 w-8" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold text-gray-900">{patient.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {patient.age} · {patient.sex === 'female' ? (isSpanish ? 'Mujer' : 'Female') : (isSpanish ? 'Hombre' : 'Male')}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto overscroll-none px-4 pt-4 lg:py-2">
                {sectionTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 px-0 pr-4 py-3 lg:px-4 lg:rounded-lg text-sm font-medium transition-colors -mx-4 lg:mx-0 pl-4 text-left ${
                        isActive
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span className="flex-1">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-gray-200 px-4 py-4">
                <Link
                  to={basePath}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  <span>{isSpanish ? 'Atrás' : 'Back'}</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <activeSection.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{activeSection.label}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">{sectionDescriptions[activeTab]}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 sm:flex">
                  <Pencil className="h-4 w-4" />
                  {sectionActionLabel}
                </div>
              </div>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              {activeTab === 'overview' && (
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
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
                        {isSpanish ? 'Perfil del paciente' : 'Patient profile'}
                      </div>
                      <div className="mt-4 space-y-3">
                        {patient.profile.map((field) => (
                          <div key={field.label} className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">{field.label}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <UtensilsCrossed className="h-4 w-4 text-teal-600" />
                        {isSpanish ? 'Alertas clínicas' : 'Clinical alerts'}
                      </div>
                      <div className="mt-4 space-y-2">
                        {patient.alerts.map((alert, index) => (
                          <Badge key={alert} variant={index % 2 === 0 ? 'warning' : 'info'}>
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {patient.anamnesisGroups.map((group) => (
                    <div key={group.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{group.summary}</p>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((item) => (
                          <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{item.value}</p>
                            {item.note && <p className="mt-2 text-xs text-gray-500">{item.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'evaluation' && (
                <div className="space-y-4">
                  {combinedTimeline.map((entry) => (
                    <div key={entry.id} className="rounded-3xl border border-gray-200 bg-white p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-semibold text-gray-900">{entry.title}</h4>
                            <Badge variant={getTimelineTone(entry.kind)}>
                              {entry.kind === 'initial'
                                ? (isSpanish ? 'Inicial' : 'Initial')
                                : entry.kind === 'follow-up'
                                  ? (isSpanish ? 'Seguimiento' : 'Follow-up')
                                  : (isSpanish ? 'Reevaluación' : 'Reevaluation')}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{formatDate(entry.date, isSpanish)}</p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {isSpanish ? 'Progreso' : 'Progress'}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">{entry.progress}%</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-600">{entry.summary}</p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {isSpanish ? 'Fórmula' : 'Formula'}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{entry.formula}</p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {isSpanish ? 'Diagnóstico' : 'Diagnosis'}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{entry.diagnosis}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Activity className="h-4 w-4 text-teal-600" />
                          {isSpanish ? 'Puntuaciones de síntomas' : 'Symptom scores'}
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {entry.symptomScores.map((score) => (
                            <div key={score.label} className="rounded-2xl bg-gray-50 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-gray-900">{score.label}</p>
                                <p className="text-sm text-gray-500">
                                  {score.previous !== undefined ? `${score.previous} → ` : ''}
                                  {score.value}/10
                                </p>
                              </div>
                              <Progress value={(score.value / 10) * 100} className="mt-3 h-2" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
                        {entry.notes}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <BarChart3 className="h-4 w-4 text-teal-600" />
                      {isSpanish ? 'Tendencia clínica' : 'Clinical trend'}
                    </div>
                    <div className="h-[360px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={patient.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="fatigue" name={isSpanish ? 'Fatiga' : 'Fatigue'} stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="sleep" name={isSpanish ? 'Sueño' : 'Sleep'} stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="digestion" name={isSpanish ? 'Digestión' : 'Digestion'} stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="stress" name={isSpanish ? 'Estrés' : 'Stress'} stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        label: isSpanish ? 'Última valoración' : 'Latest score',
                        value: `${patient.progress}%`,
                        note: isSpanish ? 'Estado global del caso' : 'Overall case state',
                      },
                      {
                        label: isSpanish ? 'Última visita' : 'Last visit',
                        value: formatDate(patient.lastVisit, isSpanish),
                        note: isSpanish ? 'Visita clínica más reciente' : 'Most recent clinical visit',
                      },
                      {
                        label: isSpanish ? 'Próxima cita' : 'Next appointment',
                        value: formatDate(patient.nextAppointment, isSpanish),
                        note: isSpanish ? 'Siguiente revisión programada' : 'Next scheduled review',
                      },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{item.value}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  {patient.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-3xl border border-gray-200 bg-white p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {formatDate(appointment.date, isSpanish)}
                            </h4>
                            <Badge variant={getStatusTone(appointment.status)}>
                              {appointmentStatusLabels[isSpanish ? 'es' : 'en'][appointment.status]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {appointment.time} · {appointment.duration}
                          </p>
                        </div>
                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                          {appointmentKindLabels[isSpanish ? 'es' : 'en'][appointment.kind]}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
