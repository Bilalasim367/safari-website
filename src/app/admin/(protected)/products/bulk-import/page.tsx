'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, Loader2, FileText, X } from '@/lib/lucide-icons';

type MatchMethod = 'exact' | 'normalized' | 'contains';

interface PreviewRow {
  recordIndex: number;
  row: number;
  rawName: string;
  cleanName: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  matched: boolean;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchMethod: MatchMethod | null;
  duplicateMatch: boolean;
  error: string | null;
}

interface UnmatchedDbProduct {
  id: string;
  name: string;
}

interface PreviewResult {
  success: boolean;
  action: 'preview';
  total: number;
  matchedCount: number;
  notFoundCount: number;
  invalidCount: number;
  containsCount: number;
  unmatchedDbCount: number;
  rows: PreviewRow[];
  unmatchedDb: UnmatchedDbProduct[];
}

interface UpdatedProduct {
  oldName: string;
  newName: string;
  slug: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
}

interface ApplyResult {
  success: boolean;
  action: 'apply';
  submitted: number;
  matched: number;
  applied: number;
  failed: number;
  errors: { row: number; name: string; reason: string }[];
  updated: UpdatedProduct[];
  proof: { impression: number; by: number };
  sample: UpdatedProduct[];
}

const SAMPLE_HEADERS = ['name', 'topNotes', 'heartNotes', 'baseNotes'];

const SAMPLE_ROW = [
  'Cool Blue',
  'Saffron, Cinnamon',
  'Oud, Rose',
  'Musk, Amber, Sandalwood',
];

const csvCell = (value: string): string => {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const matchBadge = (method: MatchMethod | null) => {
  if (method === 'contains') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        contains
      </span>
    );
  }
  if (method === 'exact' || method === 'normalized') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        {method}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
      not found
    </span>
  );
};

const notesLine = (top: string, heart: string, base: string): string => {
  const parts = [top, heart, base].map((n) => (n.trim() ? n.trim() : '—'));
  return parts.join(' · ');
};

