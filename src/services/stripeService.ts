// Servicio para manejar operaciones con Stripe
export interface StripeProductData {
  nombre: string;
  descripcion?: string;
  precio: number;
  tipo_pago: 'pago_unico' | 'suscripcion';
  moneda?: string;
  periodicidad?: 'month' | 'year' | 'quarter' | 'semiannual';
}

export interface StripeCheckoutData {
  stripe_price_id: string;
  success_url?: string;
  cancel_url?: string;
  customer_email?: string;
  metadata?: Record<string, any>;
}

export class StripeService {
  private static baseUrl = '/api/stripe2';

  // Crear producto y precio en Stripe
  static async createProduct(data: StripeProductData) {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear producto en Stripe');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  }

  // Crear sesión de checkout para pago único
  static async createCheckoutSession(data: StripeCheckoutData) {
    try {
      const response = await fetch(`${this.baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear sesión de checkout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createCheckoutSession:', error);
      throw error;
    }
  }

  // Crear sesión de suscripción
  static async createSubscriptionSession(data: StripeCheckoutData) {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear sesión de suscripción');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createSubscriptionSession:', error);
      throw error;
    }
  }

  // Redirigir al checkout de Stripe
  static redirectToCheckout(checkoutUrl: string) {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error('URL de checkout no válida');
    }
  }

  // Procesar pago completo (crear producto + checkout)
  static async processPayment(
    productData: StripeProductData,
    customerEmail?: string,
    metadata?: Record<string, any>
  ) {
    try {
      // 1. Crear producto en Stripe
      const productResult = await this.createProduct(productData);
      
      // 2. Crear sesión de checkout
      const checkoutData: StripeCheckoutData = {
        stripe_price_id: productResult.stripe_price_id,
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          product_id: productResult.stripe_product_id,
          tipo_pago: productData.tipo_pago,
        },
      };

      const checkoutResult = productData.tipo_pago === 'suscripcion' 
        ? await this.createSubscriptionSession(checkoutData)
        : await this.createCheckoutSession(checkoutData);

      // 3. Redirigir al checkout
      this.redirectToCheckout(checkoutResult.checkout_url);

      return {
        product: productResult,
        checkout: checkoutResult,
      };
    } catch (error) {
      console.error('Error en processPayment:', error);
      throw error;
    }
  }
} 