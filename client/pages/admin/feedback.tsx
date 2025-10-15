import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import feedbackService from '@/services/feedback.service';
import { 
  Mail, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageCircle,
  Download,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  X,
  FileText,
  RefreshCw,
  User,
  MessageSquare,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackMessage {
  id: number;
  subject: string;
  message: string;
  user_name: string;
  user_email: string;
  file_name: string | null;
  file_url: string | null;
  storage_path: string | null;
  file_names: string[] | null;
  file_urls: string[] | null;
  storage_paths: string[] | null;
  files_count: number;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  ip_address: string;
  user_agent: string;
  browser_name: string | null;
  browser_version: string | null;
  os: string | null;
}

interface FileInfo {
  name: string;
  url: string;
}

interface LocationInfo {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getLocationByIP = async (ip: string): Promise<LocationInfo | null> => {
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return null;
  }

  try {
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `https://api.ipgeolocation.io/ipgeo?apiKey=demo&ip=${ip}`,
      `http://ip-api.com/json/${ip}`
    ];

    for (const service of services) {
      try {
        // Создаем AbortController для timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(service, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (service.includes('ipapi.co')) {
            return {
              city: data.city,
              region: data.region,
              country: data.country_name,
              countryCode: data.country_code,
              timezone: data.timezone
            };
          } else if (service.includes('ipgeolocation')) {
            return {
              city: data.city,
              region: data.state_prov,
              country: data.country_name,
              countryCode: data.country_code2,
              timezone: data.timezone?.name
            };
          } else if (service.includes('ip-api.com')) {
            if (data.status === 'success') {
              return {
                city: data.city,
                region: data.regionName,
                country: data.country,
                countryCode: data.countryCode,
                timezone: data.timezone
              };
            }
          }
        }
      } catch (error) {
        console.warn(`Location service ${service} failed:`, error);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('All location services failed:', error);
    return null;
  }
};

const LocationDisplay: React.FC<{ ip: string }> = ({ ip }) => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (ip && ip !== 'unknown') {
        setLoading(true);
        try {
          const locationData = await getLocationByIP(ip);
          setLocation(locationData);
        } catch (error) {
          console.error('Error fetching location:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLocation();
  }, [ip]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
        <span>Определение региона...</span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span>Регион не определен</span>
      </div>
    );
  }

  const locationText = [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex items-center gap-1 text-xs" title={`IP: ${ip}`}>
      <MapPin className="w-3 h-3 text-red-500" />
      <span className="text-gray-700 font-medium">{locationText}</span>
      {location.countryCode && (
        <span className="text-xs text-gray-500">({location.countryCode})</span>
      )}
    </div>
  );
};

