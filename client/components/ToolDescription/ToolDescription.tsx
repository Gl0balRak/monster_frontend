import { useEffect, useState } from "react";

interface ToolDescriptionProps {
  shortDescription: string;
  fullDescription: string | React.ReactNode;
}

const ToolDescription: React.FC<ToolDescriptionProps> = ({ 
  shortDescription, 
  fullDescription 
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
      if (isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
  
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isExpanded]);

  return (
    <>
      <div className="overflow-hidden">
        <div className="flex items-center gap-4">
          <p className="text-gray-900 text-sm">
            {shortDescription}
          </p>
          
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 cursor-pointer text-left hover:text-red-500 group"
          >
            <span className="w-5 h-5 rounded-full bg-red-400 text-white text-xs font-bold group-hover:bg-red-500 transition-colors duration-200 flex items-center justify-center">
              !
            </span>
            <span className="text-gray-900 text-sm text-red-400 whitespace-nowrap group-hover:text-red-500">
              Инструкция
            </span>
          </button>
        </div>
      </div>

      <div className={`
        fixed top-0 right-0 h-screen bg-white shadow-xl z-[100]
        transform transition-all duration-500 ease-in-out
        ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ width: '450px', maxWidth: '95vw' }}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Детальное описание</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Закрыть панель"
          >
            <span className="text-lg font-bold text-gray-600 inline-flex items-center">×</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="text-gray-700 text-base leading-relaxed space-y-4">
            {fullDescription}
          </div>
        </div>
      </div>

      <div className={`
        fixed inset-0 bg-black z-40 transition-all duration-500 ease-in-out z-[99]
        ${isExpanded ? 'opacity-50' : 'opacity-0 pointer-events-none'}
      `}
        onClick={() => setIsExpanded(false)}
      />
    </>
  );
};

export default ToolDescription;