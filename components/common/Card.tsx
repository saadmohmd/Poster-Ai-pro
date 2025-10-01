import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-lg shadow-lg backdrop-blur-sm p-5 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-indigo-400 mb-4">{title}</h3>}
        {children}
    </div>
  );
};