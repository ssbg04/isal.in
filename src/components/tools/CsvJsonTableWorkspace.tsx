import React, { useState, useMemo, useRef } from 'react';
import { Table, Code2, UploadCloud, Download, Copy, Check } from 'lucide-react';
import { parseCsv, jsonToCsv, type CsvParseResult } from '../../services/conversionService';
import { sanitizeFilename } from '../../utils/security';

interface CsvJsonTableWorkspaceProps {
  onHistoryAdd?: (summary: string) => void;
}

export const CsvJsonTableWorkspace: React.FC<CsvJsonTableWorkspaceProps> = ({ onHistoryAdd }) => {
  const [csvMode, setCsvMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [csvDelimiter, setCsvDelimiter] = useState<string>(',');
  const [csvHasHeader, setCsvHasHeader] = useState<boolean>(true);
  const [csvIndentation, setCsvIndentation] = useState<number>(2);
  const [csvOutputTab, setCsvOutputTab] = useState<'table' | 'code'>('table');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [inputText, setInputText] = useState<string>(
    'id,name,role,department,active\n101,Alex Morgan,Staff Engineer,Infrastructure,true\n102,Sophia Chen,Product Lead,Growth,true\n103,David Miller,Security Analyst,SecOps,false\n104,Elena Rostova,UX Designer,Creative,true\n105,Marcus Vance,Data Scientist,Analytics,true'
  );
  const [parsedResult, setParsedResult] = useState<CsvParseResult | null>(() =>
    parseCsv(
      'id,name,role,department,active\n101,Alex Morgan,Staff Engineer,Infrastructure,true\n102,Sophia Chen,Product Lead,Growth,true\n103,David Miller,Security Analyst,SecOps,false\n104,Elena Rostova,UX Designer,Creative,true\n105,Marcus Vance,Data Scientist,Analytics,true',
      ',',
      true
    )
  );
  const [outputText, setOutputText] = useState<string>(() =>
    JSON.stringify(
      parseCsv(
        'id,name,role,department,active\n101,Alex Morgan,Staff Engineer,Infrastructure,true\n102,Sophia Chen,Product Lead,Growth,true\n103,David Miller,Security Analyst,SecOps,false\n104,Elena Rostova,UX Designer,Creative,true\n105,Marcus Vance,Data Scientist,Analytics,true',
        ',',
        true
      ).rows,
      null,
      2
    )
  );
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRows = useMemo(() => {
    if (!parsedResult?.rows) return [];
    if (!tableFilter.trim()) return parsedResult.rows;
    const q = tableFilter.toLowerCase();
    return parsedResult.rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [parsedResult, tableFilter]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (csvMode === 'csv-to-json') {
      const parsed = parseCsv(val, csvDelimiter, csvHasHeader);
      setParsedResult(parsed);
      setOutputText(JSON.stringify(parsed.rows, null, csvIndentation));
    } else {
      const res = jsonToCsv(val, csvDelimiter);
      if (!res.error) {
        setOutputText(res.csv);
        const parsed = parseCsv(res.csv, csvDelimiter, true);
        setParsedResult(parsed);
      }
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const isJson = csvMode === 'csv-to-json';
    const blob = new Blob([outputText], {
      type: isJson ? 'application/json' : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(isJson ? 'table-data.json' : 'table-data.csv');
    a.click();
    URL.revokeObjectURL(url);
    onHistoryAdd?.(`CSV Export: ${isJson ? 'JSON' : 'CSV'}`);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 mt-5">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Direction switcher */}
          <div className="inline-flex rounded-xl glass-panel p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setCsvMode('csv-to-json');
                if (inputText && !inputText.trim().startsWith('{') && !inputText.trim().startsWith('[')) {
                  const parsed = parseCsv(inputText, csvDelimiter, csvHasHeader);
                  setParsedResult(parsed);
                  setOutputText(JSON.stringify(parsed.rows, null, csvIndentation));
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
                csvMode === 'csv-to-json'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              CSV ➔ JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setCsvMode('json-to-csv');
                if (inputText && (inputText.trim().startsWith('{') || inputText.trim().startsWith('['))) {
                  const res = jsonToCsv(inputText, csvDelimiter);
                  if (!res.error) {
                    setOutputText(res.csv);
                    const parsed = parseCsv(res.csv, csvDelimiter, true);
                    setParsedResult(parsed);
                  }
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
                csvMode === 'json-to-csv'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              JSON ➔ CSV
            </button>
          </div>

          {/* Delimiter Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="csv-delim-select" className="text-neutral-500 font-medium">Delimiter:</label>
            <select
              id="csv-delim-select"
              value={csvDelimiter}
              onChange={(e) => {
                const delim = e.target.value;
                setCsvDelimiter(delim);
                if (csvMode === 'csv-to-json' && inputText) {
                  const parsed = parseCsv(inputText, delim, csvHasHeader);
                  setParsedResult(parsed);
                  setOutputText(JSON.stringify(parsed.rows, null, csvIndentation));
                } else if (csvMode === 'json-to-csv' && inputText) {
                  const res = jsonToCsv(inputText, delim);
                  if (!res.error) setOutputText(res.csv);
                }
              }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs outline-none font-mono focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <option value=",">Comma (,)</option>
              <option value="&#9;">Tab (TSV)</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {/* Indentation for JSON */}
          {csvMode === 'csv-to-json' && (
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="csv-indent-select" className="text-neutral-500 font-medium">Indent:</label>
              <select
                id="csv-indent-select"
                value={csvIndentation}
                onChange={(e) => {
                  const ind = Number(e.target.value);
                  setCsvIndentation(ind);
                  if (parsedResult) {
                    setOutputText(JSON.stringify(parsedResult.rows, null, ind));
                  }
                }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs outline-none font-mono focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Compact</option>
              </select>
            </div>
          )}

          {/* Has Header Checkbox */}
          {csvMode === 'csv-to-json' && (
            <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={csvHasHeader}
                onChange={(e) => {
                  const val = e.target.checked;
                  setCsvHasHeader(val);
                  if (inputText) {
                    const parsed = parseCsv(inputText, csvDelimiter, val);
                    setParsedResult(parsed);
                    setOutputText(JSON.stringify(parsed.rows, null, csvIndentation));
                  }
                }}
                className="rounded text-amber-500 focus:ring-0 accent-amber-500"
              />
              <span>Header row</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                const text = event.target?.result as string;
                if (text) {
                  setInputText(text);
                  if (file.name.endsWith('.json')) {
                    setCsvMode('json-to-csv');
                    const res = jsonToCsv(text, csvDelimiter);
                    if (!res.error) {
                      setOutputText(res.csv);
                      const parsed = parseCsv(res.csv, csvDelimiter, true);
                      setParsedResult(parsed);
                    }
                  } else {
                    setCsvMode('csv-to-json');
                    const isTab = file.name.endsWith('.tsv') || text.includes('\t');
                    const delim = isTab ? '\t' : csvDelimiter;
                    if (isTab) setCsvDelimiter('\t');
                    const parsed = parseCsv(text, delim, csvHasHeader);
                    setParsedResult(parsed);
                    setOutputText(JSON.stringify(parsed.rows, null, csvIndentation));
                  }
                }
              };
              reader.readAsText(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <label htmlFor="csv-input-text" className="font-mono uppercase tracking-wider text-[10px]">
              {csvMode === 'csv-to-json' ? 'CSV / TSV Input' : 'JSON Array Input'}
            </label>
            <span className="font-mono text-[10px]">{inputText.length} chars</span>
          </div>
          <textarea
            id="csv-input-text"
            rows={13}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              csvMode === 'csv-to-json'
                ? 'Paste CSV or TSV spreadsheet content here...'
                : 'Paste JSON array of objects here, e.g. [{"id": 1, "name": "Alice"}]'
            }
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition resize-y"
          />
        </div>

        {/* Right: Output Panes with Table / Code Tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-[10px] bg-neutral-100/50 dark:bg-neutral-950">
              <button
                type="button"
                onClick={() => setCsvOutputTab('table')}
                className={`px-2.5 py-0.5 rounded font-medium transition inline-flex items-center gap-1 cursor-pointer ${
                  csvOutputTab === 'table'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>Table Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setCsvOutputTab('code')}
                className={`px-2.5 py-0.5 rounded font-medium transition inline-flex items-center gap-1 cursor-pointer ${
                  csvOutputTab === 'code'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>{csvMode === 'csv-to-json' ? 'JSON' : 'CSV'} Code</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {csvOutputTab === 'table' ? (
            <div className="w-full min-h-[280px] max-h-[380px] overflow-y-auto bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-neutral-100 shadow-xs flex flex-col justify-between">
              {parsedResult && parsedResult.headers.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-neutral-500 font-mono">
                      {filteredRows.length} rows • {parsedResult.headers.length} cols
                    </span>
                    <input
                      type="text"
                      placeholder="Filter table records..."
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 outline-none w-36 sm:w-44 focus-visible:ring-2 focus-visible:ring-amber-500"
                    />
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200/80 dark:border-neutral-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-100 dark:bg-neutral-800/80 sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-700">
                        <tr>
                          <th className="py-2 px-3 font-mono text-[10px] text-neutral-400 font-semibold w-8">#</th>
                          {parsedResult.headers.map((h, idx) => (
                            <th key={idx} className="py-2 px-3 font-semibold text-neutral-800 dark:text-neutral-200 font-mono text-[11px] whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                        {filteredRows.slice(0, 50).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                            <td className="py-1.5 px-3 font-mono text-[10px] text-neutral-400 select-none">{rIdx + 1}</td>
                            {parsedResult.headers.map((h, cIdx) => {
                              const val = row[h];
                              const isBool = typeof val === 'boolean';
                              const isNum = typeof val === 'number';
                              return (
                                <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap font-mono text-[11px]">
                                  {isBool ? (
                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${val ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                      {String(val)}
                                    </span>
                                  ) : isNum ? (
                                    <span className="text-amber-600 dark:text-amber-400">{val}</span>
                                  ) : (
                                    <span className="text-neutral-800 dark:text-neutral-200 font-sans">{val !== null && val !== undefined ? String(val) : ''}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-neutral-400 text-xs flex-1">
                  <Table className="w-8 h-8 mb-2 opacity-40" />
                  <span>No tabular data available. Enter CSV or load a sample.</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              rows={13}
              readOnly
              value={outputText}
              aria-label="CSV conversion code output"
              className="w-full bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y"
            />
          )}
        </div>
      </div>
    </div>
  );
};
