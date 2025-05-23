import React, { useState } from 'react';
import './ConfiguracionProyecto.css';

const USUARIO_DEFAULT = {
  nombre: 'Manuel Méndez',
  email: 'manuel@email.com',
  tipo: 'Web3',
  membresia: 'Pro',
  suscripcion: 'Activa',
  creditos: 250,
  coins: 12,
  wallet: '0x1234...abcd',
  red: 'Polygon',
  puedeRetirar: true,
  puedeCrearMasAgentes: true
};

const PROYECTO_DEFAULT = {
  nombre: 'Mi Segundo Cerebro',
  dominio: 'miapp.com',
  soporte: 'soporte@miapp.com',
  idioma: 'Español',
  zonaHoraria: 'GMT-5',
  logo: '',
  maxAgentes: 10,
  maxUsuarios: 100,
  maxCreditos: 1000,
  maxAlmacenamiento: '2 GB',
};

const ConfiguracionProyecto: React.FC = () => {
  const [usuario, setUsuario] = useState(USUARIO_DEFAULT);
  const [proyecto, setProyecto] = useState(PROYECTO_DEFAULT);
  const [coins, setCoins] = useState(usuario.coins);
  const [creditos, setCreditos] = useState(usuario.creditos);
  const [wallet, setWallet] = useState(usuario.wallet);
  const [notificacion, setNotificacion] = useState('');
  const [parametros, setParametros] = useState({
    exportarDatos: false,
    apiExterna: false,
    dominios: false,
    multiusuario: false,
    facturacion: false,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProyecto({ ...proyecto, [e.target.name]: e.target.value });
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParametros({ ...parametros, [e.target.name]: e.target.checked });
  };

  const convertirCoins = () => {
    if (coins > 0) {
      setCreditos(creditos + coins * 10);
      setCoins(0);
      setNotificacion('¡Coins convertidos a créditos!');
      setTimeout(() => setNotificacion(''), 2000);
    }
  };

  const retirarCoins = () => {
    setNotificacion('Función de retiro Web3 próximamente');
    setTimeout(() => setNotificacion(''), 2000);
  };

  const guardarCambios = () => {
    setNotificacion('¡Cambios guardados!');
    setTimeout(() => setNotificacion(''), 2000);
  };

  return (
    <div className="config-proyecto-root-dark">
      {notificacion && <div className="config-proyecto-notificacion">{notificacion}</div>}
      {/* Resumen de membresía y créditos */}
      <div className="config-proyecto-resumen-dark">
        <div><b>Usuario:</b> <input className="config-proyecto-input" name="nombre" value={usuario.nombre} onChange={e => setUsuario({...usuario, nombre: e.target.value})} /></div>
        <div><b>Email:</b> <input className="config-proyecto-input" name="email" value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} /></div>
        <div><b>Membresía:</b> {usuario.membresia} ({usuario.suscripcion})</div>
        <div><b>Créditos:</b> {creditos}</div>
        <div><b>Coins:</b> {coins} <button className="config-proyecto-btn-dark" onClick={convertirCoins} disabled={coins === 0}>Convertir a créditos</button></div>
        {usuario.tipo === 'Web3' && (
          <div><b>Wallet conectada:</b> <input className="config-proyecto-input" name="wallet" value={wallet} onChange={e => setWallet(e.target.value)} /> <span className="config-proyecto-red-dark">({usuario.red})</span> {usuario.puedeRetirar && <button className="config-proyecto-btn-dark" onClick={retirarCoins}>Retirar coins</button>}</div>
        )}
        {!usuario.puedeCrearMasAgentes && (
          <div className="config-proyecto-alert-dark">Solo puedes crear un agente. Actualiza tu plan para crear más agentes Pro.</div>
        )}
      </div>

      {/* Datos generales */}
      <div className="config-proyecto-card-dark">
        <h3>Datos generales</h3>
        <div className="config-proyecto-row-dark"><b>Nombre del proyecto:</b> <input className="config-proyecto-input" name="nombre" value={proyecto.nombre} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Dominio principal:</b> <input className="config-proyecto-input" name="dominio" value={proyecto.dominio} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Soporte:</b> <input className="config-proyecto-input" name="soporte" value={proyecto.soporte} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Idioma:</b> <input className="config-proyecto-input" name="idioma" value={proyecto.idioma} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Zona horaria:</b> <input className="config-proyecto-input" name="zonaHoraria" value={proyecto.zonaHoraria} onChange={handleInput} /></div>
      </div>

      {/* Membresía y límites */}
      <div className="config-proyecto-card-dark">
        <h3>Membresía y límites</h3>
        <div className="config-proyecto-row-dark"><b>Tipo de membresía:</b> {usuario.membresia}</div>
        <div className="config-proyecto-row-dark"><b>Estado de suscripción:</b> {usuario.suscripcion}</div>
        <div className="config-proyecto-row-dark"><b>Máximo de agentes IA:</b> <input className="config-proyecto-input" name="maxAgentes" value={proyecto.maxAgentes} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Máximo de usuarios:</b> <input className="config-proyecto-input" name="maxUsuarios" value={proyecto.maxUsuarios} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Máximo de créditos:</b> <input className="config-proyecto-input" name="maxCreditos" value={proyecto.maxCreditos} onChange={handleInput} /></div>
        <div className="config-proyecto-row-dark"><b>Almacenamiento:</b> <input className="config-proyecto-input" name="maxAlmacenamiento" value={proyecto.maxAlmacenamiento} onChange={handleInput} /></div>
      </div>

      {/* Economía y monedas */}
      <div className="config-proyecto-card-dark">
        <h3>Economía y monedas</h3>
        <div className="config-proyecto-row-dark"><b>Créditos disponibles:</b> {creditos}</div>
        <div className="config-proyecto-row-dark"><b>Coins/tokens:</b> {coins}</div>
        <div className="config-proyecto-row-dark"><b>Conversión:</b> 1 coin = 10 créditos</div>
        {usuario.tipo === 'Web3' && (
          <>
            <div className="config-proyecto-row-dark"><b>Wallet conectada:</b> {wallet} <span className="config-proyecto-red-dark">({usuario.red})</span></div>
            <div className="config-proyecto-row-dark"><b>Retiro de coins:</b> <button className="config-proyecto-btn-dark" onClick={retirarCoins}>Retirar a wallet</button></div>
          </>
        )}
        <div className="config-proyecto-row-dark"><b>Historial de transacciones:</b> <button className="config-proyecto-btn-dark">Ver historial</button></div>
      </div>

      {/* Parámetros avanzados */}
      <div className="config-proyecto-card-dark">
        <h3>Parámetros avanzados</h3>
        <div className="config-proyecto-row-dark"><b>Permitir exportar datos:</b> <input type="checkbox" name="exportarDatos" checked={parametros.exportarDatos} onChange={handleSwitch} /></div>
        <div className="config-proyecto-row-dark"><b>Integración API externa:</b> <input type="checkbox" name="apiExterna" checked={parametros.apiExterna} onChange={handleSwitch} /></div>
        <div className="config-proyecto-row-dark"><b>Personalización de dominios:</b> <input type="checkbox" name="dominios" checked={parametros.dominios} onChange={handleSwitch} /></div>
        <div className="config-proyecto-row-dark"><b>Acceso multiusuario/equipos:</b> <input type="checkbox" name="multiusuario" checked={parametros.multiusuario} onChange={handleSwitch} /></div>
        <div className="config-proyecto-row-dark"><b>Facturación automática:</b> <input type="checkbox" name="facturacion" checked={parametros.facturacion} onChange={handleSwitch} /></div>
      </div>

      <button className="config-proyecto-btn-guardar" onClick={guardarCambios}>Guardar cambios</button>

      {/* Zona de peligro */}
      <div className="config-proyecto-danger-dark">
        <div className="config-proyecto-danger-title-dark">ZONA DE PELIGRO</div>
        <div className="config-proyecto-danger-card-dark">
          <h4>Eliminar todos los datos</h4>
          <p>Esta acción eliminará todos los datos del proyecto. <b>No es reversible.</b></p>
          <button className="config-proyecto-danger-btn-dark">Eliminar</button>
        </div>
        <div className="config-proyecto-danger-card-dark">
          <h4>Eliminar cuenta/proyecto</h4>
          <p>Esta acción eliminará tu cuenta y todos los datos asociados. <b>No es reversible.</b></p>
          <button className="config-proyecto-danger-btn-dark">Eliminar</button>
        </div>
        <div className="config-proyecto-danger-card-dark">
          <h4>Resetear configuración</h4>
          <p>Esto restaurará la configuración a los valores iniciales. <b>No es reversible.</b></p>
          <button className="config-proyecto-danger-btn-dark">Resetear</button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionProyecto; 