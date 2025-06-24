import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../supabase';
import { Loader2, GripVertical, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import BannerEditModal from '../BannerEditModal';

interface Banner {
  id: string;
  image: string;
  title: string;
  desc: string;
  link: string;
  cta: string;
  order_index: number;
}

interface SortableBannerItemProps {
  banner: Banner;
  onPreview: (banner: Banner) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

const SortableBannerItem: React.FC<SortableBannerItemProps> = ({ banner, onPreview, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-black/50 rounded-lg border border-[#FFD700]/30 group hover:border-[#FFD700]/60 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="text-[#FFD700]/50 group-hover:text-[#FFD700]" />
      </div>

      <img
        src={banner.image}
        alt={banner.title}
        className="w-16 h-16 object-cover rounded-lg border border-[#FFD700]/30"
      />

      <div className="flex-1">
        <h3 className="text-[#FFD700] font-bold">{banner.title}</h3>
        <p className="text-gray-400 text-sm truncate">{banner.desc}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPreview(banner)}
          className="p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"
          title="Vista previa"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEdit(banner)}
          className="p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(banner)}
          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const BannerPreview: React.FC<{ banner: Banner; onClose: () => void }> = ({ banner, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex flex-col md:flex-row items-center p-10 md:p-14 rounded-2xl gap-8"
          style={{
            background: 'linear-gradient(45deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.9) 100%)',
            boxShadow: '0 4px 60px 0 rgba(255,215,0,0.15), inset 0 0 0 1px rgba(255,215,0,0.1)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(255,215,0,0.1) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255,215,0,0.05) 0%, transparent 60%)'
            }}
          />
          <div className="absolute top-0 left-0 w-full h-1"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.2) 50%, transparent 100%)'
            }}
          />

          <div className="relative">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-36 h-36 md:w-48 md:h-48 object-cover rounded-xl shadow-2xl"
              style={{
                boxShadow: '0 0 30px 0 rgba(255,215,0,0.2), 0 0 0 1px rgba(255,215,0,0.1)'
              }}
            />
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(45deg, rgba(255,215,0,0.1) 0%, transparent 100%)'
              }}
            />
          </div>

          <div className="flex-1 relative z-10">
            <h2
              className="text-3xl md:text-4xl font-orbitron mb-4"
              style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #FDB813 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 20px rgba(255,215,0,0.2)'
              }}
            >
              {banner.title}
            </h2>
            <p
              className="mb-6 text-lg md:text-xl"
              style={{ color: '#FDB813' }}
            >
              {banner.desc}
            </p>
            <a
              href={banner.link}
              className="inline-block px-8 py-3 rounded-lg font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #FDB813 100%)',
                color: '#000000',
                boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                border: '1px solid rgba(255,215,0,0.3)'
              }}
            >
              {banner.cta}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BannersAdminPanel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .order('order_index');

      if (fetchError) throw fetchError;

      setBanners(data || []);

    } catch (err: any) {
      console.error('Error cargando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedBanners: Banner[]) => {
    try {
      setLoading(true);
      setError(null);

      // Eliminar banners que ya no existen
      const bannersToDelete = banners.filter(
        oldBanner => !updatedBanners.find(newBanner => newBanner.id === oldBanner.id)
      );

      if (bannersToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('banners')
          .delete()
          .in('id', bannersToDelete.map(b => b.id));

        if (deleteError) throw deleteError;
      }

      // Actualizar o insertar banners
      const { error: upsertError } = await supabase
        .from('banners')
        .upsert(updatedBanners);

      if (upsertError) throw upsertError;

      await loadBanners();

    } catch (err: any) {
      console.error('Error guardando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#FFD700]">Banners</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-[#FDB813] transition-colors"
        >
          <Plus size={20} />
          Gestionar Banners
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-[#0A0A0F] rounded-xl overflow-hidden border border-[#FFD700]/20"
          >
            <div className="aspect-video relative">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{banner.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">{banner.desc}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#FFD700]/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Orden: {banner.order_index + 1}
                </span>
                <span className="text-sm font-medium text-[#FFD700]">
                  {banner.cta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BannerEditModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banners={banners}
        onSave={handleSave}
      />
    </div>
  );
};

export default BannersAdminPanel; 