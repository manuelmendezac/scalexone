import React from 'react';
import ModuloCardSegundoCerebro from '../ModuloCardSegundoCerebro';
import ModuloCardSincronizadorMental from '../ModuloCardSincronizadorMental';
import ModuloCardBibliotecaConocimiento from '../ModuloCardBibliotecaConocimiento';
import ModuloCardConsejeroInteligente from '../ModuloCardConsejeroInteligente';
import ModuloCardPlanificadorMetas from '../ModuloCardPlanificadorMetas';
import SegundoCerebroHeader from '../SegundoCerebroHeader';
import ModuloCardCamaraEnfoque from '../ModuloCardCamaraEnfoque';
import ModuloCardSensorEmocional from '../ModuloCardSensorEmocional';
import ModuloCardGuiaDecisionesIA from '../ModuloCardGuiaDecisionesIA';
import SeguimientoGlobal from '../SeguimientoGlobal';
import { useRef } from 'react';
import useNeuroState from '../../store/useNeuroState';

interface Props {
  progreso: number;
  estado: string;
  xp: number;
  neurocoin: number;
  avatarUrl: string;
}

export default function SegundoCerebroPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const iaModules = useNeuroState(state => state.iaModules);
  const userXP = useNeuroState(state => state.userXP);
  const userCoins = useNeuroState(state => state.userCoins);
  const modulos = Object.values(iaModules);
  const porcentaje = modulos.length > 0 ? Math.round(modulos.reduce((acc, m) => acc + (m.progreso || 0), 0) / modulos.length) : 0;

  return (
    <div className="w-full flex flex-col items-center gap-12 py-10">
      <SegundoCerebroHeader />
      <ModuloCardSincronizadorMental
        progreso={40}
        estado="en_curso"
        xp={80}
        neurocoin={5}
        avatarUrl={"/images/modulos/diseñofinalavatar.png"}
        onOrganizarMente={() => {}}
        ideaCentral="Organiza tu mente con IA"
        imagen="/images/modulos/sincronizadordetareas.png"
      />
      <ModuloCardBibliotecaConocimiento
        progreso={60}
        estado="en_curso"
        xp={120}
        monedas={8}
        onSubirDocumento={() => {}}
        onOrganizar={() => {}}
        onBuscar={() => {}}
        onProgreso={() => {}}
        imagen="/images/modulos/bibliotecaconocimiento.png"
      />
      <ModuloCardConsejeroInteligente imagen="/images/modulos/consejerointeligente.png" />
      <ModuloCardPlanificadorMetas imagen="/images/modulos/planificadordemetas.png" />
      <ModuloCardCamaraEnfoque imagen="/images/modulos/camaradeenfoque.png" />
      <ModuloCardSensorEmocional imagen="/images/modulos/sensoremo.png" />
      <ModuloCardGuiaDecisionesIA imagen="/images/modulos/guiadedecisionesia.png" />
      <div className="w-full flex flex-col items-center justify-center mt-16 mb-8 animate-fadein">
        <div className="bg-gradient-to-br from-[#23233a] via-[#3ec6f7]/10 to-[#23233a] rounded-2xl shadow-2xl border-2 border-[#3ec6f7]/40 px-8 py-10 max-w-2xl w-full flex flex-col items-center gap-6">
          <div className="text-3xl font-extrabold text-[#3ec6f7] font-orbitron drop-shadow-lg mb-2 text-center">¿Listo para potenciar tu Segundo Cerebro?</div>
          <div className="text-lg text-[#aef1ff] text-center mb-4">Sigue avanzando y desbloquea todo tu potencial cognitivo. ¡Cada módulo suma a tu evolución!</div>
          <button
            className="px-10 py-4 rounded-2xl font-extrabold text-2xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] shadow-2xl font-orbitron transition-all animate-bounce border-2 border-[#3ec6f7] hover:from-[#4fd1fa] hover:to-[#aef1ff]"
            onClick={() => { document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            Potenciar mi Segundo Cerebro
          </button>
          <div className="mt-8">
            <SeguimientoGlobal porcentaje={porcentaje} xp={userXP} coins={userCoins} />
          </div>
        </div>
      </div>
    </div>
  );
} 