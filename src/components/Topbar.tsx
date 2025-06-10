import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiMail, FiUserPlus, FiChevronDown, FiUser, FiLogOut, FiCopy, FiHelpCircle, FiGlobe, FiSettings, FiZap } from 'react-icons/fi';
import { MdDarkMode, MdLightMode, MdFilterAlt } from 'react-icons/md';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useNeuroState from '../store/useNeuroState';
import { supabase } from '../supabase';
import SwitchClienteIB from './SwitchClienteIB';
import { FaRobot, FaWhatsapp } from 'react-icons/fa';

interface TopbarProps {
  userAvatar?: string;
  notificationsCount?: number;
  onThemeToggle?: () => void;
  darkMode?: boolean;
  isLoggedIn: boolean;
}

const AFFILIATE_LINK = 'https://neurolink.app/afiliado/tu-codigo';

const Topbar: React.FC<TopbarProps> = ({
  userAvatar,
  notificationsCount = 0,
  onThemeToggle,
  darkMode = false,
  isLoggedIn
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const affiliateRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation();
  const language = i18n.language === 'en' ? 'en' : 'es';
  const navigate = useNavigate();
  const { notifications, avatarUrl, setUserName, updateUserInfo } = useNeuroState();
  const [affiliateMode, setAffiliateMode] = useState(() => {
    // Persistencia en localStorage
    const saved = localStorage.getItem('affiliateMode');
    return saved === 'IB' ? 'IB' : 'Client';
  });

  // Cerrar el dropdown de afiliado al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (affiliateRef.current && !affiliateRef.current.contains(event.target as Node)) {
        setShowAffiliate(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showAffiliate || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAffiliate, showNotifications]);

  // Copiar enlace de afiliado
  const handleCopy = () => {
    navigator.clipboard.writeText(AFFILIATE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Cambia el idioma globalmente
  const handleLanguageChange = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  // Modo oscuro: alternar y persistir
  const handleThemeToggle = () => {
    if (onThemeToggle) onThemeToggle();
    const nextMode = !darkMode;
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Idioma: cambiar y persistir
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleSwitchAffiliate = (mode: 'Client' | 'IB') => {
    setAffiliateMode(mode);
    localStorage.setItem('affiliateMode', mode);
    if (mode === 'IB') {
      navigate('/afiliados');
    } else {
      window.location.href = 'https://www.scalexone.app/home';
    }
  };

  return (
    <header className="w-full bg-gray-900 text-white font-orbitron px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-between shadow-lg z-50 border-b border-cyan-900 min-h-[44px]">
      {/* Logo solo imagen */}
      <div className="flex items-center">
        <img src="/images/logoneurohorizontal.svg" alt="NeuroLink Logo" className="h-8 sm:h-10 w-auto object-contain" />
      </div>

      {/* Iconos a la derecha */}
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Iconos extra solo en móvil */}
        <div className="flex items-center gap-1 sm:hidden">
          <MdFilterAlt className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" title="Embudos" onClick={() => navigate('/funnels')} />
          <FaRobot className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" title="IA" onClick={() => navigate('/ia')} />
          <FiZap className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" title="Automatizaciones" onClick={() => navigate('/automatizaciones')} />
          <FaWhatsapp className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" title="WhatsApp CRM" onClick={() => navigate('/whatsapp-crm')} />
          <FiSettings className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition" title="Configuración" onClick={() => navigate('/configuracion')} />
        </div>
        {/* Botón de soporte */}
        <button
          className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition"
          aria-label="Soporte"
          onClick={() => navigate('/soporte')}
        >
          <FiHelpCircle className="w-5 h-5" />
          <span className="hidden md:inline">Help</span>
        </button>
        {/* Notificaciones */}
        <div className="relative group" ref={notificationsRef}>
          <FiBell
            className="w-6 h-6 cursor-pointer hover:text-cyan-400 transition"
            title="Notificaciones"
            aria-label="Notificaciones"
            onClick={() => setShowNotifications((v) => !v)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-xs text-white rounded-full px-1.5 py-0.5 font-bold animate-pulse shadow-lg">
              {notifications.length}
            </span>
          )}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-gray-800 border border-cyan-400 rounded-lg shadow-lg z-50 p-4"
              >
                <div className="font-bold text-lg mb-2">{t('Notificaciones') || 'Notificaciones'}</div>
                <ul className="divide-y divide-gray-700">
                  {(notifications.slice(0, 3).length > 0 ? notifications.slice(0, 3) : [
                    { id: '1', content: t('Sin notificaciones') || 'Sin notificaciones', priority: 'low', timestamp: new Date() }
                  ]).map((n) => (
                    <li key={n.id} className="py-2 text-sm flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${n.priority === 'high' ? 'bg-red-500' : n.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                      <span>{n.content}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Mensajes */}
        <FiMail
          className="w-6 h-6 cursor-pointer hover:text-cyan-400 transition"
          title="Mensajes"
          aria-label="Mensajes"
          onClick={() => navigate('/mensajes')}
        />
        {/* Afiliado/Invitación */}
        <div className="relative" ref={affiliateRef}>
          <FiUserPlus
            className="w-6 h-6 cursor-pointer hover:text-cyan-400 transition"
            title="Invitar/afiliado"
            aria-label="Afiliado"
            onClick={() => setShowAffiliate((v) => !v)}
          />
          <AnimatePresence>
            {showAffiliate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-gray-800 border border-cyan-400 rounded-lg shadow-lg z-50 p-4"
              >
                <div className="font-bold text-lg mb-2">{t('Invitar amigos') || 'Invitar amigos'}</div>
                <div className="flex items-center bg-gray-900 rounded px-2 py-2 mb-3">
                  <span className="truncate text-sm">{AFFILIATE_LINK}</span>
                  <button
                    className="ml-2 px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition"
                    onClick={handleCopy}
                    aria-label="Copiar enlace"
                  >
                    <FiCopy className="w-5 h-5 text-gray-900" />
                  </button>
                  {copied && <span className="ml-2 text-green-400 text-xs">{t('Copiado!') || 'Copiado!'}</span>}
                </div>
                <button
                  className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition mb-2"
                  onClick={() => navigate('/afiliacion')}
                >
                  {t('Ir a Afiliación') || 'Ir a Afiliación'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Selector de idioma funcional */}
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition border border-gray-700"
          onClick={() => handleLanguageChange(language === 'es' ? 'en' : 'es')}
          title={language === 'es' ? 'Cambiar a inglés' : 'Cambiar a español'}
          aria-label="Cambiar idioma"
        >
          <FiGlobe className="w-5 h-5" />
          <span className="text-base font-bold">{language === 'es' ? 'ES' : 'EN'}</span>
        </button>
        {/* Avatar y menú de usuario */}
        <div className="relative flex items-center gap-1 sm:gap-3">
          {isLoggedIn ? (
            <>
              {/* Switch tipo Client | IB */}
              <SwitchClienteIB
                mode={affiliateMode === 'IB' ? 'IB' : 'Client'}
                onChange={handleSwitchAffiliate}
                size="md"
              />
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setOpenMenu((v) => !v)}
                title="Menú de usuario"
                aria-label="Menú de usuario"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-cyan-400 shadow bg-transparent"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-cyan-900 flex items-center justify-center border-2 border-cyan-400">
                    <FiUser className="w-5 h-5 text-cyan-300" />
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              <button className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition mr-2 text-sm sm:text-base" title="Conectar a wallet" aria-label="Conectar a wallet"
                onClick={() => alert('Función de conectar wallet próximamente')}
              >
                Conectar a wallet
              </button>
              <button className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition text-sm sm:text-base" title="Iniciar sesión o registrarse" aria-label="Iniciar sesión"
                onClick={() => navigate('/login')}
              >
                {t('Iniciar sesión') || 'Iniciar sesión'}
              </button>
            </>
          )}
          {/* Menú desplegable */}
          <AnimatePresence>
            {openMenu && isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 8 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-40 bg-black border border-cyan-400 rounded-xl shadow-xl z-50"
                style={{ minWidth: 160 }}
              >
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-cyan-900 text-left text-white font-orbitron text-base transition rounded-t-xl bg-black"
                  onClick={() => navigate('/perfil')}
                >
                  <FiUser className="w-5 h-5" /> {t('Mi Perfil') || 'Mi Perfil'}
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-700 text-left text-white font-orbitron text-base transition rounded-b-xl bg-black"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUserName('Invitado');
                    updateUserInfo({ name: '', email: '' });
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                >
                  <FiLogOut className="w-5 h-5" /> {t('Cerrar Sesión') || 'Cerrar Sesión'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 