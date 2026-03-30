'use server';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { revalidatePath } from 'next/cache';

// --- Paths ---
const DATA_DIR = join(process.cwd(), 'src', 'data');
const SKILLS_PATH = join(DATA_DIR, 'skills.md');

// --- Helpers ---
function ensureFileExists(): void {
  if (!existsSync(SKILLS_PATH)) {
    const defaultContent = buildMarkdownContent([]);
    writeFileSync(SKILLS_PATH, defaultContent, 'utf-8');
  }
}

function parseSkillsFromMarkdown(content: string): string[] {
  const skills: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Exclude horizontal rules and separators
    if (trimmed.startsWith('---') || trimmed.startsWith('***') || trimmed === '---') continue;
    
    // Match lines like "- skill name" or "* skill name"
    const match = trimmed.match(/^[-*]\s*(?:\[.?\]\s*)?(.+)$/);
    if (match && match[1]) {
      let skill = match[1].trim();
      
      // Clean up markdown formatting like italics or bold if they wrap the whole word
      skill = skill.replace(/^[*_]{1,2}(.*?)[*_]{1,2}$/, '$1');
      
      // Exclude strings that look like headers or specific footers
      if (
        skill && 
        !skill.startsWith('#') && 
        !skill.toLowerCase().includes('última atualização') &&
        skill !== '--' &&
        skill !== '*' &&
        !skill.includes('Nenhuma habilidade adicionada')
      ) {
        skills.push(skill);
      }
    }
  }

  // De-duplicate just in case
  return Array.from(new Set(skills));
}

function buildMarkdownContent(skills: string[]): string {
  const header = `# Minhas Habilidades

<!-- Este arquivo é mantido automaticamente pelo sistema. Edite com cuidado. -->

## Lista de Habilidades\n\n`;

  const skillsList = skills.length > 0 
    ? skills.map((skill) => `- ${skill}`).join('\n') 
    : '*(Nenhuma habilidade adicionada ainda)*';

  const footer = `\n\n---\n\n*Última atualização: ${new Date().toISOString()}*\n`;

  return header + skillsList + footer;
}

// --- Core Functions ---

/**
 * Loads all skills from the skills.md file.
 */
export async function loadSkills(): Promise<string[]> {
  try {
    ensureFileExists();
    const content = readFileSync(SKILLS_PATH, 'utf-8');
    const skills = parseSkillsFromMarkdown(content);
    // Filter out the placeholder text if present
    return skills.filter(s => s !== '(Nenhuma habilidade adicionada ainda)');
  } catch (error) {
    console.error('[SkillsStore] Failed to load skills:', error);
    return [];
  }
}

/**
 * Saves the skills list to the skills.md file.
 */
export async function saveSkills(skills: string[]): Promise<void> {
  try {
    const content = buildMarkdownContent(skills);
    writeFileSync(SKILLS_PATH, content, 'utf-8');
    revalidatePath('/');
  } catch (error) {
    console.error('[SkillsStore] Failed to save skills:', error);
    throw new Error('Falha ao salvar habilidades no arquivo.');
  }
}

/**
 * Adds a new skill to the list if it doesn't exist.
 */
export async function addSkill(skill: string): Promise<void> {
  if (!skill.trim()) return;

  const normalizedSkill = skill.trim();
  const skills = await loadSkills();
  
  if (!skills.some(s => s.toLowerCase() === normalizedSkill.toLowerCase())) {
    skills.push(normalizedSkill);
    await saveSkills(skills);
  }
}

/**
 * Removes a skill from the list.
 */
export async function removeSkill(skillToRemove: string): Promise<void> {
  const skills = await loadSkills();
  const filtered = skills.filter((skill) => skill !== skillToRemove);
  await saveSkills(filtered);
}
