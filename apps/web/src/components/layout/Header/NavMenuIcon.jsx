export default function NavMenuIcon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true };
  const n = (name || 'circle').toLowerCase();
  switch (n) {
    case 'fan':
    case 'wind':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path
            d="M12 6c2.5 0 4.5-1.2 4.5-2.5S14.5 1 12 1 7.5 2.2 7.5 3.5 9.5 6 12 6Zm0 12c-2.5 0-4.5 1.2-4.5 2.5S9.5 23 12 23s4.5-1.2 4.5-2.5S14.5 18 12 18Zm6-6c0-2.5 1.2-4.5 2.5-4.5S19 14.5 19 12s-1.2-4.5-2.5-4.5S12 9.5 12 12Zm-12 0c0 2.5-1.2 4.5-2.5 4.5S5 9.5 5 12s1.2 4.5 2.5 4.5S12 14.5 12 12Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    case 'building':
      return (
        <svg {...common}>
          <path
            d="M4 22V4a1 1 0 0 1 1-1h6v18H4Zm10 0V11h6l2 2v9h-8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M8 8h1M8 12h1M8 16h1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'package':
      return (
        <svg {...common}>
          <path
            d="M4 8l8-4 8 4v12l-8 4-8-4V8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M4 8l8 4 8-4M12 12v10" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case 'headset':
    case 'support':
      return (
        <svg {...common}>
          <path
            d="M5 16v2a2 2 0 0 0 2 2h1M19 16v2a2 2 0 0 1-2 2h-1M7 16h-1a2 2 0 0 1-2-2v-2a7 7 0 1 1 14 0v2a2 2 0 0 1-2 2h-1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'home':
      return (
        <svg {...common}>
          <path
            d="M4 10 12 3l8 7v11a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1V10Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'cart':
      return (
        <svg {...common}>
          <path
            d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'droplet':
      return (
        <svg {...common}>
          <path
            d="M12 2.5s6 6.8 6 11.2a6 6 0 1 1-12 0C6 9.3 12 2.5 12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
  }
}
