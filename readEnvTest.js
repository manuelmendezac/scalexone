import { readFile } from 'fs';

readFile('.env', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo .env:', err);
  } else {
    console.log('Contenido de .env:\n', data);
  }
}); 