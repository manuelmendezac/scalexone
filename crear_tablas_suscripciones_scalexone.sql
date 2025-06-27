-- =====================================================
-- CREACIÓN DE TABLAS SUSCRIPCIONES PARA SCALEXONE
-- Usando el UUID correcto de la comunidad
-- =====================================================

-- Crear tabla planes_suscripcion si no existe
CREATE TABLE IF NOT EXISTS planes_suscripcion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comunidad_id TEXT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  moneda VARCHAR(3) DEFAULT 'USD',
  duracion_dias INTEGER NOT NULL DEFAULT 30,
  caracteristicas TEXT[] DEFAULT '{}',
  limites JSONB DEFAULT '{}',
  configuracion JSONB DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla suscripciones si no existe
CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comunidad_id TEXT NOT NULL,
  plan_id UUID REFERENCES planes_suscripcion(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'activa',
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  razon_cancelacion TEXT,
  renovacion_automatica BOOLEAN DEFAULT true,
  precio_pagado DECIMAL(10,2),
  descuento_aplicado DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear vista para suscripciones con detalles
CREATE OR REPLACE VIEW vista_suscripciones_activas AS
SELECT 
  s.*,
  u.email as usuario_email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as usuario_nombre,
  p.nombre as plan_nombre,
  p.precio as plan_precio,
  'ScaleXone' as comunidad_nombre,
  'scalexone' as comunidad_slug
FROM suscripciones s
LEFT JOIN auth.users u ON s.usuario_id = u.id
LEFT JOIN planes_suscripcion p ON s.plan_id = p.id;

-- Políticas RLS
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para planes_suscripcion
DROP POLICY IF EXISTS "Planes son públicos para lectura" ON planes_suscripcion;
CREATE POLICY "Planes son públicos para lectura" ON planes_suscripcion
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admins pueden modificar planes" ON planes_suscripcion;
CREATE POLICY "Solo admins pueden modificar planes" ON planes_suscripcion
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para suscripciones
DROP POLICY IF EXISTS "Usuarios pueden ver sus suscripciones" ON suscripciones;
CREATE POLICY "Usuarios pueden ver sus suscripciones" ON suscripciones
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Solo admins pueden crear suscripciones" ON suscripciones;
CREATE POLICY "Solo admins pueden crear suscripciones" ON suscripciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Solo admins pueden modificar suscripciones" ON suscripciones;
CREATE POLICY "Solo admins pueden modificar suscripciones" ON suscripciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Insertar planes de ejemplo usando el UUID correcto de ScaleXone
INSERT INTO planes_suscripcion (
  comunidad_id, nombre, descripcion, precio, duracion_dias, caracteristicas
) VALUES 
(
  '8fb70d6e-3237-465e-8669-979461cf2bc1',
  'Plan Premium Mensual',
  'Acceso completo a todas las funcionalidades de ScaleXone',
  29.99,
  30,
  ARRAY['Acceso ilimitado', 'Soporte prioritario', 'Funciones avanzadas IA', 'Marketplace completo']
),
(
  '8fb70d6e-3237-465e-8669-979461cf2bc1',
  'Plan Premium Anual',
  'Plan anual con descuento - Acceso completo por 12 meses',
  299.99,
  365,
  ARRAY['Acceso ilimitado', 'Soporte prioritario', 'Funciones avanzadas IA', 'Marketplace completo', '2 meses gratis']
) ON CONFLICT DO NOTHING;

-- Verificación final
SELECT 
  'Tablas de suscripciones creadas para ScaleXone' as mensaje,
  (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_scalexone,
  (SELECT COUNT(*) FROM suscripciones WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as suscripciones_scalexone;
