import { Category } from '../types';

/**
 * Mapping of synonyms and keywords to categories and common search terms.
 * This acts as a "thesaurus" to improve search precision.
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  'Arquitetura': ['projeto', 'planta', 'desenho', 'urbanismo', 'decoração', 'interiores', 'fachada', 'arquiteto', 'arquiteta'],
  'Engenharia': ['calculo', 'estrutural', 'obra', 'projeto civil', 'engenheiro', 'engenheira', 'alvará', 'habite-se'],
  'Técnico de Edificação': ['mestre de obras', 'fiscalização', 'medição', 'acompanhamento', 'edificações'],
  'Alvenaria e Estrutura': ['pedreiro', 'tijolo', 'bloco', 'concreto', 'viga', 'coluna', 'alicerce', 'fundação', 'muro', 'reboco'],
  'Armador': ['ferragem', 'ferro', 'viga de ferro', 'estribo', 'aço', 'coluna de ferro'],
  'Elétrica': ['eletricista', 'fio', 'tomada', 'disjuntor', 'quadro de luz', 'iluminação', 'curto-circuito', 'fiação'],
  'Hidráulica': ['encanador', 'cano', 'vazamento', 'torneira', 'chuveiro', 'esgoto', 'caixa d\'água', 'sifão', 'registro'],
  'Telhados e Calhas': ['telha', 'cobertura', 'madeiramento', 'rufo', 'pingadeira', 'vazamento no teto', 'telhadista'],
  'Gesso e Drywall': ['forro', 'sanca', 'moldura', 'parede de gesso', 'gesseiro', 'divisorias'],
  'Pisos e Revestimentos': ['azulejista', 'porcelanato', 'cerâmica', 'ladrilho', 'pastilha', 'contrapiso', 'rodapé'],
  'Pintura e Acabamento': ['pintor', 'massa corrida', 'textura', 'grafiato', 'verniz', 'lixamento', 'rolo', 'pincel'],
  'Marcenaria': ['móveis planejados', 'armário', 'cozinha', 'guarda-roupa', 'madeira', 'marceneiro', 'porta', 'janela'],
  'Serralheria': ['portão', 'grade', 'ferro', 'solda', 'serralheiro', 'alumínio', 'corrimão'],
  'Ajudante': ['servente', 'auxiliar', 'limpeza', 'carregar peso', 'braçal'],
  'Limpeza Pós-Obra': ['faxina', 'remoção de entulho', 'limpeza pesada', 'brilho', 'organização'],
  // Generic terms mapping to categories
  'reforma': ['Alvenaria e Estrutura', 'Pintura e Acabamento', 'Gesso e Drywall', 'Pisos e Revestimentos'],
  'conserto': ['Elétrica', 'Hidráulica', 'Serralheria', 'Telhados e Calhas'],
  'instalação': ['Elétrica', 'Hidráulica', 'Marcenaria', 'Pisos e Revestimentos'],
};

/**
 * Normalizes a string for searching (lowercase, trim, remove accents if needed).
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
};

/**
 * Checks if a search query matches an item based on synonyms and keywords.
 */
export const matchesSearch = (query: string, item: { title: string; description: string; category: Category; keywords?: string[] }): boolean => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const normalizedTitle = normalizeText(item.title);
  const normalizedDesc = normalizeText(item.description);
  const normalizedCategory = normalizeText(item.category);
  const normalizedKeywords = (item.keywords || []).map(k => normalizeText(k));

  // 1. Direct matches
  if (normalizedTitle.includes(normalizedQuery)) return true;
  if (normalizedDesc.includes(normalizedQuery)) return true;
  if (normalizedCategory.includes(normalizedQuery)) return true;
  if (normalizedKeywords.some(k => k.includes(normalizedQuery))) return true;

  // 2. Synonym matches
  // Check if the query is a synonym for the item's category
  const categorySynonyms = SEARCH_SYNONYMS[item.category] || [];
  if (categorySynonyms.some(syn => normalizeText(syn).includes(normalizedQuery))) return true;

  // 3. Reverse synonym check: if the query matches a key in SEARCH_SYNONYMS, 
  // check if the item's category is in the value list for that key
  for (const [key, values] of Object.entries(SEARCH_SYNONYMS)) {
    if (normalizeText(key).includes(normalizedQuery)) {
      // If the key is a category itself, we already checked it. 
      // If it's a generic term like 'reforma', check if item's category is in the list.
      if (values.includes(item.category)) return true;
    }
  }

  return false;
};
