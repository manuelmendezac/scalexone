import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Eye,
  Filter,
  Search,
  UserCheck,
  AlertCircle,
  Award,
  Handshake
} from "lucide-react";
import { supabase } from "../../supabase";

interface SolicitudAfiliado {
  id: string;
  usuario_id: string;
  producto_id: string;
  tipo_producto: "curso" | "servicio" | "suscripcion";
  estado: "pendiente" | "aprobada" | "rechazada";
  fecha_solicitud: string;
  fecha_respuesta?: string;
  notas_admin?: string;
  usuario?: {
    nombre: string;
    email: string;
    avatar_url?: string;
  };
  producto?: {
    titulo: string;
    precio: number;
    imagen_url?: string;
    afilible: boolean;
    comision_nivel1: number;
  };
}

const GestionAfiliadosPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"solicitudes" | "coproducciones" | "estadisticas">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      // Por ahora datos simulados hasta que tengamos solicitudes reales
      setSolicitudes([]);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <span className="ml-2 text-gray-300">Cargando gestión de afiliados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestión de Afiliados</h2>
          <p className="text-gray-400">Administra solicitudes, partnerships y coproducciones</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-yellow-400 font-bold text-lg">0</div>
            <div className="text-yellow-200 text-xs">Pendientes</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-green-400 font-bold text-lg">0</div>
            <div className="text-green-200 text-xs">Aprobadas</div>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <Clock size={64} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Sistema de Gestión de Afiliados</h3>
        <p className="text-gray-400">Panel para administrar solicitudes de afiliación y partnerships</p>
      </div>
    </div>
  );
};

export default GestionAfiliadosPanel;
