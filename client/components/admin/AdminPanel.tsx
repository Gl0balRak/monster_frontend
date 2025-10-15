import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Edit3, BookOpen, Video, Book, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import documentationService from '@/services/documentation.service';

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const AdminDocumentationEditor: React.FC = () => {
  const [data, setData] = useState<any>({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await documentationService.getDocumentation();
      setData(result);
      const allCategoryIds = result.categories.map((cat: any) => cat.id);
      setExpandedCategories(new Set(allCategoryIds));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      await documentationService.saveDocumentation(data);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const recalculateOrders = (categories: any[]) => {
    return categories.map((category, index) => ({
      ...category,
      order: index + 1,
      articles: category.articles?.map((article: any, articleIndex: number) => ({
        ...article,
        order: articleIndex + 1
      })) || []
    }));
  };

  const addCategory = () => {
    const newCategory = {
      id: generateId(),
      title: 'Новый раздел',
      description: 'Описание раздела',
      icon_name: 'book',
      order: data.categories.length + 1,
      articles: []
    };
    
    const updatedCategories = [...data.categories, newCategory];
    setData({
      ...data,
      categories: recalculateOrders(updatedCategories)
    });
    setExpandedCategories(prev => new Set([...Array.from(prev), newCategory.id]));
  };

  const addArticle = (categoryId: string) => {
    setData({
      ...data,
      categories: data.categories.map((category: any) => 
        category.id === categoryId 
          ? {
              ...category,
              articles: [
                ...category.articles,
                {
                  id: generateId(),
                  title: 'Новая статья',
                  description: 'Описание статьи',
                  link: '#',
                  order: category.articles.length + 1
                }
              ]
            }
          : category
      )
    });
  };

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = data.categories.filter((cat: any) => cat.id !== categoryId);
    setData({
      ...data,
      categories: recalculateOrders(updatedCategories)
    });
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.delete(categoryId);
      return newSet;
    });
  };

  const deleteArticle = (categoryId: string, articleId: string) => {
    setData({
      ...data,
      categories: data.categories.map((category: any) =>
        category.id === categoryId
          ? {
              ...category,
              articles: category.articles
                .filter((article: any) => article.id !== articleId)
                .map((article: any, index: number) => ({
                  ...article,
                  order: index + 1
                }))
            }
          : category
      )
    });
  };

  const updateCategory = (categoryId: string, field: string, value: any) => {
    setData({
      ...data,
      categories: data.categories.map((category: any) =>
        category.id === categoryId
          ? { ...category, [field]: value }
          : category
      )
    });
  };

  const updateArticle = (categoryId: string, articleId: string, field: string, value: any) => {
    setData({
      ...data,
      categories: data.categories.map((category: any) =>
        category.id === categoryId
          ? {
              ...category,
              articles: category.articles.map((article: any) =>
                article.id === articleId
                  ? { ...article, [field]: value }
                  : article
              )
            }
          : category
      )
    });
  };

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const categories = [...data.categories];
    const index = categories.findIndex(cat => cat.id === categoryId);
    
    if (direction === 'up' && index > 0) {
      [categories[index], categories[index - 1]] = [categories[index - 1], categories[index]];
    } else if (direction === 'down' && index < categories.length - 1) {
      [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]];
    }
    
    setData({ ...data, categories: recalculateOrders(categories) });
  };

  const moveArticle = (categoryId: string, articleId: string, direction: 'up' | 'down') => {
    setData({
      ...data,
      categories: data.categories.map((category: any) => {
        if (category.id === categoryId) {
          const articles = [...category.articles];
          const index = articles.findIndex(art => art.id === articleId);
          
          if (direction === 'up' && index > 0) {
            [articles[index], articles[index - 1]] = [articles[index - 1], articles[index]];
          } else if (direction === 'down' && index < articles.length - 1) {
            [articles[index], articles[index + 1]] = [articles[index + 1], articles[index]];
          }
          
          return { 
            ...category, 
            articles: articles.map((article, idx) => ({ ...article, order: idx + 1 }))
          };
        }
        return category;
      })
    });
  };

  const handleBack = () => {
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    if (referrer.startsWith(currentOrigin) && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/documentation');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

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

return (
  <div className="flex-1 bg-gray-50 p-6 pt-0">
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Редактор документации
            </h1>
            <p className="text-gray-600">
              Управление разделами и статьями документации
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {data.categories.length} разделов
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              {data.categories.reduce((acc: number, cat: any) => acc + (cat.articles?.length || 0), 0)} статей
            </span>
          </div>
        </div>
      </div>

      {/* Панель управления */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addCategory}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить раздел
          </button>
          <button
            onClick={saveData}
            disabled={saving}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к документации
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {data.categories.map((category: any, index: number) => (
          <div key={category.id} className="border-b border-gray-200 last:border-b-0">
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full px-6 py-5 flex items-center justify-between transition-all duration-200 ${
                expandedCategories.has(category.id) ? "bg-red-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  expandedCategories.has(category.id) ? "bg-red-500 text-white" : "bg-gradient-to-br from-red-500 to-red-600 text-white"
                }`}>
                  {getIconByName(category.icon_name)}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      value={category.title}
                      onChange={(e) => updateCategory(category.id, 'title', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-red-500 outline-none flex-1 text-left"
                      placeholder="Название раздела"
                    />
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0">
                      {category.articles?.length || 0} статей
                    </span>
                  </div>
                  <textarea
                    value={category.description}
                    onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-red-500 rounded-lg p-2 outline-none resize-none text-left"
                    placeholder="Описание раздела..."
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-2">
                  <select
                    value={category.icon_name}
                    onChange={(e) => updateCategory(category.id, 'icon_name', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="book">Book</option>
                    <option value="rocket">Rocket</option>
                    <option value="search">Search</option>
                    <option value="chart">Chart</option>
                    <option value="zap">Zap</option>
                    <option value="link">Link</option>
                    <option value="video">Video</option>
                    <option value="help">Help</option>
                  </select>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveCategory(category.id, 'up'); }}
                      disabled={index === 0}
                      className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                      title="Переместить вверх"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveCategory(category.id, 'down'); }}
                      disabled={index === data.categories.length - 1}
                      className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                      title="Переместить вниз"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); addArticle(category.id); }}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Статью
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 flex items-center gap-1"
                    title="Удалить раздел"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className={`transform transition-transform duration-200 ${
                  expandedCategories.has(category.id) ? "rotate-180" : ""
                }`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${
              expandedCategories.has(category.id) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}>
              <div className="px-6 pb-5 bg-gray-50">
                <div className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {category.articles?.map((article: any, articleIndex: number) => (
                      <div 
                        key={article.id} 
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 group flex flex-col h-full min-h-[140px]"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <input
                              value={article.title}
                              onChange={(e) => updateArticle(category.id, article.id, 'title', e.target.value)}
                              className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-red-500 outline-none flex-1 text-gray-900 line-clamp-2"
                              placeholder="Заголовок статьи"
                            />
                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveArticle(category.id, article.id, 'up')}
                                disabled={articleIndex === 0}
                                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                                title="Переместить вверх"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveArticle(category.id, article.id, 'down')}
                                disabled={articleIndex === category.articles.length - 1}
                                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                                title="Переместить вниз"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => deleteArticle(category.id, article.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Удалить статью"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <textarea
                            value={article.description}
                            onChange={(e) => updateArticle(category.id, article.id, 'description', e.target.value)}
                            className="w-full text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-red-500 rounded-lg p-2 pl-0 outline-none resize-none text-gray-600 leading-relaxed mb-3"
                            placeholder="Описание статьи"
                            rows={3}
                          />
                          
                          <input
                            value={article.link}
                            onChange={(e) => updateArticle(category.id, article.id, 'link', e.target.value)}
                            className="w-full text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-red-500 outline-none text-blue-600"
                            placeholder="https://example.com/article"
                          />
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>ID: {article.id.slice(-6)}</span>
                            <span>Порядок: {article.order}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addArticle(category.id)}
                      className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] text-gray-500 hover:text-gray-700 group"
                    >
                      <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Добавить статью</span>
                      <span className="text-xs mt-1 text-gray-400">Нажмите чтобы создать</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {data.categories.length === 0 && (
          <div className="text-center py-16">
            <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет разделов</h3>
            <p className="text-gray-600 mb-6">Добавьте первый раздел документации</p>
            <button
              onClick={addCategory}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Создать раздел
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};