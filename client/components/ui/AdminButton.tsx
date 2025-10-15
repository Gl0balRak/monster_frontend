import React from 'react';
import { Shield } from 'lucide-react';

interface AdminButtonProps {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminButton: React.FC<AdminButtonProps> = ({ 
  onClick, 
  href, 
  children, 
  className = '' 
}) => {
  const buttonClass = `bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${className}`;

  if (href) {
    return (
      <a href={href} className={buttonClass}>
        <Shield className="w-4 h-4" />
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass}>
      <Shield className="w-4 h-4" />
      {children}
    </button>
  );
};