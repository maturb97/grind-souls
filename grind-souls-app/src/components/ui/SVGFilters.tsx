export function SVGFilters() {
  return (
    <svg className="absolute" width="0" height="0">
      <defs>
        {/* Liquid Distortion Filter */}
        <filter id="liquid-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence 
            baseFrequency="0.02 0.02" 
            numOctaves="3" 
            result="turbulence"
            seed="2"
          >
            <animate 
              attributeName="baseFrequency" 
              dur="20s" 
              values="0.02 0.02;0.04 0.02;0.02 0.04;0.02 0.02" 
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="turbulence" 
            scale="8"
          />
        </filter>

        {/* Glassmorphism Blur */}
        <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur"/>
          <feOffset in="blur" dx="2" dy="2" result="offset"/>
          <feFlood floodColor="rgba(255,255,255,0.3)"/>
          <feComposite in2="offset" operator="over"/>
        </filter>

        {/* Chromatic Aberration */}
        <filter id="chromatic-aberration" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset in="SourceGraphic" dx="-2" dy="0" result="red"/>
          <feOffset in="SourceGraphic" dx="2" dy="0" result="blue"/>
          <feComponentTransfer in="red" result="red-channel">
            <feFuncR type="discrete" tableValues="1 0 0"/>
            <feFuncG type="discrete" tableValues="0"/>
            <feFuncB type="discrete" tableValues="0"/>
          </feComponentTransfer>
          <feComponentTransfer in="blue" result="blue-channel">
            <feFuncR type="discrete" tableValues="0"/>
            <feFuncG type="discrete" tableValues="0"/>
            <feFuncB type="discrete" tableValues="0 0 1"/>
          </feComponentTransfer>
          <feBlend in="red-channel" in2="blue-channel" mode="screen"/>
        </filter>

        {/* Glow Effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Morphing Blob */}
        <filter id="blob-morph" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence 
            baseFrequency="0.01" 
            numOctaves="2" 
            result="turbulence"
          >
            <animate 
              attributeName="baseFrequency" 
              dur="10s" 
              values="0.01;0.03;0.01" 
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="turbulence" 
            scale="15"
          />
        </filter>

        {/* Liquid Glass Gradient */}
        <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)">
            <animate attributeName="stop-color" 
              dur="4s" 
              values="rgba(59, 130, 246, 0.1);rgba(147, 51, 234, 0.1);rgba(59, 130, 246, 0.1)" 
              repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="rgba(147, 51, 234, 0.05)">
            <animate attributeName="stop-color" 
              dur="4s" 
              values="rgba(147, 51, 234, 0.05);rgba(59, 130, 246, 0.05);rgba(147, 51, 234, 0.05)" 
              repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)">
            <animate attributeName="stop-color" 
              dur="4s" 
              values="rgba(236, 72, 153, 0.1);rgba(59, 130, 246, 0.1);rgba(236, 72, 153, 0.1)" 
              repeatCount="indefinite"/>
          </stop>
        </linearGradient>

        {/* Animated Background Pattern */}
        <pattern id="animated-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="30" fill="url(#liquid-gradient)" opacity="0.1">
            <animate attributeName="r" dur="3s" values="30;35;30" repeatCount="indefinite"/>
            <animate attributeName="opacity" dur="3s" values="0.1;0.05;0.1" repeatCount="indefinite"/>
          </circle>
        </pattern>
      </defs>
    </svg>
  );
}