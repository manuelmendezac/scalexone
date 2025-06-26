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
  slug?: string;
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
      let communityData = null;
      
      console.log('Buscando comunidad para usuario:', userInfo.email, 'community_id:', userInfo.community_id);
      
      // 1. Primero buscar ScaleXOne si el usuario tiene community_id 'scalexone' o 'default'
      if (userInfo.community_id === 'scalexone' || userInfo.community_id === 'default') {
        const { data: scalexoneData, error: scalexoneError } = await supabase
          .from('comunidades')
          .select('*')
          .eq('slug', 'scalexone')
          .single();
          
        if (!scalexoneError && scalexoneData) {
          // Verificar si el usuario es owner de ScaleXOne
          if (scalexoneData.owner_id === userInfo.id) {
            communityData = scalexoneData;
            console.log('ScaleXOne encontrada como owner:', communityData);
          }
        }
      }
      
      // 2. Si no encontró ScaleXOne como owner, buscar por owner_id
      if (!communityData) {
        const { data: ownedData, error: ownedError } = await supabase
          .from('comunidades')
          .select('*')
          .eq('owner_id', userInfo.id)
          .single();

        if (!ownedError && ownedData) {
          communityData = ownedData;
          console.log('Comunidad propia encontrada:', communityData);
        }
      }

      if (communityData) {
        setCommunity(communityData);
      } else {
        console.log('No se encontró comunidad para el usuario');
        setError('No se encontró una comunidad asociada a tu cuenta. Contacta al administrador.');
      }
      
    } catch (err: any) {
      console.error("Error cargando datos de la comunidad:", err);
      setError(`Error al cargar la información: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userInfo.id, userInfo.community_id, userInfo.email]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handleSaveChanges = async () => {
    if (!userInfo?.id) {
      setError('Debes iniciar sesión para guardar los cambios.');
      return;
    }

    if (!community.id) {
      setError('No hay una comunidad válida para actualizar.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let updates: Partial<Community> = {
        nombre: community.nombre,
        descripcion: community.descripcion,
        is_public: community.is_public,
        owner_id: userInfo.id
      };

      console.log('Actualizando comunidad ID:', community.id, 'con datos:', updates);

      // Subir archivos si se seleccionaron nuevos
      if (logoFile) {
        const filePath = `${community.id}/${Date.now()}_${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('community-logos')
          .upload(filePath, logoFile, { upsert: true });
        
        if (uploadError) {
          console.error('Error subiendo logo:', uploadError);
          throw new Error(`Error subiendo logo: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('community-logos')
          .getPublicUrl(filePath);
        
        updates.logo_url = publicUrl;
      }

      if (bannerFile) {
        const filePath = `${community.id}/${Date.now()}_${bannerFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('community-banners')
          .upload(filePath, bannerFile, { upsert: true });
        
        if (uploadError) {
          console.error('Error subiendo banner:', uploadError);
          throw new Error(`Error subiendo banner: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('community-banners')
          .getPublicUrl(filePath);
        
        updates.banner_url = publicUrl;
      }

      if (logoHorizontalFile) {
        const filePath = `${community.id}/horizontal/${Date.now()}_${logoHorizontalFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('community-logos')
          .upload(filePath, logoHorizontalFile, { upsert: true });
        
        if (uploadError) {
          console.error('Error subiendo logo horizontal:', uploadError);
          throw new Error(`Error subiendo logo horizontal: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('community-logos')
          .getPublicUrl(filePath);
        
        updates.logo_horizontal_url = publicUrl;
      }
      
      // Actualizar la tabla con toda la información
      const { data: updatedData, error: updateError } = await supabase
        .from('comunidades')
        .update(updates)
        .eq('id', community.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error actualizando comunidad:', updateError);
        throw updateError;
      }

      setCommunity(updatedData);
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
      setLogoHorizontalFile(null);
      setLogoHorizontalPreview(null);

      setSuccess('¡Cambios guardados exitosamente!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error('Error guardando cambios:', err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          <p className="text-gray-400">Cargando información de la comunidad...</p>
        </div>
      </div>
    );
  }

  if (!community.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No se encontró comunidad</h3>
          <p className="text-gray-400 mb-4">No tienes una comunidad asociada o no tienes permisos para editarla.</p>
          <button 
            onClick={fetchCommunityData}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración de Comunidad</h2>
          <p className="text-gray-400 mt-1">Personaliza la información y apariencia de tu comunidad</p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-300">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información básica */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la Comunidad
                </label>
                <input
                  type="text"
                  value={community.nombre || ''}
                  onChange={(e) => setCommunity({ ...community, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  placeholder="Ej: ScaleXOne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={community.descripcion || ''}
                  onChange={(e) => setCommunity({ ...community, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  placeholder="Describe tu comunidad..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={community.is_public || false}
                  onChange={(e) => setCommunity({ ...community, is_public: e.target.checked })}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-300">
                  Comunidad pública (visible para todos)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="space-y-6">
          <ImageUploader
            title="Banner"
            description="Esta imagen aparecerá como portada en la pestaña de información de tu comunidad"
            recommendation="PNG, JPG, GIF Máximo 10MB, 4MB o menos"
            inputId="banner-upload"
            currentImageUrl={community.banner_url || null}
            onFileSelect={handleBannerSelect}
            previewUrl={bannerPreview}
          />

          <ImageUploader
            title="Logo o icono de la Comunidad"
            description="Aparecerá como icono principal en las conversaciones de tu comunidad y publicaciones"
            recommendation="PNG, JPG, GIF Máximo 1024x1024px, 4MB o menos"
            inputId="logo-upload"
            currentImageUrl={community.logo_url || null}
            onFileSelect={handleLogoSelect}
            previewUrl={logoPreview}
          />

          <ImageUploader
            title="Logo horizontal de la Comunidad"
            description="Este logo se mostrará en la barra superior. Usa un formato horizontal (ej: 300x80px)"
            recommendation="PNG, JPG, GIF Máximo 1024x1024px, 4MB o menos"
            inputId="logo-horizontal-upload"
            currentImageUrl={community.logo_horizontal_url || null}
            onFileSelect={handleLogoHorizontalSelect}
            previewUrl={logoHorizontalPreview}
          />
        </div>
      </div>

      {/* Información de debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify({ 
              communityId: community.id, 
              userId: userInfo.id, 
              userCommunityId: userInfo.community_id,
              isOwner: community.owner_id === userInfo.id 
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CommunitySettingsPanel; 