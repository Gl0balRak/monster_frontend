import React, { useState, useEffect } from 'react';

interface BackToTopButtonProps {
  scrollThreshold?: number;
  className?: string;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
                                                           scrollThreshold = 300,
                                                           className = ''
                                                         }) => {
  const [showButton, setShowButton] = useState<boolean>(false);

  const handleScroll = (): void => {
    const show: boolean = window.scrollY > scrollThreshold;
    setShowButton(show);
  };

  const goToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  if (!showButton) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 bg-red-500 hover:bg-red-600 p-3 rounded-full shadow-lg transition-all cursor-pointer z-50 ${className}`}
      onClick={goToTop}
      role="button"
      aria-label="Вернуться к началу страницы"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToTop();
        }
      }}
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </div>
  );
};

export default BackToTopButton;