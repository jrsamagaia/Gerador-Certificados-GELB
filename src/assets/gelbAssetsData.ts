/**
 * Exportação de assets em Data URL e SVG para renderização direta em canvas e PDFs
 * sem problemas de CORS ou carregamento de rede.
 */

export const GELB_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <path id="text-path-top" d="M 80,250 A 170,170 0 0,1 420,250" fill="none" />
    <path id="text-path-bottom" d="M 420,250 A 170,170 0 0,1 80,250" fill="none" />
  </defs>
  <g>
    <circle cx="250" cy="250" r="235" fill="#FBBF24" stroke="#0F2C59" stroke-width="6" />
    <circle cx="250" cy="250" r="215" fill="#0F2C59" stroke="#FBBF24" stroke-width="4" />
    <circle cx="250" cy="250" r="145" fill="#FFFFFF" stroke="#FBBF24" stroke-width="4" />
    
    <polygon points="115,145 120,158 134,158 123,167 127,180 115,171 103,180 107,167 96,158 110,158" fill="#FBBF24" />
    <polygon points="385,145 390,158 404,158 393,167 397,180 385,171 373,180 377,167 366,158 380,158" fill="#FBBF24" />
    <polygon points="105,305 110,318 124,318 113,327 117,340 105,331 93,340 97,327 86,318 100,318" fill="#FBBF24" />
    <polygon points="395,305 400,318 414,318 403,327 407,340 395,331 383,340 387,327 376,318 390,318" fill="#FBBF24" />

    <text x="75" y="258" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#FBBF24" text-anchor="middle" transform="rotate(-90 75 258)">1958</text>
    <text x="425" y="258" font-family="'Impact', 'Arial Black', sans-serif" font-size="26" font-weight="900" fill="#FBBF24" text-anchor="middle" transform="rotate(90 425 258)">32 | SC</text>

    <text font-family="'Impact', 'Arial Black', sans-serif" font-size="36" font-weight="900" fill="#FFFFFF" letter-spacing="3">
      <textPath href="#text-path-top" startOffset="50%" text-anchor="middle">GRUPO ESCOTEIRO</textPath>
    </text>

    <text font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" letter-spacing="2">
      <textPath href="#text-path-bottom" startOffset="50%" text-anchor="middle">LEÕES DE BLUMENAU</textPath>
    </text>

    <g transform="translate(130, 125) scale(0.95)">
      <path d="M 120 30 C 110 10, 90 5, 80 20 C 70 5, 50 10, 45 30 C 30 25, 20 45, 30 65 C 15 75, 10 95, 25 115 C 15 130, 20 150, 40 160 C 35 180, 50 200, 75 205 C 90 220, 120 225, 140 215 C 170 210, 190 190, 200 160 C 215 140, 210 110, 195 90 C 200 70, 185 50, 165 45 C 160 30, 140 20, 120 30 Z" fill="#0F2C59" />
      <path d="M 60 70 Q 75 60 90 75 Q 70 85 60 70 Z" fill="#FFFFFF" />
      <path d="M 40 105 Q 30 110 25 100 Q 35 95 40 105 Z" fill="#FFFFFF" />
      <path d="M 42 120 C 50 120, 55 125, 52 130 C 45 130, 40 125, 42 120 Z" fill="#FFFFFF" />
      
      <g transform="translate(45, 150)">
        <path d="M 0 10 C 30 -5, 80 -5, 110 10 C 105 30, 85 45, 55 45 C 25 45, 5 30, 0 10 Z" fill="#FBBF24" stroke="#0F2C59" stroke-width="3" />
        <path d="M 15 5 L 30 38 L 45 42 L 25 3 Z" fill="#0F2C59" />
        <path d="M 55 2 L 70 44 L 85 40 L 70 1 Z" fill="#0F2C59" />
        <rect x="42" y="38" width="26" height="30" rx="4" fill="#FBBF24" stroke="#0F2C59" stroke-width="3" />
        <path d="M 55 42 C 52 48 46 50 48 54 C 52 54 53 50 55 46 C 57 50 58 54 62 54 C 64 50 58 48 55 42 Z" fill="#0F2C59" />
        <path d="M 55 40 L 55 58" stroke="#0F2C59" stroke-width="2" />
        <path d="M 45 68 L 35 110 L 52 105 L 53 68 Z" fill="#0F2C59" stroke="#FBBF24" stroke-width="2" />
        <path d="M 57 68 L 58 105 L 75 110 L 65 68 Z" fill="#FBBF24" stroke="#0F2C59" stroke-width="2" />
      </g>
    </g>
  </g>
