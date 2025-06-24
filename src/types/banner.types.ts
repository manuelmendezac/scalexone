export interface Banner {
  id: string;
  image: string;
  backgroundImage?: string;
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
  backgroundImage: '/images/banners/city-background.jpg',
  title: 'Conecta con TU SER',
  description: 'Desbloquea el poder que te llevará a la vida que mereces',
  link: '/inicio',
  cta: 'Comenzar',
  order_index: 0
}; 