import React from 'react';
import serineLogo from '../../assets/serine-logo.png';

interface SerineLogoProps {
  className?: string;
  variant?: 'full' | 'mark-only' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const SerineLogo: React.FC<SerineLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-16'
  };

  const isWhite = variant === 'white';
  const coralColor = '#f26868';
  const tealColor = isWhite ? '#7ed8d5' : '#168d90';
  const darkNodeColor = isWhite ? '#ffffff' : '#103d4a';

  /*
   * MARK ONLY
   * Keep the existing molecular icon for places where
   * only the Serine Diagnostics symbol is required.
   */
  if (variant === 'mark-only') {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Serine Diagnostics Mark"
      >
        {/* Chemical Molecular Bonds */}
        <line
          x1="68"
          y1="28"
          x2="85"
          y2="44"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="85"
          y1="44"
          x2="68"
          y2="68"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="68"
          y1="68"
          x2="35"
          y2="68"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="68"
          y1="68"
          x2="80"
          y2="94"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="80"
          y1="94"
          x2="58"
          y2="114"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Double Bond */}
        <line
          x1="82"
          y1="91"
          x2="108"
          y2="91"
          stroke={darkNodeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        <line
          x1="82"
          y1="97"
          x2="108"
          y2="97"
          stroke={darkNodeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Nodes / Atoms */}
        <circle cx="68" cy="24" r="8" fill={coralColor} />
        <circle cx="85" cy="44" r="7.5" fill={darkNodeColor} />
        <circle cx="28" cy="68" r="8" fill={coralColor} />
        <circle cx="68" cy="68" r="8" fill={darkNodeColor} />
        <circle cx="80" cy="94" r="8" fill={darkNodeColor} />
        <circle cx="114" cy="94" r="8" fill={coralColor} />
        <circle cx="54" cy="116" r="8" fill={tealColor} />
      </svg>
    );
  }

  /*
   * FULL LOGO
   *
   * Uses the new logo image where:
   * SERINE
   * DIAGNOSTICS
   *
   * are already correctly aligned.
   */
  if (variant === 'full') {
    return (
      <img
        src={serineLogo}
        alt="Serine Diagnostics"
        className={`${sizeClasses[size]} w-auto object-contain flex-shrink-0 ${className}`}
      />
    );
  }

  /*
   * WHITE VARIANT
   *
   * Kept as the original SVG/text version because the new PNG
   * is designed for the normal white-background header.
   */
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Molecular Graphic */}
      <svg
        viewBox="0 0 130 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto flex-shrink-0`}
        aria-hidden="true"
      >
        <line
          x1="62"
          y1="26"
          x2="80"
          y2="44"
          stroke={darkNodeColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <line
          x1="80"
          y1="44"
          x2="62"
          y2="68"
          stroke={darkNodeColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <line
          x1="62"
          y1="68"
          x2="30"
          y2="68"
          stroke={darkNodeColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <line
          x1="62"
          y1="68"
          x2="76"
          y2="96"
          stroke={darkNodeColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <line
          x1="76"
          y1="96"
          x2="52"
          y2="116"
          stroke={darkNodeColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Double Bond */}
        <line
          x1="77"
          y1="92"
          x2="105"
          y2="92"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="77"
          y1="100"
          x2="105"
          y2="100"
          stroke={darkNodeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Nodes */}
        <circle cx="62" cy="22" r="9" fill={coralColor} />
        <circle cx="82" cy="44" r="8.5" fill={darkNodeColor} />
        <circle cx="24" cy="68" r="9" fill={coralColor} />
        <circle cx="62" cy="68" r="8.5" fill={darkNodeColor} />
        <circle cx="76" cy="96" r="8.5" fill={darkNodeColor} />
        <circle cx="112" cy="96" r="9" fill={coralColor} />
        <circle cx="48" cy="118" r="9" fill={tealColor} />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <span
          className="font-bold tracking-[0.28em] text-[20px] sm:text-[22px] leading-tight"
          style={{
            color: '#ffffff',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          SERINE
        </span>

        <div className="flex items-center gap-1.5 mt-0.5">
          <div
            className="h-[1px] w-3.5"
            style={{ backgroundColor: tealColor }}
          />

          <span
            className="text-[9px] sm:text-[10px] tracking-[0.22em] font-extrabold uppercase"
            style={{
              color: tealColor,
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}
          >
            DIAGNOSTICS
          </span>

          <div
            className="h-[1px] w-3.5"
            style={{ backgroundColor: tealColor }}
          />
        </div>
      </div>
    </div>
  );
};