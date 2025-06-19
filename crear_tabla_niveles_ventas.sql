-- Eliminar la tabla si existe
DROP TABLE IF EXISTS niveles_ventas;

-- Crear la tabla niveles_ventas con la estructura correcta
CREATE TABLE niveles_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    min_ventas INTEGER NOT NULL DEFAULT 0,
    max_ventas INTEGER NOT NULL DEFAULT 0,
    descripcion TEXT,
    color VARCHAR(50) DEFAULT '#FFD700',
    icono VARCHAR(10) DEFAULT '⭐',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear un trigger para actualizar el updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_niveles_ventas_updated_at
    BEFORE UPDATE ON niveles_ventas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos niveles por defecto
INSERT INTO niveles_ventas (nombre, min_ventas, max_ventas, descripcion, color, icono)
VALUES 
    ('Nivel Básico', 0, 100, 'Nivel inicial para nuevos vendedores', '#FFD700', '⭐'),
    ('Nivel Intermedio', 101, 500, 'Vendedores con experiencia moderada', '#C0C0C0', '🌟'),
    ('Nivel Avanzado', 501, 1000, 'Vendedores experimentados', '#CD7F32', '💫'),
    ('Nivel Elite', 1001, 5000, 'Vendedores de élite', '#B9F2FF', '👑'); 