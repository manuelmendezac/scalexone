import React, { useState, useEffect, useCallback } from 'react';
import { Upload, ImageIcon, Save, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';

interface Community {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  logo_horizontal_url: string;
  banner_url: string;
  is_public: boolean;
  owner_id: string;
}

interface ImageUploaderProps {
  title: string;
  description: string;
  recommendation: string;
  inputId: string;
  currentImageUrl: string | null;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, recommendation, inputId, currentImageUrl, onFileSelect, previewUrl }) => {
  const displayUrl = previewUrl || currentImageUrl;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <label className="block text-base font-semibold text-white">{title}</label>
      {displayUrl && <img src={displayUrl} alt={title} className="mt-4 w-full h-auto max-h-48 object-cover rounded-md" />}
      <p className="mt-2 text-sm text-gray-400">{description}</p>
      <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
          <div className="flex text-sm text-gray-400">
            <label htmlFor={inputId} className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-yellow-500">
              <span>Sube un archivo</span>
              <input id={inputId} name={inputId} type="file" accept="image/png, image/jpeg, image/gif" className="sr-only" onChange={handleFileChange} />
            </label>
            <p className="pl-1">o arrástralo aquí</p>
          </div>
          <p className="text-xs text-gray-500">{recommendation}</p>
        </div>
      </div>
    </div>
  );
};

