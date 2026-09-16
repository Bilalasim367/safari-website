'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, Loader2, FileText, SkipForward } from '@/lib/lucide-icons';

interface ImportResult {
  success: boolean;
  mode: 'preview' | 'import';
  duplicateMode: 'skip' | 'update';
  total: number;
  created: number;
  updated: number;
  skipped: number;
  toCreate: number;
  toUpdate: number;
  errorCount: number;
  errors: { row: number; sku: string; name: string; reason: string }[];
  newRows: { row: number; sku: string; name: string; price: number | null; stock: string }[];
  duplicateRows: { row: number; sku: string; name: string; price: number | null; dbName: string | null }[];
}

const SAMPLE_HEADERS = ['name', 'sku', 'description', 'price', 'sale_price', 'stock', 'category', 'images'];
const SAMPLE_ROWS: string[][] = [
  ['Rose Wood by Ajmal', 'PRD0001', 'Premium attar', '1500', '1800', 'in_stock', 'men', 'https://example.com/rose.jpg'],
  ['Oud Royal', 'PRD0002', 'Traditional oud', '2500', '', 'in_stock', 'women', 'https://example.com/oud.jpg|https://example.com/oud2.jpg'],
  ['Cool Breeze', 'PRD0003', 'Fresh scent', '900', '1100', 'in_stock', 'unisex', ''],
];

const csvCell = (v: string) => {
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export default function ProductImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update'>('skip');

  const parsePreview = (f: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
      setHeaders(parsed.meta.fields || []);
      setPreview(parsed.data.slice(0, 5));
    };
    reader.readAsText(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      setResult(null);
      parsePreview(f);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      parsePreview(f);
    }
  }, []);

  const downloadSample = () => {
    const csv = [SAMPLE_HEADERS.join(','), ...SAMPLE_ROWS.map((r) => r.map(csvCell).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_product_import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runPreview = async () => {
    if (!file) return;
    setUploading(true);
    setProgress('Validating rows...');
    setResult(null);
    const body = new FormData();
    body.append('file', file);
    body.append('mode', 'preview');
    body.append('duplicateMode', duplicateMode);
    try {
      const res = await fetch('/api/admin/products/import', { method: 'POST', body });
      const data: ImportResult = await res.json();
      if (!res.ok) setProgress((data as unknown as { error?: string }).error || 'Preview failed.');
      else { setResult(data); setProgress(''); }
    } catch { setProgress('Preview failed.'); }
    finally { setUploading(false); }
  };

  const runImport = async () => {
    if (!file) return;
    setUploading(true);
    setProgress('Importing...');
    const body = new FormData();
    body.append('file', file);
    body.append('mode', 'import');
    body.append('duplicateMode', duplicateMode);
    try {
      const res = await fetch('/api/admin/products/import', { method: 'POST', body });
      const data: ImportResult = await res.json();
      if (!res.ok) setProgress((data as unknown as { error?: string }).error || 'Import failed.');
      else { setResult(data); setProgress(''); }
    } catch { setProgress('Import failed.'); }
    finally { setUploading(false); }
  };

  const clearAll = () => {
    setFile(null); setPreview(null); setHeaders([]); setResult(null); setProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-2">
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Import Products</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Import Products (Simple CSV)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add or update products from a CSV with <strong>name</strong>, <strong>sku</strong>, <strong>price</strong>,
            <strong>sale_price</strong>, <strong>stock</strong>, <strong>category</strong>, <strong>images</strong>.
            Duplicate SKUs: choose <em>Skip</em> or <em>Update</em>.
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
            Columns: name · sku · description · price · sale_price · stock · category · images (pipe-separated)
          </p>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
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

          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
            <span className="text-sm font-medium">Duplicate SKU handling:</span>
            <button
              onClick={() => setDuplicateMode('skip')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                duplicateMode === 'skip' ? 'bg-gold text-white' : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              <SkipForward className="h-3 w-3 inline mr-1" />
              Skip (don&apos;t touch)
            </button>
            <button
              onClick={() => setDuplicateMode('update')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                duplicateMode === 'update' ? 'bg-gold text-white' : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              Update (overwrite fields)
            </button>
          </div>

          {preview && !result && (
            <div>
              <h3 className="text-sm font-semibold mb-2">File preview (first {Math.min(preview.length, 5)} rows)</h3>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader><TableRow>{headers.map((h) => <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>{headers.map((h) => <TableCell key={h} className="text-sm max-w-[160px] truncate">{row[h] || <span className="italic text-muted-foreground">empty</span>}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!result && (
              <Button size="lg" onClick={runPreview} disabled={uploading}>
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Validating...</> : <><Upload className="h-4 w-4 mr-2" /> Preview Changes</>}
              </Button>
            )}
            {result && (
              <Button size="lg" onClick={runImport} disabled={uploading || result.errorCount === result.total}>
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Import {result.toCreate} new + {result.toUpdate} update</>}
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={clearAll} disabled={uploading}>Cancel</Button>
          </div>

          {progress && !result && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {progress}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <span className="text-sm"><strong>{result.total}</strong> rows parsed</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-sm text-green-700"><strong>{result.created}</strong> created</span>
                <span className="text-sm text-blue-700"><strong>{result.updated}</strong> updated</span>
                <span className="text-sm text-amber-700"><strong>{result.skipped}</strong> skipped</span>
                {result.errorCount > 0 && <><span className="text-muted-foreground text-sm">·</span><span className="text-sm text-red-600"><strong>{result.errorCount}</strong> invalid</span></>}
              </div>

              {result.newRows.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-green-700">
                    <CheckCircle className="h-4 w-4" /> New products to create ({result.newRows.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.newRows.slice(0, 20).map((r, i) => (
                      <span key={i} className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-800">
                        {r.sku} — {r.name} (PKR {r.price?.toLocaleString() || '?'})
                      </span>
                    ))}
                    {result.newRows.length > 20 && <span className="text-xs text-muted-foreground italic px-1 py-1">+{result.newRows.length - 20} more</span>}
                  </div>
                </div>
              )}

              {result.duplicateRows.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-amber-700">
                    <AlertCircle className="h-4 w-4" /> Existing SKUs ({result.duplicateRows.length}) — will {duplicateMode}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.duplicateRows.slice(0, 20).map((r, i) => (
                      <span key={i} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        {r.sku} — {r.name} (CSV: {r.dbName ? `"${r.dbName}"` : '?'})
                      </span>
                    ))}
                    {result.duplicateRows.length > 20 && <span className="text-xs text-muted-foreground italic px-1 py-1">+{result.duplicateRows.length - 20} more</span>}
                  </div>
                </div>
              )}

              {result.errorCount > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-red-700">
                    <AlertCircle className="h-4 w-4" /> Invalid rows ({result.errorCount})
                  </h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader><TableRow><TableHead className="w-14 text-xs">Row</TableHead><TableHead className="w-28 text-xs">SKU</TableHead><TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Reason</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {result.errors.map((err, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{err.row}</TableCell>
                            <TableCell className="text-xs font-mono">{err.sku}</TableCell>
                            <TableCell className="text-sm">{err.name || '—'}</TableCell>
                            <TableCell className="text-sm text-destructive">{err.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {result.mode === 'import' && result.created > 0 && (
                <Link href="/admin/products"><Button>View All Products</Button></Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}