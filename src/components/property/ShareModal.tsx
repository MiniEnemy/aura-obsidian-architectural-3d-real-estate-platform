import React, { useState } from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { X, Share2, Copy, Check, QrCode } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, modalTargetProperty, activeProperty } =
    usePropertyContext();

  const property = modalTargetProperty || activeProperty;
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.name,
        text: `${property.tagline} — Explore in 3D on AURA`,
        url: currentUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-md glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold">
            <Share2 className="w-4 h-4 text-[#d4af37]" />
            <span>Transmit Architectural Listing</span>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-display text-xl text-[#f5f6f8]">{property.name}</h3>
          <p className="text-xs font-sans text-[#9eacb8] mt-1">
            Share this real-time 3D spatial walkthrough with partners, investors, or family members.
          </p>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-[10px] text-[#9eacb8] uppercase tracking-wider mb-1">
            Direct Spatial Deep Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] text-[11px] outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#d4af37] text-[#0c0e11] hover:bg-[#e5c358]'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Social Sharing Sim */}
        <div className="pt-2 flex flex-col gap-2">
          {typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-lg bg-[#181c22] border border-white/10 text-[#f5f6f8] hover:bg-[#222730] flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#d4af37]" />
              <span>Use Device Native Share Sheet</span>
            </button>
          )}

          <div className="p-3 bg-[#12151a] rounded-lg border border-white/5 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-[#d4af37] shrink-0" />
            <div className="text-[11px] text-[#9eacb8] leading-tight">
              Anyone opening this link on mobile will load directly into the 3D walkthrough with floor plans.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
