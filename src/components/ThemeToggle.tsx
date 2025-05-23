import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/themeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full
        bg-neurolink-cyberBlue/10 border-2 border-neurolink-matrixGreen/30
        text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20
        transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-neurolink-matrixGreen" />
        ) : (
          <Moon className="w-6 h-6 text-neurolink-cyberBlue" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 