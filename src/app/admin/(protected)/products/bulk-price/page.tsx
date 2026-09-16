'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, AlertTriangle, Loader2, FileText, X } from '@/lib/lucide-icons';

/* -------------------------------------------------------------------------- */
/*  Types (mirror the API response)                                            */
/* -------------------------------------------------------------------------- */

interface MatchRow {
  rowNum: number;
  name: string;
  matched: boolean;
  matchedCount: number;
  dbName: string | null;
  similarity: number | null;
  oldPrice: number | null;
  newPrice: number | null;
  oldOil: number | null;
  newOil: number | null;
  superseded: boolean;
  supersededBy: number | null;
  error: string | null;
  matchType?: string;
}

interface Suggestion {
  dbName: string;
  similarity: number;
}

interface NotFoundItem {
  row: number;
  name: string;
  sellingPrice: number | null;
  suggestions?: Suggestion[];
}

interface NotFoundItem {
  row: number;
  name: string;
  sellingPrice: number | null;
}

interface ErrorItem {
  row: number;
  name: string;
  reason: string;
}

interface DuplicateItem {
  keptRow: number;
  duplicateRow: number;
  name: string;
}

interface BulkPriceResult {
  success: boolean;
  mode: 'preview' | 'apply';
  total: number;
  matched: number;
  matchedProducts: number;
  willChange: number;
  applied: number;
  unchanged: number;
  notFoundCount: number;
  errorCount: number;
  duplicateCount: number;
  analysis?: { breakdown?: Record<string, number> };
  rows: MatchRow[];
  notFound: NotFoundItem[];
  errors: ErrorItem[];
  duplicates: DuplicateItem[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const csvCell = (value: string | number | null): string => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const fmtPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  return `PKR ${value.toLocaleString()}`;
};

const MATCH_TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  exact: { label: 'exact', cls: 'bg-green-100 text-green-800' },
  brandless: { label: 'brandless', cls: 'bg-teal-100 text-teal-800' },
  fuzzy: { label: 'fuzzy', cls: 'bg-purple-100 text-purple-800' },
  fuzzyBrandless: { label: 'fuzzy brandless', cls: 'bg-indigo-100 text-indigo-800' },
  substring: { label: 'substring', cls: 'bg-orange-100 text-orange-800' },
  override: { label: 'manual', cls: 'bg-violet-100 text-violet-800' },
};

