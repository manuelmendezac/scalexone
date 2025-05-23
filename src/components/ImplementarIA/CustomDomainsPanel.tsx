import React, { useState, useEffect } from 'react';
import './CustomDomainsPanel.css';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'active' | 'pending' | 'error';
  createdAt: string;
}

const CustomDomainsPanel: React.FC = () => {
  const [dominios, setDominios] = useState<CustomDomain[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar dominios al montar el componente
  useEffect(() => {
    cargarDominios();
  }, []);

  const cargarDominios = async () => {
    setIsLoading(true);
    try {
      // TODO: Reemplazar con llamada real a la API
      const dominiosGuardados = localStorage.getItem('customDomains');
      if (dominiosGuardados) {
        setDominios(JSON.parse(dominiosGuardados));
      }
    } catch (error) {
      setMsg('Error al cargar los dominios');
    } finally {
      setIsLoading(false);
    }
  };

  const validarDominio = (dom: string) => {
    const dominioLimpio = dom.trim().toLowerCase();
    
    // Validación más completa
    const regex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!regex.test(dominioLimpio)) {
      return false;
    }

    // Validar longitud máxima
    if (dominioLimpio.length > 255) {
      return false;
    }

    // Validar que no sea un dominio reservado
    const dominiosReservados = ['localhost', 'example.com', 'test.com'];
    if (dominiosReservados.some(d => dominioLimpio.includes(d))) {
      return false;
    }

    return true;
  };

  const guardarDominios = async (nuevosDominios: CustomDomain[]) => {
    try {
      // TODO: Reemplazar con llamada real a la API
      localStorage.setItem('customDomains', JSON.stringify(nuevosDominios));
    } catch (error) {
      setMsg('Error al guardar los dominios');
    }
  };

  const handleAdd = async () => {
    if (!validarDominio(nuevo)) {
      setMsg('Ingresa un dominio válido (ej: chat.tudominio.com)');
      return;
    }

    const dominioLimpio = nuevo.trim().toLowerCase();
    if (dominios.some(d => d.domain === dominioLimpio)) {
      setMsg('Ese dominio ya está agregado.');
      return;
    }

    setIsLoading(true);
    try {
      const nuevoDominio: CustomDomain = {
        id: Date.now().toString(),
        domain: dominioLimpio,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const nuevosDominios = [...dominios, nuevoDominio];
      await guardarDominios(nuevosDominios);
      setDominios(nuevosDominios);
      setNuevo('');
      setMsg('');
    } catch (error) {
      setMsg('Error al agregar el dominio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const nuevosDominios = dominios.filter(d => d.id !== id);
      await guardarDominios(nuevosDominios);
      setDominios(nuevosDominios);
    } catch (error) {
      setMsg('Error al eliminar el dominio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="custom-domains-panel-main">
      <h2>Dominios personalizados</h2>
      <div className="custom-domains-panel-note">
        Usa tu propio dominio o subdominio para el script de integración, iframe o enlace de agente.<br/>
        <b>Nota:</b> El dominio debe tener un registro CNAME apuntando a <code>tu-plataforma.com</code> (ajusta esto según tu infraestructura).
      </div>
      <div className="custom-domains-panel-list">
        <h3>Dominios agregados</h3>
        {isLoading ? (
          <div className="custom-domains-panel-loading">Cargando...</div>
        ) : dominios.length === 0 ? (
          <div className="custom-domains-panel-empty">No hay dominios personalizados agregados.</div>
        ) : (
          dominios.map((dom) => (
            <div className="custom-domains-panel-item" key={dom.id}>
              <div className="custom-domains-panel-domain-info">
                <span>{dom.domain}</span>
                <span className={`custom-domains-panel-status ${dom.status}`}>
                  {dom.status === 'pending' ? 'Pendiente' : 
                   dom.status === 'active' ? 'Activo' : 'Error'}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(dom.id)} 
                className="custom-domains-panel-del"
                disabled={isLoading}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
      <div className="custom-domains-panel-form">
        <input
          type="text"
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          placeholder="chat.tudominio.com"
          disabled={isLoading}
        />
        <button 
          onClick={handleAdd} 
          className="custom-domains-panel-add"
          disabled={isLoading}
        >
          {isLoading ? 'Agregando...' : 'Agregar'}
        </button>
      </div>
      {msg && <div className="custom-domains-panel-msg">{msg}</div>}
    </div>
  );
};

export default CustomDomainsPanel; 