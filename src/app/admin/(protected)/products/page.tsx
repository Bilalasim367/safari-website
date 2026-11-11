'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminProducts, deleteProduct, updateProductPartial, setProductPinned, setProductsPinned, movePinnedProduct } from "../actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Loader2, Star } from "@/lib/lucide-icons";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  categorySlug: string | null;
  size: string;
  sizePrices: string;
  inStock: boolean;
  isBestseller: boolean;
  isNew: boolean;
  gender?: string;
  season?: string | null;
  stockStatus?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  type?: string | null;
  productId?: string | null;
  displayOrder: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [bestsellerFilter, setBestsellerFilter] = useState<string>("all");
  const [newFilter, setNewFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [placementBusy, setPlacementBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    const result = await getAdminProducts();

    if (result.error) {
      setError(result.error);
      if (result.error === 'Unauthorized' || result.error === 'Not authenticated') {
        router.push('/admin/login');
      }
    } else {
      setProducts(result.products || []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getAdminProducts();
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        if (result.error === 'Unauthorized' || result.error === 'Not authenticated') {
          router.push('/admin/login');
        }
      } else {
        setProducts(result.products || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || (product.gender || "").toLowerCase() === genderFilter.toLowerCase();
    const matchesType = typeFilter === "all" || (product.type || "").toLowerCase().includes(typeFilter.toLowerCase());
    const matchesSeason = seasonFilter === "all" || (product.season || "").toLowerCase() === seasonFilter;
    const matchesStock = stockFilter === "all" || (product.stockStatus || (product.inStock ? "in_stock" : "out_of_stock")) === stockFilter;
    const matchesActive = activeFilter === "all" || (product.isActive === true).toString() === activeFilter;
    const matchesBestseller = bestsellerFilter === "all" || (product.isBestseller === true).toString() === bestsellerFilter;
    const matchesNew = newFilter === "all" || (product.isNew === true).toString() === newFilter;
    const matchesPlacement = placementFilter === "all"
      || (placementFilter === "pinned" && product.displayOrder > 0)
      || (placementFilter === "unpinned" && product.displayOrder <= 0);
    return matchesSearch && matchesGender && matchesType && matchesSeason && matchesStock && matchesActive && matchesBestseller && matchesNew && matchesPlacement;
  });

  const allFilteredSelected = filteredProducts.length > 0
    && filteredProducts.every((product) => selectedIds.includes(product.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((selected) => selected !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(allFilteredSelected ? [] : filteredProducts.map((product) => product.id));
  };

  const handleTogglePinned = async (product: Product) => {
    setPlacementBusy(product.id);
    try {
      const shouldPin = product.displayOrder <= 0;
      const result = await setProductPinned(product.id, shouldPin);
      if (result.success) {
        toast.success(shouldPin ? `"${product.name}" pinned to top` : `"${product.name}" unpinned`);
        await loadProducts();
      } else {
        toast.error(result.error || 'Error updating placement');
      }
    } catch {
      toast.error('Error updating placement');
    } finally {
      setPlacementBusy(null);
    }
  };

  const handleMovePinned = async (product: Product, direction: 'up' | 'down') => {
    setPlacementBusy(product.id);
    try {
      const result = await movePinnedProduct(product.id, direction);
      if (result.success) {
        await loadProducts();
      } else {
        toast.error(result.error || 'Error reordering product');
      }
    } catch {
      toast.error('Error reordering product');
    } finally {
      setPlacementBusy(null);
    }
  };

  const handleBulkPin = async (pinned: boolean) => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one product');
      return;
    }
    setPlacementBusy('bulk');
    try {
      const result = await setProductsPinned(selectedIds, pinned);
      if (result.success) {
        toast.success(`${result.updated ?? selectedIds.length} product(s) ${pinned ? 'pinned to top' : 'unpinned'}`);
        setSelectedIds([]);
        await loadProducts();
      } else {
        toast.error(result.error || 'Error updating placement');
      }
    } catch {
      toast.error('Error updating placement');
    } finally {
      setPlacementBusy(null);
    }
  };

  const handlePinNewest = async () => {
    const newestUnpinned = filteredProducts
      .filter((product) => product.displayOrder <= 0)
      .slice(0, 10)
      .map((product) => product.id);

    if (newestUnpinned.length === 0) {
      toast.error('No unpinned products to pin');
      return;
    }

    setPlacementBusy('bulk');
    try {
      const result = await setProductsPinned(newestUnpinned, true);
      if (result.success) {
        toast.success(`${result.updated ?? newestUnpinned.length} newest product(s) pinned to top`);
        setSelectedIds([]);
        await loadProducts();
      } else {
        toast.error(result.error || 'Error updating placement');
      }
    } catch {
      toast.error('Error updating placement');
    } finally {
      setPlacementBusy(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(id);
      if (result.success) {
        loadProducts();
      } else {
        alert(result.error || 'Error deleting product');
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const result = await updateProductPartial(product.id, { isActive: !product.isActive });
      if (result.success) {
        toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
        loadProducts();
      } else {
        toast.error(result.error || 'Error toggling status');
      }
    } catch {
      toast.error('Error toggling status');
    }
  };
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Error</h3>
          <p className="text-destructive/80 mt-1">{error}</p>
          <Button onClick={loadProducts} variant="destructive" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk-price">
            <Button variant="outline">
              Bulk Price Update
            </Button>
          </Link>
          <Link href="/admin/products/import">
            <Button variant="outline">
              Import CSV
            </Button>
          </Link>
          <Link href="/admin/products/bulk-upload">
            <Button variant="outline">
              Bulk Upload
            </Button>
          </Link>
          <Button onClick={() => setCreateOpen(true)}>
            Create / Add Product
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(open) => setCreateOpen(open)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Create / Add Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Manual Add
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Fill the detailed product form (name, price, notes, images, SEO fields…).
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/products/perfume/new">
                  <Button variant="outline" className="w-full">+ Perfume</Button>
                </Link>
                <Link href="/admin/products/attar/new">
                  <Button variant="secondary" className="w-full">+ Attar</Button>
                </Link>
              </div>
            </div>
            <div className="border-t border-muted pt-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Bulk Import
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a CSV file to create or update many products at once (matched by slug).
              </p>
              <Link href="/admin/products/bulk-import">
                <Button className="w-full">Upload CSV</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={genderFilter} onValueChange={(v) => v !== null && setGenderFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="unisex">Unisex</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => v !== null && setTypeFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="attar">Attar</SelectItem>
            <SelectItem value="perfume">Perfume</SelectItem>
          </SelectContent>
        </Select>
        <Select value={seasonFilter} onValueChange={(v) => v !== null && setSeasonFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            <SelectItem value="summer">Summer</SelectItem>
            <SelectItem value="winter">Winter</SelectItem>
            <SelectItem value="all season">All Season</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={(v) => v !== null && setStockFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="pre_order">Pre-Order</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={(v) => v !== null && setActiveFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bestsellerFilter} onValueChange={(v) => v !== null && setBestsellerFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Bestseller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={newFilter} onValueChange={(v) => v !== null && setNewFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="New" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
        <Select value={placementFilter} onValueChange={(v) => v !== null && setPlacementFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Placement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Placement</SelectItem>
            <SelectItem value="pinned">Pinned to Top</SelectItem>
            <SelectItem value="unpinned">Normal Order</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handlePinNewest}
          disabled={placementBusy === 'bulk'}
          title="Pin the 10 newest unpinned products (respects the current filters)"
        >
          {placementBusy === 'bulk' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Star className="mr-2 h-4 w-4" />
          )}
          Pin 10 newest
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gold/40 bg-gold/5 px-4 py-3">
          <span className="text-sm font-medium">
            {selectedIds.length} product(s) selected
          </span>
          <Button size="sm" onClick={() => handleBulkPin(true)} disabled={placementBusy === 'bulk'}>
            {placementBusy === 'bulk' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pin selected to top
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkPin(false)} disabled={placementBusy === 'bulk'}>
            Unpin selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} disabled={placementBusy === 'bulk'}>
            Clear
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all filtered products"
                  className="h-4 w-4 accent-[#b6965d]"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.name}`}
                    className="h-4 w-4 accent-[#b6965d]"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelected(product.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {product.productId || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {product.displayOrder > 0 ? (
                      <>
                        <Badge className="bg-gold text-black text-xs whitespace-nowrap">
                          TOP #{product.displayOrder}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={`Move ${product.name} up`}
                          title="Move up"
                          disabled={placementBusy === product.id}
                          onClick={() => handleMovePinned(product, 'up')}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={`Move ${product.name} down`}
                          title="Move down"
                          disabled={placementBusy === product.id}
                          onClick={() => handleMovePinned(product, 'down')}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Normal</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={product.displayOrder > 0 ? `Unpin ${product.name}` : `Pin ${product.name} to top`}
                      title={product.displayOrder > 0 ? 'Unpin' : 'Pin to top'}
                      disabled={placementBusy === product.id}
                      onClick={() => handleTogglePinned(product)}
                    >
                      {placementBusy === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className={`h-4 w-4 ${product.displayOrder > 0 ? 'fill-gold text-gold' : ''}`} />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.type?.toLowerCase().includes('perfume') ? 'default' : 'secondary'} className="text-xs">
                    {product.type || 'Attar'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {product.gender || 'Unisex'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {product.season || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.isActive === false && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                    {product.isFeatured && (
                      <Badge className="text-xs bg-gold">Featured</Badge>
                    )}
                    {product.isNew && (
                      <Badge variant="secondary" className="text-xs">NEW</Badge>
                    )}
                    {product.isBestseller && (
                      <Badge className="text-xs">BEST</Badge>
                    )}
                    {product.stockStatus === 'out_of_stock' && (
                      <Badge variant="destructive" className="text-xs">Out</Badge>
                    )}
                    {product.stockStatus === 'pre_order' && (
                      <Badge variant="secondary" className="text-xs">Pre-Order</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${(product.type || '').toLowerCase().includes('perfume') ? 'perfume' : 'attar'}/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant={product.isActive === false ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
