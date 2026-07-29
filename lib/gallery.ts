"use client";

import type { GalleryEntry } from "@/lib/types";

const STORAGE_KEY = "cartouche.gallery.v1";

function readAll(): GalleryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GalleryEntry =>
        typeof e === "object" && e !== null && typeof e.id === "string" && typeof e.path === "string"
    );
  } catch {
    return [];
  }
}

function writeAll(entries: GalleryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Stockage plein ou indisponible : la galerie est un confort, pas une nécessité.
  }
}

/** Cartes envoyées depuis cet appareil, la plus récente d'abord. */
export function listGallery(): GalleryEntry[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addToGallery(entry: GalleryEntry) {
  const rest = readAll().filter((e) => e.id !== entry.id);
  writeAll([entry, ...rest]);
}

export function removeFromGallery(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function getGalleryEntry(id: string): GalleryEntry | undefined {
  return readAll().find((e) => e.id === id);
}
