# Migración de Community ID

## Resumen
Se ha implementado el sistema de `community_id` para permitir que cada comunidad (marca blanca) tenga su propia configuración del menú secundario.

## Cambios Realizados

### 1. Base de Datos
- **Archivo**: `supabase.sql`
- **Cambios**:
  - Agregado campo `community_id` a la tabla `usuarios` (default: 'default')
  - Creada tabla `menu_secundario_config` para configuraciones por comunidad
  - Agregados índices para optimizar consultas
  - Insertada configuración por defecto para la comunidad 'default'

### 2. Código Frontend
- **Archivo**: `src/store/useNeuroState.ts`
  - Agregado `community_id` al estado `userInfo`
  - Actualizada función `updateUserInfo` para aceptar `community_id`

- **Archivo**: `src/App.tsx`
  - Actualizada función `checkAndSyncUser` para obtener `community_id` desde Supabase
  - El `community_id` se guarda en el estado global al hacer login

- **Archivo**: `src/utils/syncUsuarioSupabase.ts`
  - Actualizada función para preservar `community_id` existente en upserts
  - Si no existe, se asigna 'default'

- **Archivo**: `src/components/SegundoCerebroHeader.tsx`
  - Actualizada consulta para obtener `community_id` junto con `rol`

- **Archivo**: `src/pages/cursos.tsx`
  - Actualizada consulta para obtener `community_id`

## Instrucciones de Migración

### Paso 1: Ejecutar SQL en Supabase
1. Ve al Dashboard de Supabase
2. Abre el SQL Editor
3. Ejecuta el contenido de `supabase.sql`
4. Ejecuta el contenido de `migrate_community_id.sql`

### Paso 2: Verificar la Migración
Después de ejecutar el SQL, verifica que:
- Todos los usuarios tengan `community_id = 'default'`
- La tabla `menu_secundario_config` tenga la configuración por defecto
- Los índices se hayan creado correctamente

### Paso 3: Probar la Funcionalidad
1. Haz login con un usuario existente
2. Verifica que el menú secundario se cargue correctamente
3. Ve a Configuración > Menú Secundario (si eres admin)
4. Verifica que puedas editar la configuración del menú

## Estructura de Datos

### Tabla `usuarios`
```sql
- id: uuid (primary key)
- email: text (unique)
- nombre: text
- rol: text (default: 'afiliado')
- community_id: text (default: 'default') -- NUEVO
```

### Tabla `menu_secundario_config`
```sql
- id: uuid (primary key)
- community_id: text (unique)
- config: jsonb (array de elementos del menú)
- created_at: timestamp
- updated_at: timestamp
```

## Configuración por Defecto del Menú
La configuración por defecto incluye todos los elementos del menú actual:
- Inicio, Clasificación, Classroom, Cursos, Launchpad
- Comunidad, Embudos, IA, Automatizaciones
- WhatsApp CRM, Configuración

## Próximos Pasos
1. **Crear comunidades específicas**: Asignar `community_id` únicos a diferentes marcas blancas
2. **Configurar menús personalizados**: Usar el panel de admin para personalizar menús por comunidad
3. **Implementar lógica de asignación**: Automatizar la asignación de `community_id` según el dominio o configuración

## Troubleshooting

### El menú se queda en "Cargando..."
- Verifica que el usuario tenga `community_id` en la tabla `usuarios`
- Revisa la consola del navegador para errores de consulta
- Asegúrate de que la tabla `menu_secundario_config` tenga datos

### Error al guardar configuración del menú
- Verifica que el usuario sea admin de la comunidad
- Revisa que el `community_id` esté correctamente asignado
- Verifica permisos en Supabase para la tabla `menu_secundario_config` 