'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';

interface ParseResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

interface UploadError {
  row: number;
  product_id: string;
  reason: string;
}

interface UploadResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: UploadError[];
}

const SAMPLE_HEADERS = [
  'product_id', 'name', 'slug', 'category', 'gender', 'type', 'season', 'best_time',
  'impression_of', 'top_notes', 'heart_notes', 'base_notes',
  'short_description', 'long_description', 'tags', 'sizes_available',
  'price_3ml_physical', 'price_6ml_physical', 'price_12ml_physical', 'price_50ml_physical',
  'price_3ml_online', 'price_6ml_online', 'price_12ml_online', 'price_50ml_online',
  'currency', 'oil_price_per_100g', 'supplier',
  'is_featured', 'is_active', 'stock_status', 'image_folder', 'meta_title', 'meta_description',
];

const SAMPLE_ROW = [
  'PRD0001', 'Rose Wood by Ajmal', 'rose-wood-by-ajmal', 'Attar & Perfume', 'Unisex', 'Attar & Spray',
  'All Season', 'Evening', 'Ajmal',
  'Rose, Saffron', 'Oud, Cedarwood', 'Musk, Amber, Sandalwood',
  'A luxurious rose wood attar', 'A premium blend of **rose** and **oud** with rich woody undertones.\n\nPerfect for evening wear.',
  'men,oud,winter,impression,attar,perfume', '3ml,6ml,12ml,50ml',
  '500', '900', '1500', '3500',
  '450', '850', '1400', '3200',
  'PKR', '2500', 'Ajmal Fragrances',
  'true', 'true', 'in_stock', 'products/rose-wood-by-ajmal', 'Rose Wood by Ajmal | Premium Attar', 'Buy Rose Wood attar by Ajmal',
];

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      parsePreview(f);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      parsePreview(f);
    }
  }, []);

  const parsePreview = (f: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      setHeaders(parsed.meta.fields || []);
      setPreview(parsed.data.slice(0, 5));
    };
    reader.readAsText(f);
  };

  const downloadSample = () => {
    const csvContent = [
      SAMPLE_HEADERS.join(','),
      SAMPLE_ROW.join(','),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_products_upload.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setProgress('Preparing upload...');
    setResult(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        headers: {
          'x-api-key': localStorage.getItem('adminApiKey') || '',
        },
        body,
      });
      const data: UploadResult = await res.json();
      setResult(data);
      setProgress('');
    } catch {
      setProgress('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const totalColumns = SAMPLE_HEADERS.length;
  const detectedColumns = headers.length;
  const columnsMatch = detectedColumns === totalColumns;

  return (
    <div className="p-8">
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
            <BreadcrumbPage>Bulk Upload</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Bulk Upload Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a CSV file to create or update multiple products at once.
          </p>
        </div>
        <Button variant="outline" onClick={downloadSample}>
          <Download className="h-4 w-4 mr-2" /> Download Sample CSV
        </Button>
      </div>

      {!preview && (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center hover:border-gold/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-1">Drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <p className="text-xs text-muted-foreground">Accepts .csv files only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {file && preview && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
            <FileText className="h-5 w-5 text-gold" />
            <span className="font-medium">{file.name}</span>
            <span className="text-sm text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-destructive"
              onClick={() => { setFile(null); setPreview(null); setHeaders([]); setResult(null); }}
            >
              Remove
            </Button>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg border">
            {columnsMatch ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm">
              Detected <strong>{detectedColumns}</strong> of {totalColumns} expected columns
              {!columnsMatch && (
                <span className="text-amber-600"> — column mismatch detected</span>
              )}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Preview (first {Math.min(preview.length, 5)} rows)</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.slice(0, 8).map((h) => (
                      <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                    ))}
                    <TableHead className="text-xs">...</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      {headers.slice(0, 8).map((h) => (
                        <TableCell key={h} className="text-sm max-w-[150px] truncate">
                          {row[h] || <span className="text-muted-foreground italic">empty</span>}
                        </TableCell>
                      ))}
                      <TableCell className="text-sm text-muted-foreground">
                        +{headers.length - 8} more
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleImport}
              disabled={uploading || !columnsMatch}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Products
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => { setFile(null); setPreview(null); setHeaders([]); setResult(null); }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>

          {progress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${result.skipped === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <h3 className="font-semibold text-lg mb-2">Import Complete</h3>
                <div className="flex gap-4 flex-wrap">
                  <div className="bg-white rounded px-3 py-2 border">
                    <span className="text-2xl font-bold text-green-600">{result.created}</span>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                  <div className="bg-white rounded px-3 py-2 border">
                    <span className="text-2xl font-bold text-blue-600">{result.updated}</span>
                    <p className="text-xs text-muted-foreground">Updated</p>
                  </div>
                  <div className="bg-white rounded px-3 py-2 border">
                    <span className="text-2xl font-bold text-muted-foreground">{result.total}</span>
                    <p className="text-xs text-muted-foreground">Total Rows</p>
                  </div>
                  {result.skipped > 0 && (
                    <div className="bg-white rounded px-3 py-2 border">
                      <span className="text-2xl font-bold text-amber-600">{result.skipped}</span>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  )}
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Errors ({result.errors.length})
                  </h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-xs">Row</TableHead>
                          <TableHead className="w-28 text-xs">Product ID</TableHead>
                          <TableHead className="text-xs">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.errors.map((err, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{err.row}</TableCell>
                            <TableCell className="text-sm font-mono">{err.product_id}</TableCell>
                            <TableCell className="text-sm text-destructive">{err.reason}</TableCell>
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
                <Button variant="outline" onClick={() => { setFile(null); setPreview(null); setHeaders([]); setResult(null); }}>
                  Upload Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
