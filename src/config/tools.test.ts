import { describe, expect, it } from 'vitest';
import { CATEGORIES, TOOLS, isToolId } from './tools';

describe('tool registry', () => {
  it('has unique, URL-safe ids', () => {
    const ids = TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('category counts match tools', () => {
    for (const cat of CATEGORIES) {
      expect(TOOLS.filter((t) => t.category === cat.id).length, cat.id).toBe(cat.count);
    }
  });

  it('isToolId guards unknown slugs', () => {
    expect(isToolId('image-convert')).toBe(true);
    expect(isToolId('nope')).toBe(false);
  });
});

