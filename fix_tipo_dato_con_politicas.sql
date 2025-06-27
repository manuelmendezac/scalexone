-- =====================================================
-- CORRECCIÓN TIPO DE DATO CON POLÍTICAS RLS
-- =====================================================

-- 1. Eliminar todas las políticas de la tabla planes_suscripcion
DROP POLICY IF EXISTS "Planes son públicos para lectura" ON planes_suscripcion;
DROP POLICY IF EXISTS "Solo admins pueden modificar planes" ON planes_suscripcion;

-- 2. Eliminar la clave foránea
ALTER TABLE planes_suscripcion 
DROP CONSTRAINT IF EXISTS planes_suscripcion_comunidad_id_fkey;

-- 3. Cambiar el tipo de dato de comunidad_id de TEXT a UUID
ALTER TABLE planes_suscripcion 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

-- 4. Recrear la clave foránea
ALTER TABLE planes_suscripcion 
ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 5. Recrear las políticas RLS
CREATE POLICY "Planes son públicos para lectura" ON planes_suscripcion
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar planes" ON planes_suscripcion
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Hacer lo mismo para suscripciones
DROP POLICY IF EXISTS "Usuarios pueden ver sus suscripciones" ON suscripciones;
DROP POLICY IF EXISTS "Solo admins pueden crear suscripciones" ON suscripciones;
DROP POLICY IF EXISTS "Solo admins pueden modificar suscripciones" ON suscripciones;

ALTER TABLE suscripciones 
DROP CONSTRAINT IF EXISTS suscripciones_comunidad_id_fkey;

ALTER TABLE suscripciones 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

ALTER TABLE suscripciones 
ADD CONSTRAINT suscripciones_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- Recrear políticas de suscripciones
CREATE POLICY "Usuarios pueden ver sus suscripciones" ON suscripciones
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden crear suscripciones" ON suscripciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden modificar suscripciones" ON suscripciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 7. Verificar que todo está correcto
SELECT 
    'Tipos de datos y políticas corregidos' as mensaje,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id') as planes_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'suscripciones' AND column_name = 'comunidad_id') as suscripciones_tipo;
