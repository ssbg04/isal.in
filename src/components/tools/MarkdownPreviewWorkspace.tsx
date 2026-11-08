import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { markdownToHtml, htmlToMarkdown } from '../../services/conversionService';

interface MarkdownPreviewWorkspaceProps {
  onHistoryAdd?: (summary: string) => void;
}

export const MarkdownPreviewWorkspace: React.FC<MarkdownPreviewWorkspaceProps> = ({ onHistoryAdd }) => {
  const [direction, setDirection] = useState<'md-to-html' | 'html-to-md'>('md-to-html');
  const [tab, setTab] = useState<'preview' | 'raw'>('preview');
  const [inputText, setInputText] = useState<string>(
    '# Isalin Markdown\n\nFast, **100% private** in-browser text transformation.\n\n- Zero server uploads\n- Instant live preview\n- Clean HTML export\n\n> "Security and privacy without compromise."'
  );
  const [outputText, setOutputText] = useState<string>(() =>
    markdownToHtml(
      '# Isalin Markdown\n\nFast, **100% private** in-browser text transformation.\n\n- Zero server uploads\n- Instant live preview\n- Clean HTML export\n\n> "Security and privacy without compromise."'
    )
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (direction === 'md-to-html') {
      const html = markdownToHtml(val);
      setOutputText(html);
    } else {
      const md = htmlToMarkdown(val);
      setOutputText(md);
    }
  };

  const handleDirectionChange = (newDir: 'md-to-html' | 'html-to-md') => {
    setDirection(newDir);
    if (newDir === 'md-to-html') {
      setOutputText(markdownToHtml(inputText));
    } else {
      setOutputText(htmlToMarkdown(inputText));
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onHistoryAdd?.(`Markdown: ${inputText.slice(0, 40)}`);
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Control Bar: Mode Toggle + Sample Loader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs bg-neutral-100/50 dark:bg-neutral-950">
          <button
            type="button"
            onClick={() => handleDirectionChange('md-to-html')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              direction === 'md-to-html'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Markdown → HTML
          </button>
          <button
            type="button"
            onClick={() => handleDirectionChange('html-to-md')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              direction === 'html-to-md'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            HTML → Markdown
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            const sample = `# Markdown Feature Demo\n\nFast, **100% private** in-browser text transformation.\n\n- Zero server uploads\n- Instant live preview\n- Clean HTML export\n\n> "Security and privacy without compromise."\n\n\`\`\`javascript\nconsole.log("Hello from browser sandbox!");\n\`\`\``;
            setInputText(sample);
            setOutputText(markdownToHtml(sample));
          }}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
        >
          Load Sample Markdown
        </button>
      </div>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Source Text Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <label htmlFor="markdown-source-textarea" className="font-mono uppercase tracking-wider text-[10px]">
              {direction === 'md-to-html' ? 'Markdown Source' : 'HTML Source'}
            </label>
            <span className="font-mono text-[10px]">{inputText.length} chars</span>
          </div>
          <textarea
            id="markdown-source-textarea"
            rows={12}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={direction === 'md-to-html' ? 'Type or paste Markdown here...' : 'Type or paste HTML markup here...'}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition resize-y"
          />
        </div>

        {/* Right: Live Preview or Code Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            {direction === 'md-to-html' ? (
              <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-[10px] bg-neutral-100/50 dark:bg-neutral-950">
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    tab === 'preview'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setTab('raw')}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    tab === 'raw'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Raw HTML
                </button>
              </div>
            ) : (
              <span className="font-mono uppercase tracking-wider text-[10px]">Markdown Output</span>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
              aria-label="Copy output to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {direction === 'md-to-html' && tab === 'preview' ? (
            <div
              className="w-full min-h-[260px] max-h-[380px] overflow-y-auto bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 shadow-xs leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: outputText || '<span class="text-neutral-400 italic">Preview appears here...</span>',
              }}
            />
          ) : (
            <textarea
              rows={12}
              readOnly
              value={outputText}
              aria-label="Converted output text"
              className="w-full bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y"
            />
          )}
        </div>
      </div>
    </div>
  );
};
