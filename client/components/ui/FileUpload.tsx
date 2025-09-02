import React, { useState, useRef, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { commonClasses } from '@/lib/design-system';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string;
  selectedFileName?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = '.xlsx,.csv',
  selectedFileName,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Проверяем тип файла
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (acceptedTypes.includes(`.${fileType}`)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          {
            'border-gray-2 bg-gray-0 hover:bg-gray-1': !isDragOver,
            'border-red-9 bg-red-0': isDragOver,
          }
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <svg 
            className="w-8 h-8 text-gray-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          {selectedFileName ? (
            <div>
              <p className={cn('text-sm font-medium text-black', commonClasses.font)}>
                Выбран файл: {selectedFileName}
              </p>
              <p className={cn('text-xs text-gray-5', commonClasses.font)}>
                Нажмите для замены или перетащите новый файл
              </p>
            </div>
          ) : (
            <div>
              <p className={cn('text-sm font-medium text-gray-7', commonClasses.font)}>
                Выберите файл или перетащите сюда
              </p>
              <p className={cn('text-xs text-gray-5', commonClasses.font)}>
                Поддерживаемые форматы: {acceptedTypes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
