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
  
  // Metadados
  issuedAt: string;
}

export interface BatchRecipient {
  name: string;
  registration: string;
  section?: ScoutSection;
  customText?: string;
}
