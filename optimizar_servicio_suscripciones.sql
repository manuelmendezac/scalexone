-- Script para optimizar el servicio de suscripciones
-- Ejecutar después del script de actualización de planes

-- 1. Crear función para obtener estadísticas mejoradas
CREATE OR REPLACE FUNCTION get_estadisticas_comunidad_completas(p_comunidad_id UUID)
RETURNS TABLE (
    comunidad_id UUID,
    comunidad_nombre TEXT,
    comunidad_slug TEXT,
    total_suscriptores BIGINT,
    suscriptores_activos BIGINT,
    suscriptores_trial BIGINT,
    suscriptores_pausados BIGINT,
    suscriptores_cancelados BIGINT,
    total_planes BIGINT,
    planes_activos BIGINT,
    ingresos_totales DECIMAL(10,2),
    ingresos_mes_actual DECIMAL(10,2),
    ingresos_mes_anterior DECIMAL(10,2),
    crecimiento_mensual DECIMAL(5,2),
    plan_mas_popular TEXT,
    tasa_conversion DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    mes_actual_inicio DATE;
    mes_anterior_inicio DATE;
    mes_anterior_fin DATE;
BEGIN
    -- Calcular fechas para métricas mensuales
    mes_actual_inicio := DATE_TRUNC('month', CURRENT_DATE);
    mes_anterior_inicio := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    mes_anterior_fin := mes_actual_inicio - INTERVAL '1 day';
    
    RETURN QUERY
    WITH estadisticas_base AS (
        SELECT 
            c.id as comunidad_id,
            c.nombre as comunidad_nombre,
            c.slug as comunidad_slug,
            
            -- Contar suscriptores por estado
            COUNT(s.id) as total_suscriptores,
            COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscriptores_activos,
            COUNT(CASE WHEN s.estado = 'trial' THEN 1 END) as suscriptores_trial,
            COUNT(CASE WHEN s.estado = 'pausada' THEN 1 END) as suscriptores_pausados,
            COUNT(CASE WHEN s.estado = 'cancelada' THEN 1 END) as suscriptores_cancelados,
            
            -- Contar planes
            (SELECT COUNT(*) FROM planes_suscripcion p WHERE p.comunidad_id = c.id) as total_planes,
            (SELECT COUNT(*) FROM planes_suscripcion p WHERE p.comunidad_id = c.id AND p.activo = true) as planes_activos,
            
            -- Ingresos totales
            COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado END), 0) as ingresos_totales,
            
            -- Ingresos mes actual
            COALESCE(SUM(CASE 
                WHEN s.estado = 'activa' AND s.fecha_creacion >= mes_actual_inicio 
                THEN s.precio_pagado 
            END), 0) as ingresos_mes_actual,
            
            -- Ingresos mes anterior
            COALESCE(SUM(CASE 
                WHEN s.estado = 'activa' 
                AND s.fecha_creacion >= mes_anterior_inicio 
                AND s.fecha_creacion <= mes_anterior_fin
                THEN s.precio_pagado 
            END), 0) as ingresos_mes_anterior
            
        FROM comunidades c
        LEFT JOIN suscripciones s ON s.comunidad_id = c.id
        WHERE c.id = p_comunidad_id
        GROUP BY c.id, c.nombre, c.slug
    ),
    plan_popular AS (
        SELECT p.nombre as plan_mas_popular
        FROM planes_suscripcion p
        JOIN suscripciones s ON s.plan_id = p.id
        WHERE p.comunidad_id = p_comunidad_id
        AND s.estado = 'activa'
        GROUP BY p.id, p.nombre
        ORDER BY COUNT(s.id) DESC
        LIMIT 1
    )
    SELECT 
        eb.comunidad_id,
        eb.comunidad_nombre,
        eb.comunidad_slug,
        eb.total_suscriptores,
        eb.suscriptores_activos,
        eb.suscriptores_trial,
        eb.suscriptores_pausados,
        eb.suscriptores_cancelados,
        eb.total_planes,
        eb.planes_activos,
        eb.ingresos_totales,
        eb.ingresos_mes_actual,
        eb.ingresos_mes_anterior,
        
        -- Calcular crecimiento mensual
        CASE 
            WHEN eb.ingresos_mes_anterior > 0 THEN
                ROUND(((eb.ingresos_mes_actual - eb.ingresos_mes_anterior) / eb.ingresos_mes_anterior * 100)::DECIMAL, 2)
            ELSE 0
        END as crecimiento_mensual,
        
        COALESCE(pp.plan_mas_popular, 'Sin datos') as plan_mas_popular,
        
        -- Calcular tasa de conversión (activos / total)
        CASE 
            WHEN eb.total_suscriptores > 0 THEN
                ROUND((eb.suscriptores_activos::DECIMAL / eb.total_suscriptores * 100)::DECIMAL, 2)
            ELSE 0
        END as tasa_conversion
        
    FROM estadisticas_base eb
    LEFT JOIN plan_popular pp ON true;
