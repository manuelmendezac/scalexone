-- =====================================================
-- CORRECCIÓN DE VISTAS - SISTEMA DE SUSCRIPCIONES SCALEXONE
-- Corrige las vistas para usar 'comunidades' en lugar de 'organizaciones'
-- =====================================================

-- Primero eliminar las vistas existentes para evitar conflictos
DROP VIEW IF EXISTS vista_suscripciones_activas;
DROP VIEW IF EXISTS vista_estadisticas_comunidad;

-- Recrear la vista de suscripciones activas corregida para ScaleXone
CREATE VIEW vista_suscripciones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    u.name as usuario_nombre,
    u.email as usuario_email,
    s.community_id,
    c.nombre as comunidad_nombre,
    s.plan_suscripcion_id as plan_id,
    p.nombre as plan_nombre,
    p.precio as plan_precio,
    s.estado,
    s.fecha_inicio,
    s.fecha_fin,
    s.created_at as fecha_creacion,
    s.precio_pagado,
    s.renovacion_automatica,
    CASE 
        WHEN s.fecha_fin < CURRENT_TIMESTAMP THEN 'vencida'
        ELSE s.estado 
    END as estado_actual
FROM suscripciones s
JOIN usuarios u ON s.usuario_id = u.id
JOIN comunidades c ON s.community_id = c.id
JOIN planes_suscripcion p ON s.plan_suscripcion_id = p.id;

-- Recrear la vista de estadísticas por comunidad
CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    c.id as community_id,
    c.nombre as comunidad_nombre,
    COUNT(s.id) as total_suscripciones,
    COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscripciones_activas,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado ELSE 0 END), 0) as ingresos_mensuales,
    ROUND(
        (COUNT(CASE WHEN s.estado = 'activa' THEN 1 END)::decimal / 
         NULLIF(COUNT(s.id), 0) * 100), 2
    ) as tasa_retencion
FROM comunidades c
LEFT JOIN suscripciones s ON c.id = s.community_id
GROUP BY c.id, c.nombre;

-- Mensaje de confirmación
SELECT 'Vistas de suscripciones corregidas para ScaleXone' as mensaje; 