import React from 'react';
import ModuloCardPlanificadorMetas from '../components/ModuloCardPlanificadorMetas';
import ModuloCardCamaraEnfoque from '../components/ModuloCardCamaraEnfoque';

export default function PlanificadorMetas() {
  return (
    <div className="w-full flex flex-col items-center gap-12 py-10">
      <ModuloCardPlanificadorMetas />
      <ModuloCardCamaraEnfoque />
    </div>
  );
} 