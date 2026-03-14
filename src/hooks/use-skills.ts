"use client";

import { useState, useEffect, useCallback } from 'react';

const SKILLS_STORAGE_KEY = 'gig-strategist-skills';

export function useSkills() {
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSkills = window.localStorage.getItem(SKILLS_STORAGE_KEY);
      if (storedSkills) {
        setSkills(JSON.parse(storedSkills));
      }
    } catch (error) {
      console.error("Failed to load skills from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
      } catch (error) {
        console.error("Failed to save skills to localStorage", error);
      }
    }
  }, [skills, isLoaded]);

  const addSkill = useCallback((skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills(prevSkills => [...prevSkills, skill]);
    }
  }, [skills]);

  const addMultipleSkills = useCallback((newSkills: string[]) => {
    setSkills(prevSkills => {
        const skillsToAdd = newSkills.filter(s => s && !prevSkills.includes(s));
        return [...prevSkills, ...skillsToAdd];
    });
  }, []);

  const removeSkill = useCallback((skillToRemove: string) => {
    setSkills(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
  }, []);

  return { skills, addSkill, addMultipleSkills, removeSkill, isLoaded };
}
