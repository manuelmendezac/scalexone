import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface AvatarUploaderProps {
  onUpload: (url: string) => void;
  label?: string;
  initialUrl?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onUpload, label = 'Sube tu imagen de avatar', initialUrl }) => {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(initialUrl || null);
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setError('Debes seleccionar una imagen.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });
      if (uploadError) throw new Error(uploadError.message);
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      if (!publicUrlData?.publicUrl) throw new Error('No se pudo obtener la URL pública');
      onUpload(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="avatar-preview"
            className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover shadow cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
        ) : (
          <button
            className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center text-cyan-400 bg-gray-900 hover:bg-cyan-900/20 transition"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            +
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <span className="text-cyan-200">Subiendo...</span>
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="text-xs text-cyan-300">{label}</div>
    </div>
  );
};

export default AvatarUploader; 