import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface EscanerQRProps {
  onDetectado: (textoLeido: string) => void;
  onClose: () => void;
}

// Overlay de pantalla completa que prende la cámara y devuelve el texto
// leído del QR (una URL completa, en nuestro caso) apenas lo detecta.
export default function EscanerQR({ onDetectado, onClose }: EscanerQRProps) {
  const contenedorId = 'lector-qr-region';
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const yaLeidoRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(contenedorId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (textoLeido) => {
          if (yaLeidoRef.current) return;
          yaLeidoRef.current = true;
          onDetectado(textoLeido);
        },
        () => {} // errores de "no se encontró QR en este frame", se ignoran, es normal
      )
      .catch(() => {
        // No se pudo acceder a la cámara (permiso denegado, sin cámara, etc.)
        onDetectado('');
      });

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-primario/90 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
      <p className="text-white font-bold text-sm mb-4">Apuntá al código QR del equipo</p>
      <div id={contenedorId} className="w-full max-w-xs rounded-xl overflow-hidden" />
    </div>
  );
}