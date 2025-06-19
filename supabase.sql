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
  community_id text references menu_secundario_config(community_id) default 'default',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índice para mejorar el rendimiento de búsquedas por community_id
create index if not exists idx_niveles_ventas_community_id on niveles_ventas(community_id);

-- Insertar niveles por defecto solo si no existen
insert into niveles_ventas (nombre, min_ventas, max_ventas, descripcion, community_id) 
values 
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
on conflict (id) do nothing;

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

-- Crear índices para mejorar el rendimiento
create index if not exists idx_progreso_ventas_usuario_usuario_id on progreso_ventas_usuario(usuario_id);

-- Función para actualizar timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger para actualizar updated_at en niveles_ventas
drop trigger if exists update_niveles_ventas_updated_at on niveles_ventas;
create trigger update_niveles_ventas_updated_at
  before update on niveles_ventas
  for each row
  execute function update_updated_at_column();

-- Trigger para actualizar updated_at en progreso_ventas_usuario
drop trigger if exists update_progreso_ventas_usuario_updated_at on progreso_ventas_usuario;
create trigger update_progreso_ventas_usuario_updated_at
  before update on progreso_ventas_usuario
  for each row
  execute function update_updated_at_column();

-- Tabla de niveles académicos
create table if not exists niveles_academicos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  modulos_requeridos integer not null,
  videos_requeridos integer not null,
  descripcion text,
  icono text default '🎓',
  color text default '#4F46E5',
  community_id text references menu_secundario_config(community_id) default 'default',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índice para mejorar el rendimiento de búsquedas por community_id
create index if not exists idx_niveles_academicos_community_id on niveles_academicos(community_id);

-- Insertar niveles académicos por defecto
insert into niveles_academicos (nombre, modulos_requeridos, videos_requeridos, descripcion, community_id) 
values 
  ('Estudiante', 0, 0, 'Nivel inicial de aprendizaje', 'default'),
  ('Aprendiz', 2, 5, 'Primeros pasos en el conocimiento', 'default'),
  ('Practicante', 4, 10, 'Aplicando lo aprendido', 'default'),
  ('Especialista', 6, 15, 'Dominando conceptos clave', 'default'),
  ('Experto', 8, 20, 'Conocimiento avanzado', 'default'),
  ('Maestro', 10, 25, 'Dominio completo del material', 'default'),
  ('Mentor', 12, 30, 'Capacidad de enseñar a otros', 'default'),
  ('Gurú', 15, 40, 'Referente en la materia', 'default'),
  ('Visionario', 20, 50, 'Innovador y líder', 'default'),
  ('Legendario', 25, 60, 'Máximo nivel de maestría', 'default')
on conflict (id) do nothing;

-- Tabla de progreso académico por usuario
create table if not exists progreso_academico_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references users(id),
  nivel_actual uuid references niveles_academicos(id),
  modulos_completados integer default 0,
  videos_completados integer default 0,
  modulos_ids text[] default array[]::text[],
  videos_ids text[] default array[]::text[],
  ultima_actividad timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(usuario_id)
);

-- Crear índices para mejorar el rendimiento
create index if not exists idx_progreso_academico_usuario_usuario_id on progreso_academico_usuario(usuario_id);

-- Trigger para actualizar updated_at en niveles_academicos
drop trigger if exists update_niveles_academicos_updated_at on niveles_academicos;
create trigger update_niveles_academicos_updated_at
  before update on niveles_academicos
  for each row
  execute function update_updated_at_column();

-- Trigger para actualizar updated_at en progreso_academico_usuario
drop trigger if exists update_progreso_academico_usuario_updated_at on progreso_academico_usuario;
create trigger update_progreso_academico_usuario_updated_at
  before update on progreso_academico_usuario
  for each row
  execute function update_updated_at_column(); 