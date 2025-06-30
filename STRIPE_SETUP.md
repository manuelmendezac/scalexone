# Configuración de Stripe en ScaleXone

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Tu clave secreta de Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_... # Tu clave pública de Stripe
STRIPE_WEBHOOK_SECRET=whsec_... # Secreto del webhook de Stripe

# Base URL de tu aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Pasos para Configurar Stripe

### 1. Crear Cuenta en Stripe
- Ve a [stripe.com](https://stripe.com) y crea una cuenta
- Completa la verificación de tu cuenta

### 2. Obtener las Claves API
- En el Dashboard de Stripe, ve a **Developers > API keys**
- Copia la **Publishable key** y la **Secret key**
- Para desarrollo, usa las claves que empiecen con `pk_test_` y `sk_test_`

### 3. Configurar Webhooks
- En el Dashboard de Stripe, ve a **Developers > Webhooks**
- Haz clic en **Add endpoint**
- URL: `https://tu-dominio.com/api/stripe/webhook`
- Eventos a escuchar:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
- Copia el **Signing secret** (empieza con `whsec_`)

### 4. Configurar Variables de Entorno
Crea o actualiza tu archivo `.env.local` con las claves obtenidas.

## Endpoints Creados

### 1. `/api/stripe` - Crear Producto y Precio
- **Método:** POST
- **Función:** Crea un producto y precio en Stripe
- **Datos requeridos:** `nombre`, `precio`, `tipo_pago`

### 2. `/api/stripe/checkout` - Checkout Pago Único
- **Método:** POST
- **Función:** Crea sesión de checkout para pagos únicos
- **Datos requeridos:** `stripe_price_id`

### 3. `/api/stripe/subscription` - Checkout Suscripción
- **Método:** POST
- **Función:** Crea sesión de checkout para suscripciones
- **Datos requeridos:** `stripe_price_id`

### 4. `/api/stripe/webhook` - Webhook de Eventos
- **Método:** POST
- **Función:** Maneja eventos de Stripe (pagos, suscripciones, etc.)

## Componentes Creados

### 1. `StripePaymentButton`
Componente genérico para procesar pagos.

### 2. `CoursePaymentButton`
Componente específico para cursos.

### 3. `ServicePaymentButton`
Componente específico para servicios.

## Páginas Creadas

### 1. `/pago-exitoso`
Página que se muestra cuando un pago es exitoso.

### 2. `/pago-cancelado`
Página que se muestra cuando se cancela un pago.

## Uso en el Frontend

```tsx
import { CoursePaymentButton } from '../components/StripePaymentButton';

// En tu componente
<CoursePaymentButton
  curso={{
    id: "curso-123",
    nombre: "Curso de React",
    precio: 99.99,
    tipo_pago: "pago_unico"
  }}
  customerEmail="usuario@email.com"
  className="w-full"
/>
```

## Próximos Pasos

1. **Configurar las variables de entorno** con tus claves de Stripe
2. **Probar con tarjetas de prueba** de Stripe
3. **Configurar webhooks** en producción
4. **Integrar con tu base de datos** para actualizar estados de pago
5. **Implementar notificaciones por email** de confirmación

## Tarjetas de Prueba

Para probar los pagos, usa estas tarjetas de prueba de Stripe:

- **Visa:** 4242 4242 4242 4242
- **Visa (declinada):** 4000 0000 0000 0002
- **Mastercard:** 5555 5555 5555 4444
- **Fecha de expiración:** Cualquier fecha futura
- **CVC:** Cualquier número de 3 dígitos
- **Código postal:** Cualquier código postal

## Notas Importantes

- **Nunca expongas tu STRIPE_SECRET_KEY** en el frontend
- **Usa siempre HTTPS** en producción para los webhooks
- **Maneja los errores** apropiadamente en el frontend
- **Verifica los webhooks** para confirmar pagos
- **Mantén un registro** de todas las transacciones 