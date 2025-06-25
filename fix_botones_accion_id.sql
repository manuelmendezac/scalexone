-- Primero, eliminar la restricción de identity
ALTER TABLE public.botones_accion
ALTER COLUMN id DROP IDENTITY IF EXISTS;

-- Luego, modificar la columna para que sea simplemente bigint
ALTER TABLE public.botones_accion
ALTER COLUMN id TYPE bigint;

-- Agregar la restricción de primary key si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'botones_accion_pkey'
    ) THEN
        ALTER TABLE public.botones_accion
        ADD PRIMARY KEY (id);
    END IF;
END $$; 