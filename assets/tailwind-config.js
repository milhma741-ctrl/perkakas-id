/* Konfigurasi Tailwind terpusat — dipakai oleh semua halaman Perkakas.id */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink:        '#1B2430',
        inkmuted:   '#5B6672',
        surface:    '#F3F5F8',
        panel:      '#FFFFFF',
        navbg:      '#16202A',
        navmuted:   '#8B98A5',
        forest:     { DEFAULT: '#2F6F4E', dark: '#204E37', light: '#E6F0EA' },
        amber:      { DEFAULT: '#E8A33D', dark: '#C9821F', light: '#FCEFD9' },
        line:       '#E2E6EB',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,36,48,0.06), 0 1px 1px rgba(27,36,48,0.04)',
      }
    }
  }
};
