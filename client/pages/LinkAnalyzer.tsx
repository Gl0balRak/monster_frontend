import React from 'react';
import {LINK_ANALYZER} from "@/config/external.config.ts";

interface LinkAnalyzerProps {
  // Можете добавить пропсы если понадобятся
}

const LinkAnalyzer: React.FC<LinkAnalyzerProps> = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <iframe
        src={LINK_ANALYZER}
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          background: '#0a0a0a'
        }}
        title="Анализ ссылок"
        loading="lazy"
      />
    </div>
  );
};

export default LinkAnalyzer;