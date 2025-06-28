-- Script para agregar campos de suscripciones a cursos marketplace
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas necesarias para suscripciones de cursos
ALTER TABLE IF EXISTS cursos_marketplace 
ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(20) DEFAULT 'curso' CHECK (tipo_producto IN ('curso', 'suscripcion')),
ADD COLUMN IF NOT EXISTS plan_suscripcion_id UUID REFERENCES planes_suscripcion(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS duracion_dias INTEGER,
ADD COLUMN IF NOT EXISTS caracteristicas JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN cursos_marketplace.tipo_producto IS 'Tipo de producto: curso normal o suscripción de curso';
COMMENT ON COLUMN cursos_marketplace.plan_suscripcion_id IS 'Referencia al plan de suscripción (opcional)';
COMMENT ON COLUMN cursos_marketplace.duracion_dias IS 'Duración en días para suscripciones de curso';
COMMENT ON COLUMN cursos_marketplace.caracteristicas IS 'Lista de características de la suscripción (JSONB)';
COMMENT ON COLUMN cursos_marketplace.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN cursos_marketplace.updated_at IS 'Fecha de última actualización';

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_cursos_marketplace_tipo_producto ON cursos_marketplace(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_cursos_marketplace_plan_suscripcion ON cursos_marketplace(plan_suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_cursos_marketplace_duracion ON cursos_marketplace(duracion_dias);
CREATE INDEX IF NOT EXISTS idx_cursos_marketplace_created_at ON cursos_marketplace(created_at);

-- 4. Crear trigger para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_cursos_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_cursos_marketplace_updated_at
    BEFORE UPDATE ON cursos_marketplace
    FOR EACH ROW
    EXECUTE FUNCTION update_cursos_marketplace_updated_at();

-- 5. Actualizar políticas RLS para permitir gestión de suscripciones de cursos
CREATE POLICY IF NOT EXISTS "Admins can manage curso subscriptions" ON cursos_marketplace
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 6. Verificar las columnas agregadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace' 
AND column_name IN ('tipo_producto', 'plan_suscripcion_id', 'duracion_dias', 'caracteristicas', 'created_at', 'updated_at')
ORDER BY column_name;

-- 7. Mensaje de confirmación
SELECT 'Campos de suscripciones agregados exitosamente a cursos_marketplace' as resultado;
