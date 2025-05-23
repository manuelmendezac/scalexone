import React, { createContext, useContext, useState } from 'react';

export type Documento = {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
};

export type Categoria = {
  id: string;
  nombre: string;
};

const categoriasIniciales: Categoria[] = [
  { id: 'Productividad', nombre: 'Productividad' },
  { id: 'Creatividad', nombre: 'Creatividad' },
  { id: 'IA', nombre: 'IA' },
  { id: 'Salud Mental', nombre: 'Salud Mental' },
];

const docsEjemplo: Documento[] = [
  { id: '1', titulo: 'Cómo ser más productivo', categoria: 'Productividad', fecha: '2024-06-01' },
  { id: '2', titulo: 'Ideas creativas', categoria: 'Creatividad', fecha: '2024-06-02' },
  { id: '3', titulo: 'Guía de IA', categoria: 'IA', fecha: '2024-06-03' },
  { id: '4', titulo: 'Mindfulness', categoria: 'Salud Mental', fecha: '2024-06-04' },
  { id: '5', titulo: 'Técnicas de enfoque', categoria: 'Productividad', fecha: '2024-06-05' },
];

interface BibliotecaContextType {
  documentos: Documento[];
  categorias: Categoria[];
  setDocumentos: React.Dispatch<React.SetStateAction<Documento[]>>;
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
}

const BibliotecaContext = createContext<BibliotecaContextType | undefined>(undefined);

export function BibliotecaProvider({ children }: { children: React.ReactNode }) {
  const [documentos, setDocumentos] = useState<Documento[]>(docsEjemplo);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales);

  return (
    <BibliotecaContext.Provider value={{ documentos, categorias, setDocumentos, setCategorias }}>
      {children}
    </BibliotecaContext.Provider>
  );
}

export function useBiblioteca() {
  const ctx = useContext(BibliotecaContext);
  if (!ctx) throw new Error('useBiblioteca debe usarse dentro de BibliotecaProvider');
  return ctx;
} 