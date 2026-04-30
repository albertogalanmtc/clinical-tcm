// Sample Community Data for testing
import { createCommunityPost, createComment } from './communityPosts';

const INIT_FLAG_KEY = 'community_sample_data_initialized';
const INIT_VERSION = '2'; // Increment to force re-initialization

export function initializeSampleCommunityData() {
  // Check if already initialized with current version
  if (localStorage.getItem(INIT_FLAG_KEY) === INIT_VERSION) {
    return;
  }

  // Clear existing data to regenerate with new ID system
  localStorage.removeItem('community_posts');
  localStorage.removeItem('community_comments');
  localStorage.removeItem('community_user_interactions');
  localStorage.removeItem('community_post_counter');
  localStorage.removeItem('community_comment_counter');

  // Set flag immediately to prevent concurrent initializations
  localStorage.setItem(INIT_FLAG_KEY, INIT_VERSION);

  console.log('🔄 Initializing sample community data...');

  // Create sample posts with delays to ensure unique IDs
  const post1 = createCommunityPost({
    title: 'Dolor menstrual severo con coágulos - ¿Estoy en lo correcto?',
    content: `**Contexto:** Mujer de 32 años, sin medicación actual, dolor desde hace 2 años que ha empeorado.

**Síntomas principales:**
- Dolor menstrual intenso, especialmente los primeros 2 días
- Coágulos oscuros y grandes
- Sangrado abundante color púrpura oscuro
- Sensación de frío en extremidades
- Lengua: púrpura con equimosis en los bordes
- Pulso: tenso y profundo

**Diagnóstico TCM:**
Estancamiento de Sangre en el Útero con deficiencia de Yang

**Tratamiento aplicado:**
Shao Fu Zhu Yu Tang modificada:
- Base de la fórmula original
- Añadí Ai Ye y Pao Jiang para calentar
- Reduje Dan Shen ligeramente

**Evolución/Resultado:**
Después de 2 ciclos, el dolor ha disminuido un 60% pero los coágulos persisten aunque son más pequeños.

**Pregunta/Duda:**
¿Debería aumentar la dosis de hierbas que movilizan la sangre o es normal que tome más tiempo? ¿Alguien ha tenido experiencia similar?`,
    category: 'help',
    symptoms: ['Dolor menstrual', 'Coágulos', 'Sangrado abundante', 'Frío en extremidades']
  });

  const post2 = createCommunityPost({
    title: 'Caso exitoso: Insomnio crónico con Suan Zao Ren Tang',
    content: `Quiero compartir un caso que tuvo muy buenos resultados:

**Contexto:** Hombre de 45 años, ejecutivo, insomnio de conciliación y mantenimiento desde hace 5 años. Había probado melatonina y benzodiacepinas sin éxito sostenido.

**Síntomas:**
- Dificultad para conciliar el sueño (1-2 horas)
- Despertares frecuentes (3-4 veces por noche)
- Sudoración nocturna leve
- Palpitaciones al acostarse
- Lengua: roja sin saburra en la punta
- Pulso: rápido y filiforme

**Diagnóstico TCM:**
Deficiencia de Yin de Corazón e Hígado con Calor vacío

**Tratamiento:**
Suan Zao Ren Tang con modificaciones:
- Aumenté Suan Zao Ren a 30g
- Añadí Ye Jiao Teng 15g
- Añadí Bai Zi Ren 10g
- Añadí Long Gu y Mu Li (cocción previa)

**Resultado:**
Primera semana: reducción del tiempo de conciliación a 30 min
Segunda semana: solo 1 despertar nocturno
Cuarta semana: duerme 7 horas continuas, sin sudoración

El paciente ha podido dejar completamente la medicación occidental. Seguimiento a los 3 meses: mantiene los resultados.`,
    category: 'success',
    symptoms: ['Insomnio', 'Despertares nocturnos', 'Sudoración nocturna', 'Palpitaciones']
  });

  const post3 = createCommunityPost({
    title: '¿Qué fórmula preferís para Qi Xu de Bazo con humedad?',
    content: `Tengo un paciente con clara deficiencia de Qi de Bazo pero con bastante humedad (lengua edematosa con marcas dentales, saburra gruesa).

Estoy dudando entre:
1. Bu Zhong Yi Qi Tang + Ping Wei San
2. Xiang Sha Liu Jun Zi Tang
3. Shen Ling Bai Zhu San

¿Cuál ha sido vuestra experiencia? ¿Alguna preferencia según el tipo de paciente?

En este caso particular: fatiga importante, distensión abdominal post-prandial, heces blandas, lengua pálida con saburra blanca gruesa.`,
    category: 'question',
    symptoms: ['Fatiga', 'Distensión abdominal', 'Heces blandas']
  });

  // Add some comments to post1
  setTimeout(() => {
    createComment({
      postId: post1.id,
      content: `He tenido varios casos similares. Mi experiencia es que cuando los coágulos persisten después de 2 ciclos, suele indicar que el estancamiento es más profundo de lo que pensábamos inicialmente.

Te sugeriría:
1. Mantener Shao Fu Zhu Yu Tang pero aumentar progresivamente Dan Shen y Yi Mu Cao
2. Considerar añadir San Leng y E Zhu si no hay contraindicaciones (embarazo, sangrado excesivo)
3. Importante: revisar si hay componente de frío - si la paciente mejora con calor local, enfatiza más las hierbas que calientan

¿Has notado si el color de la sangre ha cambiado? Eso sería un buen indicador de progreso.`
    });

    createComment({
      postId: post1.id,
      content: `Yo en estos casos también reviso:
- Factores emocionales (el estancamiento de Qi de Hígado puede perpetuar el estancamiento de Sangre)
- Dieta (evitar lácteos y fritos que generan humedad y obstruyen aún más)
- Ejercicio (el movimiento ayuda a movilizar la sangre)

A veces un curso de moxibustión en Ren 4, Ren 6 y Zi Gong (útero) puede acelerar mucho el proceso. ¿Lo has considerado?`
    });
  }, 100);

  // Add comments to post2
  setTimeout(() => {
    createComment({
      postId: post2.id,
      content: `¡Excelente caso! Me encanta cómo adaptaste la fórmula clásica. La combinación de Long Gu y Mu Li fue muy acertada para anclar el Shen.

Una pregunta: ¿notaste si había ansiedad asociada? En ejecutivos con este patrón a veces añado también Gou Teng para calmar el Yang de Hígado si hay componente de estrés.`
    });
  }, 150);

  // Add comments to post3
  setTimeout(() => {
    createComment({
      postId: post3.id,
      content: `Para ese cuadro específico yo iría con Xiang Sha Liu Jun Zi Tang. Es perfecta para Qi Xu de Bazo con humedad y distensión.

Bu Zhong Yi Qi Tang es más para casos con prolapso o fatiga extrema sin tanta humedad. Shen Ling Bai Zhu San la reservo más para diarrea crónica o humedad más severa.

La clave en tu caso es que tiene TANTO Qi Xu COMO humedad significativa, y Xiang Sha Liu Jun Zi maneja ambos aspectos equilibradamente.`
    });

    createComment({
      postId: post3.id,
      content: `Coincido con Xiang Sha Liu Jun Zi Tang. Yo también añadiría algunas recomendaciones dietéticas:
- Evitar crudos y fríos completamente
- Introducir arroz congee con jengibre en las mañanas
- Reducir lácteos, trigo y azúcares

La humedad tarda en resolverse, así que paciencia con el tratamiento (mínimo 4-6 semanas).`
    });
  }, 200);

  console.log('✅ Sample community data initialized');
}
