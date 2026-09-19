import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

export const AstrolabeIllustration: React.FC<IllustrationProps> = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer brass ring */}
    <circle cx="80" cy="80" r="70" stroke="#D4AF37" strokeWidth="2.5" opacity="0.8" />
    <circle cx="80" cy="80" r="66" stroke="#2D3139" strokeWidth="1" />
    <circle cx="80" cy="80" r="58" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    
    {/* Compass / Meridian cross hairs */}
    <line x1="80" y1="12" x2="80" y2="148" stroke="#D4AF37" strokeWidth="1.2" opacity="0.5" />
    <line x1="12" y1="80" x2="148" y2="80" stroke="#D4AF37" strokeWidth="1.2" opacity="0.5" />
    <line x1="32" y1="32" x2="128" y2="128" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
    <line x1="128" y1="32" x2="32" y2="128" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />

    {/* Eccentric Zodiac Ring */}
    <circle cx="86" cy="74" r="42" stroke="#F2D06B" strokeWidth="1.8" opacity="0.75" />
    <circle cx="86" cy="74" r="38" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />

    {/* Star pointers / rete flames */}
    <path d="M 86 32 L 88 44 L 84 44 Z" fill="#F2D06B" />
    <path d="M 128 74 L 116 76 L 116 72 Z" fill="#F2D06B" />
    <path d="M 86 116 L 84 104 L 88 104 Z" fill="#F2D06B" />
    <path d="M 44 74 L 56 72 L 56 76 Z" fill="#F2D06B" />

    {/* Central pivot and rule */}
    <rect
      x="77"
      y="18"
      width="6"
      height="124"
      rx="3"
      transform="rotate(35 80 80)"
      fill="#D4AF37"
      fillOpacity="0.85"
    />
    <circle cx="80" cy="80" r="9" fill="#16181D" stroke="#D4AF37" strokeWidth="2.5" />
    <circle cx="80" cy="80" r="3.5" fill="#F2D06B" />

    {/* Top hanging loop */}
    <circle cx="80" cy="10" r="7" stroke="#D4AF37" strokeWidth="2" fill="none" />
    <rect x="78" y="16" width="4" height="4" fill="#D4AF37" />
  </svg>
);

export const ManuscriptTipIllustration: React.FC<IllustrationProps> = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Parchment Scroll Base */}
    <path
      d="M30 40 C30 30, 45 28, 60 30 L130 30 C140 30, 145 36, 145 44 L145 125 C145 135, 130 138, 115 135 L45 135 C35 135, 30 130, 30 120 Z"
      fill="#1C1E24"
      stroke="#D4AF37"
      strokeWidth="1.5"
    />
    {/* Page Curl accent */}
    <path
      d="M30 115 C42 118, 50 124, 52 135 C42 135, 35 130, 30 120"
      fill="#2D3139"
      stroke="#D4AF37"
      strokeWidth="1"
    />

    {/* Script lines */}
    <line x1="45" y1="48" x2="115" y2="48" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="45" y1="58" x2="130" y2="58" stroke="#E0E2E6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="45" y1="68" x2="125" y2="68" stroke="#E0E2E6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="45" y1="78" x2="105" y2="78" stroke="#E0E2E6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="45" y1="88" x2="128" y2="88" stroke="#E0E2E6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="45" y1="98" x2="95" y2="98" stroke="#E0E2E6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

    {/* Botanical sketch on manuscript */}
    <path
      d="M110 95 Q118 78 126 95 T134 95"
      stroke="#F2D06B"
      strokeWidth="1.5"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M122 78 L122 110"
      stroke="#F2D06B"
      strokeWidth="1"
      opacity="0.8"
    />
    <circle cx="122" cy="76" r="3" fill="#D4AF37" />

    {/* Magnifying Glass Overlay with Glass Glare */}
    <g transform="translate(10, 10)">
      <circle cx="75" cy="75" r="28" fill="#16181D" fillOpacity="0.75" stroke="#D4AF37" strokeWidth="2.5" />
      <circle cx="75" cy="75" r="24" stroke="#F2D06B" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      <path
        d="M62 60 A 20 20 0 0 1 88 60"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Secret Runes visible only in lens */}
      <text x="66" y="80" fill="#F2D06B" fontSize="13" fontFamily="Cinzel, serif" fontWeight="bold">Ω 7</text>
      {/* Brass Handle */}
      <line x1="95" y1="95" x2="135" y2="135" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
      <line x1="95" y1="95" x2="135" y2="135" stroke="#F2D06B" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </g>
  </svg>
);

