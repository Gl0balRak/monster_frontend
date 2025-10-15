class DocumentationService {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    this.tableName = 'documentation';
    
    console.log('Supabase Documentation Service запущен', {
      url: this.supabaseUrl ? 'Настроен' : 'Отсутствует',
      key: this.supabaseKey ? 'Настроен' : 'Отсутствует',
      table: this.tableName
    });
  }

  async getDocumentation() {
    try {
      console.log('[Supabase] Загрузка данных...');
      
      if (!this.isConfigured()) {
        console.log('[Supabase] Используем локальные данные (не настроен)');
        return this.getFallbackData();
      }

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.1`, 
        {
          headers: this.getHeaders()
        }
      );

      console.log(`[Supabase] Ответ: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0 && data[0].data) {
        console.log('[Supabase] Данные успешно загружены', {
          categories: data[0].data.categories?.length
        });
        return data[0].data;
      } else {
        console.log('[Supabase] Данные не найдены в таблице');
        return this.getFallbackData();
      }
      
    } catch (error) {
      console.error('[Supabase] Ошибка загрузки:', error.message);
      return this.getFallbackData();
    }
  }

  async saveDocumentation(documentationData) {
    try {
      console.log('[Supabase] Сохранение данных...', {
        categories: documentationData.categories?.length
      });

      if (!this.isConfigured()) {
        throw new Error('Supabase не настроен - проверьте переменные окружения');
      }

      const payload = {
        id: 1,
        data: documentationData,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.1`, 
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        }
      );

      console.log(`[Supabase] Статус сохранения: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Supabase] Ошибка сохранения:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Сохранение не удалось: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Supabase] Данные успешно сохранены!', {
        updatedAt: result[0]?.updated_at
      });
      
      return { 
        success: true, 
        message: 'Данные сохранены в Supabase',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[Supabase] Критическая ошибка:', error.message);
      throw new Error(`Ошибка сохранения: ${error.message}`);
    }
  }

  isConfigured() {
    const configured = !!(this.supabaseUrl && this.supabaseKey);
    if (!configured) {
      console.warn('Supabase не настроен. Проверьте VITE_SUPABASE_URL и VITE_SUPABASE_KEY');
    }
    return configured;
  }

  getHeaders() {
    return {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  getFallbackData() {
    console.log('Используем резервные данные');
    return {
      categories: [
        {
          id: "fallback-mode",
          title: "Локальный режим",
          description: "Данные загружены из резервного хранилища",
          icon_name: "database",
          order: 1,
          articles: [
            {
              id: "fallback-1",
              title: "Supabase недоступен",
              description: "В данный момент данные загружены локально",
              link: "#",
              order: 1
            }
          ]
        }
      ]
    };
  }

  async testConnection() {
    console.log('Тестируем подключение к Supabase...');
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });
      
      const success = response.ok;
      console.log(success ? 'Подключение к Supabase УСПЕШНО' : 'Подключение к Supabase НЕУДАЧНО');
      return { success, status: response.status };
    } catch (error) {
      console.error('Ошибка подключения:', error);
      return { success: false, error: error.message };
    }
  }
}

const documentationService = new DocumentationService();
export default documentationService;