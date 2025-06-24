import React, { useState, useRef } from 'react';
import ModalFuturista from './ModalFuturista';
import { supabase } from '../supabase';
import { Loader2 } from 'lucide-react';

interface Banner {
  id: string;
  image: string;
  title: string;
  desc: string;
  link: string;
  cta: string;
  order_index: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: (banner: Banner) => void;
}

const BannerEditModal: React.FC<Props> = ({ open, onClose, banner, onSave }) => {
  const [form, setForm] = useState<Banner>(banner || {
    id: crypto.randomUUID(),
    image: '',
    title: '',
    desc: '',
    link: '',
    cta: '',
    order_index: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Validar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona una imagen válida');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Crear preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Subir a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setForm({ ...form, image: publicUrl });

    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      setError(err.message);
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (!form.image) throw new Error('La imagen es requerida');
      if (!form.title.trim()) throw new Error('El título es requerido');
      if (!form.desc.trim()) throw new Error('La descripción es requerida');
      if (!form.cta.trim()) throw new Error('El texto del botón es requerido');

      await onSave(form);
      onClose();

    } catch (err: any) {
      console.error('Error guardando banner:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalFuturista open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-[#FFD700]">
          {banner ? 'Editar Banner' : 'Nuevo Banner'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen */}
          <div>
            <label className="block mb-2 text-[#FFD700]">Imagen</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-lg border border-[#FFD700]/30"
                />
              )}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Seleccionar Imagen'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Título */}
          <div>
            <label htmlFor="title" className="block mb-2 text-[#FFD700]">Título</label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa el título del banner"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="desc" className="block mb-2 text-[#FFD700]">Descripción</label>
            <textarea
              id="desc"
              name="desc"
              value={form.desc}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa la descripción del banner"
              rows={3}
            />
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block mb-2 text-[#FFD700]">Enlace</label>
            <input
              type="text"
              id="link"
              name="link"
              value={form.link}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa el enlace del botón"
            />
          </div>

          {/* CTA */}
          <div>
            <label htmlFor="cta" className="block mb-2 text-[#FFD700]">Texto del Botón</label>
            <input
              type="text"
              id="cta"
              name="cta"
              value={form.cta}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa el texto del botón"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalFuturista>
  );
};

export default BannerEditModal; 