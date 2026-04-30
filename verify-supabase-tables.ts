// Script de verificación de tablas de Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verificando tablas en Supabase...\n');

  const tables = [
    'admin_plans',
    'admin_platform_settings',
    'admin_dashboard_content',
    'admin_carousel_settings',
    'admin_banners',
    'admin_safety_categories'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        console.error(`❌ ${table}: NO EXISTE`);
        console.error(`   Error: ${error.message}\n`);
      } else {
        console.log(`✅ ${table}: EXISTE (${data?.length || 0} filas en sample)`);
      }
    } catch (err: any) {
      console.error(`❌ ${table}: ERROR - ${err.message}\n`);
    }
  }

  // Verificar datos en admin_plans
  console.log('\n📋 Verificando datos en admin_plans...');
  const { data: plans, error: plansError } = await supabase.from('admin_plans').select('code, name');

  if (plansError) {
    console.error('❌ No se pudo leer admin_plans:', plansError.message);
  } else if (plans && plans.length > 0) {
    console.log('✅ Planes encontrados:');
    plans.forEach(plan => console.log(`   - ${plan.code}: ${plan.name}`));
  } else {
    console.log('⚠️  admin_plans existe pero está vacía');
  }
}

verifyTables().catch(console.error);
