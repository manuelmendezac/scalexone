-- =====================================================
-- CORRECCIÓN FINAL VISTA SUSCRIPCIONES - SIN CONFLICTOS
-- =====================================================

-- Eliminar vista existente para recrearla sin conflictos
DROP VIEW IF EXISTS vista_suscripciones_activas;

-- Recrear vista con estructura limpia
CREATE VIEW vista_suscripciones_activas AS
SELECT 
  s.id,
  s.usuario_id,
  s.comunidad_id,
  s.plan_id,
  s.estado,
  s.fecha_inicio,
  s.fecha_fin,
  s.fecha_cancelacion,
  s.razon_cancelacion,
  s.renovacion_automatica,
  s.precio_pagado,
  s.descuento_aplicado,
  s.metadata,
  s.fecha_creacion,
  s.fecha_actualizacion,
  u.email as usuario_email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as usuario_nombre,
  p.nombre as plan_nombre,
  p.precio as plan_precio,
  p.descripcion as plan_descripcion,
  p.duracion_dias as plan_duracion_dias,
  'ScaleXone' as comunidad_nombre,
  'scalexone' as comunidad_slug,
  CASE 
    WHEN s.fecha_fin < CURRENT_TIMESTAMP THEN 'vencida'
    ELSE s.estado 
  END as estado_actual
FROM suscripciones s
LEFT JOIN auth.users u ON s.usuario_id = u.id
LEFT JOIN planes_suscripcion p ON s.plan_id = p.id;

-- Verificar que todo funciona
SELECT 
  'Vista suscripciones corregida sin conflictos' as mensaje,
  (SELECT COUNT(*) FROM vista_suscripciones_activas) as total_en_vista;
