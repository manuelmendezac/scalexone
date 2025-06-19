export interface Video {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion?: string;
  url: string;
  miniatura_url?: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface ProgresoVideo {
  id: string;
  usuario_id: string;
  video_id: string;
  tiempo_visto: number;
  porcentaje_completado: number;
  completado: boolean;
  ultima_reproduccion: string;
}

export interface RecursoModulo {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'documento' | 'enlace' | 'archivo';
  url: string;
  orden: number;
  created_at: string;
  updated_at: string;
} 