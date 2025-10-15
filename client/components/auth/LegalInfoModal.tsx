import React from 'react';
import { X } from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Юридическая информация</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="text-gray-900 block mb-1">ИП:</strong>
              <span className="text-gray-700">Михайлов Дмитрий Сергеевич</span>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">ИНН:</strong>
              <span className="text-gray-700">78025669321</span>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">Телефон:</strong>
              <span className="text-gray-700">+7 (495) 477-57-39</span>
            </div>
            <div>
              <strong className="text-gray-900 block mb-1">Email:</strong>
              <span className="text-gray-700">mail@mihaylov.digital</span>
            </div>
          </div>
          
          <div>
            <strong className="text-gray-900 block mb-2">Описание услуг:</strong>

            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Текстовый анализ сайтов</li>
              <li>Семантический анализ</li>
              <li>Прокачка запросного индекса</li>
              <li>Анализ ссылок</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-gray-900 block mb-2">Стоимость услуг:</strong>
            <span className="text-gray-700">1 лимит - 1 рубль 00 копеек </span>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Текстовый анализ - 5 лимитов за 1 анализ</li>
              <li>Семантика - 1 лимит за 1 операцию анализа</li>
              <li>Прокачка запросного индекса - 10 лимитов за 1 операцию анализа</li>
              <li>Анализ ссылок - 0 лимитов</li>
            </ul>
          </div>
          
          <div>
            <p className="text-gray-700">
              <strong>Договор оферты:</strong>{' '}
              <a 
                href="/оферта.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-800 underline"
              >
                Скачать договор оферты
              </a>
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalInfoModal;