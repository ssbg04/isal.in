import type { PresetWorkflow } from '../components/HistoryPresetsDrawer';
import type { ToolType } from '../services/conversionService';
import {
  convertJsonYaml,
  processBase64,
  generateUUIDs,
  convertCssUnits,
} from '../services/conversionService';

export interface PresetActions {
  onSelectTool: (toolId: ToolType) => void;
  setTargetImageFormat?: (format: any) => void;
  setImageQuality?: (quality: number) => void;
  setJsonDirection?: (dir: 'json-to-yaml' | 'yaml-to-json') => void;
  setBase64Mode?: (mode: 'encode' | 'decode') => void;
  setUuidCount?: (count: number) => void;
  setUnitCategory?: (cat: 'css' | 'storage' | 'time') => void;
  setCssPx?: (px: number) => void;
  setCssBaseSize?: (base: number) => void;
  setCssResults?: (res: any) => void;
  setTextInput?: (text: string) => void;
  setTextOutput?: (text: string) => void;
}

export function buildPresets(actions: PresetActions): PresetWorkflow[] {
  return [
    {
      id: 'web-ready-webp',
      title: 'Web-Ready WebP (85% Quality)',
      toolId: 'image-convert',
      description: 'Modern web image format with smart compression for 70%+ smaller file sizes.',
      badge: 'WebP',
      iconType: 'media',
      apply: () => {
        actions.onSelectTool('image-convert');
        actions.setTargetImageFormat?.('image/webp');
        actions.setImageQuality?.(0.85);
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      id: 'crisp-png',
      title: 'Lossless High-Res PNG',
      toolId: 'image-convert',
      description: 'Pixel-perfect lossless conversion ideal for diagrams, UI icons, and logos.',
      badge: 'PNG',
      iconType: 'media',
      apply: () => {
        actions.onSelectTool('image-convert');
        actions.setTargetImageFormat?.('image/png');
        actions.setImageQuality?.(1.0);
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      id: 'json-beautify',
      title: 'JSON ⇄ YAML Config Transformer',
      toolId: 'json-yaml',
      description: 'Clean bi-directional schema conversion with syntax verification and live preview.',
      badge: 'Config',
      iconType: 'code',
      apply: () => {
        actions.onSelectTool('json-yaml');
        actions.setJsonDirection?.('json-to-yaml');
        const sample = `{\n  "name": "production-api",\n  "version": "1.0.0",\n  "server": {\n    "host": "0.0.0.0",\n    "port": 8080,\n    "ssl": true\n  }\n}`;
        actions.setTextInput?.(sample);
        convertJsonYaml(sample, 'json-to-yaml').then((out) => actions.setTextOutput?.(out)).catch(() => {});
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      id: 'safe-base64',
      title: 'Base64 Safe String Encoding',
      toolId: 'base64',
      description: 'ASCII string to Base64 encode for secure header payloads and storage tokens.',
      badge: 'Security',
      iconType: 'code',
      apply: () => {
        actions.onSelectTool('base64');
        actions.setBase64Mode?.('encode');
        const sample = 'Multi-Converter Client-Side Production Token';
        actions.setTextInput?.(sample);
        actions.setTextOutput?.(processBase64(sample, 'encode'));
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      id: 'uuid-batch-10',
      title: 'Batch 10 UUID v4 Identifiers',
      toolId: 'uuid',
      description: 'Generate 10 cryptographically random RFC 4122 v4 tokens ready to copy.',
      badge: 'Crypto',
      iconType: 'utility',
      apply: () => {
        actions.onSelectTool('uuid');
        actions.setUuidCount?.(10);
        const uuids = generateUUIDs(10);
        actions.setTextOutput?.(uuids.join('\n'));
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
    {
      id: 'css-rem-scale',
      title: 'CSS px ⇄ rem Fluid Typography',
      toolId: 'unit-convert',
      description: 'Convert pixels to rem using standard 16px root font size for responsive styling.',
      badge: 'CSS',
      iconType: 'utility',
      apply: () => {
        actions.onSelectTool('unit-convert');
        actions.setUnitCategory?.('css');
        actions.setCssPx?.(24);
        actions.setCssBaseSize?.(16);
        actions.setCssResults?.(convertCssUnits(24, 'px', 16));
        setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
    },
  ];
}