END;
$$;

-- 2. Función para validar y procesar pruebas gratis vencidas
CREATE OR REPLACE FUNCTION procesar_pruebas_vencidas()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    suscripciones_actualizadas INTEGER := 0;
BEGIN
    -- Actualizar suscripciones trial vencidas
    UPDATE suscripciones 
    SET estado = 'vencida',
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE estado = 'trial' 
    AND fecha_fin < CURRENT_DATE;
    
    GET DIAGNOSTICS suscripciones_actualizadas = ROW_COUNT;
    
    RETURN suscripciones_actualizadas;
END;
$$;

-- 3. Función para aplicar descuentos automáticamente
CREATE OR REPLACE FUNCTION aplicar_descuento_a_suscripcion(
    p_suscripcion_id UUID,
    p_codigo_descuento TEXT
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    descuento_record RECORD;
    precio_original DECIMAL(10,2);
    precio_con_descuento DECIMAL(10,2);
    descuento_aplicado DECIMAL(10,2);
BEGIN
    -- Obtener información del descuento
    SELECT * INTO descuento_record
    FROM codigos_descuento cd
    WHERE cd.codigo = UPPER(TRIM(p_codigo_descuento))
    AND cd.activo = true
    AND (cd.fecha_fin IS NULL OR cd.fecha_fin >= CURRENT_DATE)
    AND (cd.usos_maximos IS NULL OR cd.usos_actuales < cd.usos_maximos);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Código de descuento inválido o vencido';
    END IF;
    
    -- Obtener precio original de la suscripción
    SELECT s.precio_pagado INTO precio_original
    FROM suscripciones s
    WHERE s.id = p_suscripcion_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Suscripción no encontrada';
    END IF;
    
    -- Calcular descuento
    IF descuento_record.tipo = 'porcentaje' THEN
        descuento_aplicado := precio_original * (descuento_record.valor / 100);
    ELSE -- monto_fijo
        descuento_aplicado := descuento_record.valor;
    END IF;
    
    -- Asegurar que el descuento no sea mayor al precio
    descuento_aplicado := LEAST(descuento_aplicado, precio_original);
    precio_con_descuento := precio_original - descuento_aplicado;
    
    -- Actualizar suscripción
    UPDATE suscripciones 
    SET precio_pagado = precio_con_descuento,
        descuento_aplicado = descuento_aplicado,
        metadata = COALESCE(metadata, '{}') || jsonb_build_object('codigo_descuento', p_codigo_descuento),
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = p_suscripcion_id;
    
    -- Incrementar uso del código
    UPDATE codigos_descuento 
    SET usos_actuales = usos_actuales + 1
    WHERE codigo = descuento_record.codigo;
    
    RETURN precio_con_descuento;
END;
$$;

-- 4. Función para obtener métricas de retención
CREATE OR REPLACE FUNCTION get_metricas_retencion(p_comunidad_id UUID, p_meses INTEGER DEFAULT 12)
RETURNS TABLE (
    mes TEXT,
    nuevos_suscriptores INTEGER,
    cancelaciones INTEGER,
    reactivaciones INTEGER,
    tasa_retencion DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH meses_serie AS (
        SELECT 
            DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL) as mes_inicio,
            TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL), 'YYYY-MM') as mes_nombre
        FROM generate_series(0, p_meses - 1) n
        ORDER BY mes_inicio DESC
    ),
    metricas_por_mes AS (
        SELECT 
            ms.mes_nombre,
            ms.mes_inicio,
            
            -- Nuevos suscriptores
            COUNT(CASE 
                WHEN s.fecha_creacion >= ms.mes_inicio 
                AND s.fecha_creacion < ms.mes_inicio + INTERVAL '1 month'
                THEN 1 
            END) as nuevos,
            
            -- Cancelaciones
            COUNT(CASE 
                WHEN s.fecha_cancelacion >= ms.mes_inicio 
                AND s.fecha_cancelacion < ms.mes_inicio + INTERVAL '1 month'
                THEN 1 
            END) as cancelaciones,
            
            -- Reactivaciones (suscripciones que fueron canceladas y luego reactivadas)
            COUNT(CASE 
                WHEN s.estado = 'activa'
                AND s.fecha_actualizacion >= ms.mes_inicio 
                AND s.fecha_actualizacion < ms.mes_inicio + INTERVAL '1 month'
                AND s.fecha_cancelacion IS NOT NULL
                THEN 1 
            END) as reactivaciones,
            
            -- Total activos al final del mes
            COUNT(CASE 
                WHEN s.estado = 'activa' 
                AND s.fecha_creacion < ms.mes_inicio + INTERVAL '1 month'
                AND (s.fecha_cancelacion IS NULL OR s.fecha_cancelacion >= ms.mes_inicio + INTERVAL '1 month')
                THEN 1 
            END) as activos_fin_mes,
            
            -- Total activos al inicio del mes
            COUNT(CASE 
                WHEN s.estado = 'activa' 
                AND s.fecha_creacion < ms.mes_inicio
                AND (s.fecha_cancelacion IS NULL OR s.fecha_cancelacion >= ms.mes_inicio)
                THEN 1 
            END) as activos_inicio_mes
            
        FROM meses_serie ms
        LEFT JOIN suscripciones s ON s.comunidad_id = p_comunidad_id
        GROUP BY ms.mes_nombre, ms.mes_inicio
    )
    SELECT 
        mpm.mes_nombre::TEXT,
        mpm.nuevos::INTEGER,
        mpm.cancelaciones::INTEGER,
        mpm.reactivaciones::INTEGER,
        CASE 
            WHEN mpm.activos_inicio_mes > 0 THEN
                ROUND(((mpm.activos_fin_mes::DECIMAL / mpm.activos_inicio_mes) * 100)::DECIMAL, 2)
            ELSE 0
        END as tasa_retencion
    FROM metricas_por_mes mpm
    ORDER BY mpm.mes_inicio DESC;
