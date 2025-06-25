-- Crear tabla para los botones de acción
create table if not exists public.botones_accion (
    id bigint primary key generated always as identity,
    title text not null,
    url text not null,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear política RLS para permitir lectura a todos los usuarios autenticados
create policy "Permitir lectura a usuarios autenticados"
on public.botones_accion for select
to authenticated
using (true);

-- Crear política RLS para permitir inserción/actualización/eliminación solo a administradores
create policy "Permitir todas las operaciones a administradores"
on public.botones_accion for all
to authenticated
using (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
);

-- Habilitar RLS
alter table public.botones_accion enable row level security;

-- Crear función para actualizar el updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Crear trigger para actualizar el updated_at
create trigger update_botones_accion_updated_at
    before update
    on public.botones_accion
    for each row
    execute function public.update_updated_at_column(); 