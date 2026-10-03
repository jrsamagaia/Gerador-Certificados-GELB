import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../config/firebase';
import { CertificateTemplate, ScoutCategory } from '../types/certificate';
import { createDefaultAcolhidaFilhotesPdf } from './pdfRenderer';

const DB_NAME = 'gelb_certificate_templates_db';
const DB_VERSION = 1;
const STORE_NAME = 'templates';
const LOCAL_STORAGE_KEY = 'gelb_certificate_templates_cache';
const CHUNK_SIZE = 500000; // 500 KB chunk boundary safe for Firestore 1MB limits

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
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.warn('Could not cache templates in localStorage (quota may be exceeded).', err);
  }
}

/**
 * Save template locally in IndexedDB / localStorage
 */
async function saveLocalOnly(template: CertificateTemplate): Promise<void> {
  try {
    const dbInstance = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
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
}

/**
 * Fetches all templates from local storage
 */
export async function getLocalTemplates(): Promise<CertificateTemplate[]> {
  try {
    const dbInstance = await openDatabase();
    return new Promise((resolve) => {
      const tx = dbInstance.transaction(STORE_NAME, 'readonly');
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
 * Fetch PDF content from chunks subcollection in Firestore if needed
 */
export async function fetchTemplateChunks(templateId: string): Promise<string> {
  const path = `templates/${templateId}/chunks`;
  try {
    const chunksSnapshot = await getDocs(collection(db, 'templates', templateId, 'chunks'));
    const chunkDocs: { chunkIndex: number; data: string }[] = [];
    chunksSnapshot.forEach((d) => {
      const cdata = d.data();
      if (typeof cdata.chunkIndex === 'number' && typeof cdata.data === 'string') {
        chunkDocs.push({ chunkIndex: cdata.chunkIndex, data: cdata.data });
      }
    });

    chunkDocs.sort((a, b) => a.chunkIndex - b.chunkIndex);
    return chunkDocs.map((c) => c.data).join('');
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetches all published templates from Firebase Firestore Cloud Database
 */
export async function fetchCloudTemplates(): Promise<CertificateTemplate[]> {
  const path = 'templates';
  try {
    const snapshot = await getDocs(collection(db, path));
    const cloudList: CertificateTemplate[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as Partial<CertificateTemplate> & { hasChunks?: boolean };
      if (data.id && data.name && data.category && data.model) {
        cloudList.push({
          id: data.id,
          name: data.name,
          category: data.category as ScoutCategory,
          model: data.model,
          fileName: data.fileName || `${data.name}.pdf`,
          fileSize: data.fileSize || 0,
          pdfDataUrl: data.pdfDataUrl || '',
          previewImageDataUrl: data.previewImageDataUrl || data.pdfDataUrl || '',
          description: data.description,
          orientation: (data.orientation as 'landscape' | 'portrait') || 'landscape',
          isDefault: !!data.isDefault,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          defaultNamePosY: data.defaultNamePosY,
          defaultNamePosX: data.defaultNamePosX,
          defaultNameFontSize: data.defaultNameFontSize,
          defaultNameFontFamily: data.defaultNameFontFamily,
          defaultNameColor: data.defaultNameColor,
          defaultDatePosY: data.defaultDatePosY,
          defaultSignaturesPosY: data.defaultSignaturesPosY,
        });
      }
    });

    // Save fetched cloud templates to local cache so offline works
    for (const t of cloudList) {
      await saveLocalOnly(t);
    }

    return cloudList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetches all templates (combining local cache with cloud database)
 */
export async function getAllTemplates(): Promise<CertificateTemplate[]> {
  const local = await getLocalTemplates();

  try {
    // Attempt cloud sync in background / asynchronously
    const cloud = await fetchCloudTemplates();
    const mergedMap = new Map<string, CertificateTemplate>();

    local.forEach((t) => mergedMap.set(t.id, t));
    cloud.forEach((t) => mergedMap.set(t.id, t));

    return Array.from(mergedMap.values());
  } catch (e) {
    console.warn('Operando com modelos locais em cache (modo offline/não sincronizado):', e);
    return local;
  }
}

/**
 * Retrieves a single template by ID (loading chunks if needed)
 */
export async function getTemplateById(id: string): Promise<CertificateTemplate | null> {
  const all = await getAllTemplates();
  const template = all.find((t) => t.id === id) || null;
  if (!template) return null;

  // If pdfDataUrl is empty, it may be stored in chunks in the cloud
  if (!template.pdfDataUrl || template.pdfDataUrl.trim() === '') {
    try {
      const fullPdf = await fetchTemplateChunks(id);
      if (fullPdf) {
        template.pdfDataUrl = fullPdf;
        await saveLocalOnly(template);
      }
    } catch (e) {
      console.warn('Não foi possível obter fragmentos remotos do template:', e);
    }
  }

  return template;
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

  // Partial match fallback
  const partial = all.find((t) => {
    if (t.category.toLowerCase() !== category.toLowerCase()) return false;
    const m1 = t.model.toLowerCase();
    const m2 = model.toLowerCase();
    return m1.includes(m2) || m2.includes(m1);
  });

  return partial || null;
}

/**
 * Saves a certificate template to both local storage AND Firebase Firestore Cloud
 */
export async function saveTemplate(
  template: CertificateTemplate,
  syncToCloud = true
): Promise<void> {
  // Always save locally first for instant reactivity
  await saveLocalOnly(template);

  // Sync to Firebase Cloud if enabled and user is logged in
  if (syncToCloud && auth.currentUser) {
    const templateDocPath = `templates/${template.id}`;
    try {
      const needsChunking = template.pdfDataUrl && template.pdfDataUrl.length > CHUNK_SIZE;

      if (needsChunking) {
        // Break pdfDataUrl into chunks
        const chunks: string[] = [];
        for (let i = 0; i < template.pdfDataUrl.length; i += CHUNK_SIZE) {
          chunks.push(template.pdfDataUrl.substring(i, i + CHUNK_SIZE));
        }

        const batch = writeBatch(db);

        // Upload chunk subcollection
        for (let idx = 0; idx < chunks.length; idx++) {
          const chunkRef = doc(db, 'templates', template.id, 'chunks', `chunk-${idx}`);
          batch.set(chunkRef, {
            templateId: template.id,
            chunkIndex: idx,
            totalChunks: chunks.length,
            data: chunks[idx],
            type: 'pdf',
          });
        }

        // Save main template document without full bulky string
        const mainRef = doc(db, 'templates', template.id);
        const payload: Record<string, unknown> = {
          id: template.id,
          name: template.name,
          category: template.category,
          model: template.model,
          fileName: template.fileName,
          fileSize: template.fileSize,
          orientation: template.orientation || 'landscape',
          isDefault: !!template.isDefault,
          hasChunks: true,
          chunkCount: chunks.length,
          authorUid: auth.currentUser.uid,
          authorEmail: auth.currentUser.email || '',
          createdAt: template.createdAt,
          updatedAt: new Date().toISOString(),
        };

        if (template.description) payload.description = template.description;
        if (template.previewImageDataUrl && template.previewImageDataUrl.length <= 800000) {
          payload.previewImageDataUrl = template.previewImageDataUrl;
        }

        batch.set(mainRef, payload);
        await batch.commit();
      } else {
        // Direct save in single document
        const mainRef = doc(db, 'templates', template.id);
        const payload: Record<string, unknown> = {
          id: template.id,
          name: template.name,
          category: template.category,
          model: template.model,
          fileName: template.fileName,
          fileSize: template.fileSize,
          pdfDataUrl: template.pdfDataUrl,
          orientation: template.orientation || 'landscape',
          isDefault: !!template.isDefault,
          hasChunks: false,
          chunkCount: 0,
          authorUid: auth.currentUser.uid,
          authorEmail: auth.currentUser.email || '',
          createdAt: template.createdAt,
          updatedAt: new Date().toISOString(),
        };

        if (template.description) payload.description = template.description;
        if (template.previewImageDataUrl && template.previewImageDataUrl.length <= 800000) {
          payload.previewImageDataUrl = template.previewImageDataUrl;
        }

        await setDoc(mainRef, payload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, templateDocPath);
    }
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
 * Deletes a template by ID (both locally and in Firebase Cloud)
 */
export async function deleteTemplate(id: string): Promise<void> {
  addToDeletedBlacklist(id);

  // Remove from local storage
  try {
    const dbInstance = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
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

  // Delete from Firebase Cloud if signed in
  if (auth.currentUser) {
    const path = `templates/${id}`;
    try {
      await deleteDoc(doc(db, 'templates', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
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
      await saveTemplate(t, !!auth.currentUser);
    }
  }

  window.dispatchEvent(new CustomEvent('gelb_templates_updated'));
}

/**
 * Syncs all local templates to the cloud in batch
 */
export async function syncAllLocalTemplatesToCloud(): Promise<number> {
  if (!auth.currentUser) {
    throw new Error('É necessário estar autenticado com uma conta Google para sincronizar com a nuvem.');
  }

  const localTemplates = await getLocalTemplates();
  let count = 0;

  for (const tpl of localTemplates) {
    await saveTemplate(tpl, true);
    count++;
  }

  return count;
}

/**
 * Ensures default pre-installed templates exist in the core storage
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
        fileSize: 45200,
        pdfDataUrl,
        previewImageDataUrl,
        description: 'Modelo Oficial de Acolhida do Ramo Filhotes - GELB 32/SC.',
        orientation: 'landscape',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveTemplate(defaultAcolhida, false);
      return [...existing, defaultAcolhida];
    } catch (err) {
      console.warn('Erro ao inicializar modelo padrão de filhotes:', err);
    }
  }

  return existing;
}

/**
 * Attaches a real-time listener to Firestore templates collection
 */
export function subscribeToCloudTemplates(onUpdate: (templates: CertificateTemplate[]) => void) {
  const path = 'templates';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const templates: CertificateTemplate[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Partial<CertificateTemplate>;
        if (data.id && data.name && data.category && data.model) {
          templates.push({
            id: data.id,
            name: data.name,
            category: data.category as ScoutCategory,
            model: data.model,
            fileName: data.fileName || `${data.name}.pdf`,
            fileSize: data.fileSize || 0,
            pdfDataUrl: data.pdfDataUrl || '',
            previewImageDataUrl: data.previewImageDataUrl || data.pdfDataUrl || '',
            description: data.description,
            orientation: (data.orientation as 'landscape' | 'portrait') || 'landscape',
            isDefault: !!data.isDefault,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            defaultNamePosY: data.defaultNamePosY,
            defaultNamePosX: data.defaultNamePosX,
            defaultNameFontSize: data.defaultNameFontSize,
            defaultNameFontFamily: data.defaultNameFontFamily,
            defaultNameColor: data.defaultNameColor,
            defaultDatePosY: data.defaultDatePosY,
            defaultSignaturesPosY: data.defaultSignaturesPosY,
          });
        }
      });
      onUpdate(templates);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
