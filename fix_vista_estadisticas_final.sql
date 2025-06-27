-- =====================================================
-- CORRECCIÓN FINAL VISTA ESTADÍSTICAS - SCALEXONE
-- Corrige el error: column vista_estadisticas_.comunidad.comunidad_id does not exist
-- =====================================================

-- Eliminar la vista problemática
DROP VIEW IF EXISTS vista_estadisticas_comunidad;

-- Recrear la vista de estadísticas simplificada
CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid as community_id,
    'ScaleXone' as nombre,
    COALESCE(COUNT(s.id), 0) as total_suscripciones,
    COALESCE(COUNT(CASE WHEN s.estado = 'activa' THEN 1 END), 0) as suscripciones_activas,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN COALESCE(s.precio_pagado, 0) ELSE 0 END), 0) as ingresos_mensuales,
    COALESCE(
        ROUND(
            (COUNT(CASE WHEN s.estado = 'activa' THEN 1 END)::decimal / 
             NULLIF(COUNT(s.id), 0) * 100), 2
        ), 0
    ) as tasa_retencion
FROM suscripciones s
WHERE s.comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
   OR s.comunidad_id IS NULL  -- Incluir suscripciones sin comunidad asignada
GROUP BY 1, 2;

-- Mensaje de confirmación
SELECT 'Vista estadísticas corregida - error comunidad_id solucionado' as mensaje; 