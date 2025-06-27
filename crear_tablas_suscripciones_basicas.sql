-- =====================================================
-- CREACIÓN DE TABLAS BÁSICAS DE SUSCRIPCIONES
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
CREATE POLICY "Planes son públicos para lectura" ON planes_suscripcion
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar planes" ON planes_suscripcion
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para suscripciones
CREATE POLICY "Usuarios pueden ver sus suscripciones" ON suscripciones
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden crear suscripciones" ON suscripciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden modificar suscripciones" ON suscripciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Insertar plan de ejemplo si no existe
INSERT INTO planes_suscripcion (
  comunidad_id, nombre, descripcion, precio, duracion_dias, caracteristicas
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Plan Premium',
  'Acceso completo a todas las funcionalidades',
  29.99,
  30,
  ARRAY['Acceso ilimitado', 'Soporte prioritario', 'Funciones avanzadas']
) ON CONFLICT DO NOTHING;

-- Verificación final
SELECT 
  'Tablas de suscripciones verificadas' as mensaje,
  (SELECT COUNT(*) FROM planes_suscripcion) as total_planes,
  (SELECT COUNT(*) FROM suscripciones) as total_suscripciones; 