export interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  cta: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const initialBanner: Banner = {
  id: 'initial',
  image: '/images/modulos/modulo2.png',
  title: 'IA AUTOMATIZADA',
  description: 'CONCENTRA TU NEGOCIO DIGITAL 24/7',
  link: '/inicio',
  cta: 'INGRESAR',
  order_index: 0
}; 