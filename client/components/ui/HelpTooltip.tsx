import React, { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, className = '' }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <div className={`relative inline-block ml-2 ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="w-5 h-5 rounded-full bg-gray-400 text-white text-xs font-bold hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center"
        aria-label="Показать подсказку"
      >
        ?
      </button>

      {isVisible && (
        <div className="absolute z-10 w-80 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-lg -left-40 md:-left-20">
          <div className="whitespace-pre-line">{content}</div>
          {/* Стрелочка */}
          <div className="absolute -top-1 left-20 md:left-8 w-2 h-2 bg-white border-l border-t border-gray-300 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};
