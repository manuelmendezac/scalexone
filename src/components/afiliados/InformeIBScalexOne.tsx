import React, { useState } from 'react';

const mockComisiones = [
  {
    id: 1,
    fecha: '2024-06-03',
    referido: 'Carlos López',
    producto: 'SaaS ScalexOne',
    nivel: 1,
    montoVenta: 200,
    comision: 40,
    estado: 'Confirmada',
  },
  {
    id: 2,
    fecha: '2024-06-04',
    referido: 'Ana Martínez',
    producto: 'Consultoría ScalexOne',
    nivel: 3,
    montoVenta: 300,
    comision: 15,
    estado: 'Pendiente',
  },
];

const InformeIBScalexOne: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');

  const comisionesFiltradas = mockComisiones.filter(c =>
    (!filtroEstado || c.estado === filtroEstado) &&
    (!filtroNivel || c.nivel === Number(filtroNivel))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comisiones ScalexOne</h2>
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
          <option value="3">Nivel 3</option>
        </select>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Fecha</th>
            <th className="p-2">Referido</th>
            <th className="p-2">Producto</th>
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

export default InformeIBScalexOne; 