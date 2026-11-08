import { useState, useEffect, useCallback, useMemo } from 'react';
import { isToolId, getToolMeta, SITE_URL } from '../config/tools';
import type { ToolType } from '../services/conversionService';

export function getToolFromLocation(): ToolType | null {
  if (typeof window === 'undefined') return null;
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (isToolId(slug)) return slug;
  const hash = window.location.hash.replace('#', '').split('?')[0];
  if (isToolId(hash)) {
    window.history.replaceState(null, '', `/${hash}`);
    return hash;
  }
  return null;
}

const updateMeta = (selector: string, attr: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.querySelector(selector)?.setAttribute(attr, value);
};

export function useToolRouting() {
  const initialTool = useMemo(() => getToolFromLocation() ?? 'image-convert', []);
  const initialMode = useMemo(() => (getToolFromLocation() ? 'tool' : 'home'), []);

  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [viewMode, setViewMode] = useState<'home' | 'tool'>(initialMode);

  const currentToolMeta = useMemo(() => getToolMeta(activeTool), [activeTool]);

  // Synchronize document title, canonical URLs, and metadata
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (viewMode === 'home') {
      document.title = 'Isalin Multi-Converter — Convert files and data in one place | Isalin ang lahat. Convert anything.';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Free, 100% private in-browser utility suite. Convert images, documents, text, code, physical units, and Philippine financial calculators with zero server uploads.'
        );
      }
      updateMeta('link[rel="canonical"]', 'href', `${SITE_URL}/`);
      updateMeta('meta[property="og:url"]', 'content', `${SITE_URL}/`);
    } else if (currentToolMeta) {
      document.title = `${currentToolMeta.title} — Isalin: Isalin ang lahat. Convert anything.`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `${currentToolMeta.title}: ${currentToolMeta.shortDesc}. Isalin ang lahat. Convert anything — 100% private in-browser utility suite.`
        );
      }
      updateMeta('link[rel="canonical"]', 'href', `${SITE_URL}/${activeTool}`);
      updateMeta('meta[property="og:url"]', 'content', `${SITE_URL}/${activeTool}`);
      if (window.location.pathname !== `/${activeTool}`) {
        window.history.replaceState(null, '', `/${activeTool}`);
      }
    }
  }, [activeTool, currentToolMeta, viewMode]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const tool = getToolFromLocation();
      if (tool) {
        setActiveTool(tool);
        setViewMode('tool');
      } else {
        setViewMode('home');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const selectTool = useCallback((toolId: ToolType) => {
    setActiveTool(toolId);
    setViewMode('tool');
    if (typeof window !== 'undefined' && window.location.pathname !== `/${toolId}`) {
      window.history.pushState(null, '', `/${toolId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToHome = useCallback(() => {
    setViewMode('home');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    activeTool,
    setActiveTool,
    viewMode,
    setViewMode,
    currentToolMeta,
    selectTool,
    navigateToHome,
  };
}
