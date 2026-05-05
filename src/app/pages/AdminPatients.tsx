import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  ClipboardList,
  Search,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { appointmentKindLabels, appointmentStatusLabels, patientCases, patientStatusLabels, type PatientCase } from '../data/patientCases';

function formatDate(value: string, isSpanish: boolean) {
  return format(new Date(value), isSpanish ? 'd MMM yyyy' : 'MMM d, yyyy', {
    locale: isSpanish ? es : undefined,
  });
}

function getPatientStatusTone(status: PatientCase['status']) {
  if (status === 'active') return 'success';
  if (status === 'reevaluation') return 'warning';
  return 'info';
}

export default function AdminPatients() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientCase['status']>('all');

  const visiblePatients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return patientCases.filter((patient) => {
      const matchesQuery =
        !normalizedQuery ||
        [patient.name, patient.city, patient.chiefComplaint, patient.diagnosis, patient.formula]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const stats = useMemo(() => {
    const total = patientCases.length;
    const active = patientCases.filter((patient) => patient.status === 'active').length;
    const reevaluation = patientCases.filter((patient) => patient.status === 'reevaluation').length;
    const appointments = patientCases.flatMap((patient) => patient.appointments).filter((appointment) => appointment.status === 'scheduled').length;

    return [
      {
        label: isSpanish ? 'Pacientes' : 'Patients',
        value: total,
        hint: isSpanish ? 'Expedientes clínicos activos' : 'Active clinical files',
        icon: Users,
        tone: 'bg-teal-50 text-teal-700',
      },
      {
        label: isSpanish ? 'Seguimiento' : 'Active follow-up',
        value: active,
        hint: isSpanish ? 'Casos en curso' : 'Cases in progress',
        icon: Stethoscope,
        tone: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: isSpanish ? 'Reevaluación' : 'Reevaluation',
        value: reevaluation,
        hint: isSpanish ? 'Pendientes de revisión' : 'Pending review',
        icon: ClipboardList,
        tone: 'bg-amber-50 text-amber-700',
      },
      {
        label: isSpanish ? 'Citas' : 'Appointments',
        value: appointments,
        hint: isSpanish ? 'Programadas en la agenda' : 'Scheduled on the agenda',
        icon: CalendarDays,
        tone: 'bg-indigo-50 text-indigo-700',
      },
    ];
  }, [isSpanish]);

  const upcomingAppointments = useMemo(() => {
    return patientCases
      .flatMap((patient) =>
        patient.appointments
          .filter((appointment) => appointment.status === 'scheduled')
          .map((appointment) => ({
            ...appointment,
            patient,
          })),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <UserRound className="h-3.5 w-3.5" />
            {isSpanish ? 'Solo visible para admin' : 'Admin only'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSpanish ? 'Pacientes' : 'Patients'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              {isSpanish
                ? 'Panel visual para ver expedientes, seguimiento, anamnesis, reevaluaciones y agenda clínica.'
                : 'Visual board to review patient files, follow-up, anamnesis, reevaluations, and the clinical schedule.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-gray-200 bg-white">
            <Link to="/admin/patients">
              <Stethoscope className="h-4 w-4" />
              {isSpanish ? 'Abrir tablero' : 'Open board'}
            </Link>
          </Button>
          <Button className="bg-teal-600 text-white hover:bg-teal-700">
            <CalendarPlus className="h-4 w-4" />
            {isSpanish ? 'Nueva ficha' : 'New patient file'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.hint}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="space-y-4 border-b border-gray-100 pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">
                  {isSpanish ? 'Listado de expedientes' : 'Patient files'}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  {isSpanish
                    ? 'Busca un paciente y abre su ficha clínica con un clic.'
                    : 'Search a patient and open the clinical file with one click.'}
                </p>
              </div>

              <div className="flex w-full gap-2 lg:w-auto">
                <div className="relative flex-1 lg:min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={isSpanish ? 'Buscar paciente, ciudad, diagnóstico...' : 'Search patient, city, diagnosis...'}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: isSpanish ? 'Todos' : 'All' },
                { key: 'active', label: isSpanish ? 'Activos' : 'Active' },
                { key: 'reevaluation', label: isSpanish ? 'Reevaluación' : 'Reevaluation' },
                { key: 'monitoring', label: isSpanish ? 'Observación' : 'Monitoring' },
              ].map((filter) => {
                const isActive = statusFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-teal-200 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            {visiblePatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/admin/patients/${patient.id}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={patient.name}
                      size="lg"
                      color={patient.sex === 'female' ? '#0f766e' : '#2563eb'}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <Badge variant={getPatientStatusTone(patient.status)}>
                          {patientStatusLabels[patient.status][isSpanish ? 'es' : 'en']}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {patient.age} · {patient.city} · {patient.phone}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm text-gray-600">
                        {patient.chiefComplaint}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {isSpanish ? 'Última visita' : 'Last visit'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(patient.lastVisit, isSpanish)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {isSpanish ? 'Próxima cita' : 'Next appointment'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(patient.nextAppointment, isSpanish)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {isSpanish ? 'Progreso' : 'Progress'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{patient.progress}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{patient.diagnosis}</Badge>
                    <Badge variant="default">{patient.formula}</Badge>
                    {patient.alerts.slice(0, 2).map((alert) => (
                      <Badge key={alert} variant="warning">
                        {alert}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{isSpanish ? 'Evolución clínica' : 'Clinical evolution'}</span>
                      <span>{patient.progress}%</span>
                    </div>
                    <Progress value={patient.progress} className="h-2" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                  <div className="text-gray-500">
                    {isSpanish ? 'Abrir ficha completa' : 'Open full file'}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
                </div>
              </Link>
            ))}

            {visiblePatients.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'No hay pacientes que coincidan con la búsqueda' : 'No patients match the current search'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {isSpanish
                    ? 'Prueba con otro nombre, ciudad o diagnóstico.'
                    : 'Try another name, city, or diagnosis.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-5">
              <CardTitle className="text-lg">
                {isSpanish ? 'Flujo clínico' : 'Clinical workflow'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[
                {
                  title: isSpanish ? '1. Anamnesis' : '1. Anamnesis',
                  text: isSpanish ? 'Recoge el patrón inicial, síntomas y contexto clínico.' : 'Capture the initial pattern, symptoms, and clinical context.',
                },
                {
                  title: isSpanish ? '2. Evaluación' : '2. Evaluation',
                  text: isSpanish ? 'Mide la severidad y la respuesta a la estrategia terapéutica.' : 'Measure severity and response to the therapeutic strategy.',
                },
                {
                  title: isSpanish ? '3. Reevaluación' : '3. Reevaluation',
                  text: isSpanish ? 'Compara la evolución y ajusta el plan si hace falta.' : 'Compare evolution and adjust the plan when needed.',
                },
                {
                  title: isSpanish ? '4. Citas' : '4. Appointments',
                  text: isSpanish ? 'Ordena el calendario de seguimiento de forma visual.' : 'Keep the follow-up schedule visually organized.',
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{step.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {isSpanish ? 'Próximas citas' : 'Upcoming appointments'}
                </CardTitle>
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{appointment.patient.name}</h4>
                        <Badge variant={appointment.status === 'scheduled' ? 'success' : 'default'}>
                          {appointmentStatusLabels[isSpanish ? 'es' : 'en'][appointment.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(appointment.date, isSpanish)} · {appointment.time} · {appointment.duration}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      {appointmentKindLabels[isSpanish ? 'es' : 'en'][appointment.kind]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{appointment.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
