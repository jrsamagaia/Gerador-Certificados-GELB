/**
 * Configurações globais de diretórios, assets e textos para o
 * Sistema de Geração de Certificados do Grupo Escoteiro Leões de Blumenau (GELB 32/SC).
 *
 * Atualizado para substituir "A União dos Escoteiros do Brasil..."
 * por "O Grupo Escoteiro Leões de Blumenau..." e vincular todos os caminhos de assets.
 */

export interface DirectoryConfig {
  baseAssetDir: string;
  logosDir: string;
  fontsDir: string;
  signaturesDir: string;
  templatesDir: string;
  watermarksDir: string;
}

export const GELB_DIRECTORIES: DirectoryConfig = {
  baseAssetDir: '/assets/gelb',
  logosDir: '/assets/gelb/logos',
  fontsDir: '/assets/gelb/fonts',
  signaturesDir: '/assets/gelb/signatures',
  templatesDir: '/assets/gelb/templates',
  watermarksDir: '/assets/gelb/watermarks',
};

export interface AssetPaths {
  primaryLogo: string;
  monochromeLogo: string;
  fleurDeLisWatermark: string;
  signaturePresidente: string;
  signatureDiretoria: string;
  defaultTemplateBackground: string;
}

export const GELB_ASSETS: AssetPaths = {
  primaryLogo: 'https://geleoesdeblumenau.com.br/wp-content/uploads/2023/05/logo-geleoes-1.png',
  monochromeLogo: `${GELB_DIRECTORIES.logosDir}/logo-gelb-monochrome.svg`,
  fleurDeLisWatermark: `${GELB_DIRECTORIES.watermarksDir}/flor-de-lis.svg`,
  signaturePresidente: `${GELB_DIRECTORIES.signaturesDir}/assinatura-presidente.svg`,
  signatureDiretoria: `${GELB_DIRECTORIES.signaturesDir}/assinatura-diretoria.svg`,
  defaultTemplateBackground: `${GELB_DIRECTORIES.templatesDir}/template-oficial.svg`,
};

export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  category: 'header' | 'body' | 'signature';
  assetPath: string;
  fallback: string;
  googleFontName?: string;
}

export const GELB_FONTS: FontDefinition[] = [
  {
    id: 'cinzel',
    name: 'Cinzel Decorative (Oficial)',
    family: "'Cinzel Decorative', 'Cinzel', serif",
    category: 'header',
    assetPath: `${GELB_DIRECTORIES.fontsDir}/Cinzel-Bold.woff2`,
    fallback: 'serif',
    googleFontName: 'Cinzel Decorative',
  },
  {
    id: 'montserrat',
    name: 'Montserrat (Texto Principal)',
    family: "'Montserrat', 'Helvetica Neue', sans-serif",
    category: 'body',
    assetPath: `${GELB_DIRECTORIES.fontsDir}/Montserrat-Regular.woff2`,
    fallback: 'sans-serif',
    googleFontName: 'Montserrat',
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes (Assinaturas & Nomes Elegantes)',
    family: "'Great Vibes', 'Brush Script MT', cursive",
    category: 'signature',
    assetPath: `${GELB_DIRECTORIES.fontsDir}/GreatVibes-Regular.woff2`,
    fallback: 'cursive',
    googleFontName: 'Great Vibes',
  },
  {
    id: 'playfair',
    name: 'Playfair Display (Honra ao Mérito)',
    family: "'Playfair Display', Georgia, serif",
    category: 'header',
    assetPath: `${GELB_DIRECTORIES.fontsDir}/PlayfairDisplay-Bold.woff2`,
    fallback: 'serif',
    googleFontName: 'Playfair Display',
  },
];

/**
 * Textos padrão oficiais ajustados para o Grupo Escoteiro Leões de Blumenau (GELB 32/SC)
 */
export const GELB_TEXT_TEMPLATES = {
  institutionName: 'O Grupo Escoteiro Leões de Blumenau - GELB 32/SC',
  institutionShort: 'GELB 32/SC',
  cityState: 'Blumenau - SC',
  foundedYear: '1958',

  standardHeader: 'O Grupo Escoteiro Leões de Blumenau (GELB 32/SC), por meio de sua Diretoria Executiva e no uso de suas atribuições estatutárias, confere o presente',

  certTypes: {
    participacao: {
      title: 'CERTIFICADO DE PARTICIPAÇÃO',
      subtitle: 'Reconhecimento pela participação ativa nas atividades escoteiras',
      bodyTemplate: 'Certificamos a participação no(a) {evento}, realizado(a) na cidade de {local}, com carga horária total de {horas} horas, demonstrando espírito escoteiro, dedicação e compromisso com a Promessa e a Lei Escoteira.',
    },
    conclusao: {
      title: 'CERTIFICADO DE CONCLUSÃO',
      subtitle: 'Conclusão de etapa e capacitação de formação escoteira',
      bodyTemplate: 'Certificamos a conclusão com êxito do módulo de capacitação em {curso}, promovido pelo Grupo Escoteiro Leões de Blumenau 32/SC no período de {data_inicio} a {data_fim}, cumprindo integralmente as diretrizes do plano de formação.',
    },
    honra: {
      title: 'CERTIFICADO DE HONRA AO MÉRITO',
      subtitle: 'Distinção especial e relevante serviços prestados ao movimento escoteiro',
      bodyTemplate: 'O Grupo Escoteiro Leões de Blumenau outorga este Certificado de Honra ao Mérito em reconhecimento aos relevantes serviços prestados, liderança exemplar e inestimável dedicação ao fortalecimento do GELB 32/SC e da juventude blumenauense.',
    },
    promessa: {
      title: 'CERTIFICADO DE PROMESSA ESCOTEIRA',
      subtitle: 'Compromisso de honra com Deus, com a Pátria e com o Próximo',
      bodyTemplate: 'Certificamos a realização solene da Promessa Escoteira no Grupo Escoteiro Leões de Blumenau 32/SC em {data_inicio}, ingressando na fraternidade mundial dos escoteiros sob a divisa: Sempre Alerta!',
    },
    insignia: {
      title: 'CERTIFICADO DE CONQUISTA DE INSÍGNIA',
      subtitle: 'Progressão pessoal e especialidades escoteiras',
      bodyTemplate: 'O Grupo Escoteiro Leões de Blumenau certifica a conquista da Insígnia Especial {curso}, cumprindo todos os requisitos e etapas de progressão pessoal exigidos pelo programa educativo escoteiro.',
    },
  },
};

/**
 * Função utilitária para resolver caminhos de assets do GELB
 */
export function getGelbAssetPath(pathKey: keyof AssetPaths | string): string {
  if (pathKey in GELB_ASSETS) {
    return GELB_ASSETS[pathKey as keyof AssetPaths];
  }
  if (pathKey.startsWith('/')) {
    return pathKey;
  }
  return `${GELB_DIRECTORIES.baseAssetDir}/${pathKey}`;
}
