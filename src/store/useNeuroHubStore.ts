import { create } from 'zustand';

type PacketType = 'text' | 'link' | 'file';

interface KnowledgePacket {
  id: string;
  title: string;
  summary: string;
  type: PacketType;
  content: string;
  tags: string[];
  from: string;
  attachment?: File;
  visibility: 'public' | 'private';
  createdAt: Date;
  likes: number;
  shares: number;
}

interface Room {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
  }[];
  messages: {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
    reactions: { emoji: string; count: number }[];
    type: 'text' | 'file' | 'link';
  }[];
  createdAt: Date;
  isPrivate: boolean;
}

interface NeuroHubState {
  // Paquetes de conocimiento
  packets: KnowledgePacket[];
  addPacket: (packet: Omit<KnowledgePacket, 'id' | 'createdAt' | 'likes' | 'shares'>) => void;
  updatePacket: (id: string, packet: Partial<KnowledgePacket>) => void;
  deletePacket: (id: string) => void;
  filterPackets: (tags: string[], visibility?: 'public' | 'private', type?: PacketType) => KnowledgePacket[];
  likePacket: (id: string) => void;
  sharePacket: (id: string) => void;

  // Salas colaborativas
  rooms: Room[];
  activeRoom: string | null;
  createRoom: (name: string, isPrivate?: boolean) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, type?: 'text' | 'file' | 'link') => void;
  addReaction: (roomId: string, messageId: string, emoji: string) => void;
  updateMemberStatus: (roomId: string, memberId: string, status: 'online' | 'offline' | 'away') => void;

  // Vista
  viewMode: 'list' | 'neural';
  setViewMode: (mode: 'list' | 'neural') => void;
}

export const useNeuroHubStore = create<NeuroHubState>((set, get) => ({
  // Estado inicial
  packets: [],
  rooms: [],
  activeRoom: null,
  viewMode: 'list',

  // Acciones para paquetes
  addPacket: (packet) => set((state) => ({
    packets: [...state.packets, {
      ...packet,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      likes: 0,
      shares: 0
    }]
  })),

  updatePacket: (id, packet) => set((state) => ({
    packets: state.packets.map(p => 
      p.id === id ? { ...p, ...packet } : p
    )
  })),

  deletePacket: (id) => set((state) => ({
    packets: state.packets.filter(p => p.id !== id)
  })),

  filterPackets: (tags, visibility, type) => {
    const state = get();
    return state.packets.filter(packet => {
      const matchesTags = tags.length === 0 || 
        tags.some(tag => packet.tags.includes(tag));
      const matchesVisibility = !visibility || 
        packet.visibility === visibility;
      const matchesType = !type || packet.type === type;
      return matchesTags && matchesVisibility && matchesType;
    });
  },

  likePacket: (id) => set((state) => ({
    packets: state.packets.map(p =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    )
  })),

  sharePacket: (id) => set((state) => ({
    packets: state.packets.map(p =>
      p.id === id ? { ...p, shares: p.shares + 1 } : p
    )
  })),

  // Acciones para salas
  createRoom: (name, isPrivate = false) => set((state) => ({
    rooms: [...state.rooms, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      members: [],
      messages: [],
      createdAt: new Date(),
      isPrivate
    }]
  })),

  joinRoom: (roomId) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            members: [...room.members, {
              id: 'current-user',
              name: 'Usuario Actual',
              status: 'online'
            }]
          }
        : room
    ),
    activeRoom: roomId
  })),

  leaveRoom: (roomId) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            members: room.members.filter(m => m.id !== 'current-user')
          }
        : room
    ),
    activeRoom: state.activeRoom === roomId ? null : state.activeRoom
  })),

  sendMessage: (roomId, content, type = 'text') => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            messages: [
              ...room.messages,
              {
                id: Math.random().toString(36).substr(2, 9),
                sender: 'current-user',
                content,
                timestamp: new Date(),
                reactions: [],
                type
              }
            ]
          }
        : room
    )
  })),

  addReaction: (roomId, messageId, emoji) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            messages: room.messages.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: msg.reactions.some(r => r.emoji === emoji)
                      ? msg.reactions.map(r =>
                          r.emoji === emoji
                            ? { ...r, count: r.count + 1 }
                            : r
                        )
                      : [...msg.reactions, { emoji, count: 1 }]
                  }
                : msg
            )
          }
        : room
    )
  })),

  updateMemberStatus: (roomId, memberId, status) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            members: room.members.map(member =>
              member.id === memberId
                ? {
                    ...member,
                    status,
                    lastSeen: status === 'offline' ? new Date() : member.lastSeen
                  }
                : member
            )
          }
        : room
    )
  })),

  // Acciones de vista
  setViewMode: (mode) => set({ viewMode: mode })
})); 