</svg>`;

export const GELB_LOGO_OFFICIAL_URL = `data:image/svg+xml;utf8,${encodeURIComponent(GELB_LOGO_SVG)}`;

export const GELB_LOGO_DATA_URL = GELB_LOGO_OFFICIAL_URL;

export const ESCOTEIROS_DO_BRASIL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="100%" height="100%">
  <g>
    <!-- Petala Esquerda Azul com Cruzeiro do Sul -->
    <path d="M 200 290 C 180 270 110 260 110 180 C 110 130 150 70 200 40 C 190 80 180 120 180 160 C 160 150 140 160 140 180 C 140 210 180 250 200 290 Z" fill="#003B82" />
    
    <!-- Petala Direita Verde -->
    <path d="M 200 290 C 220 270 290 260 290 180 C 290 130 250 70 200 40 C 210 80 220 120 220 160 C 240 150 260 160 260 180 C 260 210 220 250 200 290 Z" fill="#00843D" />

    <!-- Onda Central Amarela -->
    <path d="M 200 40 C 185 80 180 130 190 180 C 195 210 200 250 200 290 C 200 250 205 210 210 180 C 220 130 215 80 200 40 Z" fill="#FFCC00" />
    
    <!-- Lóbulos e curvas -->
    <path d="M 195 180 C 150 140 110 145 110 180 C 110 215 155 240 195 280 C 180 250 170 210 195 180 Z" fill="#003B82" />
    <path d="M 205 180 C 250 140 290 145 290 180 C 290 215 245 240 205 280 C 220 250 230 210 205 180 Z" fill="#00843D" />

    <path d="M 200 40 C 190 70 185 100 185 140 L 200 290 L 215 140 C 215 100 210 70 200 40 Z" fill="#00843D" />
    <path d="M 200 40 C 190 70 185 100 185 140 L 200 290 L 195 140 C 190 100 195 70 200 40 Z" fill="#003B82" />
    <path d="M 195 45 C 190 80 188 120 190 160 L 200 290 L 205 160 C 207 120 205 80 200 45 Z" fill="#FFCC00" />

    <!-- Estrelas do Cruzeiro do Sul (Brancas) -->
    <polygon points="135,180 137,185 142,185 138,188 140,193 135,190 130,193 132,188 128,185 133,185" fill="#FFFFFF" />
    <polygon points="150,165 152,170 157,170 153,173 155,178 150,175 145,178 147,173 143,170 148,170" fill="#FFFFFF" />
    <polygon points="155,195 157,200 162,200 158,203 160,208 155,205 150,208 152,203 148,200 153,200" fill="#FFFFFF" />
    <polygon points="170,180 172,185 177,185 173,188 175,193 170,190 165,193 167,188 163,185 168,185" fill="#FFFFFF" />
    <polygon points="162,188 163,191 166,191 164,193 165,196 162,194 159,196 160,193 158,191 161,191" fill="#FFFFFF" />

    <!-- Texto Oficial UEB -->
    <text x="200" y="365" font-family="'Arial Black', 'Trebuchet MS', sans-serif" font-size="36" font-weight="900" fill="#003B82" text-anchor="middle" letter-spacing="2">ESCOTEIROS</text>
    <text x="200" y="405" font-family="'Arial', 'Trebuchet MS', sans-serif" font-size="26" font-weight="bold" fill="#0099B8" text-anchor="middle" letter-spacing="8">DO BRASIL</text>
  </g>
</svg>`;

export const ESCOTEIROS_DO_BRASIL_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(ESCOTEIROS_DO_BRASIL_LOGO_SVG)}`;

export const FLOR_DE_LIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <g fill="#0F2C59" opacity="0.85">
    <path d="M 100 10 C 115 50 135 80 135 120 C 135 150 120 170 100 170 C 80 170 65 150 65 120 C 65 80 85 50 100 10 Z" />
    <path d="M 90 120 C 60 110 20 120 15 150 C 10 180 40 190 60 180 C 80 170 85 145 90 120 Z" />
    <path d="M 110 120 C 140 110 180 120 185 150 C 190 180 160 190 140 180 C 120 170 115 145 110 120 Z" />
    <rect x="60" y="160" width="80" height="16" rx="4" fill="#FBBF24" stroke="#0F2C59" stroke-width="3" />
    <path d="M 75 176 Q 100 220 125 176 Z" fill="#0F2C59" />
    <polygon points="45,150 48,157 55,157 50,161 52,168 45,163 38,168 40,161 35,157 42,157" fill="#FBBF24" />
    <polygon points="155,150 158,157 165,157 160,161 162,168 155,163 148,168 150,161 145,157 152,157" fill="#FBBF24" />
  </g>
</svg>`;

export const FLOR_DE_LIS_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(FLOR_DE_LIS_SVG)}`;

export const SIGNATURE_PRESIDENTE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="100%" height="100%">
  <path d="M 20 50 Q 40 10 70 45 T 120 30 T 170 55 T 220 20 T 270 40" fill="none" stroke="#0F2C59" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 50 60 Q 100 20 180 50 T 260 30" fill="none" stroke="#0F2C59" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
</svg>`;

export const SIGNATURE_PRESIDENTE_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SIGNATURE_PRESIDENTE_SVG)}`;

export const SIGNATURE_DIRETORIA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="100%" height="100%">
  <path d="M 15 40 C 45 60, 60 10, 100 35 C 140 60, 160 15, 200 45 C 230 15, 250 50, 285 30" fill="none" stroke="#003366" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 30 25 Q 90 65 150 20 T 250 55" fill="none" stroke="#003366" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
</svg>`;

export const SIGNATURE_DIRETORIA_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SIGNATURE_DIRETORIA_SVG)}`;
