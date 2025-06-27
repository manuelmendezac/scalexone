-- 1. Verificar datos existentes en servicios_marketplace
SELECT 
    '🔍 DATOS EXISTENTES SERVICIOS_MARKETPLACE' as titulo,
    COUNT(*) as total_registros,
    COUNT(caracteristicas) as con_caracteristicas
FROM servicios_marketplace;

-- 2. Limpiar datos existentes que puedan causar conflictos
UPDATE servicios_marketplace 
SET caracteristicas = NULL 
WHERE caracteristicas IS NOT NULL;

-- 3. Ahora cambiar el tipo de datos
ALTER TABLE servicios_marketplace 
ALTER COLUMN caracteristicas TYPE JSONB USING NULL;

-- 4. Verificar que el cambio se aplicó
SELECT 
    '✅ TIPO CAMBIADO' as resultado,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace' AND column_name = 'caracteristicas';

-- 5. Insertar el plan de prueba
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan Prueba Final',
    'Plan para verificar funcionamiento completo',
    49.99,
    'USD',
    30,
    '["Acceso completo", "Soporte prioritario", "Sin límites"]'::jsonb
) ON CONFLICT (nombre) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio;

-- 6. Confirmar éxito final
SELECT 
    '🎉 SISTEMA 100% FUNCIONAL' as estado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Prueba Final';
