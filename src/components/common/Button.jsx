import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled = false,
    ...props
}) => {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
        outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'bg-status-error hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100';

    return (
        <motion.button
            whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
            className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${(disabled || loading) ? disabledClasses : ''}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </motion.button>
    );
};

export default Button;
