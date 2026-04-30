import { useUser } from '../contexts/UserContext';
import { Herb } from '../data/herbs';

// Lista de países miembros de la Unión Europea
const EU_COUNTRIES = [
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  // Nombres en español
  'España',
  'Alemania',
  'Francia',
  'Italia',
  'Portugal',
  'Países Bajos',
  'Bélgica',
  'Grecia',
  'República Checa',
  'Rumania',
  'Suecia',
  'Hungría',
  'Austria',
  'Bulgaria',
  'Dinamarca',
  'Finlandia',
  'Eslovaquia',
  'Irlanda',
  'Croacia',
  'Lituania',
  'Eslovenia',
  'Letonia',
  'Estonia',
  'Chipre',
  'Luxemburgo',
  'Malta',
  'Polonia'
];

export function useHerbBannedStatus() {
  const { country } = useUser();

  const isHerbBanned = (herb: Herb): boolean => {
    if (!country || !herb.banned_countries || herb.banned_countries.length === 0) {
      return false;
    }
    
    // Verificar si el país está directamente en la lista
    if (herb.banned_countries.includes(country)) {
      return true;
    }
    
    // Verificar si "UE" está en la lista y el usuario está en un país de la UE
    if (herb.banned_countries.includes('UE') && EU_COUNTRIES.includes(country)) {
      return true;
    }
    
    return false;
  };

  return { isHerbBanned, userCountry: country };
}