import React, { useState, useEffect } from "react";
import { X, Upload, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import feedbackService from '@/services/feedback.service';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  subject: string;
  message: string;
  name: string;
  email: string;
  files: File[];
  consent: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    subject: "",
    message: "",
    name: "",
    email: "",
    files: [],
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsMounted(true), 10);
    } else {
      setIsMounted(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
    
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await feedbackService.submitFeedback({
        subject: formData.subject,
        message: formData.message,
        user_name: formData.name,
        user_email: formData.email,
        files: formData.files
      });

      if (result.success) {
        toast.success("Сообщение об ошибке отправлено");
        
        setFormData({
          subject: "",
          message: "",
          name: "",
          email: "",
          files: [],
          consent: false
        });
        
        onClose();
      } else {
        throw new Error("Ошибка отправки");
      }
      
    } catch (error: any) {
      console.error("Ошибка при отправке:", error);
      toast.error(error.message || "Ошибка при отправке сообщения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.subject && 
                     formData.message && 
                     formData.name && 
                     formData.email && 
                     formData.consent;

  if (!isOpen && !isMounted) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto transition-all duration-300 transform ${isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} max-h-[90vh] overflow-y-auto`}>
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Сообщить об ошибке
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тема вашего обращения *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Введите тему обращения"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сообщение *
            </label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              Опишите порядок действий, вызвавших ошибку. Приложите данные, при обработке которых произошла ошибка.
            </p>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Подробно опишите проблему..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Присоединить файлы {formData.files.length > 0 && `(${formData.files.length})`}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Приложите снимки экрана с интерфейсом системы или сообщением об ошибке.
              Можно выбрать несколько файлов.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <label className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto">
                <Upload className="w-4 h-4" />
                <span>Выбрать файлы</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  multiple
                />
              </label>
            </div>
            
            {formData.files.length > 0 && (
              <div className="space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Удалить файл"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ваше имя"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="consent"
              id="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
              required
            />
            <label htmlFor="consent" className="text-xs text-gray-700 leading-relaxed">
              Я даю согласие на обработку моих персональных данных в соответствии с политикой конфиденциальности. *
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};