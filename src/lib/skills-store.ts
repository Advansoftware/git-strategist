'use server';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// --- Paths ---
const DATA_DIR = join(process.cwd(), 'src', 'data');
const SKILLS_PATH = join(DATA_DIR, 'skills.md');

// --- Helpers ---
function ensureFileExists(): void {
  if (!existsSync(SKILLS_PATH)) {
    writeFileSync(
      SKILLS_PATH,
      '# Minhas Habilidades\n\n<!-- Este arquivo é mantido automaticamente pelo sistema. Edite com cuidado. -->\n\n',
      'utf-8'
    );
  }
}

function parseSkillsFromMarkdown(content: string): string[] {
  const skills: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines like "- skill name" or "* skill name" or "- [ ] skill name"
    const match = trimmed.match(/^[-*]\s*(?:\[.?\]\s*)?(.+)$/);
    if (match && match[1]) {
      const skill = match[1].trim();
      if (skill && !skill.startsWith('#')) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

function buildMarkdownContent(skills: string[]): string {
  const header = `# Minhas Habilidades

<!-- Este arquivo é mantido automaticamente pelo sistema. Edite com cuidado. -->

## Lista de Habilidades

`;
  const skillsList = skills.map((skill) => `- ${skill}`).join('\n');
  const footer = '\n\n---\n\n*Última atualização: ' + new Date().toISOString() + '*\n';

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
    return parseSkillsFromMarkdown(content);
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

  const skills = await loadSkills();
  if (!skills.includes(skill.trim())) {
    skills.push(skill.trim());
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
