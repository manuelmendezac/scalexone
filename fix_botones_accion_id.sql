-- Deshabilitar RLS temporalmente para la modificación
ALTER TABLE public.botones_accion DISABLE ROW LEVEL SECURITY;

-- Crear una tabla temporal con la estructura correcta
CREATE TABLE public.botones_accion_temp (
    id bigint primary key generated by default as identity,
    title text not null,
    url text not null,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Copiar los datos existentes
INSERT INTO public.botones_accion_temp (title, url, order_index, created_at, updated_at)
SELECT title, url, order_index, created_at, updated_at
FROM public.botones_accion;

-- Eliminar la tabla original
DROP TABLE public.botones_accion;

-- Renombrar la tabla temporal
ALTER TABLE public.botones_accion_temp RENAME TO botones_accion;

-- Recrear las políticas RLS
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON public.botones_accion FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir todas las operaciones a administradores"
ON public.botones_accion FOR ALL
TO authenticated
USING (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
);

-- Habilitar RLS nuevamente
ALTER TABLE public.botones_accion ENABLE ROW LEVEL SECURITY;

-- Recrear el trigger para updated_at
CREATE TRIGGER update_botones_accion_updated_at
    BEFORE UPDATE
    ON public.botones_accion
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 