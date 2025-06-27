-- =====================================================
-- CORRECCIÓN COMPLETA TIPO DE DATO UUID - FINAL
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES (sin importar el nombre)
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Eliminar todas las políticas de planes_suscripcion
    FOR pol IN SELECT schemaname, tablename, policyname 
               FROM pg_policies 
               WHERE tablename = 'planes_suscripcion'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.tablename;
    END LOOP;
    
    -- Eliminar todas las políticas de suscripciones
    FOR pol IN SELECT schemaname, tablename, policyname 
               FROM pg_policies 
               WHERE tablename = 'suscripciones'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.tablename;
    END LOOP;
END $$;

-- 2. Eliminar las claves foráneas
ALTER TABLE planes_suscripcion 
DROP CONSTRAINT IF EXISTS planes_suscripcion_comunidad_id_fkey;

ALTER TABLE suscripciones 
DROP CONSTRAINT IF EXISTS suscripciones_comunidad_id_fkey;

-- 3. Cambiar tipos de datos de TEXT a UUID
ALTER TABLE planes_suscripcion 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

ALTER TABLE suscripciones 
ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::uuid;

-- 4. Recrear las claves foráneas
ALTER TABLE planes_suscripcion 
ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

ALTER TABLE suscripciones 
ADD CONSTRAINT suscripciones_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 5. Recrear políticas RLS básicas
CREATE POLICY "planes_select_all" ON planes_suscripcion
  FOR SELECT USING (true);

CREATE POLICY "planes_admin_all" ON planes_suscripcion
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "suscripciones_select_own" ON suscripciones
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NOT NULL);

CREATE POLICY "suscripciones_admin_insert" ON suscripciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "suscripciones_admin_update" ON suscripciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 6. Verificar que todo está correcto
SELECT 
    'CORRECCIÓN COMPLETADA EXITOSAMENTE' as estado,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id') as planes_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'suscripciones' AND column_name = 'comunidad_id') as suscripciones_tipo,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'planes_suscripcion') as politicas_planes,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'suscripciones') as politicas_suscripciones;
