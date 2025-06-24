import React, { useState } from 'react';
import ModalFuturista from './ModalFuturista';
import { supabase } from '../supabase';

interface Banner {
  image: string;
  title: string;
  desc: string;
  link: string;
  cta: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: (banner: Banner) => void;
}

const BannerEditModal: React.FC<Props> = ({ open, onClose, banner, onSave }) => {
  const [form, setForm] = useState<Banner>(banner || {
    image: '',
    title: '',
    desc: '',
    link: '',
    cta: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setLoading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);
      
      setForm({ ...form, image: publicUrl });
    } catch (err: any) {
      setError('Error al subir la imagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image || !form.title || !form.desc || !form.cta) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <ModalFuturista open={open} onClose={onClose}>
      <div className="w-full max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-[#FFD700] mb-6">Editar Banner</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-[#FFD700] font-semibold">
              Imagen del banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-white"
            />
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl mt-2"
                style={{
                  boxShadow: '0 0 20px rgba(255,215,0,0.2)'
                }}
              />
            )}
          </div>

          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-[#FFD700] font-semibold">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ingresa el título del banner"
              className="w-full px-4 py-2 rounded-xl bg-black/50 border border-[#FFD700] text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-[#FFD700] font-semibold">
              Descripción
            </label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              placeholder="Ingresa la descripción del banner"
              className="w-full px-4 py-2 rounded-xl bg-black/50 border border-[#FFD700] text-white placeholder-gray-400 min-h-[100px]"
              required
            />
          </div>

          {/* Link y CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#FFD700] font-semibold">
                Enlace
              </label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="URL del enlace"
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-[#FFD700] text-white placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#FFD700] font-semibold">
                Texto del botón
              </label>
              <input
                type="text"
                name="cta"
                value={form.cta}
                onChange={handleChange}
                placeholder="Ej: Ver más"
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-[#FFD700] text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 font-semibold text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FDB813] text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </ModalFuturista>
  );
};

export default BannerEditModal; 