import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import useNeuroState from '../../store/useNeuroState';

const EditarVideosClassroom = () => {
    const { modulo_id: paramId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useNeuroState();
    
    const queryParams = new URLSearchParams(location.search);
    const queryId = queryParams.get('modulo_id');
    const modulo_id = paramId || queryId;

    // Obtener el community_id del usuario
    const communityId = userInfo?.community_id || '8fb70d6e-3237-465e-8669-979461cf2bc1';

    const [modulo, setModulo] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nuevoVideo, setNuevoVideo] = useState({ titulo: '', descripcion: '', url: '', embed_code: '', orden: 0, thumbnail_url: '' });
    const [videoForm, setVideoForm] = useState<any>(null);

    useEffect(() => {
        const fetchModuloYVideos = async () => {
            if (!modulo_id) {
                setError("No se encontró un ID de módulo en la URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data: mod, error: modError } = await supabase.from('classroom_modulos').select('*').eq('id', modulo_id).single();
            
            if(modError) {
                setError("Error al cargar el módulo: " + modError.message);
                setLoading(false);
                return;
            }

            if (mod) setModulo(mod);

            const { data: vids, error: vidError } = await supabase 
                .from('videos_classroom_modulo')
                .select('*')
                .eq('modulo_id', modulo_id)
                .eq('community_id', communityId)
                .order('orden', { ascending: true });
            
            if(vidError) {
                setError("Error al cargar los videos: " + vidError.message);
                setLoading(false);
                return;
            }

            setVideos(vids || []);
            setLoading(false);
        };
        fetchModuloYVideos();
    }, [modulo_id]);

    const handleGuardarOrden = async () => {
        setSaving(true);
        const updates = videos.map((video, index) =>
            supabase.from('videos_classroom_modulo').update({ orden: index }).eq('id', video.id)
        );
        await Promise.all(updates);
        setSaving(false);
        alert('Orden guardado');
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(videos);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setVideos(items);
    };

    const handleAgregarVideo = async () => {
        if (!nuevoVideo.titulo || (!nuevoVideo.url && !nuevoVideo.embed_code)) {
            alert('El título y la URL (o código embed) son requeridos.');
            return;
        }
        
        const videoData = { ...nuevoVideo };
        if (videoData.url && videoData.url.includes('loom.com') && !videoData.embed_code) {
            try {
                const response = await fetch(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(videoData.url)}`);
                if (response.ok) {
                    const oembedData = await response.json();
                    videoData.embed_code = oembedData.html;
                    if (!videoData.thumbnail_url) {
                        videoData.thumbnail_url = oembedData.thumbnail_url;
                    }
                }
            } catch (e) {
                console.error("Fallo al obtener datos oEmbed de Loom al agregar", e);
            }
        }
        
        let orden = videoData.orden;
        if (orden === null || orden === 0) {
            orden = (videos.reduce((max, v) => v.orden > max ? v.orden : max, 0) || 0) + 1;
        }
        
        const { data, error } = await supabase
            .from('videos_classroom_modulo')
            .insert([{ 
                ...videoData, 
                modulo_id: modulo_id, 
                community_id: communityId,
                orden 
            }])
            .select();

        if (error) {
            alert('Error al agregar el video: ' + error.message);
        } else if(data) {
            setVideos([...videos, ...data].sort((a,b) => a.orden - b.orden));
            setNuevoVideo({ titulo: '', descripcion: '', url: '', embed_code: '', orden: 0, thumbnail_url: '' });
        }
    };

    const handleGuardarVideo = async (video: any, index: number) => {
        const videoData = { ...video };

        if (videoData.url && videoData.url.includes('loom.com') && !videoData.embed_code) {
            try {
                const response = await fetch(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(videoData.url)}`);
                if (response.ok) {
                    const oembedData = await response.json();
                    videoData.embed_code = oembedData.html;
                    if (!videoData.thumbnail_url) {
                        videoData.thumbnail_url = oembedData.thumbnail_url;
                    }
                }
            } catch (e) {
                console.error("Fallo al obtener datos oEmbed de Loom al guardar", e);
            }
        }

        const { data, error } = await supabase
            .from('videos_classroom_modulo')
            .update(videoData)
            .eq('id', videoData.id)
            .select()
            .single();

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else if (data) {
            const updatedVideos = [...videos];
            updatedVideos[index] = data;
            setVideos(updatedVideos);
            setVideoForm(null);
        }
    };

    const handleEliminarVideo = async (videoId: string, index: number) => {
        if (!window.confirm('¿Seguro que quieres eliminar este video?')) return;
        
        const { error } = await supabase.from('videos_classroom_modulo').delete().eq('id', videoId);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            const updatedVideos = videos.filter((_, i) => i !== index);
            setVideos(updatedVideos);
        }
    };
    
    const handleMiniaturaUpload = async (file: File | null, video: any, setVideoState: Function) => {
        if (!file) return;
        const ext = file.name.split('.').pop();
        const fileName = `thumbnail_classroom_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('cursos').upload(fileName, file, { upsert: true });

        if (error) {
            alert('Error al subir miniatura: ' + error.message);
            return;
        }
        const { data } = supabase.storage.from('cursos').getPublicUrl(fileName);
        if (data?.publicUrl) {
            setVideoState({ ...video, thumbnail_url: data.publicUrl });
        }
    };

    if (error) return <div className="text-red-400 p-8 text-center">{error}</div>;

    return (
        <div className="p-4 md:p-8 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold text-cyan-300 mb-2">Editar Módulo: {modulo?.titulo}</h1>
            <button onClick={() => navigate(-1)} className="mb-6 bg-cyan-800 px-4 py-2 rounded hover:bg-cyan-700">Volver</button>

            <div className="mb-8">
                <button onClick={handleGuardarOrden} disabled={saving} className="bg-green-600 px-6 py-2 rounded hover:bg-green-500 disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar Orden de Videos'}
                </button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="videos">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {videos.map((video, idx) => (
                                <Draggable key={video.id} draggableId={video.id} index={idx}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                                            <div className="flex items-center gap-4">
                                                <GripVertical className="text-neutral-500" />
                                                <div className="flex-grow">
                                                    <p className="font-bold">{video.orden}. {video.titulo}</p>
                                                    <p className="text-sm text-neutral-400">{video.descripcion}</p>
                                                </div>
                                                <button onClick={() => setVideoForm(video)} className="bg-blue-600 text-white px-4 py-1 rounded">Editar</button>
                                            </div>

                                            {videoForm && videoForm.id === video.id && (
                                                <div className="mt-4 p-4 rounded-lg bg-neutral-800/50 border border-cyan-900 flex flex-col gap-3">
                                                    <h3 className="text-lg font-bold text-cyan-400">Editando: {video.titulo}</h3>
                                                     <div>
                                                        <label className="block text-sm font-medium text-cyan-300">Título</label>
                                                        <input type="text" value={videoForm.titulo || ''} onChange={(e) => setVideoForm({...videoForm, titulo: e.target.value})} className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded" />
                                                    </div>
                                                     <div>
                                                        <label className="block text-sm font-medium text-cyan-300">Descripción</label>
                                                        <textarea value={videoForm.descripcion || ''} onChange={(e) => setVideoForm({...videoForm, descripcion: e.target.value})} className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded" rows={3}></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-cyan-300">URL del Video</label>
                                                        <input type="text" value={videoForm.url || ''} onChange={(e) => setVideoForm({...videoForm, url: e.target.value})} className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded" />
                                                    </div>
                                                    <div>
                                                      <label className="block text-sm font-medium text-cyan-300 mt-2">Código Embed (Opcional)</label>
                                                      <textarea
                                                          value={videoForm.embed_code || ''}
                                                          onChange={(e) => setVideoForm({...videoForm, embed_code: e.target.value})}
                                                          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded font-mono text-sm"
                                                          rows={3}
                                                          placeholder='<iframe ...></iframe>'
                                                      />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-cyan-300">URL de Miniatura (Opcional)</label>
                                                        <input type="text" value={videoForm.thumbnail_url || ''} onChange={(e) => setVideoForm({...videoForm, thumbnail_url: e.target.value})} className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded" />
                                                        <input type="file" accept="image/*" className="mt-2" onChange={(e) => handleMiniaturaUpload(e.target.files ? e.target.files[0] : null, videoForm, setVideoForm)} />
                                                        {videoForm.thumbnail_url && <img src={videoForm.thumbnail_url} alt="Miniatura" className="w-32 h-20 object-cover rounded-md mt-2" />}
                                                    </div>
                                                    <div className="flex gap-3 mt-2">
                                                        <button className="px-4 py-2 rounded bg-cyan-700 text-white font-bold" onClick={() => handleGuardarVideo(videoForm, idx)}>Guardar Cambios</button>
                                                        <button className="px-4 py-2 rounded bg-red-700 text-white font-bold" onClick={() => handleEliminarVideo(video.id, idx)}>Eliminar Video</button>
                                                        <button className="px-4 py-2 rounded bg-neutral-600 text-white font-bold" onClick={() => setVideoForm(null)}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <div className="mt-8 p-4 rounded-xl bg-[#1a2a3f] border border-cyan-900/40 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Agregar Nuevo Video</h3>
                <label className="text-cyan-300 text-sm font-semibold mb-1">Título</label>
                <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.titulo} onChange={(e) => setNuevoVideo({ ...nuevoVideo, titulo: e.target.value })} />
                <label className="text-cyan-300 text-sm font-semibold mb-1">Descripción <span className="text-cyan-500">(opcional)</span></label>
                <textarea className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.descripcion} onChange={(e) => setNuevoVideo({ ...nuevoVideo, descripcion: e.target.value })} />
                <label className="text-cyan-300 text-sm font-semibold mb-1">URL del video <span className="text-cyan-500">(Vimeo, YouTube, etc)</span></label>
                <input className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.url} onChange={(e) => setNuevoVideo({ ...nuevoVideo, url: e.target.value })} />
                
                <label className="text-cyan-300 text-sm font-semibold mb-1">Código Embed <span className="text-cyan-500">(opcional)</span></label>
                <textarea
                  className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1 font-mono text-sm"
                  rows={4}
                  placeholder='<iframe ...></iframe>'
                  value={nuevoVideo.embed_code || ''}
                  onChange={(e) => setNuevoVideo({ ...nuevoVideo, embed_code: e.target.value })}
                />
                <p className="text-xs text-gray-400 -mt-1 mb-1">Pega aquí el código 'embed' si la URL normal no funciona.</p>

                <label className="text-cyan-300 text-sm font-semibold mb-1">Orden en la Lista <span className="text-cyan-500">(opcional)</span></label>
                <input type="number" className="px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-700 mb-1" value={nuevoVideo.orden} onChange={(e) => setNuevoVideo({ ...nuevoVideo, orden: parseInt(e.target.value) })} />
                <label className="text-cyan-300 text-sm font-semibold mb-1">Miniatura <span className="text-cyan-500">(opcional)</span></label>
                <div className="flex items-center gap-3 mb-2">
                    {nuevoVideo.thumbnail_url && <img src={nuevoVideo.thumbnail_url} alt="Miniatura" className="w-20 h-14 object-cover rounded" />}
                    <input type="file" accept="image/*" onChange={(e) => handleMiniaturaUpload(e.target.files ? e.target.files[0] : null, nuevoVideo, setNuevoVideo)} />
                </div>
                <button className="px-4 py-2 rounded bg-green-700 text-white font-bold mt-2" onClick={handleAgregarVideo}>Agregar Video</button>
            </div>
        </div>
    );
};

export default EditarVideosClassroom;