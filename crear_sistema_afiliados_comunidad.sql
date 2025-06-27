-- =====================================================
-- SISTEMA DE AFILIADOS PARA COMUNIDAD SCALEXONE
-- Script completo para implementar marketing de afiliados
-- que atraiga contactos para unirse a la comunidad
-- =====================================================

-- 1. TABLA DE CÓDIGOS DE AFILIADO
-- =====================================
CREATE TABLE IF NOT EXISTS codigos_afiliado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre_personalizado VARCHAR(100),
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  clicks_totales INTEGER DEFAULT 0,
  conversiones_totales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE CLICKS EN ENLACES DE AFILIADO
-- ==========================================
CREATE TABLE IF NOT EXISTS clicks_afiliado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_afiliado_id UUID REFERENCES codigos_afiliado(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  dispositivo VARCHAR(50),
  navegador VARCHAR(50),
  convertido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE CONVERSIONES (REGISTROS EN COMUNIDAD)
-- ==================================================
CREATE TABLE IF NOT EXISTS conversiones_afiliado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_afiliado_id UUID REFERENCES codigos_afiliado(id) ON DELETE CASCADE,
  click_id UUID REFERENCES clicks_afiliado(id) ON DELETE SET NULL,
  nuevo_usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_conversion VARCHAR(50) DEFAULT 'registro_comunidad', -- registro_comunidad, suscripcion_premium, compra_curso
  valor_conversion DECIMAL(10,2) DEFAULT 0,
  comision_generada DECIMAL(10,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmada, pagada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE COMISIONES POR AFILIADO
-- ====================================
CREATE TABLE IF NOT EXISTS comisiones_afiliado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES conversiones_afiliado(id) ON DELETE CASCADE,
  tipo_comision VARCHAR(50) NOT NULL, -- registro, premium, curso, servicio
  monto DECIMAL(10,2) NOT NULL,
  porcentaje_aplicado DECIMAL(5,2),
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobada, pagada
  fecha_pago DATE,
  metodo_pago VARCHAR(50),
  referencia_pago VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE CONFIGURACIÓN DE COMISIONES
-- ========================================
CREATE TABLE IF NOT EXISTS config_comisiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_evento VARCHAR(50) UNIQUE NOT NULL,
  monto_fijo DECIMAL(10,2) DEFAULT 0,
  porcentaje DECIMAL(5,2) DEFAULT 0,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERTAR CONFIGURACIÓN INICIAL DE COMISIONES
-- ================================================
INSERT INTO config_comisiones (tipo_evento, monto_fijo, porcentaje, descripcion) VALUES
('registro_comunidad', 5.00, 0, 'Comisión por cada nuevo registro en la comunidad'),
('suscripcion_premium', 0, 30.00, '30% de comisión por suscripción premium'),
('compra_curso_marketplace', 0, 25.00, '25% de comisión por compra de curso'),
('compra_servicio_marketplace', 0, 20.00, '20% de comisión por compra de servicio'),
('renovacion_suscripcion', 0, 15.00, '15% de comisión por renovación de suscripción')
ON CONFLICT (tipo_evento) DO NOTHING;

-- 7. FUNCIÓN PARA GENERAR CÓDIGO DE AFILIADO ÚNICO
-- =================================================
CREATE OR REPLACE FUNCTION generar_codigo_afiliado(user_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  base_codigo VARCHAR(20);
  final_codigo VARCHAR(20);
  counter INTEGER := 1;
BEGIN
  -- Obtener nombre de usuario o usar ID
  SELECT COALESCE(
    UPPER(SUBSTRING(raw_user_meta_data->>'full_name' FROM 1 FOR 8)),
    UPPER(SUBSTRING(CAST(user_uuid AS TEXT) FROM 1 FOR 8))
  ) INTO base_codigo
  FROM auth.users WHERE id = user_uuid;
  
  -- Limpiar caracteres especiales
  base_codigo := REGEXP_REPLACE(base_codigo, '[^A-Z0-9]', '', 'g');
  
  -- Asegurar longitud mínima
  IF LENGTH(base_codigo) < 4 THEN
    base_codigo := base_codigo || SUBSTRING(CAST(user_uuid AS TEXT) FROM 1 FOR 8 - LENGTH(base_codigo));
  END IF;
  
  final_codigo := SUBSTRING(base_codigo FROM 1 FOR 8);
  
  -- Verificar unicidad
  WHILE EXISTS (SELECT 1 FROM codigos_afiliado WHERE codigo = final_codigo) LOOP
    final_codigo := SUBSTRING(base_codigo FROM 1 FOR 6) || LPAD(counter::TEXT, 2, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_codigo;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA REGISTRAR CLICK EN ENLACE
-- ==========================================
CREATE OR REPLACE FUNCTION registrar_click_afiliado(
  p_codigo VARCHAR(20),
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_utm_source VARCHAR(100) DEFAULT NULL,
  p_utm_medium VARCHAR(100) DEFAULT NULL,
  p_utm_campaign VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  codigo_id UUID;
  click_id UUID;
BEGIN
  -- Obtener ID del código de afiliado
  SELECT id INTO codigo_id 
  FROM codigos_afiliado 
  WHERE codigo = p_codigo AND activo = true;
  
  IF codigo_id IS NULL THEN
    RAISE EXCEPTION 'Código de afiliado no válido: %', p_codigo;
  END IF;
  
  -- Registrar click
  INSERT INTO clicks_afiliado (
    codigo_afiliado_id, ip_address, user_agent, referrer,
    utm_source, utm_medium, utm_campaign
  ) VALUES (
    codigo_id, p_ip_address, p_user_agent, p_referrer,
    p_utm_source, p_utm_medium, p_utm_campaign
  ) RETURNING id INTO click_id;
  
  -- Actualizar contador de clicks
  UPDATE codigos_afiliado 
  SET clicks_totales = clicks_totales + 1,
      updated_at = NOW()
  WHERE id = codigo_id;
  
  RETURN click_id;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN PARA REGISTRAR CONVERSIÓN
-- =====================================
CREATE OR REPLACE FUNCTION registrar_conversion_afiliado(
  p_codigo VARCHAR(20),
  p_nuevo_usuario_id UUID,
  p_tipo_conversion VARCHAR(50) DEFAULT 'registro_comunidad',
  p_valor_conversion DECIMAL(10,2) DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  codigo_id UUID;
  afiliado_user_id UUID;
  click_id UUID;
  conversion_id UUID;
  comision_config RECORD;
  monto_comision DECIMAL(10,2);
BEGIN
  -- Obtener información del código de afiliado
  SELECT ca.id, ca.user_id INTO codigo_id, afiliado_user_id
  FROM codigos_afiliado ca
  WHERE ca.codigo = p_codigo AND ca.activo = true;
  
  IF codigo_id IS NULL THEN
    RAISE EXCEPTION 'Código de afiliado no válido: %', p_codigo;
  END IF;
  
  -- Buscar click reciente del mismo usuario (últimas 24 horas)
  SELECT c.id INTO click_id
  FROM clicks_afiliado c
  WHERE c.codigo_afiliado_id = codigo_id
    AND c.created_at > NOW() - INTERVAL '24 hours'
    AND c.convertido = false
  ORDER BY c.created_at DESC
  LIMIT 1;
  
  -- Obtener configuración de comisión
  SELECT * INTO comision_config
  FROM config_comisiones
  WHERE tipo_evento = p_tipo_conversion AND activo = true;
  
  -- Calcular comisión
  IF comision_config.monto_fijo > 0 THEN
    monto_comision := comision_config.monto_fijo;
  ELSIF comision_config.porcentaje > 0 AND p_valor_conversion > 0 THEN
    monto_comision := (p_valor_conversion * comision_config.porcentaje / 100);
  ELSE
    monto_comision := 0;
  END IF;
  
  -- Registrar conversión
  INSERT INTO conversiones_afiliado (
    codigo_afiliado_id, click_id, nuevo_usuario_id,
    tipo_conversion, valor_conversion, comision_generada
  ) VALUES (
    codigo_id, click_id, p_nuevo_usuario_id,
    p_tipo_conversion, p_valor_conversion, monto_comision
  ) RETURNING id INTO conversion_id;
  
  -- Crear comisión si aplica
  IF monto_comision > 0 THEN
    INSERT INTO comisiones_afiliado (
      user_id, conversion_id, tipo_comision, monto, porcentaje_aplicado
    ) VALUES (
      afiliado_user_id, conversion_id, p_tipo_conversion, 
      monto_comision, comision_config.porcentaje
    );
  END IF;
  
  -- Marcar click como convertido
  IF click_id IS NOT NULL THEN
    UPDATE clicks_afiliado SET convertido = true WHERE id = click_id;
  END IF;
  
  -- Actualizar contador de conversiones
  UPDATE codigos_afiliado 
  SET conversiones_totales = conversiones_totales + 1,
      updated_at = NOW()
  WHERE id = codigo_id;
  
  RETURN conversion_id;
END;
$$ LANGUAGE plpgsql;

-- 10. VISTA PARA ESTADÍSTICAS DE AFILIADOS
-- =========================================
CREATE OR REPLACE VIEW estadisticas_afiliado AS
SELECT 
  ca.user_id,
  ca.codigo,
  ca.nombre_personalizado,
  ca.clicks_totales,
  ca.conversiones_totales,
  CASE 
    WHEN ca.clicks_totales > 0 
    THEN ROUND((ca.conversiones_totales::DECIMAL / ca.clicks_totales * 100), 2)
    ELSE 0 
  END as tasa_conversion,
  COALESCE(SUM(com.monto), 0) as total_comisiones,
  COALESCE(SUM(CASE WHEN com.estado = 'pendiente' THEN com.monto ELSE 0 END), 0) as comisiones_pendientes,
  COALESCE(SUM(CASE WHEN com.estado = 'pagada' THEN com.monto ELSE 0 END), 0) as comisiones_pagadas,
  COUNT(DISTINCT conv.nuevo_usuario_id) as usuarios_referidos,
  ca.created_at,
  ca.activo
FROM codigos_afiliado ca
LEFT JOIN conversiones_afiliado conv ON ca.id = conv.codigo_afiliado_id
LEFT JOIN comisiones_afiliado com ON conv.id = com.conversion_id
GROUP BY ca.id, ca.user_id, ca.codigo, ca.nombre_personalizado, 
         ca.clicks_totales, ca.conversiones_totales, ca.created_at, ca.activo;

-- 11. TRIGGERS PARA TIMESTAMPS
-- =============================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_codigos_afiliado_timestamp
  BEFORE UPDATE ON codigos_afiliado
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_comisiones_afiliado_timestamp
  BEFORE UPDATE ON comisiones_afiliado
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 12. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =======================================
ALTER TABLE codigos_afiliado ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks_afiliado ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversiones_afiliado ENABLE ROW LEVEL SECURITY;
ALTER TABLE comisiones_afiliado ENABLE ROW LEVEL SECURITY;

-- Políticas para codigos_afiliado
CREATE POLICY "Usuarios pueden ver sus propios códigos" ON codigos_afiliado
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios códigos" ON codigos_afiliado
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios códigos" ON codigos_afiliado
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para comisiones_afiliado
CREATE POLICY "Usuarios pueden ver sus propias comisiones" ON comisiones_afiliado
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para clicks (solo lectura por función)
CREATE POLICY "Clicks son públicos para funciones" ON clicks_afiliado
  FOR ALL USING (true);

-- Políticas para conversiones (solo lectura por función)
CREATE POLICY "Conversiones son públicas para funciones" ON conversiones_afiliado
  FOR ALL USING (true);

-- 13. DATOS INICIALES PARA PRUEBAS
-- =================================
-- Crear código de afiliado para usuario admin (si existe)
DO $$
DECLARE
  admin_user_id UUID;
  codigo_generado VARCHAR(20);
BEGIN
  -- Buscar usuario admin
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@scalexone.com' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Generar código para admin
    codigo_generado := generar_codigo_afiliado(admin_user_id);
    
    INSERT INTO codigos_afiliado (user_id, codigo, nombre_personalizado, descripcion)
    VALUES (
      admin_user_id, 
      codigo_generado, 
      'Enlace Principal ScaleXone',
      'Enlace principal para atraer nuevos miembros a la comunidad ScaleXone'
    );
    
    RAISE NOTICE 'Código de afiliado creado para admin: %', codigo_generado;
  END IF;
END $$;

-- 14. ÍNDICES PARA OPTIMIZACIÓN
-- ==============================
CREATE INDEX IF NOT EXISTS idx_codigos_afiliado_codigo ON codigos_afiliado(codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_afiliado_user_id ON codigos_afiliado(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_afiliado_codigo_id ON clicks_afiliado(codigo_afiliado_id);
CREATE INDEX IF NOT EXISTS idx_clicks_afiliado_created_at ON clicks_afiliado(created_at);
CREATE INDEX IF NOT EXISTS idx_conversiones_afiliado_codigo_id ON conversiones_afiliado(codigo_afiliado_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_afiliado_user_id ON comisiones_afiliado(user_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_afiliado_estado ON comisiones_afiliado(estado);

-- 15. VERIFICACIÓN FINAL
-- =======================
SELECT 
  'codigos_afiliado' as tabla, COUNT(*) as registros 
FROM codigos_afiliado
UNION ALL
SELECT 
  'config_comisiones' as tabla, COUNT(*) as registros 
FROM config_comisiones
UNION ALL
SELECT 
  'Sistema de afiliados' as tabla, 1 as registros;

-- =====================================================
-- SISTEMA DE AFILIADOS PARA COMUNIDAD COMPLETADO
-- ===================================================== 