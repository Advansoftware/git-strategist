'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSkills, saveSkillsList, addSkill as addSkillAction, removeSkill as removeSkillAction } from '@/lib/actions';

export function useSkills() {
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load skills from server on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getSkills();
        if (isMounted) {
          setSkills(data);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const addSkill = useCallback(async (skill: string) => {
    if (!skill || skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      return { success: true }; // Already exists or empty
    }

    const result = await addSkillAction(skill);
    if ('success' in result) {
      setSkills(prevSkills => {
        const next = [...prevSkills, skill];
        return Array.from(new Set(next));
      });
      return { success: true };
    } else {
      console.error('Failed to add skill:', result.error);
      return { error: result.error };
    }
  }, [skills]);

  const addMultipleSkills = useCallback(async (newSkills: string[]) => {
    const skillsToAdd = newSkills.filter(s => s && !skills.some(existing => existing.toLowerCase() === s.toLowerCase()));
    if (skillsToAdd.length > 0) {
      // Add all skills via server actions
      const results = await Promise.all(skillsToAdd.map(s => addSkillAction(s)));
      const failed = results.find(r => 'error' in r);
      
      if (!failed) {
        setSkills(prevSkills => [...prevSkills, ...skillsToAdd]);
      }
    }
  }, [skills]);

  const removeSkill = useCallback(async (skillToRemove: string) => {
    const result = await removeSkillAction(skillToRemove);
    if ('success' in result) {
      setSkills(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
      return { success: true };
    } else {
      console.error('Failed to remove skill:', result.error);
      return { error: result.error };
    }
  }, []);

  return { skills, addSkill, addMultipleSkills, removeSkill, isLoaded };
}
