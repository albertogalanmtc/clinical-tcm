import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SearchBar } from '../components/ui/SearchBar';
import { ScrollableListCard } from '../components/ui/ScrollableListCard';
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

        {visiblePatients.length > 0 ? (
          <ScrollableListCard className="flex-1 min-h-0 overflow-hidden">
            <div className="divide-y divide-gray-200 border-b border-gray-200">
              {visiblePatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => navigate(`${basePath}/${patient.id}`)}
                  className="group block w-full bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 sm:px-4 sm:py-4 lg:px-6"
                >
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,0.7fr)_minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,1.6fr)] sm:items-center">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                    </div>
                    <div className="whitespace-nowrap text-gray-600">
                      {patient.age} {isSpanish ? 'años' : 'years'}
                    </div>
                    <div className="whitespace-nowrap text-gray-600">
                      {patient.phone}
                    </div>
                    <div className="inline-flex items-center gap-2 whitespace-nowrap text-gray-700">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-gray-500">
                        {isSpanish ? 'Última:' : 'Last:'}
                      </span>
                      {formatDate(patient.lastVisit, isSpanish)}
                    </div>
                    <div className={`inline-flex items-center gap-2 whitespace-nowrap ${patient.nextAppointment ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <CalendarDays className="h-4 w-4" />
                      <span className="font-medium text-gray-500">
                        {isSpanish ? 'Próxima:' : 'Next:'}
                      </span>
                      {patient.nextAppointment
                        ? formatDate(patient.nextAppointment, isSpanish)
                        : (isSpanish ? 'Sin cita programada' : 'No appointment scheduled')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollableListCard>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
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
      </div>
    </div>
  );
}
