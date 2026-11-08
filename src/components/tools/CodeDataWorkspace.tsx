import React, { useState, useEffect, useCallback } from 'react';
import { DualPaneCodeWorkspace } from '../DualPaneCodeWorkspace';
import { processBase64, processUrlEncode } from '../../services/conversionService';
import type { ToolType } from '../../config/tools';

interface CodeDataWorkspaceProps {
  toolId: 'json-yaml' | 'base64' | 'url-encode';
  onHistoryAdd?: (toolId: ToolType, title: string, badge: string, input: string, output: string) => void;
}

export const CodeDataWorkspace: React.FC<CodeDataWorkspaceProps> = ({ toolId, onHistoryAdd }) => {
  const [jsonDirection, setJsonDirection] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');
  const [autoTransform, setAutoTransform] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [textInput, setTextInput] = useState<string>(() => {
    if (toolId === 'json-yaml') {
      return `{\n  "appName": "Isalin",\n  "version": "2.5.0",\n  "privacy": "100% Client-Side",\n  "features": [\n    "Zero server uploads",\n    "Fast processing",\n    "PWA Offline"\n  ]\n}`;
    }
    if (toolId === 'base64') {
      return 'Isalin Multi-Converter: 100% private client-side utility suite ⚡';
    }
    return 'https://isal.in/search?query=developer tools & privacy=100% private';
  });

  const [textOutput, setTextOutput] = useState<string>('');

  // Dynamically load yaml conversion to keep bundle light
  const convertJsonYaml = async (input: string, direction: 'json-to-yaml' | 'yaml-to-json'): Promise<string> => {
    const yaml = await import('js-yaml');
    if (direction === 'json-to-yaml') {
      const parsed = JSON.parse(input);
      return yaml.dump(parsed, { indent: 2 });
    } else {
      const parsed = yaml.load(input);
      return JSON.stringify(parsed, null, 2);
    }
  };

  const executeTransform = useCallback(async (inputStr: string) => {
    if (!inputStr.trim()) {
      setTextOutput('');
      return;
    }
    setIsProcessing(true);
    try {
      if (toolId === 'json-yaml') {
        const out = await convertJsonYaml(inputStr, jsonDirection);
        setTextOutput(out);
        onHistoryAdd?.('json-yaml', 'JSON ⇄ YAML', jsonDirection === 'json-to-yaml' ? 'YAML' : 'JSON', inputStr, out);
      } else if (toolId === 'base64') {
        const out = processBase64(inputStr, base64Mode);
        setTextOutput(out);
        onHistoryAdd?.('base64', 'Base64', base64Mode === 'encode' ? 'ENCODE' : 'DECODE', inputStr, out);
      } else if (toolId === 'url-encode') {
        const out = processUrlEncode(inputStr, urlMode);
        setTextOutput(out);
        onHistoryAdd?.('url-encode', 'URL Percent Encoder', urlMode === 'encode' ? 'ENCODE' : 'DECODE', inputStr, out);
      }
    } catch {
      // Suppress incomplete typing errors during live transform
    } finally {
      setIsProcessing(false);
    }
  }, [toolId, jsonDirection, base64Mode, urlMode, onHistoryAdd]);

  // Live auto-transform on change
  useEffect(() => {
    if (!autoTransform) return;
    const timer = setTimeout(() => {
      executeTransform(textInput);
    }, 120);
    return () => clearTimeout(timer);
  }, [textInput, autoTransform, executeTransform]);

  const handleSwap = () => {
    if (toolId === 'json-yaml') {
      const next = jsonDirection === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml';
      setJsonDirection(next);
      if (textOutput) {
        const prev = textOutput;
        setTextInput(prev);
        setTextOutput(textInput);
      }
    } else if (toolId === 'base64') {
      const next = base64Mode === 'encode' ? 'decode' : 'encode';
      setBase64Mode(next);
      if (textOutput) {
        const prev = textOutput;
        setTextInput(prev);
        setTextOutput(textInput);
      }
    } else if (toolId === 'url-encode') {
      const next = urlMode === 'encode' ? 'decode' : 'encode';
      setUrlMode(next);
      if (textOutput) {
        const prev = textOutput;
        setTextInput(prev);
        setTextOutput(textInput);
      }
    }
  };

  const handleLoadSample = () => {
    if (toolId === 'json-yaml') {
      if (jsonDirection === 'json-to-yaml') {
        const s = `{\n  "appName": "Isalin",\n  "version": "2.5.0",\n  "privacy": "100% Client-Side",\n  "features": [\n    "Zero server uploads",\n    "Fast processing"\n  ]\n}`;
        setTextInput(s);
        convertJsonYaml(s, 'json-to-yaml').then(setTextOutput).catch(() => {});
      } else {
        const s = `appName: Isalin\nversion: 2.5.0\nprivacy: 100% Client-Side\nfeatures:\n  - Zero server uploads\n  - Fast processing\n`;
        setTextInput(s);
        convertJsonYaml(s, 'yaml-to-json').then(setTextOutput).catch(() => {});
      }
    } else if (toolId === 'base64') {
      if (base64Mode === 'encode') {
        const s = 'Isalin Multi-Converter: Fast, private, client-side developer toolbox ⚡';
        setTextInput(s);
        setTextOutput(processBase64(s, 'encode'));
      } else {
        const s = 'SXNhbGluIE11bHRpLUNvbnZlcnRlcjogRmFzdCwgcHJpdmF0ZSwgY2xpZW50LXNpZGUgZGV2ZWxvcGVyIHRvb2xib3gg4pqh';
        setTextInput(s);
        setTextOutput(processBase64(s, 'decode'));
      }
    } else if (toolId === 'url-encode') {
      if (urlMode === 'encode') {
        const s = 'https://isal.in/search?query=developer tools & privacy=100% private&category=code & data';
        setTextInput(s);
        setTextOutput(processUrlEncode(s, 'encode'));
      } else {
        const s = 'https%3A%2F%2Fisal.in%2Fsearch%3Fquery%3Ddeveloper%20tools%20%26%20privacy%3D100%25%20private%26category%3Dcode%20%26%20data';
        setTextInput(s);
        setTextOutput(processUrlEncode(s, 'decode'));
      }
    }
  };

  return (
    <div className="mt-5">
      <DualPaneCodeWorkspace
        inputTitle={
          toolId === 'json-yaml'
            ? jsonDirection === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'
            : toolId === 'base64'
            ? base64Mode === 'encode' ? 'Plain Text Source' : 'Base64 Encoded Text'
            : urlMode === 'encode' ? 'Raw URL / Query String' : 'Percent-Encoded URL'
        }
        outputTitle={
          toolId === 'json-yaml'
            ? jsonDirection === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'
            : toolId === 'base64'
            ? base64Mode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Plain Text'
            : urlMode === 'encode' ? 'Percent-Encoded Output' : 'Decoded URL'
        }
        inputBadge={
          toolId === 'json-yaml'
            ? jsonDirection === 'json-to-yaml' ? 'JSON' : 'YAML'
            : toolId === 'base64'
            ? base64Mode === 'encode' ? 'TEXT' : 'BASE64'
            : urlMode === 'encode' ? 'RAW URL' : 'ENCODED'
        }
        outputBadge={
          toolId === 'json-yaml'
            ? jsonDirection === 'json-to-yaml' ? 'YAML' : 'JSON'
            : toolId === 'base64'
            ? base64Mode === 'encode' ? 'BASE64' : 'TEXT'
            : urlMode === 'encode' ? 'ENCODED' : 'RAW URL'
        }
        outputFileExtension={
          toolId === 'json-yaml'
            ? jsonDirection === 'json-to-yaml' ? 'yaml' : 'json'
            : toolId === 'base64'
            ? base64Mode === 'encode' ? 'b64' : 'txt'
            : 'txt'
        }
        inputValue={textInput}
        outputValue={textOutput}
        onInputChange={setTextInput}
        onTransform={() => executeTransform(textInput)}
        onSwap={handleSwap}
        onLoadSample={handleLoadSample}
        autoTransform={autoTransform}
        onAutoTransformChange={setAutoTransform}
        isProcessing={isProcessing}
      />
    </div>
  );
};
