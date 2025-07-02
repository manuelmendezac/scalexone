-- Tabla profesional de ventas para historial y reportes
CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id),
  producto_id uuid NOT NULL,
  tipo_producto VARCHAR(30) NOT NULL, -- curso, servicio, software, etc.
  monto NUMERIC(12,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'USD',
  estado VARCHAR(20) DEFAULT 'confirmada', -- confirmada, pendiente, cancelada
  metodo_pago VARCHAR(30) DEFAULT 'stripe', -- stripe, paypal, etc.
  referencia_externa VARCHAR(100), -- id de Stripe, PayPal, etc.
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_ventas_usuario_id ON ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_producto_id ON ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago); 