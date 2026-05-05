import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-white text-gray-700 border border-gray-200 shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center dark:bg-[#161e1c] dark:text-gray-200 dark:border-[#232e2c]"
        >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
};

export default ThemeToggle;
