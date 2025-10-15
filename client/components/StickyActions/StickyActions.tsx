import React, { useState, useRef, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { commonClasses } from "@/lib/design-system";

interface StickyButton {
  key: string;
  label: string;
  loading: boolean;
  color: string;
  icon: React.ReactNode;
  tooltip: string;
}

interface StickyActionsProps {
  buttons: StickyButton[];
  onButtonClick: (key: string) => void;
}

const StickyActions: React.FC<StickyActionsProps> = ({ buttons, onButtonClick }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((key: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredButton(key);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredButton(null);
  }, []);

  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700",
    purple: "bg-purple-600 hover:bg-purple-700", 
    green: "bg-green-600 hover:bg-green-700",
    darkBlue: "bg-blue-800 hover:bg-blue-900",
    cyan: "bg-cyan-500 hover:bg-cyan-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    teal: "bg-teal-500 hover:bg-teal-600",
    blue: "bg-blue-600 hover:bg-blue-700",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {buttons.map((button) => {
        const isHovered = hoveredButton === button.key;
        const finalColorClass = colorClasses[button.color as keyof typeof colorClasses] || "bg-gray-600";

        return (
          <div 
            key={button.key} 
            className="relative group"
            onMouseEnter={() => handleMouseEnter(button.key)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => onButtonClick(button.key)}
              disabled={button.loading}
              className={cn(
                "relative rounded-lg text-white font-medium transition-all duration-300 overflow-hidden z-10",
                "text-sm h-10 flex items-center justify-center",
                button.loading
                  ? "opacity-50 cursor-not-allowed bg-gray-400"
                  : finalColorClass,
                isHovered ? "w-auto px-4 justify-start" : "w-12",
                "shadow-md hover:shadow-lg",
                commonClasses.font
              )}
            >
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                {button.icon}
              </span>
              
              <span className={cn(
                "whitespace-nowrap text-left transition-all duration-300 overflow-hidden",
                isHovered ? "opacity-100 max-w-full ml-3" : "opacity-0 max-w-0 w-0 ml-0"
              )}>
                {button.loading ? `${button.label.split(' ')[0]}...` : button.label}
              </span>
            </button>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              {button.tooltip}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StickyActions;