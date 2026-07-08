'use client';

import React, { useState } from "react";
import Link from "next/link";
import { getAdminProducts, deleteProduct, updateProductPartial } from "../actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  price50mlPhysical?: number | null;
  price50mlOnline?: number | null;
  productId?: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    const result = await getAdminProducts();

    if (result.error) {
      setError(result.error);
      if (result.error === 'Unauthorized' || result.error === 'Not authenticated') {
        window.location.href = '/admin/login';
      }
    } else {
      setProducts(result.products || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      const result = await getAdminProducts();

      if (result.error) {
        setError(result.error);
        if (result.error === 'Unauthorized' || result.error === 'Not authenticated') {
          window.location.href = '/admin/login';
        }
      } else {
        setProducts(result.products || []);
      }
      setLoading(false);
    })();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || (product.gender || "").toLowerCase() === genderFilter;
    const matchesSeason = seasonFilter === "all" || (product.season || "").toLowerCase() === seasonFilter;
    const matchesStock = stockFilter === "all" || (product.stockStatus || (product.inStock ? "in_stock" : "out_of_stock")) === stockFilter;
    const matchesActive = activeFilter === "all" || (product.isActive === true).toString() === activeFilter;
    return matchesSearch && matchesGender && matchesSeason && matchesStock && matchesActive;
  });

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
          <Link href="/admin/products/bulk-upload">
            <Button variant="outline">
              Bulk Upload
            </Button>
          </Link>
          <Link href="/admin/products/perfume/new">
            <Button>
              + Perfume
            </Button>
          </Link>
          <Link href="/admin/products/attar/new">
            <Button variant="secondary">
              + Attar
            </Button>
          </Link>
        </div>
      </div>

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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>50ml Physical</TableHead>
              <TableHead>50ml Online</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">
                  {product.productId || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
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
                <TableCell className="font-mono text-sm">
                  {product.price50mlPhysical != null ? `PKR ${product.price50mlPhysical}` : (product.inStock ? <span className="text-muted-foreground">—</span> : '—')}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {product.price50mlOnline != null ? `PKR ${product.price50mlOnline}` : '—'}
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
