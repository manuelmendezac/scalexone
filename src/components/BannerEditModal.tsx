import React, { useState, useRef, useEffect } from 'react';
import ModalFuturista from './ModalFuturista';
import { supabase } from '../supabase';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  cta: string;
  order_index: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  banners: Banner[];
  onSave: (banners: Banner[]) => void;
}

interface SortableBannerFormProps {
  banner: Banner;
  onChange: (banner: Banner) => void;
  onDelete: () => void;
  preview: string | null;
  onImageChange: (file: File) => void;
}

const SortableBannerForm: React.FC<SortableBannerFormProps> = ({ banner, onChange, onDelete, preview, onImageChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: banner.id });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#0A0A0F] rounded-xl p-8 border border-[#FFD700]/20 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-[#FFD700]/10 rounded-lg">
          <GripVertical className="text-[#FFD700]" />
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna izquierda - Imagen */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group border-2 border-dashed border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-colors"
          >
            {(preview || banner.image) ? (
              <img
                src={preview || banner.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FFD700]/60 group-hover:text-[#FFD700]">
                <Plus size={40} />
                <span className="mt-2 font-medium">Seleccionar Imagen</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Columna derecha - Formulario */}
        <div className="space-y-6">
          <div>
            <label className="block text-[#FFD700] mb-2 text-sm font-medium">Título</label>
            <input
              type="text"
              value={banner.title}
              onChange={(e) => onChange({ ...banner, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa el título del banner"
            />
          </div>

          <div>
            <label className="block text-[#FFD700] mb-2 text-sm font-medium">Descripción</label>
            <textarea
              value={banner.description}
              onChange={(e) => onChange({ ...banner, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa la descripción del banner"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#FFD700] mb-2 text-sm font-medium">Enlace</label>
              <input
                type="text"
                value={banner.link}
                onChange={(e) => onChange({ ...banner, link: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
                placeholder="URL del enlace"
              />
            </div>
            <div>
              <label className="block text-[#FFD700] mb-2 text-sm font-medium">Texto del Botón</label>
              <input
                type="text"
                value={banner.cta}
                onChange={(e) => onChange({ ...banner, cta: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
                placeholder="Ej: Ver más"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerEditModal: React.FC<Props> = ({ open, onClose, banners: initialBanners, onSave }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBanners((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((banner, index) => ({
        ...banner,
        order_index: index
      }));
    });
  };

  const handleImageChange = async (bannerId: string, file: File) => {
    try {
      // Crear preview temporal
      const preview = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [bannerId]: preview }));

      // Validar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona una imagen válida');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setBanners(prev => prev.map(banner => 
        banner.id === bannerId ? { ...banner, image: publicUrl } : banner
      ));

    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = () => {
    const newBanner: Banner = {
      id: crypto.randomUUID(),
      image: '',
      title: '',
      description: '',
      link: '',
      cta: '',
      order_index: banners.length
    };
    setBanners([...banners, newBanner]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validar todos los banners
      const bannersToSave = banners.filter(banner => banner.id !== 'initial');
      for (const banner of bannersToSave) {
        if (!banner.image) throw new Error('Todos los banners deben tener una imagen');
        if (!banner.title.trim()) throw new Error('Todos los banners deben tener un título');
        if (!banner.description.trim()) throw new Error('Todos los banners deben tener una descripción');
        if (!banner.link.trim()) throw new Error('Todos los banners deben tener un enlace');
        if (!banner.cta.trim()) throw new Error('Todos los banners deben tener un texto de botón');
      }

      await onSave(banners);
      onClose();

    } catch (err: any) {
      console.error('Error guardando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalFuturista open={open} onClose={onClose}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#FFD700]">Editar Banners</h2>
          <button
            onClick={handleAddBanner}
            className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors"
          >
            <Plus size={24} />
            Agregar Banner
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={banners}
              strategy={verticalListSortingStrategy}
            >
              {banners.map((banner) => (
                <SortableBannerForm
                  key={banner.id}
                  banner={banner}
                  onChange={(updatedBanner) => {
                    setBanners(prev => prev.map(b => 
                      b.id === updatedBanner.id ? updatedBanner : b
                    ));
                  }}
                  onDelete={() => {
                    setBanners(prev => prev.filter(b => b.id !== banner.id));
                  }}
                  preview={previews[banner.id]}
                  onImageChange={(file) => handleImageChange(banner.id, file)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </ModalFuturista>
  );
};

export default BannerEditModal; 