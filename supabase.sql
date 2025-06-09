-- Tabla de usuarios
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  rol text default 'afiliado'
);

-- Tabla de membresías
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio decimal,
  descripcion text
);

-- Insertar membresías sugeridas
insert into memberships (nombre, precio, descripcion) values
  ('Pro', null, 'Membresía Pro'),
  ('Business', null, 'Membresía Business'),
  ('White Label', null, 'Membresía White Label')
  on conflict (nombre) do nothing;

-- Tabla de ventas
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default now(),
  user_id uuid references users(id),
  membership_id uuid references memberships(id),
  afiliado_id uuid references users(id),
  estado text default 'confirmada',
  monto decimal
);

-- Tabla de comisiones
create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id),
  afiliado_id uuid references users(id),
  monto decimal,
  estado text default 'pendiente',
  fecha date not null default now()
);

-- Trigger para calcular comisión al 25% al insertar una venta confirmada
create or replace function crear_comision_venta()
returns trigger as $$
begin
  if NEW.estado = 'confirmada' then
    insert into commissions (sale_id, afiliado_id, monto, estado, fecha)
    values (NEW.id, NEW.afiliado_id, NEW.monto * 0.25, 'pendiente', NEW.fecha);
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_crear_comision_venta on sales;
create trigger trigger_crear_comision_venta
  after insert on sales
  for each row execute function crear_comision_venta(); 