import React, { useState } from 'react';

const mockComisiones = [
  {
    id: 1,
    fecha: '2024-06-01',
    referido: 'Juan Pérez',
    producto: 'Curso Marca Blanca',
    cliente: 'Academia XYZ',
    nivel: 1,
    montoVenta: 100,
    comision: 20,
    estado: 'Confirmada',
  },
  {
    id: 2,
    fecha: '2024-06-02',
    referido: 'María García',
    producto: 'Suscripción Marca Blanca',
    cliente: 'Academia XYZ',
    nivel: 2,
    montoVenta: 50,
    comision: 5,
    estado: 'Pendiente',
  },
];

const InformeIBMarcaBlanca: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');

  const comisionesFiltradas = mockComisiones.filter(c =>
    (!filtroEstado || c.estado === filtroEstado) &&
    (!filtroNivel || c.nivel === Number(filtroNivel))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comisiones Marca Blanca</h2>
      <div className="flex gap-4 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border rounded p-2">
          <option value="">Todos los estados</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Pendiente">Pendiente</option>
        </select>
        <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)} className="border rounded p-2">
          <option value="">Todos los niveles</option>
          <option value="1">Nivel 1</option>
          <option value="2">Nivel 2</option>
        </select>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Fecha</th>
            <th className="p-2">Referido</th>
            <th className="p-2">Producto</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Nivel</th>
            <th className="p-2">Monto Venta</th>
            <th className="p-2">Comisión</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {comisionesFiltradas.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.fecha}</td>
              <td className="p-2">{c.referido}</td>
              <td className="p-2">{c.producto}</td>
              <td className="p-2">{c.cliente}</td>
              <td className="p-2">{c.nivel}</td>
              <td className="p-2">${c.montoVenta}</td>
              <td className="p-2">${c.comision}</td>
              <td className="p-2">{c.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InformeIBMarcaBlanca; 