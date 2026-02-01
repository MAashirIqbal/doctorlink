import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    glass = false,
    hover = true,
    ...props
}) => {
    const baseClasses = glass ? 'glass-card' : 'card';
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
