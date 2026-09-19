import { ScoutCategory } from '../types/certificate';

export interface ModelDefinition {
  id: string;
  name: string;
  category: ScoutCategory;
  defaultTitle?: string;
  defaultText?: string;
}

export const SCOUT_CATEGORIES: ScoutCategory[] = [
  'Todas',
  'Progressão',
  'Especialidades',
  'Promessas',
  'Insígnias de Modalidade',
  'Interesse Especial',
  'Monitoria',
  'Atividade',
  'Expansão',
];

export const CATEGORY_MODELS_MAP: Record<Exclude<ScoutCategory, 'Todas'>, string[]> = {
  'Progressão': [
    'Acolhida',
    'Progressão Lobinho',
    'Progressão Escoteiro',
    'Progressão Sênior',
    'Progressão Pioneiro',
    'Progressão Filhotes',
  ],
  'Especialidades': [
    'Especialidade Lobinho',
    'Especialidade Escoteiro',
    'Especialidade Sênior',
    'Especialidade Pioneiro',
  ],
  'Promessas': [
    'Promessa (Lobinho)',
    'Promessa (Geral)',
  ],
  'Insígnias de Modalidade': [
    'Insígnia do Aviador',
    'Insígnia do Aeronauta',
    'Insígnia do Grumete',
    'Insígnia Naval',
  ],
  'Interesse Especial': [
    'Insígnia Cone Sul',
    'Insígnia da Lusofonia',
    'Insígnia Reduzir, Reciclar, Reutilizar',
    'Escoteiros pela Energia Solar',
    'Campeões da Natureza',
  ],
  'Monitoria': [
    'Monitor (Sênior)',
    'Sub-monitor (Sênior)',
    'Monitor (Escoteiro)',
    'Sub-monitor (Escoteiro)',
    'Primo',
    'Segundo',
  ],
  'Atividade': [
    'Estrela de Atividade',
  ],
  'Expansão': [
    'Recrutador',
    'Semeador',
  ],
};

export const ALL_MODELS = Object.values(CATEGORY_MODELS_MAP).flat();
