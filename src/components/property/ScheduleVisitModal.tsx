import React, { useState } from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { ScheduledVisit } from '../../types/property';
import { X, Calendar, Clock, User, Mail, Phone, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScheduleVisitModal: React.FC = () => {
  const {
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    modalTargetProperty,
    activeProperty,
    addScheduledVisit
  } = usePropertyContext();

  const property = modalTargetProperty || activeProperty;

  const [date, setDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [visitType, setVisitType] = useState<'in-person' | '3d-guided' | 'virtual-video'>(
    '3d-guided'
  );
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedVisit, setConfirmedVisit] = useState<ScheduledVisit | null>(null);

  if (!isScheduleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;

    const newVisit: ScheduledVisit = {
      id: `visit-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.name,
      date,
      timeSlot,
      visitType,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      createdAt: new Date().toISOString()
    };

    addScheduledVisit(newVisit);
    setConfirmedVisit(newVisit);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f2ca50', '#a3b8cc', '#ffffff']
      });
    } catch {}
  };

  const handleClose = () => {
    setIsSuccess(false);
    setConfirmedVisit(null);
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold">
            <Calendar className="w-4 h-4 text-[#d4af37]" />
            <span>Private Property Concierge</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess && confirmedVisit ? (
          <div className="py-6 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display text-2xl text-[#f5f6f8]">
                Appointment Confirmed
              </h3>
              <p className="text-xs font-sans text-[#9eacb8] mt-1 max-w-md">
                Your private architectural reservation for <strong>{confirmedVisit.propertyName}</strong> has
                been scheduled and recorded into local residency archives.
              </p>
            </div>

            <div className="w-full bg-[#12151a] p-4 rounded-lg border border-white/10 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">FORMAT:</span>
                <span className="text-[#d4af37] uppercase font-semibold">
                  {confirmedVisit.visitType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">DATE & TIME:</span>
                <span className="text-[#f5f6f8]">{confirmedVisit.date} at {confirmedVisit.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">MANAGING AGENT:</span>
                <span className="text-[#f5f6f8]">{property.agent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">PATRON:</span>
                <span className="text-[#f5f6f8]">{confirmedVisit.clientName} ({confirmedVisit.clientEmail})</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="mt-2 py-2.5 px-6 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase text-xs hover:bg-[#e5c358] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] text-[#9eacb8] uppercase tracking-wider">
                SELECTED RESIDENCE
              </span>
              <h3 className="font-display text-xl text-[#f5f6f8]">{property.name}</h3>
              <p className="text-xs text-[#9eacb8] font-sans">
                {property.location.neighborhood}, {property.location.city}
              </p>
            </div>

            {/* Visit Format */}
            <div>
              <label className="block text-[11px] text-[#9eacb8] mb-1.5 uppercase">
                Select Tour Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '3d-guided', label: '3D Spatial Demo' },
                  { id: 'in-person', label: 'In-Person Visit' },
                  { id: 'virtual-video', label: 'Live Video Call' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setVisitType(type.id as any)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      visitType === type.id
                        ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5f6f8] font-semibold ring-1 ring-[#d4af37]'
                        : 'border-white/5 bg-[#14171d] text-[#9eacb8] hover:border-white/20'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Preferred Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none"
                >
                  <option value="10:00 AM">10:00 AM (Morning Light)</option>
                  <option value="11:30 AM">11:30 AM (Midday Solar)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:30 PM">04:30 PM (Golden Hour Sunset)</option>
                  <option value="07:00 PM">07:00 PM (Twilight Ambience)</option>
                </select>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jonathan Sterling"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Email *</label>
                  <input
                    type="email"
                    placeholder="jonathan@sterling.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (310) 555-0199"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9eacb8] mb-1 uppercase">
                  Private Notes or Architectural Inquiries
                </label>
                <textarea
                  rows={2}
                  placeholder="Interested in pool heating specifications, solar glass capacity..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2 text-[#f5f6f8] focus:border-[#d4af37] outline-none placeholder-[#5c6673] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase text-xs shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:bg-[#e5c358] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Reservation Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
