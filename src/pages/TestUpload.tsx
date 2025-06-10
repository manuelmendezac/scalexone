import { useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sylenfqkikdyhkcpgpaq.supabase.co',
  'TU_ANON_KEY_AQUI'
);

export default function TestUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Archivo a subir:', file);
    if (!file || file.size === 0) {
      alert('Archivo vacío o no válido');
      return;
    }
    const { error } = await supabase.storage.from('launchpad-assets').upload('prueba/' + file.name, file, { upsert: true });
    if (error) {
      console.error('Error real de Supabase:', error);
      alert('Error subiendo imagen: ' + error.message);
      return;
    }
    const { data } = supabase.storage.from('launchpad-assets').getPublicUrl('prueba/' + file.name);
    alert('¡Subida exitosa! URL: ' + data.publicUrl);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Prueba de subida directa a Supabase Storage</h2>
      <input type="file" ref={inputRef} onChange={handleUpload} />
    </div>
  );
} 