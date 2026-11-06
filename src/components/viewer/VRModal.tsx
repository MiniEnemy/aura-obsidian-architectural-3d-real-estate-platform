import React, { useState, useEffect } from 'react';
import { X, Glasses, Check, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface VRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VRModal: React.FC<VRModalProps> = ({ isOpen, onClose }) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
        (navigator as any).xr
          .isSessionSupported('immersive-vr')
          .then((supported: boolean) => setIsSupported(supported))
          .catch(() => setIsSupported(false));
      } else {
        setIsSupported(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunchVR = async () => {
    setIsRequesting(true);
    try {
      if ((navigator as any).xr?.requestSession) {
        await (navigator as any).xr.requestSession('immersive-vr');
      }
    } catch (err) {
      console.warn('VR session request failed', err);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold text-xs">
            <Glasses className="w-4 h-4 text-[#d4af37]" />
            <span>WebXR Spatial Computing</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="font-display text-2xl text-[#f5f6f8]">
            Enter Immersive VR Walkthrough
          </h2>
          <p className="text-xs font-sans text-[#9eacb8] mt-1.5 leading-relaxed">
            Step directly onto the travertine floors in real 1:1 architectural scale using your
            Meta Quest 3, Apple Vision Pro, or SteamVR headset.
          </p>
        </div>

        {/* Hardware Status Display */}
        <div className="p-4 rounded-lg bg-[#14171d] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9eacb8]">HEADSET DETECTION:</span>
            {isSupported ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> WebXR Ready
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> VR Not Detected on this Display
              </span>
            )}
          </div>
          <p className="text-[11px] font-sans text-[#9eacb8] leading-normal">
            {isSupported
              ? 'Compatible spatial headset connected. Click launch below to initiate immersive stereoscopic session.'
              : 'WebXR immersive-vr sessions require a tethered or standalone VR headset browser (e.g. Meta Quest Browser, Safari on visionOS, or Wolvic).'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {isSupported ? (
            <button
              onClick={handleLaunchVR}
              disabled={isRequesting}
              className="flex-1 py-3 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-[#e5c358] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRequesting ? 'Initiating...' : 'Launch VR Session'}</span>
            </button>
          ) : null}

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