const CommunitySettingsPanel: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [community, setCommunity] = useState<Partial<Community>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoHorizontalFile, setLogoHorizontalFile] = useState<File | null>(null);
  const [logoHorizontalPreview, setLogoHorizontalPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  
  const handleBannerSelect = (file: File) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleLogoHorizontalSelect = (file: File) => {
    setLogoHorizontalFile(file);
    setLogoHorizontalPreview(URL.createObjectURL(file));
  };

  const fetchCommunityData = useCallback(async () => {
    if (!userInfo?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comunidades')
        .select('*')
        .eq('owner_id', userInfo.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setCommunity(data);
      }
    } catch (err: any) {
      console.error("Error cargando datos de la comunidad:", err);
      setError(`Error al cargar la información: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userInfo.id]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handleSaveChanges = async () => {
    if (!userInfo?.id) {
      setError('Debes iniciar sesión para guardar los cambios.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let currentCommunityId = community.id;
      let updates: Partial<Community> = {
        nombre: community.nombre,
        descripcion: community.descripcion,
        is_public: community.is_public,
        owner_id: userInfo.id
      };

      console.log('Objeto a guardar:', updates);

      // Si no hay ID, es una comunidad nueva. La creamos primero.
      if (!currentCommunityId) {
        const { data: newCommunityData, error: insertError } = await supabase
          .from('comunidades')
          .insert({ owner_id: userInfo.id, nombre: community.nombre, descripcion: community.descripcion, is_public: community.is_public })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        currentCommunityId = newCommunityData.id;
        setCommunity(newCommunityData); // Actualizamos el estado con la nueva comunidad
      }

      if (!currentCommunityId) {
        throw new Error("No se pudo crear o encontrar el ID de la comunidad.");
      }

      // Subir archivos si se seleccionaron nuevos
      if (logoFile) {
        const filePath = `${currentCommunityId}/${Date.now()}_${logoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('community-logos').upload(filePath, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('community-logos').getPublicUrl(filePath);
        updates.logo_url = publicUrl;
      }

      if (bannerFile) {
        const filePath = `${currentCommunityId}/${Date.now()}_${bannerFile.name}`;
        const { error: uploadError } = await supabase.storage.from('community-banners').upload(filePath, bannerFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('community-banners').getPublicUrl(filePath);
        updates.banner_url = publicUrl;
      }

      if (logoHorizontalFile) {
        const filePath = `${currentCommunityId}/horizontal/${Date.now()}_${logoHorizontalFile.name}`;
        const { error: uploadError } = await supabase.storage.from('community-logos').upload(filePath, logoHorizontalFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('community-logos').getPublicUrl(filePath);
        updates.logo_horizontal_url = publicUrl;
      }
      
      // Actualizar la tabla con toda la información
      const { data: updatedData, error: updateError } = await supabase
        .from('comunidades')
        .update(updates)
        .eq('id', currentCommunityId)
        .select()
        .single();

      if (updateError) throw updateError;

      setCommunity(updatedData); // Sincronizar estado con la base de datos
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
      setLogoHorizontalFile(null);
      setLogoHorizontalPreview(null);

      setSuccess('¡Cambios guardados con éxito!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error("Error guardando datos de la comunidad:", err);
      setError(`Error al guardar los cambios: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-yellow-400"/></div>;
  }

  return (
    <div className="flex-1 sm:p-8 p-4 bg-black">
      <div className="mx-auto">
        <div className="w-full bg-gray-900/50 rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Comunidad</h2>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md flex items-center"><AlertCircle className="mr-2"/>{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-md flex items-center"><CheckCircle className="mr-2"/>{success}</div>}


          <div className="grid grid-cols-1 gap-y-10">
            {/* Banner */}
            <ImageUploader 
              title="Banner"
              description="Esta imagen aparecerá como portada en la pestaña de información de tu comunidad."
              recommendation="PNG, JPG, GIF. Mínimo 750x390px, 4MB o menos."
              inputId="banner-upload"
              currentImageUrl={community.banner_url || null}
              onFileSelect={handleBannerSelect}
              previewUrl={bannerPreview}
            />

            {/* Logo o icono */}
            <ImageUploader 
              title="Logo o icono de la Comunidad"
              description="Aparecerá como icono principal en las conversaciones de tu comunidad y publicaciones."
              recommendation="PNG, JPG, GIF. Mínimo 100x100px, 4MB o menos."
              inputId="logo-upload"
              currentImageUrl={community.logo_url || null}
              onFileSelect={handleLogoSelect}
              previewUrl={logoPreview}
            />
            
            {/* Logo horizontal */}
            <ImageUploader 
              title="Logo horizontal de la Comunidad"
              description="Este logo se mostrará en la barra superior. Usa un formato horizontal (ej: 300x80px)."
              recommendation="PNG, JPG, GIF. 300x80px recomendado, 4MB o menos."
              inputId="logo-horizontal-upload"
              currentImageUrl={community.logo_horizontal_url || null}
              onFileSelect={handleLogoHorizontalSelect}
              previewUrl={logoHorizontalPreview}
            />
            
            {/* Nombre y Descripción */}
            <div className="space-y-6">
              <div>
                <label htmlFor="communityName" className="block text-base font-semibold text-white mb-2">Nombre de la comunidad</label>
                <input
                  type="text"
                  id="communityName"
                  value={community.nombre || ''}
                  onChange={(e) => setCommunity({ ...community, nombre: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="communityDescription" className="block text-base font-semibold text-white mb-2">Descripción de la comunidad</label>
                <textarea
                  id="communityDescription"
                  rows={5}
                  value={community.descripcion || ''}
                  onChange={(e) => setCommunity({ ...community, descripcion: e.target.value })}
                  placeholder="Describe el propósito y las reglas de tu comunidad."
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            
            {/* Status de la Comunidad */}
            <div>
              <label htmlFor="communityStatus" className="block text-base font-semibold text-white mb-2">Status de la comunidad</label>
              <select
                id="communityStatus"
                value={community.is_public ? 'public' : 'private'}
                onChange={(e) => setCommunity({ ...community, is_public: e.target.value === 'public' })}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="public">Comunidad Pública (Cualquier usuario puede verla)</option>
                <option value="private">Comunidad Privada (Solo miembros pueden verla - Próximamente)</option>
              </select>
            </div>

            <div className="flex justify-end mt-4">
               <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySettingsPanel; 