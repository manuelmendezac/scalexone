-- =====================================================
-- CORRECCIÓN DE VISTAS - SISTEMA DE SUSCRIPCIONES SCALEXONE
-- Corrige las vistas para usar la estructura correcta
-- =====================================================

-- Primero eliminar las vistas existentes para evitar conflictos
DROP VIEW IF EXISTS vista_suscripciones_activas;
DROP VIEW IF EXISTS vista_estadisticas_comunidad;

-- Recrear la vista de suscripciones activas corregida para ScaleXone
-- NOTA: comunidad_id es TEXT, no UUID, y plan_id se llama plan_id, no plan_suscripcion_id
CREATE VIEW vista_suscripciones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as usuario_nombre,
    u.email as usuario_email,
    s.comunidad_id,
    'ScaleXone' as comunidad_nombre,
    s.plan_id,
    p.nombre as plan_nombre,
    p.precio as plan_precio,
    s.estado,
    s.fecha_inicio,
    s.fecha_fin,
    s.fecha_creacion,
    s.precio_pagado,
    s.renovacion_automatica,
    CASE 
        WHEN s.fecha_fin < CURRENT_TIMESTAMP THEN 'vencida'
        ELSE s.estado 
    END as estado_actual
FROM suscripciones s
LEFT JOIN auth.users u ON s.usuario_id = u.id
LEFT JOIN planes_suscripcion p ON s.plan_id = p.id;

-- Recrear la vista de estadísticas por comunidad
-- Usar comunidad_id como TEXT y el UUID real de ScaleXone
CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid as community_id,
    'ScaleXone' as comunidad_nombre,
    COUNT(s.id) as total_suscripciones,
    COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscripciones_activas,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado ELSE 0 END), 0) as ingresos_mensuales,
    ROUND(
        (COUNT(CASE WHEN s.estado = 'activa' THEN 1 END)::decimal / 
         NULLIF(COUNT(s.id), 0) * 100), 2
    ) as tasa_retencion
FROM suscripciones s
WHERE s.comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- Mensaje de confirmación
SELECT 'Vistas de suscripciones corregidas para ScaleXone' as mensaje; 