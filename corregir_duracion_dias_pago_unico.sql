-- =========================================
-- CORRECCIÓN: DURACION_DIAS PARA PAGO ÚNICO  
-- =========================================
-- Problema: duracion_dias no acepta NULL para servicios pago único
-- Solución: Permitir NULL o usar valor especial (0)

-- 1️⃣ VERIFICAR ESTRUCTURA ACTUAL
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default,
    numeric_precision
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' 
AND column_name = 'duracion_dias';

-- 2️⃣ VER RESTRICCIONES ACTUALES
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'planes_suscripcion' 
AND tc.constraint_type IN ('CHECK', 'NOT NULL');

-- 3️⃣ SOLUCIÓN: PERMITIR NULL EN DURACION_DIAS
-- Para servicios de pago único (duracion_dias = NULL significa "sin duración/permanente")
ALTER TABLE planes_suscripcion 
ALTER COLUMN duracion_dias DROP NOT NULL;

-- 4️⃣ VERIFICAR QUE EL CAMBIO SE APLICÓ
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' 
AND column_name = 'duracion_dias';

-- 5️⃣ ACTUALIZAR REGISTROS EXISTENTES DE PAGO ÚNICO (si los hay)
-- Poner NULL en duracion_dias donde sea pago único
UPDATE planes_suscripcion 
SET duracion_dias = NULL
WHERE configuracion->>'pago_unico' = 'true' 
OR configuracion->>'tipo' LIKE '%pago_unico%';

-- 6️⃣ VERIFICACIÓN FINAL
SELECT 
    id,
    nombre,
    duracion_dias,
    configuracion->>'tipo' as tipo,
    configuracion->>'pago_unico' as pago_unico
FROM planes_suscripcion
ORDER BY created_at DESC
LIMIT 10;

-- =========================================
-- RESULTADO ESPERADO:
-- ✅ duracion_dias permite NULL
-- ✅ Servicios pago único tienen duracion_dias = NULL  
-- ✅ Servicios suscripción mantienen duracion_dias numérica
-- ========================================= 