-- =====================================================
-- CORRECCIÓN TIPO DE DATO COMUNIDAD_ID - PLANES_SUSCRIPCION
-- =====================================================

-- 1. Primero, eliminar la clave foránea si existe
ALTER TABLE planes_suscripcion 
DROP CONSTRAINT IF EXISTS planes_suscripcion_comunidad_id_fkey;

-- 2. Cambiar el tipo de dato de comunidad_id de TEXT a UUID
ALTER TABLE planes_suscripcion 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

-- 3. Recrear la clave foránea correctamente
ALTER TABLE planes_suscripcion 
ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 4. Hacer lo mismo para la tabla suscripciones
ALTER TABLE suscripciones 
DROP CONSTRAINT IF EXISTS suscripciones_comunidad_id_fkey;

ALTER TABLE suscripciones 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

ALTER TABLE suscripciones 
ADD CONSTRAINT suscripciones_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 5. Verificar que los cambios se aplicaron correctamente
SELECT 
    'Tipos de datos corregidos' as mensaje,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id') as planes_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'suscripciones' AND column_name = 'comunidad_id') as suscripciones_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'comunidades' AND column_name = 'id') as comunidades_tipo;
