class FeedbackService {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    this.tableName = 'feedback_messages';
    this.bucketName = 'feedback-files';
    
    console.log('Feedback Service initialized', {
      url: this.supabaseUrl,
      key: this.supabaseKey ? '***' + this.supabaseKey.slice(-8) : 'none'
    });
  }

  getPublicHeaders() {
    return {
      'apikey': this.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

    async uploadFile(file) {
    try {
      console.log('Uploading single file:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Ошибка загрузки файла: ${uploadResponse.status} - ${errorText}`);
      }

      const fileUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${fileName}`;
      
      console.log('File uploaded successfully:', fileUrl);
      
      return {
        success: true,
        fileName: file.name,
        fileUrl: fileUrl,
        storagePath: fileName
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }


  getFileViewUrl(filePath) {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;
  }

  parseBrowserInfo() {
    const ua = navigator.userAgent;
    
    let browserName = 'Неизвестный браузер';
    let browserVersion = 'Неизвестная версия';
    let os = 'Неизвестная ОС';

    if (ua.includes('Opera') || ua.includes('OPR/')) {
      browserName = 'Opera';
      const match = ua.match(/(Opera|OPR)\/([0-9.]+)/);
      browserVersion = match ? match[2] : 'Неизвестно';
    } else if (ua.includes('Edg')) {
      browserName = 'Edge';
      const match = ua.match(/Edg\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Неизвестно';
    } else if (ua.includes('Chrome')) {
      browserName = 'Chrome';
      const match = ua.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Неизвестно';
    } else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      const match = ua.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Неизвестно';
    } else if (ua.includes('Safari')) {
      browserName = 'Safari';
      const match = ua.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Неизвестно';
    }

    if (ua.includes('Windows')) {
      os = 'Windows';
    } else if (ua.includes('Mac')) {
      os = 'macOS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
    }

    console.log('Browser detection:', {
      userAgent: ua,
      browser: browserName,
      version: browserVersion,
      os: os
    });

    return {
      raw: ua,
      name: browserName,
      version: browserVersion,
      os: os
    };
  }

  async uploadFiles(files) {
    try {
      console.log('Uploading files:', files.map(f => f.name));
      
      const uploadResults = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch(
          `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${fileName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
            },
            body: formData
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Ошибка загрузки файла ${file.name}: ${uploadResponse.status} - ${errorText}`);
        }

        const fileUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${fileName}`;
        
        uploadResults.push({
          success: true,
          fileName: file.name,
          fileUrl: fileUrl,
          storagePath: fileName
        });
      }
      
      console.log('Files uploaded successfully:', uploadResults.length);
      return uploadResults;
      
    } catch (error) {
      console.error('Files upload error:', error);
      throw error;
    }
  }

  async submitFeedback(feedbackData) {
    try {
      console.log('Submitting feedback...', {
        email: feedbackData.user_email,
        subject: feedbackData.subject,
        filesCount: feedbackData.files ? feedbackData.files.length : 0,
        file: feedbackData.file ? 'yes' : 'no'
      });

      if (!this.isConfigured()) {
        throw new Error('Supabase не настроен');
      }

      const canSubmit = await this.checkEmailLimit(feedbackData.user_email);
      if (!canSubmit) {
        throw new Error('Превышен лимит сообщений для этого email (10 в сутки)');
      }

      const isValidEmail = this.validateEmail(feedbackData.user_email);
      if (!isValidEmail) {
        throw new Error('Некорректный email адрес');
      }

      let fileUploadResults = [];
      
      if (feedbackData.files && feedbackData.files.length > 0) {
        fileUploadResults = await this.uploadFiles(feedbackData.files);
      } else if (feedbackData.file) {
        const singleFileResult = await this.uploadFile(feedbackData.file);
        fileUploadResults = [singleFileResult];
      }

      const browserInfo = this.parseBrowserInfo();

      const payload = {
        subject: feedbackData.subject,
        message: feedbackData.message,
        user_name: feedbackData.user_name,
        user_email: feedbackData.user_email,
        status: 'new',
        ip_address: await this.getClientIP(),
        user_agent: browserInfo.raw,
        browser_name: browserInfo.name,
        browser_version: browserInfo.version,
        os: browserInfo.os
      };

      if (fileUploadResults.length > 0) {
        payload.file_names = fileUploadResults.map(f => f.fileName);
        payload.file_urls = fileUploadResults.map(f => f.fileUrl);
        payload.storage_paths = fileUploadResults.map(f => f.storagePath);
        payload.files_count = fileUploadResults.length;
        
        payload.file_name = fileUploadResults[0].fileName;
        payload.file_url = fileUploadResults[0].fileUrl;
        payload.storage_path = fileUploadResults[0].storagePath;
      }

      console.log('Sending payload:', payload);

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/${this.tableName}`, 
        {
          method: 'POST',
          headers: this.getPublicHeaders(),
          body: JSON.stringify(payload)
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Full error response:', errorText);
        throw new Error(`Ошибка отправки: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Feedback submitted successfully:', result);
      
      return { 
        success: true, 
        message: 'Сообщение отправлено',
        id: result[0]?.id 
      };

    } catch (error) {
      console.error('Feedback submission error:', error);
      throw new Error(`Ошибка отправки сообщения: ${error.message}`);
    }
  }

  async getFeedbackMessages(filters = {}) {
    try {
      console.log('Getting feedback messages...', { filters });

      if (!this.isConfigured()) {
        throw new Error('Supabase не настроен');
      }

      let url = `${this.supabaseUrl}/rest/v1/${this.tableName}?order=created_at.desc`;
      
      if (filters.status) {
        url += `&status=eq.${filters.status}`;
      }
      if (filters.limit) {
        url += `&limit=${filters.limit}`;
      }

      const response = await fetch(url, {
        headers: this.getPublicHeaders()
      });

      console.log('Fetch status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка загрузки: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Feedback messages loaded:', data.length);
      
      return data;

    } catch (error) {
      console.error('Feedback fetch error:', error);
      throw error;
    }
  }

  async updateFeedbackStatus(messageId, status) {
    try {
      console.log('Updating feedback status...', { messageId, status });

      const payload = {
        status: status,
        updated_at: new Date().toISOString()
      };

      console.log('Update payload:', payload);

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${messageId}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        }
      );

      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response:', errorText);
        throw new Error(`Ошибка обновления: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Feedback status update response:', result);
      
      if (result && result.length > 0) {
        const updatedMessage = result[0];
        console.log('CONFIRMED - Status updated in DB:', {
          id: updatedMessage.id,
          status: updatedMessage.status,
          updated_at: updatedMessage.updated_at
        });
      } else {
        console.warn('No data returned after update - might be RLS issue');
      }

      return { 
        success: true, 
        status: status,
        data: result 
      };

    } catch (error) {
      console.error('Feedback update error:', error);
      throw error;
    }
  }

  async checkEmailLimit(email) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}?user_email=eq.${email}&created_at=gte.${today}T00:00:00Z&created_at=lte.${today}T23:59:59Z`;
      
      const response = await fetch(url, {
        headers: this.getPublicHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.length < 10;
      }
      
      return true;
    } catch (error) {
      console.error('Limit check error:', error);
      return true;
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getClientIP() {
    try {
      const services = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://ipapi.co/json/'
      ];
      
      for (const service of services) {
        try {
          const response = await fetch(service, { timeout: 5000 });
          if (response.ok) {
            const data = await response.json();
            return data.ip || data.ip_address || 'unknown';
          }
        } catch (error) {
          console.warn(`IP service ${service} failed:`, error.message);
          continue;
        }
      }
      
      return 'unknown';
    } catch (error) {
      console.error('All IP services failed:', error);
      return 'unknown';
    }
  }

  isConfigured() {
    return !!(this.supabaseUrl && this.supabaseKey);
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;