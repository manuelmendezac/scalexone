-- =====================================================
-- CORRECCIÓN DE VISTAS - SISTEMA DE SUSCRIPCIONES
-- =====================================================

-- Primero eliminar las vistas existentes para evitar conflictos
DROP VIEW IF EXISTS vista_suscripciones_activas;
DROP VIEW IF EXISTS vista_estadisticas_organizacion;

-- Recrear la vista de suscripciones activas corregida
CREATE VIEW vista_suscripciones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    u.name as usuario_nombre,
    u.email as usuario_email,
    s.organizacion_id,
    o.nombre as organizacion_nombre,
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
JOIN usuarios u ON s.usuario_id = u.id
JOIN organizaciones o ON s.organizacion_id = o.id
JOIN planes_suscripcion p ON s.plan_id = p.id;

-- Recrear la vista de estadísticas por organización
CREATE VIEW vista_estadisticas_organizacion AS
SELECT 
    o.id as organizacion_id,
    o.nombre as organizacion_nombre,
    COUNT(s.id) as total_suscripciones,
    COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscripciones_activas,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado ELSE 0 END), 0) as ingresos_mensuales,
    ROUND(
        (COUNT(CASE WHEN s.estado = 'activa' THEN 1 END)::decimal / 
         NULLIF(COUNT(s.id), 0) * 100), 2
    ) as tasa_retencion
FROM organizaciones o
LEFT JOIN suscripciones s ON o.id = s.organizacion_id
GROUP BY o.id, o.nombre; 