END;
$$;

-- 5. Trigger para notificaciones automáticas de vencimiento
CREATE OR REPLACE FUNCTION notificar_vencimientos_proximos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la suscripción vence en 7 días, crear notificación
    IF NEW.fecha_fin <= CURRENT_DATE + INTERVAL '7 days' 
       AND NEW.fecha_fin > CURRENT_DATE 
       AND NEW.estado = 'activa' THEN
        
        INSERT INTO notificaciones_sistema (
            usuario_id,
            tipo,
            titulo,
            mensaje,
            datos,
            fecha_creacion
        ) VALUES (
            NEW.usuario_id,
            'suscripcion_vencimiento',
            'Su suscripción vence pronto',
            'Su suscripción vencerá el ' || NEW.fecha_fin::TEXT || '. Renueve para continuar disfrutando del servicio.',
            jsonb_build_object(
                'suscripcion_id', NEW.id,
                'fecha_vencimiento', NEW.fecha_fin,
                'plan_id', NEW.plan_id
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS notificaciones_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT,
    datos JSONB DEFAULT '{}',
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP
);

-- Crear trigger para notificaciones
DROP TRIGGER IF EXISTS trigger_notificar_vencimientos ON suscripciones;
CREATE TRIGGER trigger_notificar_vencimientos
    AFTER UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION notificar_vencimientos_proximos();

-- 6. Índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_fin ON suscripciones(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado_fecha ON suscripciones(estado, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_suscripciones_comunidad_estado ON suscripciones(comunidad_id, estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario_estado ON suscripciones(usuario_id, estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida ON notificaciones_sistema(usuario_id, leida);

-- 7. Vista materializada para estadísticas rápidas (opcional)
DROP MATERIALIZED VIEW IF EXISTS vista_estadisticas_comunidades;
CREATE MATERIALIZED VIEW vista_estadisticas_comunidades AS
SELECT 
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    c.slug as comunidad_slug,
    COUNT(s.id) as total_suscriptores,
    COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscriptores_activos,
    COUNT(p.id) as total_planes,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado END), 0) as ingresos_totales,
    DATE_TRUNC('month', CURRENT_DATE) as periodo_calculo
FROM comunidades c
LEFT JOIN suscripciones s ON s.comunidad_id = c.id
LEFT JOIN planes_suscripcion p ON p.comunidad_id = c.id
GROUP BY c.id, c.nombre, c.slug;

-- Crear índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_vista_estadisticas_comunidad ON vista_estadisticas_comunidades(comunidad_id);

-- 8. Función para refrescar estadísticas (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION refresh_estadisticas_comunidades()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY vista_estadisticas_comunidades;
    RETURN 'Estadísticas actualizadas: ' || CURRENT_TIMESTAMP;
END;
$$;

-- 9. Limpieza de datos huérfanos y optimización
DO $$
BEGIN
    -- Limpiar suscripciones sin usuario válido
    DELETE FROM suscripciones 
    WHERE usuario_id NOT IN (SELECT id FROM usuarios);
    
    -- Limpiar notificaciones antiguas (más de 6 meses)
    DELETE FROM notificaciones_sistema 
    WHERE fecha_creacion < CURRENT_DATE - INTERVAL '6 months';
    
    -- Actualizar estadísticas de las tablas
    ANALYZE suscripciones;
    ANALYZE planes_suscripcion;
    ANALYZE comunidades;
    
    RAISE NOTICE 'Limpieza y optimización completada';
END $$;

-- 10. Verificación final
SELECT 
    'Optimización completada' as status,
    COUNT(*) as total_planes,
    (SELECT COUNT(*) FROM suscripciones) as total_suscripciones,
    (SELECT COUNT(*) FROM comunidades) as total_comunidades
FROM planes_suscripcion; 