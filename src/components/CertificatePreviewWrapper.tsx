import React, { useRef, useState, useEffect } from 'react';
import { CertificateCanvas } from './CertificateCanvas';
import { CertificateData } from '../types/certificate';

interface CertificatePreviewWrapperProps {
  certificate: CertificateData;
  containerId: string;
}

export const CertificatePreviewWrapper: React.FC<CertificatePreviewWrapperProps> = ({
  certificate,
  containerId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      // 1122px é a largura nativa do canvas do certificado
      // Subtrai 24px de padding para garantir respiro
      const availableWidth = Math.max(width - 24, 280);
      const computedScale = Math.min(availableWidth / 1122, 1);
      setScale(computedScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const scaledHeight = Math.round(793 * scale);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center py-3 px-2 bg-slate-200/70 rounded-xl border border-slate-300/80 overflow-hidden"
    >
      <div
        className="relative overflow-hidden rounded-lg shadow-md border border-slate-300/70 bg-white"
        style={{
          width: `${Math.round(1122 * scale)}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          style={{
            width: '1122px',
            height: '793px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <CertificateCanvas
            certificate={certificate}
            containerId={containerId}
          />
        </div>
      </div>
    </div>
  );
};