const matchTypeBadge = (t: string | undefined) => {
  const def = MATCH_TYPE_LABELS[t ?? ''] ?? { label: 'matched', cls: 'bg-green-100 text-green-800' };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${def.cls}`}>{def.label}</span>
  );
};

const fmtSim = (s: number | null | undefined): string =>
  s === null || s === undefined ? '' : ` ~${Math.round(s * 100)}%`;

const SAMPLE_CSV = [
  '',
  'Final Perfumes Prices and Category List',
  '',
  'Sr. #,Perfume Oil,Price of 100 Gram Oil,Attar Price (1 Tola),Box Price (1 Tola),Bottle Price (1 Tola),Printing Cost,Flyer Cost,Delivery Charges,Total Cost (1 Tola),Selling Price',
  '1,1 MILLION ROYAL BY PACO RABANNE - PRM,5300,636,150,120,2,10,250,1168,1668',
  '2,"K" BY DOLCE & GABBANA (D&G),6000,720,150,120,2,10,250,1252,1852',
  '3,ROSE WOOD BY AJMAL,690,82.8,150,120,2,10,250,614.8,1114.8',
  'Total,,755910,,,,,,,,',
].join('\n');

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BulkPriceUpdatePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<BulkPriceResult | null>(null);
  const [afterApply, setAfterApply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  const selectFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are supported. Please convert your Excel file to CSV.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    setError(null);
    setFile(f);
    setResult(null);
    setAfterApply(false);
    setProgress('');
    setOverrides({});
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
  }, []);

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_bulk_price_update.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = (filename: string, header: string[], rows: (string | number | null)[][]) => {
    const csvContent = [header.join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadNotFound = () => {
    if (!result) return;
    downloadCsv(
      'not_found_products.csv',
      ['csv_row', 'product_name', 'selling_price'],
      result.notFound.map((n) => [n.row, n.name, n.sellingPrice ?? ''])
    );
  };

  const runPreview = async () => {
    if (!file) return;
    setUploading(true);
    setProgress('Parsing CSV and matching products…');
    setResult(null);
    setAfterApply(false);
    setError(null);
    setOverrides({});
    const body = new FormData();
    body.append('file', file);
    body.append('mode', 'preview');
    try {
      const res = await fetch('/api/admin/products/bulk-price', { method: 'POST', body });
      const data = (await res.json()) as BulkPriceResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error || 'Preview failed.');
      } else {
        setResult(data);
        setProgress('');
      }
    } catch {
      setError('Preview failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const runApply = async () => {
    if (!file || !result) return;
    setUploading(true);
    setProgress('Updating prices…');
    setAfterApply(false);
    setError(null);
    const body = new FormData();
    body.append('file', file);
    body.append('mode', 'apply');
    const overrideList = Object.entries(overrides)
      .filter(([, dbName]) => dbName && dbName.length > 0)
      .map(([row, dbName]) => ({ row: Number(row), dbName }));
    if (overrideList.length > 0) {
      body.append('overrides', JSON.stringify(overrideList));
    }
    try {
      const res = await fetch('/api/admin/products/bulk-price', { method: 'POST', body });
      const data = (await res.json()) as BulkPriceResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error || 'Apply failed. No changes were made.');
      } else {
        setResult(data);
        setAfterApply(true);
        setProgress('');
      }
    } catch {
      setError('Apply failed. Please try again. No partial update was applied.');
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setProgress('');
    setAfterApply(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const r = result;
  const matchedCount = r?.matched ?? 0;
  const notFoundCount = r?.notFoundCount ?? 0;
  const errorCount = r?.errorCount ?? 0;

  const hunks: { key: string; cls: string; label: string; value: number }[] = r
    ? [
        { key: 'total', cls: 'text-foreground', label: 'rows found', value: r.total },
        { key: 'matched', cls: 'text-green-700', label: 'matched', value: r.matched },
        { key: 'change', cls: 'text-blue-700', label: 'price changes', value: r.willChange },
        { key: 'notfound', cls: 'text-amber-700', label: 'not found', value: r.notFoundCount },
        { key: 'errors', cls: 'text-red-700', label: 'invalid', value: r.errorCount },
        { key: 'dupes', cls: 'text-muted-foreground', label: 'duplicates cleared', value: r.duplicateCount },
      ]
    : [];

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
            <BreadcrumbPage>Bulk Price Update</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Bulk Price Update</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
            Upload the supplier CSV. The file has a blank line, a title row, another blank line, a header row
            (<code>Sr. #</code>, <code>Perfume Oil</code>, <code>Price of 100 Gram Oil</code>… <code>Selling Price</code>),
            then product rows and a final <code>Total</code> row — those we handle automatically. Products are matched by
            name — exact (full name), brand-less (CSV{' '}<code>&quot;X BY BRAND&quot;</code> vs DB <code>&quot;X&quot;</code>), fuzzy, and ordered-token
            substring layers — and only{' '}
            <strong>Selling Price → price</strong> and <strong>Price of 100 Gram Oil → oil price</strong> are written.
            Everything runs in a single transaction with a full audit log.
          </p>
        </div>
        <Button variant="outline" onClick={downloadSample} className="shrink-0">
          <Download className="h-4 w-4 mr-2" /> Download Sample CSV
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 p-3 mb-6 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          {error && error.startsWith('Could not find') && (
            <button className="ml-auto text-xs underline hover:text-red-950" onClick={downloadSample}>
              Download sample
            </button>
          )}
        </div>
      )}

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
            Columns: Sr. # · Perfume Oil · Price of 100 Gram Oil · Attar Price (1 Tola) · … · Selling Price
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
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
            <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={clearAll} disabled={uploading}>
              Remove
            </Button>
          </div>

          <div className="flex gap-3">
            {!result && (
              <Button size="lg" onClick={runPreview} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing & matching…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Preview Changes
                  </>
                )}
              </Button>
            )}
            {result && !afterApply && (
              <Button
                size="lg"
                onClick={runApply}
                disabled={uploading || matchedCount === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Update ({r?.matchedProducts ?? 0} product{r?.matchedProducts === 1 ? '' : 's'})
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={clearAll} disabled={uploading}>
              {afterApply ? 'Upload Another File' : 'Cancel'}
            </Button>
          </div>

          {progress && !result && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress}
            </div>
          )}

          {r && (
            <div className="space-y-6">
              {afterApply && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50/70 p-4">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                  <div className="text-sm">
                    <span className="font-semibold text-green-800">
                      {r.applied} product{r.applied === 1 ? '' : 's'} updated
                    </span>
                    <span className="text-green-700/90"> ({r.willChange} price changes applied)</span>
                    {r.unchanged > 0 && (
                      <span className="text-muted-foreground"> · {r.unchanged} already at the new price · </span>
                    )}
                    {r.notFoundCount + r.errorCount > 0 && (
                      <span className="text-amber-700"> · {r.notFoundCount} not found, {r.errorCount} invalid skipped</span>
                    )}
                  </div>
                  {notFoundCount > 0 && (
                    <Button variant="outline" size="sm" onClick={downloadNotFound} className="ml-auto">
                      <Download className="h-4 w-4 mr-2" /> Download not-found CSV
                    </Button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30 border-border">
                {hunks.map((h) => (
                  <span key={h.key} className="text-sm">
                    <strong className={h.cls}>{h.value.toLocaleString()}</strong> {h.label}
                    <span className="text-muted-foreground mx-1">·</span>
                  </span>
                ))}
                {!afterApply && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    The table below shows every CSV row. Review it, then Confirm Update to write to the database in one transaction.
                  </span>
                )}
              </div>

              {r.analysis?.breakdown && (
                <div className="text-xs text-muted-foreground -mt-2">
                  Match quality:{' '}
                  {Object.entries(r.analysis.breakdown).map(([k, v], i, arr) => (
                    <span key={k}>
                      {matchTypeBadge(k)} <strong>{v}</strong>
                      {i < arr.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-2">Rows — {r.total.toLocaleString()} total</h3>
                <div className="overflow-x-auto rounded-md border max-h-[28rem] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-xs">Row</TableHead>
                        <TableHead className="text-xs">CSV Name</TableHead>
                        <TableHead className="w-40 text-xs">Match</TableHead>
                        <TableHead className="text-xs">DB Name</TableHead>
                        <TableHead className="w-40 text-xs">Price (Selling)</TableHead>
                        <TableHead className="w-36 text-xs">Oil/100g</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.rows.map((row) => {
                        const changed = row.matched && !row.superseded && !row.error &&
                          ((row.newPrice !== null && row.oldPrice !== null && row.newPrice !== row.oldPrice) ||
                           (row.newOil !== null && row.oldOil !== null && row.newOil !== Math.round(row.oldOil)));
                        return (
                          <TableRow key={row.rowNum} className={row.superseded ? 'opacity-50' : row.matched && !row.error ? (changed ? 'bg-blue-50/40' : '') : 'bg-amber-50/40'}>
                            <TableCell className="text-xs text-muted-foreground">{row.rowNum}</TableCell>
                            <TableCell className="text-sm max-w-[220px] truncate" title={row.name}>
                              {row.name || <span className="italic text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              {row.error ? (
                                <Badge variant="destructive">
                                  <X className="h-3 w-3" /> invalid
                                </Badge>
                              ) : row.superseded ? (
                                <Badge variant="outline">superseded — row {row.supersededBy} kept</Badge>
                              ) : row.matched ? (
                                <span className="inline-flex items-center gap-1">
                                  {matchTypeBadge(row.matchType)}
                                  {row.matchedCount > 1 && row.matchType === 'exact' && (
                                    <span className="text-[10px] text-muted-foreground">×{row.matchedCount}</span>
                                  )}
                                  {row.similarity !== null && row.similarity < 1 && (
                                    <span className="text-[10px] text-muted-foreground">{fmtSim(row.similarity)}</span>
                                  )}
                                </span>
                              ) : (
                                <Badge variant="destructive" className="bg-amber-100 text-amber-800">
                                  <AlertCircle className="h-3 w-3" /> not found
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">
                              {row.matched && row.dbName ? row.dbName : <span className="italic text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              {row.matched ? (
                                <span className="text-sm">
                                  <span className="text-muted-foreground line-through">{fmtPrice(row.oldPrice)}</span>
                                  <span className="mx-1 text-muted-foreground">→</span>
                                  <span className={`font-semibold ${row.newPrice !== null && row.oldPrice !== null && row.newPrice !== row.oldPrice ? 'text-blue-700' : ''}`}>
                                    {fmtPrice(row.newPrice)}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-sm">{fmtPrice(row.newPrice)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.matched ? (
                                <span>
                                  <span className="text-muted-foreground">{fmtPrice(row.oldOil)}</span>
                                  <span className="mx-1 text-muted-foreground">→</span>
                                  <span className="font-semibold">{fmtPrice(row.newOil)}</span>
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">{fmtPrice(row.newOil)}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {notFoundCount > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Not found in database ({notFoundCount}) — skipped, no update{!afterApply && (
                      <span className="text-xs text-muted-foreground font-normal">
                        (pick a suggestion below to map a row manually)
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2 mb-3">
                    {r.notFound.map((n) => {
                      const hasOver = Boolean(overrides[n.row]);
                      return (
                        <div key={n.row} className={`flex items-center gap-2 rounded border p-2 ${hasOver ? 'border-violet-300 bg-violet-50/40' : 'border-border'}`}>
                          <span className="text-xs text-muted-foreground w-12 shrink-0">row {n.row}</span>
                          <span className="text-xs w-[40%] min-w-0 truncate" title={n.name}>{n.name}</span>
                          <span className="text-xs text-muted-foreground w-24 shrink-0">{fmtPrice(n.sellingPrice)}</span>
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            {afterApply
                              ? (hasOver && <Badge className="bg-violet-100 text-violet-800">{overrides[n.row]}</Badge>)
                              : (
                                <>
                                  <select
                                    className="h-8 max-w-full flex-1 min-w-0 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                                    value={overrides[n.row] ?? ''}
                                    onChange={(e) => {
                                      const v = e.target.value || '';
                                      setOverrides((prev) => {
                                        const next = { ...prev };
                                        if (v) next[n.row] = v;
                                        else delete next[n.row];
                                        return next;
                                      });
                                    }}
                                    disabled={uploading}
                                  >
                                    <option value="">— Skip (not updated) —</option>
                                    {n.suggestions?.map((s) => (
                                      <option key={s.dbName} value={s.dbName}>
                                        {s.dbName} ({Math.round(s.similarity * 100)}%)
                                      </option>
                                    ))}
                                    {!n.suggestions?.length && <option disabled value="">no suggestions</option>}
                                  </select>
                                  {hasOver && (
                                    <Button variant="ghost" size="sm" onClick={() => setOverrides((prev) => { const next = { ...prev }; delete next[n.row]; return next; })} disabled={uploading}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={downloadNotFound}>
                      <Download className="h-4 w-4 mr-2" /> Download not-found CSV
                    </Button>
                    {!afterApply && Object.keys(overrides).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Object.keys(overrides).length} row{Object.keys(overrides).length === 1 ? '' : 's'} will be matched manually on Confirm Update.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Suggestions are the closest DB products by name similarity. Products are not auto-created.
                  </p>
                </div>
              )}

              {r.duplicates.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Duplicates in file ({r.duplicates.length}) — last occurrence won
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {r.duplicates.map((d, i) => (
                      <span key={i} className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                        {d.name} — row {d.keptRow} kept (row {d.duplicateRow} ignored)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {errorCount > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    Invalid rows ({errorCount}) — skipped
                  </h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20 text-xs">Row</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {r.errors.map((err, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{err.row}</TableCell>
                            <TableCell className="text-sm">{err.name || '—'}</TableCell>
                            <TableCell className="text-sm text-destructive">{err.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!afterApply && <p className="text-sm text-muted-foreground">Review the preview above, then Confirm Update to save (runs in one transaction).</p>}
                <Button variant="outline" size="lg" className="ml-auto" onClick={clearAll}>
                  {afterApply ? 'Upload Another File' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-8 text-xs text-muted-foreground">
        CSV only (≤ 5MB). The parser ignores the title/blank preamble and the final <code>Total</code> row. Quoted names with commas,
        decimal prices, curly quotes and stray characters are handled automatically.
      </div>
    </div>
  );
}