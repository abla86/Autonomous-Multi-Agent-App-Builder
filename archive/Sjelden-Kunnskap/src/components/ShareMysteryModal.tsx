import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Mail,
  Send,
  X,
} from 'lucide-react';
import { Mystery } from '../types';
import {
  generateSecureMysteryShareUrl,
  copyTextSafelyToClipboard,
  sanitizePlainText,
} from '../utils/security';

interface ShareMysteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mystery: Mystery;
}

export const ShareMysteryModal: React.FC<ShareMysteryModalProps> = ({
  isOpen,
  onClose,
  mystery,
}) => {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const shareUrl = generateSecureMysteryShareUrl(mystery.id);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setHasNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const success = await copyTextSafelyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Sjelden Kunnskap: ${mystery.title}`,
          text: `Bli med og løs dagens historiske mysterium: "${mystery.title}".`,
          url: shareUrl,
        });
      } catch (err: unknown) {
        // User cancelled or aborted share, no action needed
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const safeTitle = sanitizePlainText(mystery.title);
  const safeText = encodeURIComponent(
    `Kan du løse dagens mysterium i arkivet? «${safeTitle}» — ${mystery.era}. Utforsk sporene her:`
  );
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${safeText}&url=${encodedUrl}`,
      color: 'hover:border-sky-500 hover:text-sky-400',
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:border-blue-500 hover:text-blue-400',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.66 1.64 1.65 1.65 0 0 0 1.66 1.65 1.65 1.65 0 0 0 1.65-1.65 1.64 1.64 0 0 0-1.65-1.64" />
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:border-blue-400 hover:text-blue-300',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      url: `https://api.whatsapp.com/send?text=${safeText}%20${encodedUrl}`,
      color: 'hover:border-emerald-500 hover:text-emerald-400',
    },
    {
      name: 'E-post',
      icon: <Mail className="w-4 h-4" />,
      url: `mailto:?subject=${encodeURIComponent(`Dagens Mysterium: ${safeTitle}`)}&body=${safeText}%0A%0A${encodedUrl}`,
      color: 'hover:border-amber-400 hover:text-amber-300',
    },
  ];

  return (
    <div
      id="share-mystery-modal-backdrop"
      className="fixed inset-0 bg-[#0F1115]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="share-mystery-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#16181D] border border-[#2D3139] rounded-xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D3139] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#E0E2E6]">
                Del Dagens Mysterium
              </h2>
              <p className="text-[11px] text-gray-400">
                Utfordre venner og kolleger til å dechiffrere sporene
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            aria-label="Lukk delemeny"
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mystery Preview Card */}
        <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-3.5 flex items-start gap-3">
          <div className="w-2 h-full bg-[#D4AF37] rounded-full self-stretch" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider mb-0.5">
              <span>{mystery.era}</span>
              <span>•</span>
              <span>Sjeldenhetsgrad {mystery.rarityFactor}%</span>
            </div>
            <h3 className="text-sm font-serif font-bold text-[#E0E2E6] truncate">
              {mystery.title}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans">
              {mystery.brief}
            </p>
          </div>
        </div>

        {/* Copy Link Section with Security Notice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="secure-share-link-input"
              className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Sikker Permalenke
            </label>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
              <ShieldCheck className="w-3 h-3" /> Verifisert & Sanert
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="secure-share-link-input"
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-[#0F1115] border border-[#2D3139] focus:border-[#D4AF37] rounded px-3 py-2.5 text-xs text-gray-200 font-mono select-all focus:outline-none"
            />
            <button
              id="copy-share-link-btn"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#D4AF37] hover:bg-[#F2D06B] text-[#0F1115]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Kopier
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 font-sans flex items-center gap-1 animate-fadeIn">
              <Check className="w-3 h-3" /> Lenken ble kopiert trygt til utklippstavlen.
            </p>
          )}
        </div>

        {/* Social Media Sharing Channels */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Del direkte via sosiale medier:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2.5 rounded bg-[#1C1E24] border border-[#2D3139] text-xs text-gray-300 font-medium transition-all ${item.color}`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            ))}

            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center gap-2 p-2.5 rounded bg-[#1C1E24] border border-[#D4AF37]/50 text-xs text-[#D4AF37] font-medium hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Mer... (System)</span>
              </button>
            )}
          </div>
        </div>

        {/* Security & Privacy Details Footer */}
        <div className="p-3 bg-[#0F1115] border border-[#2D3139] rounded text-[11px] text-gray-400 flex items-start gap-2.5 font-sans leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-gray-300 font-semibold">Skikkelig sikkerhet:</strong> Lenken er sanert mot XSS og script-injeksjoner, inneholder ingen sporing eller personopplysninger, og åpnes beskyttet mot vinduskapring (<code>rel=&quot;noopener noreferrer&quot;</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
