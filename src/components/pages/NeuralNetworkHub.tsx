import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Share2, Brain, Zap, MessageCircle, Plus, X, Wifi, Moon, Sun, Loader2, File, Tag, Eye, EyeOff, Send, Smile, Link, Grid, List, Heart, Share, ExternalLink } from 'lucide-react';
import { useNeuroHubStore } from '../../store/useNeuroHubStore';

// Tipos
interface Clon {
  id: string;
  name: string;
  status: 'activo' | 'concentración' | 'descanso' | 'sincronizando';
  avatar?: string;
}

interface KnowledgePacket {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  from: string;
  attachment?: File;
  visibility: 'public' | 'private';
  createdAt: Date;
}

interface Room {
  id: string;
  name: string;
  members: Clon[];
  messages: { sender: string; content: string; timestamp: string }[];
}

const STATUS_COLORS = {
  activo: 'bg-neurolink-matrixGreen',
  concentración: 'bg-blue-500',
  descanso: 'bg-violet-500',
  sincronizando: 'bg-cyan-400',
};

// Componente para la animación de sinapsis
const SynapseAnimation: React.FC<{ clones: Clon[] }> = ({ clones }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<{ id: string; d: string; status: string }[]>([]);

  useEffect(() => {
    const activeClones = clones.filter(c => 
      c.status === 'activo' || c.status === 'sincronizando'
    );

    const newPaths = activeClones.flatMap((clone, i) => {
      return activeClones.slice(i + 1).map(target => ({
        id: `${clone.id}-${target.id}`,
        d: `M${50 + i * 100},50 L${50 + (i + 1) * 100},50`,
        status: clone.status === 'sincronizando' || target.status === 'sincronizando' ? 'sincronizando' : 'activo'
      }));
    });

    setPaths(newPaths);
  }, [clones]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    >
      {paths.map(path => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={path.status === 'sincronizando' ? 'url(#gradient-sync)' : 'url(#gradient-normal)'}
          strokeWidth={path.status === 'sincronizando' ? '3' : '2'}
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: path.status === 'sincronizando' ? 0.8 : 0.5 
          }}
          transition={{
            duration: path.status === 'sincronizando' ? 1 : 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      <defs>
        <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#ff00ff" />
        </linearGradient>
        <linearGradient id="gradient-sync" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ff00" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Componente para el formulario de paquetes
const PacketForm: React.FC<{
  onSubmit: (packet: Omit<KnowledgePacket, 'id' | 'createdAt' | 'likes' | 'shares'>) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'link' | 'file'>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      summary,
      content,
      type,
      tags,
      visibility,
      attachment: attachment || undefined,
      from: 'current-user'
    });
    onClose();
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-cyan-100 mb-2 block">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
          required
        />
      </div>
      <div>
        <label className="text-cyan-100 mb-2 block">Tipo de contenido</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-cyan-100">
            <input
              type="radio"
              checked={type === 'text'}
              onChange={() => setType('text')}
              className="text-cyan-600"
            />
            <File className="w-5 h-5" />
            Texto
          </label>
          <label className="flex items-center gap-2 text-cyan-100">
            <input
              type="radio"
              checked={type === 'link'}
              onChange={() => setType('link')}
              className="text-cyan-600"
            />
            <Link className="w-5 h-5" />
            Enlace
          </label>
          <label className="flex items-center gap-2 text-cyan-100">
            <input
              type="radio"
              checked={type === 'file'}
              onChange={() => setType('file')}
              className="text-cyan-600"
            />
            <File className="w-5 h-5" />
            Archivo
          </label>
        </div>
      </div>
      <div>
        <label className="text-cyan-100 mb-2 block">Descripción</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="text-cyan-100 mb-2 block">Contenido</label>
        {type === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
            rows={5}
            required
          />
        ) : type === 'link' ? (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
            placeholder="https://..."
            required
          />
        ) : (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setContent(file.name);
                setAttachment(file);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
            required
          />
        )}
      </div>
      <div>
        <label className="text-cyan-100 mb-2 block">Etiquetas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
            placeholder="Nueva etiqueta"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 rounded bg-cyan-600/30 text-cyan-100 text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter(t => t !== tag))}
                className="hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="text-cyan-100 mb-2 block">Visibilidad</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-cyan-100">
            <input
              type="radio"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="text-cyan-600"
            />
            <Eye className="w-5 h-5" />
            Público
          </label>
          <label className="flex items-center gap-2 text-cyan-100">
            <input
              type="radio"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="text-cyan-600"
            />
            <EyeOff className="w-5 h-5" />
            Privado
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-red-600/30 text-red-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-cyan-600/80 text-cyan-100"
        >
          Crear Paquete
        </button>
      </div>
    </form>
  );
};

