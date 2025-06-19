-- Eliminar todos los niveles de ventas actuales
DELETE FROM niveles_ventas;

-- Reiniciar la secuencia si existe
ALTER SEQUENCE IF EXISTS niveles_ventas_id_seq RESTART WITH 1; 