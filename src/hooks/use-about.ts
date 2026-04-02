'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAbout, saveAboutContent } from '@/lib/actions';

export function useAbout() {
  const [content, setContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getAbout();
        if (isMounted) {
          setContent(data);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load about:', error);
        if (isMounted) setIsLoaded(true);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveAboutContent(content);
      if ('error' in result) {
        return { error: result.error };
      }
      return { success: true as const };
    } catch {
      return { error: 'Falha ao salvar.' };
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  return { content, setContent, save, isLoaded, isSaving };
}