export const AdminFeedbackPage: React.FC = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [allMessages, setAllMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<{url: string, name: string} | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const allData = await feedbackService.getFeedbackMessages({ limit: 1000 });
      setAllMessages(allData);

      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      filters.limit = 100;
      
      const data = await feedbackService.getFeedbackMessages(filters);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const updateStatus = async (messageId: number, newStatus: string) => {
    let previousStatus: string | undefined;
    
    try {
      setUpdatingStatus(messageId);
      previousStatus = messages.find(msg => msg.id === messageId)?.status;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { 
          ...msg, 
          status: newStatus as any,
          updated_at: new Date().toISOString()
        } : msg
      ));
      
      const result = await feedbackService.updateFeedbackStatus(messageId, newStatus);
      
      if (result.success) {
        toast.success('Статус обновлен');
      } else {
        throw new Error('Не удалось обновить статус');
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка обновления статуса');
      
      if (previousStatus) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: previousStatus as any } : msg
        ));
        setAllMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: previousStatus as any } : msg
        ));
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefreshClick = () => {
    fetchMessages();
    toast.info('Данные обновлены');
  };

  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const getMessageFiles = (message: FeedbackMessage): FileInfo[] => {
    if (message.files_count > 0 && message.file_names && message.file_urls) {
      return message.file_names.map((name, index) => ({
        name,
        url: message.file_urls![index]
      }));
    }
    if (message.file_name && message.file_url) {
      return [{ name: message.file_name, url: message.file_url }];
    }
    return [];
  };

  const handleFileView = (file: FileInfo) => {
    if (!file.url) {
      toast.error('Файл не найден');
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    if (imageExtensions.includes(fileExt || '')) {
      setImagePreview({
        url: file.url,
        name: file.name
      });
    } else if (fileExt === 'pdf') {
      window.open(file.url, '_blank');
    } else {
      window.open(file.url, '_blank');
    }
  };

  const handleFileDownload = (file: FileInfo) => {
    if (!file.url) {
      toast.error('Файл не найден');
      return;
    }
    
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4 text-red-500" />;
    } else if (['pdf'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-red-600" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    if (statusFilter !== 'all' && message.status !== statusFilter) {
      return false;
    }
    
    return (
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-50 text-red-700 border-red-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решено';
      case 'closed': return 'Завершен';
      default: return status;
    }
  };

  const StatusDropdown: React.FC<{ currentStatus: string; messageId: number }> = ({ 
    currentStatus, 
    messageId 
  }) => (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(messageId, e.target.value)}
        disabled={updatingStatus === messageId}
        className={`appearance-none px-3 py-2 pr-8 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
          getStatusColor(currentStatus)
        } hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="new">Новый</option>
        <option value="in_progress">В работе</option>
        <option value="resolved">Решено</option>
        <option value="closed">Завершен</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
      {updatingStatus === messageId && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
          <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
        </div>
      )}
    </div>
  );

  const stats = {
    total: allMessages.length,
    new: allMessages.filter(m => m.status === 'new').length,
    inProgress: allMessages.filter(m => m.status === 'in_progress').length,
    resolved: allMessages.filter(m => m.status === 'resolved').length,
    closed: allMessages.filter(m => m.status === 'closed').length,
  };

  return (
    <AdminLayout title="">
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-900">{imagePreview.name}</h3>
              <button 
                onClick={() => setImagePreview(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 bg-black">
              <img 
                src={imagePreview.url} 
                alt={imagePreview.name}
                className="max-w-full max-h-[70vh] object-contain mx-auto rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 p-6 pt-0">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Обратная связь
              </h1>
              <p className="text-gray-600">
                Управление сообщениями от пользователей
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                {stats.total} всего
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                {stats.new} новых
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
                {stats.inProgress} в работе
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Всего</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                <p className="text-sm text-gray-600">Новые</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">В работе</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-gray-600">Решено</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                <p className="text-sm text-gray-600">Завершены</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по теме, имени или email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white transition-colors text-sm min-w-[140px]"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новые</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решено</option>
                <option value="closed">Завершены</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map((message) => {
                const messageFiles = getMessageFiles(message);
                
                return (
                  <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                              {message.subject}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{message.user_name}</span>
                              </div>
                              <span className="text-blue-600">{message.user_email}</span>
                              <span className="text-gray-500">{formatDate(message.created_at)}</span>
                            </div>
                          </div>
                          <StatusDropdown 
                            currentStatus={message.status} 
                            messageId={message.id} 
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(message.status)}
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusText(message.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-2 leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                    
                    {messageFiles.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FileText className="w-4 h-4" />
                          <span>Файлы ({messageFiles.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {messageFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border">
                              {getFileIcon(file.name)}
                              <span className="text-sm text-gray-700 max-w-[200px] truncate">
                                {file.name}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleFileView(file)}
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Просмотреть"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleFileDownload(file)}
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Скачать"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <LocationDisplay ip={message.ip_address} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleMessageExpansion(message.id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {expandedMessage === message.id ? 'Скрыть детали' : 'Показать детали'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          expandedMessage === message.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      <div className="text-xs text-gray-500">
                        ID: {message.id}
                      </div>
                    </div>

                    {expandedMessage === message.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 border">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Полный текст:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap text-sm bg-white p-3 rounded border">
                            {message.message}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Техническая информация:</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">IP-адрес:</span>
                                <span className="font-medium text-xs font-mono">{message.ip_address}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">Регион:</span>
                                <span className="font-medium">
                                  <LocationDisplay ip={message.ip_address} />
                                </span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">Браузер:</span>
                                <span className="font-medium">
                                  {message.browser_name || 'Неизвестно'} {message.browser_version || ''}
                                </span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">ОС:</span>
                                <span className="font-medium">{message.os || 'Неизвестно'}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">Отправлено:</span>
                                <span className="font-medium">{formatDate(message.created_at)}</span>
                              </div>
                              {message.updated_at !== message.created_at && (
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                  <span className="text-gray-600">Обновлено:</span>
                                  <span className="font-medium">{formatDate(message.updated_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Управление статусом:</h4>
                            <div className="flex items-center gap-3 p-3 bg-white rounded border">
                              <StatusDropdown 
                                currentStatus={message.status} 
                                messageId={message.id} 
                              />
                              <span className="text-sm text-gray-500">
                                {message.status === 'new' && 'Ожидает обработки'}
                                {message.status === 'in_progress' && 'Находится в работе'}
                                {message.status === 'resolved' && 'Проблема решена'}
                                {message.status === 'closed' && 'Обращение закрыто'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Сообщений не найдено</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтры' 
                  : 'Пока нет сообщений обратной связи'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;