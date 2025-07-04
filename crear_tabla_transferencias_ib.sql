-- Tabla de transferencias entre cuentas IB
CREATE TABLE IF NOT EXISTS transferencias_ib (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ib_origen VARCHAR(20) NOT NULL,
    ib_destino VARCHAR(20) NOT NULL,
    user_id_origen UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    user_id_destino UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada', 'pendiente', 'cancelada')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_transferencias_ib_origen ON transferencias_ib(ib_origen);
CREATE INDEX IF NOT EXISTS idx_transferencias_ib_destino ON transferencias_ib(ib_destino);
CREATE INDEX IF NOT EXISTS idx_transferencias_ib_user_origen ON transferencias_ib(user_id_origen);
CREATE INDEX IF NOT EXISTS idx_transferencias_ib_user_destino ON transferencias_ib(user_id_destino);

-- Políticas de seguridad básicas (RLS)
ALTER TABLE transferencias_ib ENABLE ROW LEVEL SECURITY;

-- Permitir que los usuarios vean sus propias transferencias
CREATE POLICY "Usuarios pueden ver sus transferencias" ON transferencias_ib
    FOR SELECT
    USING (user_id_origen = auth.uid() OR user_id_destino = auth.uid());

-- Permitir que los usuarios creen transferencias desde su IB
CREATE POLICY "Usuarios pueden crear transferencias desde su IB" ON transferencias_ib
    FOR INSERT
    WITH CHECK (user_id_origen = auth.uid()); 