export default function ImportNotesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [records, setRecords] = useState<string[][]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  const runPreview = useCallback(async (rawRows: string[][]) => {
    setPreviewing(true);
    setPreviewError(null);
    setPreview(null);
    setApplyResult(null);
    try {
      const res = await fetch('/api/admin/products/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', rows: rawRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || 'Preview failed.');
      } else {
        setPreview(data);
      }
    } catch {
      setPreviewError('Preview failed. Please try again.');
    } finally {
      setPreviewing(false);
    }
  }, []);

  const parseFile = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = Papa.parse<(string | null)[]>(text, {
        header: false,
        skipEmptyLines: true,
      });
      const data = (parsed.data || []).map((row) =>
        (Array.isArray(row) ? row : []).map((c) => (c === undefined || c === null ? '' : String(c)))
      );
      setFile(f);
      setRecords(data);
      void runPreview(data);
    };
    reader.readAsText(f);
  }, [runPreview]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith('.csv')) {
        parseFile(f);
      }
    },
    [parseFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
        parseFile(f);
      }
    },
    [parseFile]
  );

  const downloadSample = () => {
    const csvContent = [
      SAMPLE_HEADERS.join(','),
      SAMPLE_ROW.map(csvCell).join(','),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import-notes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFile(null);
    setRecords([]);
    setPreview(null);
    setPreviewError(null);
    setApplyResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApply = async () => {
    if (!preview) return;
    const matchedIndices = preview.rows
      .filter((r) => r.matched && !r.error)
      .sort((a, b) => a.recordIndex - b.recordIndex)
      .map((r) => r.recordIndex);
    if (matchedIndices.length === 0) return;

    setApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch('/api/admin/products/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', rows: records, matchedIndices }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || 'Apply failed.');
      } else {
        setApplyResult(data);
      }
    } catch {
      setPreviewError('Apply failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const totalRows = preview?.total ?? 0;
  const matchedCount = preview?.matchedCount ?? 0;
  const notFoundCount = preview?.notFoundCount ?? 0;
  const invalidCount = preview?.invalidCount ?? 0;
  const containsCount = preview?.containsCount ?? 0;
  const unmatchedDbCount = preview?.unmatchedDbCount ?? 0;

  return (
    <div className="p-2">
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/products" className="text-muted-foreground hover:text-foreground transition-colors">
                Products
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Import Notes (CSV)</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Import Notes (CSV)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a CSV with <strong>name</strong>, <strong>topNotes</strong>, <strong>heartNotes</strong>, <strong>baseNotes</strong>.
            Rows are smart-matched to existing products and update only <strong>name · slug · notes</strong> — nothing else.
            CSV names are auto-cleaned: <strong>{'"- PRM"'}</strong> codes and <strong>{'"BY brand"'}</strong> suffixes are removed, then converted to Title Case (e.g. {'"1 MILLION ROYAL BY PACO RABANNE - PRM"'}{' '}→{' '}{'"1 Million Royal"'}).
          </p>
        </div>
        <Button variant="outline" onClick={downloadSample}>
          <Download className="h-4 w-4 mr-2" /> Download Sample CSV
        </Button>
      </div>

      {!file && (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center hover:border-gold/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Accepts .csv files only · columns: name, topNotes, heartNotes, baseNotes
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {file && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
            <FileText className="h-5 w-5 text-gold" />
            <span className="font-medium">{file.name}</span>
            <span className="text-sm text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={clearAll} disabled={applying}>
              Remove
            </Button>
          </div>

          {previewing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Matching rows against existing products...
            </div>
          )}

          {previewError && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-red-50 border-red-200 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {previewError}
            </div>
          )}

          {preview && !previewing && (
            <>
              {/* Summary strip */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border">
                <span className="text-sm font-medium">
                  <strong>{matchedCount}</strong> matched
                </span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm">
                  <strong className="text-amber-600">{notFoundCount}</strong> not found
                </span>
                {invalidCount > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm text-red-600">
                      <strong>{invalidCount}</strong> missing name
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm">
                  <strong>{unmatchedDbCount}</strong> DB products untouched
                </span>
              </div>

              {containsCount > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-amber-50/60 border-amber-200 text-sm text-amber-800">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>
                    <strong>{containsCount}</strong> row{containsCount !== 1 ? 's' : ''} matched via{' '}
                    <strong>contains</strong> (yellow) — review carefully before applying (possible spelling
                    variations).
                  </span>
                </div>
              )}

              {/* Preview table */}
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Preview — {totalRows} CSV rows
                </h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-xs">#</TableHead>
                        <TableHead className="text-xs">CSV Raw Name</TableHead>
                        <TableHead className="text-xs">Cleaned New Name</TableHead>
                        <TableHead className="text-xs">Matched DB Product (old name)</TableHead>
                        <TableHead className="text-xs">Match Method</TableHead>
                        <TableHead className="text-xs">Notes (Top • Heart • Base)</TableHead>
                        <TableHead className="text-xs">Matched?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.rows.map((r) => (
                        <TableRow key={r.recordIndex} className={r.matchMethod === 'contains' ? 'bg-amber-50/60' : ''}>
                          <TableCell className="text-xs text-muted-foreground">{r.row}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate whitespace-nowrap">
                            {r.rawName || <span className="italic text-muted-foreground">empty</span>}
                          </TableCell>
                          <TableCell className="text-sm font-medium max-w-[180px] truncate">
                            {r.cleanName || <span className="italic text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-sm max-w-[220px] truncate">
                            {r.matchedProductName ? (
                              <span className={r.duplicateMatch ? 'text-amber-700' : ''}>
                                {r.matchedProductName}
                                {r.duplicateMatch && (
                                  <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                    duplicate match
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell>{matchBadge(r.matchMethod)}</TableCell>
                          <TableCell className="text-xs max-w-[260px] truncate" title={`Top: ${r.topNotes || '—'}\nHeart: ${r.heartNotes || '—'}\nBase: ${r.baseNotes || '—'}`}>
                            {notesLine(r.topNotes, r.heartNotes, r.baseNotes)}
                          </TableCell>
                          <TableCell>
                            {r.error ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                <X className="h-3 w-3" /> {r.error}
                              </span>
                            ) : r.matched ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                <CheckCircle className="h-3 w-3" /> Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                <X className="h-3 w-3" /> Not found
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Not-found list */}
              {preview.notFoundCount > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Not found in DB ({preview.notFoundCount}) — no match, no update
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preview.rows
                      .filter((r) => !r.error && !r.matched)
                      .slice(0, 20)
                      .map((r) => (
                        <span key={r.recordIndex} className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                          {r.cleanName || r.rawName}
                        </span>
                      ))}
                    {preview.notFoundCount > 20 && (
                      <span className="text-xs text-muted-foreground italic px-1 py-1">
                        +{preview.notFoundCount - 20} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Unmatched DB products */}
              {unmatchedDbCount > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Unmatched DB products ({unmatchedDbCount}) — UNTOUCHED
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preview.unmatchedDb.slice(0, 20).map((p) => (
                      <span key={p.id} className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                        {p.name}
                      </span>
                    ))}
                    {unmatchedDbCount > 20 && (
                      <span className="text-xs text-muted-foreground italic px-1 py-1">
                        +{unmatchedDbCount - 20} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button size="lg" onClick={handleApply} disabled={applying || matchedCount === 0}>
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Apply {matchedCount} Update{matchedCount !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" onClick={clearAll} disabled={applying}>
                  Cancel
                </Button>
              </div>

              {/* Apply result */}
              {applyResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${applyResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <h3 className="font-semibold text-lg mb-2">Apply Complete</h3>
                    <div className="flex gap-4 flex-wrap">
                      <div className="bg-white rounded px-3 py-2 border">
                        <span className="text-2xl font-bold text-green-600">{applyResult.applied}</span>
                        <p className="text-xs text-muted-foreground">Updated</p>
                      </div>
                      <div className="bg-white rounded px-3 py-2 border">
                        <span className="text-2xl font-bold text-blue-600">{applyResult.matched}</span>
                        <p className="text-xs text-muted-foreground">Matched</p>
                      </div>
                      <div className="bg-white rounded px-3 py-2 border">
                        <span className="text-2xl font-bold text-red-600">{applyResult.failed}</span>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        <CheckCircle className="h-3 w-3" /> {'Names with "Impression":'} {applyResult.proof.impression}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        <CheckCircle className="h-3 w-3" /> {'Names with " by ": '} {applyResult.proof.by}
                      </span>
                    </div>
                  </div>

                  {applyResult.errors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Failed rows ({applyResult.errors.length})
                      </h3>
                      <div className="rounded-md border overflow-hidden max-h-64 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16 text-xs">Row</TableHead>
                              <TableHead className="w-40 text-xs">Name</TableHead>
                              <TableHead className="text-xs">Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applyResult.errors.map((err, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm">{err.row}</TableCell>
                                <TableCell className="text-sm font-medium">{err.name || '—'}</TableCell>
                                <TableCell className="text-sm text-destructive">{err.reason}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {applyResult.sample.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Sample ({applyResult.sample.length} of {applyResult.updated.length})</h3>
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Old Name → New Name</TableHead>
                              <TableHead className="text-xs">Top</TableHead>
                              <TableHead className="text-xs">Heart</TableHead>
                              <TableHead className="text-xs">Base</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applyResult.sample.map((u, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm max-w-[240px]">
                                  <span className="text-muted-foreground line-through">{u.oldName}</span>
                                  <span className="mx-1 text-muted-foreground">→</span>
                                  <span className="font-medium">{u.newName}</span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[140px]">{u.notesTop.join(', ') || '—'}</TableCell>
                                <TableCell className="text-xs max-w-[140px]">{u.notesHeart.join(', ') || '—'}</TableCell>
                                <TableCell className="text-xs max-w-[140px]">{u.notesBase.join(', ') || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href="/admin/products">
                      <Button>View All Products</Button>
                    </Link>
                    <Button variant="outline" onClick={clearAll}>
                      Import Another File
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}