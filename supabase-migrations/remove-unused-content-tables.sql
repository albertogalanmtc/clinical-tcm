-- =====================================================
-- SCRIPT: Eliminar tablas de contenido no utilizadas
-- =====================================================
-- Este script elimina las tablas de Promotions, Courses,
-- Research y Celebrations que ya no se utilizan en la app.
--
-- IMPORTANTE: Este script ELIMINARÁ DATOS PERMANENTEMENTE
-- Asegúrate de hacer un backup si hay datos que necesites conservar.
--
-- Ejecutar este script en: Supabase Dashboard > SQL Editor
-- =====================================================

-- Eliminar tabla de Promotions
DROP TABLE IF EXISTS promotions CASCADE;

-- Eliminar tabla de Courses
DROP TABLE IF EXISTS courses CASCADE;

-- Eliminar tabla de Research
DROP TABLE IF EXISTS research CASCADE;

-- Eliminar tabla de Celebrations
DROP TABLE IF EXISTS celebrations CASCADE;

-- Verificar que las tablas se eliminaron correctamente
-- (Esto debería retornar 0 filas si todo salió bien)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('promotions', 'courses', 'research', 'celebrations');

-- =====================================================
-- TABLAS QUE PERMANECEN EN LA BASE DE DATOS:
-- =====================================================
-- ✅ users (auth + profile)
-- ✅ news
-- ✅ banners
-- ✅ dashboard_messages
-- ✅ surveys
-- ✅ survey_responses
-- ✅ community_posts
-- ✅ community_comments
-- ✅ banner_dismissals
-- ✅ prescriptions (si aplica)
-- =====================================================
