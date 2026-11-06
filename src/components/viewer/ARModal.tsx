import React, { useState, useEffect } from 'react';
import { X, Sparkles, QrCode, Check, AlertCircle, Smartphone } from 'lucide-react';

interface ARModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ARModal: React.FC<ARModalProps> = ({ isOpen, onClose }) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
        (navigator as any).xr
          .isSessionSupported('immersive-ar')
          .then((supported: boolean) => setIsSupported(supported))
          .catch(() => setIsSupported(false));
      } else {
        setIsSupported(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Augmented Reality Spatial Projection</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="font-display text-2xl text-[#f5f6f8]">
            Project Architectural Model in AR
          </h2>
          <p className="text-xs font-sans text-[#9eacb8] mt-1.5 leading-relaxed">
            Project the architectural residence directly onto your boardroom table or open lawn.
            Rotate, examine elevations, and inspect structural layouts in 3D tabletop scale.
          </p>
        </div>

        {/* Status */}
        <div className="p-4 rounded-lg bg-[#14171d] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9eacb8]">AR SENSOR STATUS:</span>
            {isSupported ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> AR Passthrough Ready
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> AR Mobile QR Sync
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* Visual simulated QR code */}
            <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shrink-0">
              <div
                className="w-full h-full bg-[#111317] rounded flex flex-col items-center justify-center text-[8px] text-center text-[#d4af37] font-bold p-1 border border-black"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #111317 0, #111317 4px, #1a1c1f 4px, #1a1c1f 8px)'
                }}
              >
                <QrCode className="w-12 h-12 text-[#d4af37]" />
              </div>
            </div>

            <div className="text-[11px] font-sans text-[#9eacb8] leading-relaxed">
              <strong className="text-[#f5f6f8] block mb-1">Scan with iPhone or iPad:</strong>
              Open iOS Camera or Chrome AR on Android to anchor this property model to your physical
              environment. Pinch to scale, swipe to rotate azimuth.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {isSupported && (
            <button
              onClick={() => {
                if ((navigator as any).xr?.requestSession) {
                  (navigator as any).xr.requestSession('immersive-ar').catch(() => {});
                }
              }}
              className="flex-1 py-3 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-[#e5c358] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AR Camera</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg bg-[#181c22] text-[#f5f6f8] font-semibold text-xs tracking-wider uppercase border border-white/10 hover:bg-[#222730] transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue in 3D Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
