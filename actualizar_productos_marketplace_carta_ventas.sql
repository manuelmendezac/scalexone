-- =================================================================
-- ACTUALIZAR TABLAS DEL MARKETPLACE PARA CARTA DE VENTAS DINÁMICA
-- =================================================================
-- Este script agrega tres nuevas columnas de tipo JSONB a las tablas
-- 'cursos_marketplace' y 'servicios_marketplace'.
-- Estas columnas almacenarán los datos estructurados para las nuevas
-- secciones de la página de producto:
--
-- 1. features_section: Para la sección "¿Qué incluye tu acceso?".
--    Guardará un array de objetos, donde cada objeto tiene un ícono,
--    título y lista de puntos.
--
-- 2. testimonials: Para la sección de "Testimonios".
--    Guardará un array de objetos con el texto del testimonio,
--    nombre del cliente, su cargo y la URL de su avatar.
--
-- 3. faq: Para la sección de "Preguntas Frecuentes".
--    Guardará un array de objetos con una pregunta y su respuesta.
--
-- El tipo JSONB es eficiente para almacenar y consultar datos semi-estructurados.
-- =================================================================

-- 1. Actualizar la tabla de cursos del marketplace
ALTER TABLE public.cursos_marketplace
ADD COLUMN IF NOT EXISTS features_section JSONB,
ADD COLUMN IF NOT EXISTS testimonials JSONB,
ADD COLUMN IF NOT EXISTS faq JSONB;

-- 2. Actualizar la tabla de servicios del marketplace
ALTER TABLE public.servicios_marketplace
ADD COLUMN IF NOT EXISTS features_section JSONB,
ADD COLUMN IF NOT EXISTS testimonials JSONB,
ADD COLUMN IF NOT EXISTS faq JSONB;

-- Mensaje de confirmación
-- NOTA: Para verificar que las columnas fueron agregadas, puedes
-- ejecutar el siguiente comando en el SQL Editor de Supabase:
-- \d+ cursos_marketplace
-- \d+ servicios_marketplace
-- O simplemente revisar la estructura de las tablas en la interfaz.

SELECT 'Columnas features_section, testimonials y faq agregadas exitosamente a las tablas de marketplace.' as "Resultado"; 