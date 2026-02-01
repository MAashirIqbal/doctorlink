import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-status-error focus:border-status-error focus:ring-status-error/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-status-error">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
