-- Tabla de usuarios
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  rol text default 'afiliado',
  community_id text default 'default'
);

-- Tabla de configuración del menú secundario por comunidad
create table if not exists menu_secundario_config (
  id uuid primary key default gen_random_uuid(),
  community_id text not null unique,
  config jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices para mejorar el rendimiento
create index if not exists idx_users_community_id on users(community_id);
create index if not exists idx_menu_secundario_config_community_id on menu_secundario_config(community_id);

-- Insertar configuración por defecto para la comunidad 'default'
insert into menu_secundario_config (community_id, config) 
values ('default', '[
  {"id": "home", "label": "Inicio", "icon": "🏠", "path": "/home", "visible": true, "orden": 1},
  {"id": "clasificacion", "label": "Clasificación", "icon": "📊", "path": "/clasificacion", "visible": true, "orden": 2},
  {"id": "classroom", "label": "Classroom", "icon": "🎓", "path": "/classroom", "visible": true, "orden": 3},
  {"id": "cursos", "label": "Cursos", "icon": "📚", "path": "/cursos", "visible": true, "orden": 4},
  {"id": "launchpad", "label": "Launchpad", "icon": "🚀", "path": "/launchpad", "visible": true, "orden": 5},
  {"id": "comunidad", "label": "Comunidad", "icon": "👥", "path": "/comunidad", "visible": true, "orden": 6},
  {"id": "funnels", "label": "Embudos", "icon": "🫧", "path": "/funnels", "visible": true, "orden": 7},
  {"id": "ia", "label": "IA", "icon": "🤖", "path": "/ia", "visible": true, "orden": 8},
  {"id": "automatizaciones", "label": "Automatizaciones", "icon": "⚙️", "path": "/automatizaciones", "visible": true, "orden": 9},
  {"id": "whatsapp-crm", "label": "WhatsApp CRM", "icon": "💬", "path": "/whatsapp-crm", "visible": true, "orden": 10},
  {"id": "configuracion", "label": "Configuración", "icon": "🔧", "path": "/configuracion", "visible": true, "orden": 11}
]'::jsonb)
on conflict (community_id) do nothing;

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
on conflict do nothing;

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

-- Función para obtener el ranking de un usuario por su email
create or replace function get_user_rank(user_email text)
returns integer
language plpgsql
as $$
declare
  user_rank integer;
begin
  select rank
  into user_rank
  from (
    select email,
           rank() over (order by xp desc) as rank
    from usuarios
  ) ranked
  where email = user_email;
  
  return user_rank;
end;
$$;

-- Tabla de niveles de ventas
create table if not exists niveles_ventas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  min_ventas integer not null,
  max_ventas integer not null,
  descripcion text,
  icono text default '🏆',
  color text default '#FFD700',
  community_id text default 'default',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de progreso de ventas por usuario
create table if not exists progreso_ventas_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references users(id),
  nivel_actual uuid references niveles_ventas(id),
  ventas_acumuladas decimal default 0,
  ultima_venta timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(usuario_id)
);

-- Insertar niveles por defecto
insert into niveles_ventas (nombre, min_ventas, max_ventas, descripcion, community_id) values
  ('Starter', 0, 999, 'Nivel inicial', 'default'),
  ('Affiliate', 1000, 4999, 'Afiliado activo', 'default'),
  ('Achiever', 5000, 9999, 'Logrador consistente', 'default'),
  ('Hustler', 10000, 24999, 'Vendedor destacado', 'default'),
  ('Builder', 25000, 49999, 'Constructor de negocio', 'default'),
  ('Connector', 50000, 99999, 'Conector de redes', 'default'),
  ('Monetizer', 100000, 249999, 'Monetizador experto', 'default'),
  ('Architect', 250000, 499999, 'Arquitecto de ventas', 'default'),
  ('Visionary', 500000, 999999, 'Visionario de negocios', 'default'),
  ('Ambassador', 1000000, 999999999, 'Embajador elite', 'default')
on conflict do nothing;

-- Crear índices para mejorar el rendimiento
create index if not exists idx_niveles_ventas_community_id on niveles_ventas(community_id);
create index if not exists idx_progreso_ventas_usuario_usuario_id on progreso_ventas_usuario(usuario_id); 