import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Shield, ChevronUp, ArrowRight, Book, Video, HelpCircle } from 'lucide-react';
import documentationService from '@/services/documentation.service';
import { useNavigate } from 'react-router-dom';

const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const getIconByName = (iconName: string): React.ReactNode => {
  const icons: { [key: string]: React.ReactNode } = {
    rocket: <RocketIcon />,
    search: <SearchIcon />,
    chart: <ChartIcon />,
    zap: <ZapIcon />,
    link: <LinkIcon />,
    book: <Book className="w-5 h-5" />,
    video: <Video className="w-5 h-5" />,
    help: <HelpCircle className="w-5 h-5" />,
  };
  return icons[iconName] || <Book className="w-5 h-5" />;
};

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articlesCount: number;
  content: {
    title: string;
    description: string;
    link: string;
  }[];
}

const Documentation: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [documentationData, setDocumentationData] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;
  const navigate = useNavigate();

  const fetchDocumentationData = async () => {
    try {
      setLoading(true);
      const data = await documentationService.getDocumentation();
      
      if (!data || !data.categories) {
        throw new Error('Некорректные данные документации');
      }
      
      const formattedData: DocumentationItem[] = data.categories.map((category: any) => ({
        id: category.id.toString(),
        title: category.title || 'Без названия',
        description: category.description || 'Описание отсутствует',
        icon: getIconByName(category.icon_name),
        articlesCount: category.articles?.length || 0,
        content: (category.articles || [])
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((article: any) => ({
            title: article.title || 'Без названия',
            description: article.description || 'Описание отсутствует',
            link: article.link || "#",
          }))
      }));
      
      setDocumentationData(formattedData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке документации');
      console.error('Error fetching documentation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentationData();
  }, []);

  const toggleItem = (itemId: string) => {
    setActiveItem(prev => prev === itemId ? null : itemId);
  };

  const isItemOpen = (itemId: string) => activeItem === itemId;

  const refreshData = () => {
    fetchDocumentationData();
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Документация</h1>
            <p className="text-gray-600">Загрузка данных...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Документация</h1>
            <p className="text-gray-600">Ошибка загрузки данных</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={refreshData} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Документация</h1>
              <p className="text-gray-600">Справочные материалы и руководства по использованию сервиса</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {documentationData.map((item) => (
                <div key={item.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-full px-6 py-5 flex items-center justify-between transition-all duration-200 ${
                      isItemOpen(item.id) ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isItemOpen(item.id) ? "bg-red-500 text-white" : "bg-gradient-to-br from-red-500 to-red-600 text-white"
                      }`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className="bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">
                            {item.articlesCount} статей
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-200 ${isItemOpen(item.id) ? "rotate-180" : ""}`}>
                      <ChevronUp className="w-5 h-5" />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-200 ${
                    isItemOpen(item.id) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-6 pb-5 bg-gray-50">
                      <div className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {item.content.map((article, index) => (
                            <div 
                              key={index} 
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] group flex flex-col h-full min-h-[140px]"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                                  {article.description}
                                </p>
                              </div>
                              <div className="mt-auto">
                                <button 
                                  onClick={() => window.open(article.link, '_blank')}
                                  className="inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 group"
                                >
                                  Читать
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.open('#', '_blank')}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Book className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 leading-tight">Полное руководство</div>
                    <div className="text-sm text-gray-600 mt-1">PDF документация</div>
                  </div>
                </button>
                <button 
                  onClick={() => window.open('#', '_blank')}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-600 leading-tight">Видеоуроки</div>
                    <div className="text-sm text-gray-600 mt-1">15+ материалов</div>
                  </div>
                </button>
                <button 
                  onClick={() => window.open('#', '_blank')}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-600 leading-tight">Поддержка</div>
                    <div className="text-sm text-gray-600 mt-1">Помощь 24/7</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;