import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css'
import { ThemeProvider } from './context/themeContext'
import './i18n'
import App from './App.tsx'
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Asegúrate de que la ruta es correcta
import { register } from 'swiper/element/bundle';

// Force deploy: 2024-07-29 12:00:00

register();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