export const CabinetTipIllustration: React.FC<IllustrationProps> = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Antique Archive Cabinet Frame */}
    <rect x="25" y="25" width="110" height="115" rx="4" fill="#16181D" stroke="#D4AF37" strokeWidth="2" />
    <rect x="30" y="30" width="100" height="48" rx="2" fill="#1C1E24" stroke="#2D3139" strokeWidth="1" />
    <rect x="30" y="84" width="100" height="50" rx="2" fill="#1C1E24" stroke="#2D3139" strokeWidth="1" />

    {/* Top Shelf: Potion bottle and specimen jar */}
    {/* Jar 1 */}
    <rect x="42" y="44" width="16" height="26" rx="3" fill="#0F1115" stroke="#D4AF37" strokeWidth="1.2" />
    <rect x="45" y="40" width="10" height="4" fill="#D4AF37" />
    <path d="M44 54 Q50 51 56 54 L56 68 L44 68 Z" fill="#D4AF37" fillOpacity="0.4" />
    
    {/* Hourglass */}
    <path
      d="M74 42 L90 42 M74 68 L90 68 M76 43 L88 67 M88 43 L76 67"
      stroke="#F2D06B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="82" cy="55" r="1.5" fill="#FFFFFF" />

    {/* Ancient Bound Codex book */}
    <rect x="100" y="38" width="8" height="32" rx="1" fill="#D4AF37" />
    <rect x="110" y="42" width="7" height="28" rx="1" fill="#2D3139" stroke="#D4AF37" strokeWidth="0.8" />

    {/* Bottom Shelf: Astrolabe compass and specimen butterfly */}
    <circle cx="54" cy="109" r="14" stroke="#D4AF37" strokeWidth="1.5" fill="#0F1115" />
    <line x1="54" y1="98" x2="54" y2="120" stroke="#F2D06B" strokeWidth="1" />
    <line x1="43" y1="109" x2="65" y2="109" stroke="#F2D06B" strokeWidth="1" />
    <circle cx="54" cy="109" r="3" fill="#D4AF37" />

    {/* Golden key */}
    <path
      d="M86 104 C86 100 90 98 94 98 C98 98 102 100 102 104 C102 108 98 110 94 110 L94 122 L98 122 M94 117 L97 117"
      stroke="#D4AF37"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Archival corner ornaments */}
    <path d="M25 35 L35 25 M135 35 L125 25 M25 130 L35 140 M135 130 L125 140" stroke="#F2D06B" strokeWidth="1.5" />
  </svg>
);

export const CipherTipIllustration: React.FC<IllustrationProps> = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cryptographic disk / rotor */}
    <circle cx="80" cy="80" r="66" fill="#16181D" stroke="#D4AF37" strokeWidth="2" />
    <circle cx="80" cy="80" r="54" fill="#1C1E24" stroke="#2D3139" strokeWidth="1" strokeDasharray="4 2" />
    <circle cx="80" cy="80" r="38" fill="#0F1115" stroke="#D4AF37" strokeWidth="1.5" />

    {/* Runes / cipher segments */}
    <text x="75" y="27" fill="#D4AF37" fontSize="9" fontFamily="monospace">A</text>
    <text x="115" y="44" fill="#D4AF37" fontSize="9" fontFamily="monospace">VII</text>
    <text x="135" y="84" fill="#D4AF37" fontSize="9" fontFamily="monospace">Φ</text>
    <text x="118" y="126" fill="#D4AF37" fontSize="9" fontFamily="monospace">9</text>
    <text x="76" y="142" fill="#D4AF37" fontSize="9" fontFamily="monospace">Ψ</text>
    <text x="32" y="124" fill="#D4AF37" fontSize="9" fontFamily="monospace">IV</text>
    <text x="18" y="84" fill="#D4AF37" fontSize="9" fontFamily="monospace">Ω</text>
    <text x="36" y="44" fill="#D4AF37" fontSize="9" fontFamily="monospace">3</text>

    {/* Inner lock icon */}
    <rect x="71" y="73" width="18" height="15" rx="2" fill="#D4AF37" />
    <path d="M74 73 V67 C74 63.7 76.7 61 80 61 C83.3 61 86 63.7 86 67 V73" stroke="#D4AF37" strokeWidth="2" fill="none" />
    <circle cx="80" cy="79" r="2" fill="#16181D" />
    <line x1="80" y1="81" x2="80" y2="85" stroke="#16181D" strokeWidth="1.5" />
    
    {/* Decryption pointer ray */}
    <line x1="80" y1="38" x2="80" y2="60" stroke="#F2D06B" strokeWidth="2" strokeLinecap="round" />
    <polygon points="77,42 80,36 83,42" fill="#F2D06B" />
  </svg>
);
