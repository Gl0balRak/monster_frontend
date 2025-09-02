import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <h1 className="text-2xl font-bold text-black font-['Open_Sans',-apple-system,Roboto,Helvetica,sans-serif]">
            {title}
          </h1>
          {description && (
            <p className="text-base text-gray-5 font-['Open_Sans',-apple-system,Roboto,Helvetica,sans-serif]">
              {description}
            </p>
          )}
          <p className="text-sm text-gray-5 font-['Open_Sans',-apple-system,Roboto,Helvetica,sans-serif]">
            Эта страница находится в разработке. Продолжите работу в других разделах или свяжитесь с нами для получения дополнительной информации.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
