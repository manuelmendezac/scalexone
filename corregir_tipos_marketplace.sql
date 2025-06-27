-- 1. Verificar tipos de datos en servicios_marketplace
SELECT 
    '🔍 TIPOS SERVICIOS_MARKETPLACE' as titulo,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace' 
AND column_name IN ('caracteristicas', 'niveles_comision', 'comision_nivel1', 'comision_nivel2', 'comision_nivel3');

-- 2. Corregir tipos de datos para compatibilidad
ALTER TABLE servicios_marketplace 
ALTER COLUMN caracteristicas TYPE JSONB USING 
    CASE 
        WHEN caracteristicas IS NULL THEN NULL
        WHEN caracteristicas::text = '{}' THEN '[]'::jsonb
        ELSE caracteristicas::jsonb
    END;

-- 3. Ahora insertar el plan (debería funcionar sin errores)
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

-- 4. Verificar que todo funciona
SELECT 
    '🎉 ÉXITO TOTAL' as resultado,
    COUNT(*) as planes_scalexone
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- 5. Mostrar todos los planes de ScaleXone
SELECT 
    '📊 PLANES SCALEXONE FINALES' as titulo,
    nombre,
    precio,
    moneda,
    caracteristicas
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
ORDER BY precio;
