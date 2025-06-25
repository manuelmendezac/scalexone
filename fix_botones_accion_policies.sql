-- Primero, eliminar las políticas existentes para evitar conflictos
drop policy if exists "Permitir lectura a usuarios autenticados" on public.botones_accion;
drop policy if exists "Permitir todas las operaciones a administradores" on public.botones_accion;

-- Política para permitir lectura a todos los usuarios autenticados
create policy "Permitir lectura a usuarios autenticados"
on public.botones_accion for select
to authenticated
using (true);

-- Política para permitir inserción a administradores
create policy "Permitir inserción a administradores"
on public.botones_accion for insert
to authenticated
with check (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
);

-- Política para permitir actualización a administradores
create policy "Permitir actualización a administradores"
on public.botones_accion for update
to authenticated
using (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
)
with check (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
);

-- Política para permitir eliminación a administradores
create policy "Permitir eliminación a administradores"
on public.botones_accion for delete
to authenticated
using (
    exists (
        select 1
        from public.usuarios u
        where u.id = auth.uid()
        and (u.rol = 'admin' or u.rol = 'superadmin')
    )
);

-- Asegurarse de que RLS está habilitado
alter table public.botones_accion enable row level security; 