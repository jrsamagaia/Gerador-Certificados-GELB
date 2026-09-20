export type CertificateType =
  | 'participacao'
  | 'conclusao'
  | 'honra'
  | 'promessa'
  | 'insignia';

export type ScoutCategory =
  | 'Todas'
  | 'Progressão'
  | 'Especialidades'
  | 'Promessas'
  | 'Insígnias de Modalidade'
  | 'Interesse Especial'
  | 'Monitoria'
  | 'Atividade'
  | 'Expansão';

export type ScoutSection =
  | 'Alcatéia (Lobinhos)'
  | 'Tropa Escoteira'
  | 'Tropa Senior'
  | 'Clã Pionense'
  | 'Adultos / Chefia'
  | 'Geral GELB';

export interface Signatory {
  id: string;
  name: string;
  role: string;
  signatureImage?: string; // data URL or asset path
  enabled: boolean;
}

export interface CertificateData {
  id: string;
  hash: string;
  type: CertificateType;
  recipientName: string;
  recipientRegistration: string; // Registro UEB
  section?: ScoutSection;
  eventName: string;
  eventDate: string; // Ex: '15 de Outubro de 2025'
  startDate?: string;
  endDate?: string;
  location: string; // Ex: 'Blumenau - SC'
  workloadHours?: number;
  customText?: string;
  
  // Scout Category & Model fields (da interface de imagens)
  category: ScoutCategory;
  model: string;
  groupName: string; // Ex: 'Grupo Escoteiro Leões de Blumenau - GELB 32/SC'
  responsaveis?: string; // Para Acolhida / Progressão
  progressionStage?: string; // Progressão de etapa de (ex: 'Acolhida dos Filhotes', 'Lobo Saltador', 'Pista', 'Rumo')
  nomeEspecialidade?: string; // Ex: 'Radioamadorismo'
  nivelConquistado?: string; // '1' | '2' | '3'
  itensCompletados?: string; // Ex: '1, 3, 5 e 8'
  ramo?: string; // Ex: 'Lobinho / Escoteiro'
  matilhaPatrulha?: string; // Ex: 'Preta / Xavante'
  quantidadeAnos?: string; // Ex: '1', '2', '3'
  quantidadeNovosMembros?: string; // Ex: '3'
  
  // Componentes de Data separados
  dia?: string;
  mes?: string;
  ano?: string;
  
  // Customizações visuais
  logoPath: string;
  uelLogoPath?: string;
  scLogoPath?: string;
  showWatermark: boolean;
  borderStyle: 'classic-gelb' | 'gold-honor' | 'minimalist' | 'scout-green';
  
  // Assinaturas
  signatories: Signatory[];
  
  // Modelo Específico em PDF
  customTemplateId?: string;
  customTemplateName?: string;
  useCustomTemplate?: boolean;
  customTemplateBackground?: string; // Imagem rasterizada da página para renderização
  templateMode?: 'faithful-structure' | 'hybrid-system'; // 'faithful-structure' mantém a estrutura exata do certificado enviado
  fillMode?: 'fields-on-lines' | 'center-diploma'; // 'fields-on-lines' preenche linhas pré-impressas
  
  // Campos de posicionamento para linhas pré-impressas
  fieldRecipientY?: number; // % vertical linha do filhote/homenageado (padrão: 31.8)
  fieldRecipientX?: number; // % horizontal início da linha do nome (padrão: 43.0)
  fieldRecipientFontSize?: number; // Tamanho fonte filhote
  fieldRecipientFontFamily?: string; // Fonte filhote
  fieldRecipientColor?: string; // Cor filhote
  
  showResponsaveisOnTemplate?: boolean; // Se preenche responsáveis na linha
  fieldResponsaveisY?: number; // % vertical linha responsáveis (padrão: 36.2)
  fieldResponsaveisX?: number; // % horizontal início linha responsáveis (padrão: 46.5)
  fieldResponsaveisFontSize?: number; // Tamanho fonte responsáveis
  
  showProgressionStageOnTemplate?: boolean; // Se preenche etapa de progressão na linha correspondente
  fieldProgressionStageY?: number; // % vertical linha progressão (padrão: 40.5)
  fieldProgressionStageX?: number; // % horizontal início linha progressão (padrão: 44.0)
  fieldProgressionStageFontSize?: number; // Tamanho fonte progressão
  
  showGroupOnTemplate?: boolean; // Se preenche grupo escoteiro na linha
  fieldGroupY?: number; // % vertical linha grupo escoteiro (padrão: 44.8)
  fieldGroupX?: number; // % horizontal início linha grupo escoteiro (padrão: 41.5)
  fieldGroupFontSize?: number; // Tamanho fonte grupo escoteiro
  
  fieldDateY?: number; // % vertical linha de data fracionada (padrão: 54.8)
  fieldCityX?: number; // % horizontal centro cidade (padrão: 34.2)
  fieldDayX?: number; // % horizontal centro dia (padrão: 44.8)
  fieldMonthX?: number; // % horizontal centro mês (padrão: 55.5)
  fieldYearX?: number; // % horizontal centro ano (padrão: 67.5)
  fieldDateFontSize?: number; // Tamanho fonte data fracionada
  
  fieldSignaturesY?: number; // % vertical assinaturas sobre as linhas (padrão: 66.0)
  fieldSigLeftX?: number; // % horizontal assinatura esquerda (padrão: 35.5)
  fieldSigRightX?: number; // % horizontal assinatura direita (padrão: 62.5)
  
  // Modo centralizado clássico (fallback)
  namePosY?: number; // Posição vertical do nome (% do topo, ex: 52)
  namePosX?: number; // Posição horizontal do nome (% da esquerda, ex: 50)
  nameFontSize?: number; // Tamanho da fonte do nome em px (ex: 36)
  nameColor?: string; // Cor do texto do nome (ex: '#0F2C59')
  nameFontFamily?: string; // Família tipográfica do nome
  showRegistrationOnTemplate?: boolean; // Se exibe Registro UEB sobre o modelo
  regPosY?: number; // Posição vertical do registro (% do topo)
  showDateOnTemplate?: boolean; // Se exibe data sobre o modelo
  datePosY?: number; // Posição vertical da data (% do topo, ex: 68)
  dateFontSize?: number; // Tamanho da fonte da data
  dateColor?: string; // Cor da data
  showSignaturesOnTemplate?: boolean; // Se exibe assinaturas digitais sobrepostas
  signaturesPosY?: number; // Posição vertical das assinaturas (% do topo, ex: 80)
  
  // Metadados
  issuedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string; // Ex: 'Certificado de Acolhida dos Filhotes'
  category: ScoutCategory;
  model: string; // Ex: 'Progressão Filhotes' ou 'Acolhida'
  fileName: string;
  fileSize: number;
  pdfDataUrl: string; // Base64 data URL do arquivo PDF original
  previewImageDataUrl?: string; // Imagem da página para renderização
  description?: string;
  orientation: 'landscape' | 'portrait';
  isDefault?: boolean;
  defaultNamePosY?: number;
  defaultNamePosX?: number;
  defaultNameFontSize?: number;
  defaultNameFontFamily?: string;
  defaultNameColor?: string;
  defaultDatePosY?: number;
  defaultSignaturesPosY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchRecipient {
  name: string;
  registration: string;
  section?: ScoutSection;
  customText?: string;
}
