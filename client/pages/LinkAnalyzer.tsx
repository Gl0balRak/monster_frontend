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
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        color: '#e0e0e0'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Анализ ссылок
        </h2>
        <p style={{
          margin: '8px 0 0 0',
          color: '#888',
          fontSize: '14px'
        }}>
          Классификация ссылок с помощью GPT-4
        </p>
      </div>
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