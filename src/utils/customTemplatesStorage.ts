import { CertificateTemplate, ScoutCategory } from '../types/certificate';
import { createDefaultAcolhidaFilhotesPdf } from './pdfRenderer';

const DB_NAME = 'gelb_certificate_templates_db';
const DB_VERSION = 1;
const STORE_NAME = 'templates';
const LOCAL_STORAGE_KEY = 'gelb_certificate_templates_cache';

/**
 * Opens the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('model', 'model', { unique: false });
        store.createIndex('category_model', ['category', 'model'], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fallback to localStorage if IndexedDB is unavailable
 */
function getFromLocalStorage(): CertificateTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(templates: CertificateTemplate[]): void {
  try {
    // Only save minimal data in localStorage if needed to prevent 5MB overflow
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.warn('Could not cache templates in localStorage (quota may be exceeded).', err);
  }
}

/**
 * Fetches all templates from IndexedDB (with fallback)
 */
export async function getAllTemplates(): Promise<CertificateTemplate[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = (request.result as CertificateTemplate[]) || [];
        resolve(result);
      };

      request.onerror = () => {
        resolve(getFromLocalStorage());
      };
    });
  } catch {
    return getFromLocalStorage();
  }
}

/**
 * Retrieves a single template by ID
 */
export async function getTemplateById(id: string): Promise<CertificateTemplate | null> {
  const all = await getAllTemplates();
  return all.find((t) => t.id === id) || null;
}

/**
 * Finds the matching template for a specific Category and Model
 */
export async function getTemplateForCategoryAndModel(
  category: ScoutCategory,
  model: string
): Promise<CertificateTemplate | null> {
  const all = await getAllTemplates();
  // Exact match
  const exact = all.find(
    (t) =>
      t.category.toLowerCase() === category.toLowerCase() &&
      t.model.toLowerCase() === model.toLowerCase()
  );
  if (exact) return exact;

  // Partial match fallback (e.g. 'Acolhida' or 'Progressão Filhotes')
  const partial = all.find((t) => {
    if (t.category.toLowerCase() !== category.toLowerCase()) return false;
    const m1 = t.model.toLowerCase();
    const m2 = model.toLowerCase();
    return m1.includes(m2) || m2.includes(m1);
  });

  return partial || null;
}

/**
 * Saves or updates a certificate template in the core storage
 */
export async function saveTemplate(template: CertificateTemplate): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(template);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const current = getFromLocalStorage();
    const filtered = current.filter((t) => t.id !== template.id);
    filtered.push(template);
    saveToLocalStorage(filtered);
  }

  // Notify components across the application
  window.dispatchEvent(new CustomEvent('gelb_templates_updated'));
}

const DELETED_TEMPLATES_KEY = 'gelb_deleted_templates_blacklist';

function getDeletedBlacklist(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToDeletedBlacklist(id: string): void {
  try {
    const list = getDeletedBlacklist();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Erro ao salvar lista de modelos excluídos:', err);
  }
}

/**
 * Deletes a template by ID
 */
export async function deleteTemplate(id: string): Promise<void> {
  // Adiciona à lista de excluídos para evitar recriação automática
  addToDeletedBlacklist(id);

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const current = getFromLocalStorage();
    const filtered = current.filter((t) => t.id !== id);
    saveToLocalStorage(filtered);
  }

  window.dispatchEvent(new CustomEvent('gelb_templates_updated'));
}

/**
 * Sets a template as the default/active one for its category and model
 */
export async function setDefaultTemplate(id: string): Promise<void> {
  const all = await getAllTemplates();
  const target = all.find((t) => t.id === id);
  if (!target) return;

  for (const t of all) {
    if (t.category === target.category && t.model === target.model) {
      t.isDefault = t.id === id;
      await saveTemplate(t);
    }
  }

  window.dispatchEvent(new CustomEvent('gelb_templates_updated'));
}

/**
 * Ensures default pre-installed templates (such as Certificado de Acolhida dos Filhotes)
 * exist in the core storage.
 */
export async function initDefaultTemplates(): Promise<CertificateTemplate[]> {
  const blacklist = getDeletedBlacklist();
  if (blacklist.includes('tpl-acolhida-filhotes-padrao')) {
    return await getAllTemplates();
  }

  const existing = await getAllTemplates();
  const hasAcolhida = existing.some(
    (t) =>
      t.id === 'tpl-acolhida-filhotes-padrao' ||
      t.name.toLowerCase().includes('acolhida') ||
      t.model.toLowerCase().includes('filhotes') ||
      t.model.toLowerCase() === 'acolhida'
  );

  if (!hasAcolhida) {
    try {
      const { pdfDataUrl, previewImageDataUrl } = await createDefaultAcolhidaFilhotesPdf();
      const defaultAcolhida: CertificateTemplate = {
        id: 'tpl-acolhida-filhotes-padrao',
        name: 'Certificado de Acolhida dos Filhotes',
        category: 'Progressão',
        model: 'Progressão Filhotes',
        fileName: 'certificado-acolhida-filhotes-gelb.pdf',
        fileSize: 45200, // ~45 KB
        pdfDataUrl,
        previewImageDataUrl,
        description: 'Modelo Oficial de Acolhida do Ramo Filhotes - GELB 32/SC.',
        orientation: 'landscape',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveTemplate(defaultAcolhida);
      return [...existing, defaultAcolhida];
    } catch (err) {
      console.warn('Erro ao inicializar modelo padrão de filhotes:', err);
    }
  }

  return existing;
}
