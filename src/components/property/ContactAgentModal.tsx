import React, { useState } from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { saveInquiry } from '../../utils/storage';
import { InquiryMessage } from '../../types/property';
import { X, Mail, Phone, MessageSquare, CheckCircle2, User, Send } from 'lucide-react';

export const ContactAgentModal: React.FC = () => {
  const {
    isContactModalOpen,
    setIsContactModalOpen,
    modalTargetProperty,
    activeProperty
  } = usePropertyContext();

  const property = modalTargetProperty || activeProperty;
  const agent = property.agent;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hello ${agent.name}, I would like to receive the full architectural dossier, CAD floor plans, and acquisition prospectus for ${property.name}.`
  );
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'whatsapp'>('email');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isContactModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const inquiry: InquiryMessage = {
      id: `inq-${Date.now()}`,
      propertyId: property.id,
      name,
      email,
      phone,
      message,
      preferredContact,
      createdAt: new Date().toISOString()
    };

    saveInquiry(inquiry);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setIsContactModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold">
            <Mail className="w-4 h-4 text-[#d4af37]" />
            <span>Direct Partner Inquiry</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display text-2xl text-[#f5f6f8]">
                Inquiry Dispatched
              </h3>
              <p className="text-xs font-sans text-[#9eacb8] mt-1 max-w-sm">
                Your direct inquiry has been transmitted to <strong>{agent.name}</strong>. An architectural
                portfolio package will be shared with <strong>{email}</strong> shortly.
              </p>
            </div>

            <div className="w-full bg-[#12151a] p-3 rounded-lg border border-white/10 text-left text-[11px] text-[#9eacb8] space-y-1">
              <div>DIRECT PHONE: {agent.phone}</div>
              <div>CONFIDENTIAL DESK: {agent.email}</div>
            </div>

            <button
              onClick={handleClose}
              className="py-2.5 px-6 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase text-xs hover:bg-[#e5c358] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agent Mini Header */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#14171d] border border-white/5">
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/40 shrink-0"
              />
              <div>
                <h4 className="font-display text-sm text-[#f5f6f8]">{agent.name}</h4>
                <div className="text-[11px] text-[#d4af37] font-sans">{agent.title}</div>
                <div className="text-[10px] text-[#9eacb8]">{agent.company} • {agent.licenseNumber}</div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Full Name *</label>
              <input
                type="text"
                placeholder="Lord / Lady / Dr. / Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Email *</label>
                <input
                  type="email"
                  placeholder="contact@patron.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (212) 555-0182"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Message *</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Private Dossier Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