// Componente para el chat de sala
const RoomChat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { rooms, sendMessage, addReaction, leaveRoom } = useNeuroHubStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const room = rooms.find(r => r.id === roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [room?.messages]);

  if (!room) return null;

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center p-4 border-b border-cyan-700/30">
        <div>
          <h3 className="text-cyan-100 font-orbitron">{room.name}</h3>
          <p className="text-violet-200/60 text-sm">
            {room.members.length} miembros
          </p>
        </div>
        <button
          onClick={() => leaveRoom(roomId)}
          className="px-4 py-2 rounded-lg bg-red-600/30 text-red-100 hover:bg-red-600/50"
        >
          Salir
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {room.messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === 'current-user'
                  ? 'bg-cyan-600/30 text-cyan-100'
                  : 'bg-violet-600/30 text-violet-100'
              }`}
            >
              {msg.type === 'link' ? (
                <a
                  href={msg.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100"
                >
                  <ExternalLink className="w-4 h-4" />
                  {msg.content}
                </a>
              ) : msg.type === 'file' ? (
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  <span>{msg.content}</span>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <div className="flex gap-2 mt-2">
                {msg.reactions.map(reaction => (
                  <button
                    key={reaction.emoji}
                    onClick={() => addReaction(roomId, msg.id, reaction.emoji)}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                ))}
                <button
                  onClick={() => addReaction(roomId, msg.id, '👍')}
                  className="text-sm hover:scale-110 transition-transform"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-cyan-700/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              sendMessage(roomId, message);
              setMessage('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-cyan-700/30 text-cyan-100"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-100 hover:bg-cyan-600/50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const NeuralNetworkHub: React.FC = () => {
  // Estados principales
  const [clones, setClones] = useState<Clon[]>([
    { id: '1', name: 'Neo', status: 'activo' },
    { id: '2', name: 'Trinity', status: 'concentración' },
    { id: '3', name: 'Morpheus', status: 'descanso' },
    { id: '4', name: 'Anónimo', status: 'sincronizando' },
  ]);
  const [showPacketForm, setShowPacketForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibilityFilter, setVisibilityFilter] = useState<'public' | 'private' | null>(null);
  const [typeFilter, setTypeFilter] = useState<'text' | 'link' | 'file' | null>(null);
  const { 
    packets, 
    addPacket, 
    deletePacket, 
    filterPackets,
    likePacket,
    sharePacket,
    rooms,
    createRoom,
    joinRoom,
    activeRoom,
    setActiveRoom,
    viewMode,
    setViewMode
  } = useNeuroHubStore();

  // Actualizar la sección de paquetes de conocimiento
  const filteredPackets = filterPackets(selectedTags, visibilityFilter || undefined, typeFilter || undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1021] via-[#1a1a40] to-[#2d1e60] p-6 relative overflow-hidden">
      <SynapseAnimation clones={clones} />
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-orbitron text-cyan-400 drop-shadow-glow">NeuralNetwork Hub</h1>
            <p className="text-violet-200/80">Red social de clones IA para aprendizaje colaborativo</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'neural' : 'list')}
              className="px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-200 font-orbitron flex items-center gap-2 hover:bg-cyan-600/50"
            >
              {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
              {viewMode === 'list' ? 'Vista Neural' : 'Vista Lista'}
            </button>
            <button className="px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-200 font-orbitron flex items-center gap-2 hover:bg-cyan-600/50">
              <Brain className="w-5 h-5 animate-pulse" />
              Sinapsis Global
            </button>
          </div>
        </div>

        {/* Sección de clones activos */}
        <section className="bg-black/40 rounded-xl border border-cyan-700/30 p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-orbitron text-cyan-300 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Clones conectados
          </h2>
          <div className={`grid ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {clones.map(clon => (
              <motion.div
                key={clon.id}
                whileHover={{ scale: 1.05 }}
                className={`relative bg-gradient-to-br from-cyan-900/60 to-violet-900/60 rounded-lg p-4 ${
                  viewMode === 'neural' ? 'flex items-center gap-4' : 'flex flex-col items-center'
                } shadow-md border border-cyan-700/20`}
              >
                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-black ${STATUS_COLORS[clon.status]}`}></div>
                <div className="w-12 h-12 rounded-full bg-cyan-800 flex items-center justify-center">
                  <User className="w-7 h-7 text-cyan-300" />
                </div>
                <div className={`${viewMode === 'neural' ? 'flex-1' : 'text-center'}`}>
                  <span className="text-cyan-100 font-orbitron text-sm block">{clon.name}</span>
                  <span className="text-xs text-violet-300/70 capitalize">{clon.status}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded bg-cyan-600/30 text-cyan-100 hover:bg-cyan-600/50">
                    <Brain className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded bg-violet-600/30 text-violet-100 hover:bg-violet-600/50">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded bg-cyan-600/30 text-cyan-100 hover:bg-cyan-600/50">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sección de paquetes de conocimiento */}
        <section className="bg-black/40 rounded-xl border border-violet-700/30 p-6 mb-8 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-orbitron text-violet-300 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Compartir conocimiento
            </h2>
            <button
              onClick={() => setShowPacketForm(true)}
              className="px-4 py-2 rounded-lg bg-violet-600/30 text-violet-100 font-orbitron flex items-center gap-2 hover:bg-violet-600/50"
            >
              <Plus className="w-5 h-5" /> Nuevo paquete
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por etiquetas..."
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-violet-700/30 text-violet-100"
                onChange={(e) => setSelectedTags(e.target.value.split(',').map(t => t.trim()))}
              />
            </div>
            <select
              value={visibilityFilter || ''}
              onChange={(e) => setVisibilityFilter(e.target.value as 'public' | 'private' | null)}
              className="px-4 py-2 rounded-lg bg-black/40 border border-violet-700/30 text-violet-100"
            >
              <option value="">Todos</option>
              <option value="public">Públicos</option>
              <option value="private">Privados</option>
            </select>
            <select
              value={typeFilter || ''}
              onChange={(e) => setTypeFilter(e.target.value as 'text' | 'link' | 'file' | null)}
              className="px-4 py-2 rounded-lg bg-black/40 border border-violet-700/30 text-violet-100"
            >
              <option value="">Todos los tipos</option>
              <option value="text">Texto</option>
              <option value="link">Enlaces</option>
              <option value="file">Archivos</option>
            </select>
          </div>

          {/* Lista de paquetes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackets.map(packet => (
              <motion.div
                key={packet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-900/60 to-cyan-900/60 rounded-lg p-4 border border-violet-700/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-cyan-100 font-orbitron">{packet.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => likePacket(packet.id)}
                      className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sharePacket(packet.id)}
                      className="p-1 rounded-lg text-violet-400 hover:bg-violet-400/10"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePacket(packet.id)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-violet-200/80 text-sm mb-4">{packet.summary}</p>
                {packet.type === 'link' ? (
                  <a
                    href={packet.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 mb-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {packet.content}
                  </a>
                ) : packet.type === 'file' ? (
                  <div className="flex items-center gap-2 text-cyan-300 mb-4">
                    <File className="w-4 h-4" />
                    {packet.content}
                  </div>
                ) : (
                  <p className="text-violet-200/60 text-sm mb-4">{packet.content}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {packet.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded bg-violet-600/30 text-violet-100 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-violet-200/60">
                  <span>{packet.from}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {packet.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share className="w-3 h-3" />
                      {packet.shares}
                    </span>
                    <span>{new Date(packet.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sección de salas colaborativas */}
        <section className="bg-black/40 rounded-xl border border-cyan-700/30 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-orbitron text-cyan-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Espacios colaborativos
            </h2>
            <button
              onClick={() => createRoom('Nueva Sala')}
              className="px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-100 font-orbitron flex items-center gap-2 hover:bg-cyan-600/50"
            >
              <Plus className="w-5 h-5" /> Nueva sala
            </button>
          </div>

          {/* Lista de salas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-900/60 to-violet-900/60 rounded-lg p-4 border border-cyan-700/30"
              >
                <h3 className="text-cyan-100 font-orbitron mb-2">{room.name}</h3>
                <p className="text-violet-200/80 text-sm mb-4">
                  {room.members.length} miembros
                </p>
                <button
                  onClick={() => {
                    joinRoom(room.id);
                    setActiveRoom(room.id);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-100 hover:bg-cyan-600/50"
                >
                  Entrar
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Modal para crear paquete */}
        <AnimatePresence>
          {showPacketForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#181a2a] rounded-xl border border-cyan-700/30 p-8 w-full max-w-2xl shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-orbitron text-cyan-300">
                    Crear nuevo paquete de conocimiento
                  </h3>
                  <button
                    onClick={() => setShowPacketForm(false)}
                    className="p-2 rounded-lg bg-cyan-600/20 text-cyan-100 hover:bg-cyan-600/40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <PacketForm
                  onSubmit={addPacket}
                  onClose={() => setShowPacketForm(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal para chat de sala */}
        <AnimatePresence>
          {activeRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#181a2a] rounded-xl border border-cyan-700/30 p-8 w-full max-w-4xl shadow-2xl"
              >
                <RoomChat roomId={activeRoom} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NeuralNetworkHub; 