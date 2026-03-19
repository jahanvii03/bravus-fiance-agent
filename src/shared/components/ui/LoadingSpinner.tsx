import React from 'react';

interface LoadingSpinnerProps {
    variant?: 'default' | 'sidebar' | 'inline';
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    variant = 'default',
    size = 'md',
    message = 'Loading...'
}) => {
    // Size configurations
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-16 w-16'
    };

    // Variant configurations
    if (variant === 'sidebar') {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-gray-200 border-t-[#273658]`}></div>
                <p className="mt-3 text-sm text-gray-500 font-medium">{message}</p>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex items-center justify-center gap-2">
                <div className={`animate-spin rounded-full ${sizeClasses.sm} border-2 border-gray-200 border-t-[#273658]`}></div>
                <span className="text-sm text-gray-500">{message}</span>
            </div>
        );
    }

    // Default variant (overlay)
    return (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-10">
            <div className="p-4 rounded-lg flex flex-col items-center bg-white shadow-lg">
                <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-gray-200 border-t-[#273658]`}></div>
                <p className="mt-3 text-sm text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;