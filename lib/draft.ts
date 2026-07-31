"use client";

import { isThemeId, type ThemeId } from "@/lib/themes";

/**
 * Un enregistrement ne vivait que dans la mémoire de l'onglet : un rechargement,
 * une mise à jour, un onglet évincé par le système, et trente secondes de vie
 * disparaissaient sans retour. Un envoi qui échoue n'était pas rattrapable non
 * plus — il fallait tout refaire, si tant est que l'instant se reproduise.
 *
 * Le brouillon est donc écrit sur l'appareil, dans IndexedDB (qui stocke un
 * Blob tel quel, sans le gonfler en base64). Il ne quitte jamais le téléphone
 * et disparaît dès que la carte est partie.
 */

const DB_NAME = "cartouche";
const DB_VERSION = 1;
const STORE = "drafts";
const KEY = "current";

/** Au-delà, un brouillon oublié n'a plus de sens : on ne le ressort pas. */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface DraftValues {
  title: string;
  message: string;
  location: string;
  theme: ThemeId;
}

export interface CardDraft {
  /** L'enregistrement encodé, prêt à partir. */
  wav: Blob;
  duration: number;
  peaks: number[];
  /** La photo déjà recadrée, si l'expéditeur en avait choisi une. */
  photo: Blob | null;
  values: DraftValues;
  savedAt: string;
}

/**
 * Ce qui ressort d'IndexedDB a pu être écrit par une version antérieure de
 * l'application : on ne le croit pas sur parole.
 */
export function isValidDraft(value: unknown): value is CardDraft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Record<string, unknown>;

  if (!(draft.wav instanceof Blob) || draft.wav.size === 0) return false;
  if (
    typeof draft.duration !== "number" ||
    !Number.isFinite(draft.duration) ||
    draft.duration <= 0
  ) {
    return false;
  }
  if (!Array.isArray(draft.peaks) || draft.peaks.length === 0) return false;
  if (draft.peaks.some((p) => typeof p !== "number" || !Number.isFinite(p))) return false;
  if (draft.photo !== null && !(draft.photo instanceof Blob)) return false;
  if (typeof draft.savedAt !== "string" || Number.isNaN(Date.parse(draft.savedAt))) {
    return false;
  }

  const values = draft.values;
  if (typeof values !== "object" || values === null) return false;
  const { title, message, location, theme } = values as Record<string, unknown>;
  if (typeof title !== "string" || typeof message !== "string") return false;
  if (typeof location !== "string" || !isThemeId(theme)) return false;

  return true;
}

/** Un brouillon trop vieux est traité comme absent. */
export function isFresh(draft: CardDraft, now = Date.now()): boolean {
  return now - Date.parse(draft.savedAt) < DRAFT_MAX_AGE_MS;
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      // Navigation privée sur certains navigateurs : le brouillon est un
      // filet de sécurité, pas une condition de fonctionnement.
      return resolve(null);
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        let request: IDBRequest<T>;
        try {
          request = action(db.transaction(STORE, mode).objectStore(STORE));
        } catch {
          db.close();
          return resolve(null);
        }
        request.onsuccess = () => {
          resolve(request.result ?? null);
          db.close();
        };
        request.onerror = () => {
          resolve(null);
          db.close();
        };
      })
  );
}

/** Écrit (ou remplace) le brouillon courant. Silencieux en cas d'échec. */
export async function saveDraft(
  draft: Omit<CardDraft, "savedAt"> & { savedAt?: string }
): Promise<void> {
  const record: CardDraft = { ...draft, savedAt: draft.savedAt ?? new Date().toISOString() };
  await run("readwrite", (store) => store.put(record, KEY));
}

/** Rend le brouillon en attente, s'il existe et qu'il est encore d'actualité. */
export async function loadDraft(): Promise<CardDraft | null> {
  const value = await run<unknown>("readonly", (store) => store.get(KEY));
  if (!isValidDraft(value)) return null;
  if (!isFresh(value)) {
    void clearDraft();
    return null;
  }
  return value;
}

/** Efface le brouillon — carte partie, ou abandon assumé. */
export async function clearDraft(): Promise<void> {
  await run("readwrite", (store) => store.delete(KEY));
}
