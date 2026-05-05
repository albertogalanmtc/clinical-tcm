import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SearchBar } from '../components/ui/SearchBar';
import { useLanguage } from '../contexts/LanguageContext';
import { normalizeForSearch } from '../utils/searchUtils';
import { patientCases } from '../data/patientCases';
import { useUser } from '../contexts/UserContext';

function formatDate(value: string, isSpanish: boolean) {
  return format(new Date(value), isSpanish ? 'd MMM yyyy' : 'MMM d, yyyy', {
    locale: isSpanish ? es : undefined,
  });
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
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={isSpanish ? 'Buscar paciente...' : 'Search patient...'}
            className="w-full lg:flex-1"
          />
          <Button className="h-10 w-full rounded-lg bg-teal-600 px-4 text-white hover:bg-teal-700 lg:w-auto">
            <Plus className="h-4 w-4" />
            {isSpanish ? 'Nuevo paciente' : 'New patient'}
          </Button>
        </div>

        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {isSpanish ? 'Pacientes recientes' : 'Recent patients'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {visiblePatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200 bg-white">
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
                        className="cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <td className="px-6 py-5">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-gray-900">
                              {patient.name}
                            </h3>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                          {patient.age} {isSpanish ? 'años' : 'years'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                          {patient.phone}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-gray-500">
                              {isSpanish ? 'Última:' : 'Last:'}
                            </span>
                            {' '}
                            {formatDate(patient.lastVisit, isSpanish)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm">
                          <span className={`inline-flex items-center gap-2 ${patient.nextAppointment ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <CalendarDays className="h-4 w-4" />
                            {patient.nextAppointment
                              ? (
                                <>
                                  <span className="font-medium text-gray-500">
                                    {isSpanish ? 'Próxima:' : 'Next:'}
                                  </span>
                                  {' '}
                                  {formatDate(patient.nextAppointment, isSpanish)}
                                </>
                              )
                              : (isSpanish ? 'Sin cita programada' : 'No appointment scheduled')}
                          </span>
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
