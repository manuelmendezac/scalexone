-- =====================================================
-- FASE 1: AGREGAR PAGO ÚNICO A SERVICIOS MARKETPLACE
-- =====================================================

-- ✅ PASO 1: Agregar campo tipo_pago a servicios_marketplace
ALTER TABLE servicios_marketplace 
ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(20) DEFAULT 'suscripcion' 
CHECK (tipo_pago IN ('suscripcion', 'pago_unico'));

-- ✅ PASO 2: Agregar comentario explicativo
COMMENT ON COLUMN servicios_marketplace.tipo_pago IS 'Tipo de pago: suscripcion (recurrente) o pago_unico (una sola vez)';

-- ✅ PASO 3: Actualizar servicios existentes (mantener compatibilidad)
-- Los servicios tradicionales serán 'pago_unico' por defecto
-- Los servicios con plan_suscripcion_id serán 'suscripcion'
UPDATE servicios_marketplace 
SET tipo_pago = CASE 
  WHEN plan_suscripcion_id IS NOT NULL THEN 'suscripcion'
  ELSE 'pago_unico'
END;

-- ✅ PASO 4: Crear índice para optimización
CREATE INDEX IF NOT EXISTS idx_servicios_tipo_pago ON servicios_marketplace(tipo_pago);

-- ✅ PASO 5: Verificar cambios
SELECT 
  'Servicios Pago Único' as tipo,
  COUNT(*) as cantidad
FROM servicios_marketplace 
WHERE tipo_pago = 'pago_unico'

UNION ALL

SELECT 
  'Servicios Suscripción' as tipo,
  COUNT(*) as cantidad
FROM servicios_marketplace 
WHERE tipo_pago = 'suscripcion';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 
  titulo,
  categoria,
  tipo_producto,
  tipo_pago,
  precio,
  CASE 
    WHEN plan_suscripcion_id IS NOT NULL THEN 'Con Plan Suscripción'
    ELSE 'Sin Plan Suscripción'
  END as estado_plan
FROM servicios_marketplace 
ORDER BY created_at DESC;

COMMENT ON TABLE servicios_marketplace IS 'Tabla servicios marketplace con soporte para pago único y suscripciones'; 