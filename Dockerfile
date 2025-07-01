# Usa una imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye el proyecto Next.js
RUN npm run build

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando para arrancar la app en producción
CMD ["npm", "start"] 