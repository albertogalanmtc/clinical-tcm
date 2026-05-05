import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, Users } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SearchBar } from '../components/ui/SearchBar';
import { useLanguage } from '../contexts/LanguageContext';
import { normalizeForSearch } from '../utils/searchUtils';
import { patientCases, patientStatusLabels, type PatientCase } from '../data/patientCases';
import { useUser } from '../contexts/UserContext';

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

export default function Patients() {
  const { language } = useLanguage();
  const { isAdmin } = useUser();
  const isSpanish = language === 'es';
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const basePath = location.pathname.startsWith('/admin/') ? '/admin/patients' : '/patients';

  const visiblePatients = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query);

    return patientCases.filter((patient) => {
      if (!normalizedQuery) return true;

      const searchableText = [
        patient.name,
        String(patient.age),
        patient.city,
        patient.phone,
        patient.email,
        patient.chiefComplaint,
        patient.diagnosis,
        patient.formula,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden p-4 pb-[86px] sm:pb-4 lg:p-6 lg:pb-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Users className="h-3.5 w-3.5" />
              {isSpanish ? 'Vista clínica' : 'Clinical board'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSpanish ? 'Pacientes' : 'Patients'}
            </h1>
            <p className="max-w-2xl text-sm text-gray-600">
              {isSpanish
                ? 'Consulta la lista de pacientes y abre su ficha clínica con un clic.'
                : 'Browse the patient list and open each clinical file with one click.'}
            </p>
          </div>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="space-y-4 border-b border-gray-100 pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">
                  {isSpanish ? 'Listado de pacientes' : 'Patient roster'}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  {isSpanish
                    ? 'Busca por nombre, edad, teléfono, última visita o próxima cita.'
                    : 'Search by name, age, phone, last appointment, or next appointment.'}
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder={
                    isSpanish
                      ? 'Buscar paciente, ciudad, diagnóstico...'
                      : 'Search patient, city, diagnosis...'
                  }
                  className="w-full"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {visiblePatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/70">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">
                        {isSpanish ? 'Nombre' : 'Name'}
                      </th>
                      <th className="px-5 py-3">
                        {isSpanish ? 'Edad' : 'Age'}
                      </th>
                      <th className="px-5 py-3">
                        {isSpanish ? 'Teléfono' : 'Phone'}
                      </th>
                      <th className="px-5 py-3">
                        {isSpanish ? 'Última cita' : 'Last appointment'}
                      </th>
                      <th className="px-5 py-3">
                        {isSpanish ? 'Próxima cita' : 'Next appointment'}
                      </th>
                      <th className="px-5 py-3 text-right">
                        <span className="sr-only">{isSpanish ? 'Abrir' : 'Open'}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {visiblePatients.map((patient) => (
                      <tr
                        key={patient.id}
                        onClick={() => navigate(`${basePath}/${patient.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`${basePath}/${patient.id}`);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        className="group cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              name={patient.name}
                              size="lg"
                              color={patient.sex === 'female' ? '#0f766e' : '#2563eb'}
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-semibold text-gray-900">
                                  {patient.name}
                                </h3>
                                <Badge variant={getPatientStatusTone(patient.status)}>
                                  {patientStatusLabels[patient.status][isSpanish ? 'es' : 'en']}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {patient.city} · {patient.chiefComplaint}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                          {patient.age}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                          {patient.phone}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                          {formatDate(patient.lastVisit, isSpanish)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                          {formatDate(patient.nextAppointment, isSpanish)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {isSpanish
                    ? 'No hay pacientes que coincidan con la búsqueda'
                    : 'No patients match the current search'}
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
      </div>
    </div>
  );
}
