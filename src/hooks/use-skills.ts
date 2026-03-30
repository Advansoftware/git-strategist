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

  // Save skills to server whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    async function persist() {
      try {
        await saveSkillsList(skills);
      } catch (error) {
        console.error('Failed to save skills:', error);
      }
    }

    persist();
  }, [skills, isLoaded]);

  const addSkill = useCallback(async (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const result = await addSkillAction(skill);
      if ('success' in result) {
        setSkills(prevSkills => [...prevSkills, skill]);
      } else {
        console.error('Failed to add skill:', result.error);
      }
    }
  }, [skills]);

  const addMultipleSkills = useCallback(async (newSkills: string[]) => {
    const skillsToAdd = newSkills.filter(s => s && !skills.includes(s));
    if (skillsToAdd.length > 0) {
      // Add all skills to server
      await Promise.all(skillsToAdd.map(s => addSkillAction(s)));
      // Update local state
      setSkills(prevSkills => [...prevSkills, ...skillsToAdd]);
    }
  }, [skills]);

  const removeSkill = useCallback(async (skillToRemove: string) => {
    const result = await removeSkillAction(skillToRemove);
    if ('success' in result) {
      setSkills(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
    } else {
      console.error('Failed to remove skill:', result.error);
    }
  }, []);

  return { skills, addSkill, addMultipleSkills, removeSkill, isLoaded };
}
