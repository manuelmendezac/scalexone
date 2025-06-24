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
  desc: string;
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
    <div ref={setNodeRef} style={style} className="bg-[#0A0A0F] rounded-xl p-6 border border-[#FFD700]/20 mb-4">
      <div className="flex items-center justify-between mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        {/* Columna de imagen */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            {(preview || banner.image) && (
              <img
                src={preview || banner.image}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-[#FFD700]/30"
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageChange(file);
              }}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors text-sm font-medium"
            >
              Seleccionar Imagen
            </button>
          </div>
        </div>

        {/* Columna de formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#FFD700] mb-2 text-sm font-medium">Título</label>
            <input
              type="text"
              value={banner.title}
              onChange={(e) => onChange({ ...banner, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa el título del banner"
            />
          </div>

          <div>
            <label className="block text-[#FFD700] mb-2 text-sm font-medium">Descripción</label>
            <textarea
              value={banner.desc}
              onChange={(e) => onChange({ ...banner, desc: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
              placeholder="Ingresa la descripción del banner"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#FFD700] mb-2 text-sm font-medium">Enlace</label>
              <input
                type="text"
                value={banner.link}
                onChange={(e) => onChange({ ...banner, link: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
                placeholder="Ingresa el enlace del botón"
              />
            </div>
            <div>
              <label className="block text-[#FFD700] mb-2 text-sm font-medium">Texto del Botón</label>
              <input
                type="text"
                value={banner.cta}
                onChange={(e) => onChange({ ...banner, cta: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#FFD700]/30 text-white focus:border-[#FFD700] transition-colors"
                placeholder="Ingresa el texto del botón"
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
      desc: '',
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
      for (const banner of banners) {
        if (!banner.image) throw new Error('Todos los banners deben tener una imagen');
        if (!banner.title.trim()) throw new Error('Todos los banners deben tener un título');
        if (!banner.desc.trim()) throw new Error('Todos los banners deben tener una descripción');
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#FFD700]">Editar Banners</h2>
          <button
            onClick={handleAddBanner}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors"
          >
            <Plus size={20} />
            Agregar Banner
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="px-6 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors disabled:opacity-50"
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