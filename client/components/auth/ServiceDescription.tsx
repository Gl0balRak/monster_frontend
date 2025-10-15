import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';

const ServiceDescription: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">
            Профессиональные инструменты для SEO-специалистов
          </span>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronUp className="w-4 h-4 text-gray-500" />
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              Инструменты для анализа содержимого сайтов:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>
                  <strong>Текстовый анализ</strong> - глубокий анализ контента страницы, проверка SEO-параметров, 
                  сравнение с конкурентами из поисковой выдачи, анализ LSI-фраз и ключевых слов
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>
                  <strong>Семантика</strong> - сбор и кластеризация семантического ядра, парсинг ключевых слов 
                  с конкурентов, анализ частотностей, спроса и кликов, проверка коммерциализации
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>
                  <strong>Прокачка запросного индекса</strong> - анализ и оптимизация запросного потенциала сайта, 
                  выявление новых ключевых фраз, расширение семантического покрытия
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>
                  <strong>Анализ ссылок</strong> - классификация и анализ ссылочной массы, определение типов ссылок 
                  (крауд, сабмит, спам и др.), оценка качества ссылочного профиля
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDescription;