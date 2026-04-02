'use server';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { revalidatePath } from 'next/cache';

// --- Paths ---
const DATA_DIR = join(process.cwd(), 'src', 'data');
const ABOUT_PATH = join(DATA_DIR, 'about.md');

// --- Helpers ---
function ensureFileExists(): void {
  if (!existsSync(ABOUT_PATH)) {
    const defaultContent = `# Sobre Mim

<!-- Este arquivo contém informações pessoais usadas pela IA para gerar análises mais precisas. -->
<!-- Edite diretamente ou preencha pela tela de Configurações. -->


`;
    writeFileSync(ABOUT_PATH, defaultContent, 'utf-8');
  }
}

/**
 * Loads the full about markdown content.
 */
export async function loadAbout(): Promise<string> {
  try {
    ensureFileExists();
    const content = readFileSync(ABOUT_PATH, 'utf-8');
    // Strip the header comment for the UI
    return content.replace(/^<!--[\s\S]*?-->\n\n?/, '').trim();
  } catch (error) {
    console.error('[AboutStore] Failed to load about:', error);
    return '';
  }
}

/**
 * Saves the about markdown content.
 */
export async function saveAbout(content: string): Promise<void> {
  try {
    writeFileSync(ABOUT_PATH, content, 'utf-8');
    revalidatePath('/');
  } catch (error) {
    console.error('[AboutStore] Failed to save about:', error);
    throw new Error('Falha ao salvar informações pessoais.');
  }
}
