'use client';

import React, { useState } from "react";
import Link from "next/link";
import { getAdminProducts, createProduct, updateProduct, deleteProduct, updateProductPartial } from "../actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    originalPrice: "",
    categorySlug: "men" as string | null,
    size: "50ml",
    inStock: true,
    isBestseller: false,
    isNew: false,
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sizePrices, setSizePrices] = useState([
    { size: "30ml", price: "", originalPrice: "" },
    { size: "50ml", price: "", originalPrice: "" },
    { size: "100ml", price: "", originalPrice: "" },
  ]);

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

  const defaultSizePrices = [
    { size: "30ml", price: "", originalPrice: "" },
    { size: "50ml", price: "", originalPrice: "" },
    { size: "100ml", price: "", originalPrice: "" },
  ];

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        originalPrice: String(product.originalPrice || ''),
        categorySlug: product.categorySlug || "men",
        size: product.size || "50ml",
        inStock: product.inStock ?? true,
        isBestseller: product.isBestseller ?? false,
        isNew: product.isNew ?? false,
        image: product.image || "",
      });
      const parsed = (() => {
        try { return JSON.parse(product.sizePrices || '[]'); } catch { return []; }
      })();
      const filled = defaultSizePrices.map((dsp) => {
        const match = parsed.find((p: { size: string }) => p.size === dsp.size);
        return match
          ? { size: match.size, price: String(match.price ?? ''), originalPrice: String(match.originalPrice ?? '') }
          : { ...dsp };
      });
      setSizePrices(filled);
      setImagePreview(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        slug: "",
        price: "",
        originalPrice: "",
        categorySlug: "men",
        size: "50ml",
        inStock: true,
        isBestseller: false,
        isNew: false,
        image: "",
      });
      setSizePrices(defaultSizePrices.map(s => ({ ...s })));
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();

      if (data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
      }
    } catch {
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      const parsedSizePrices = sizePrices.map((sp) => ({
        size: sp.size,
        price: Number(sp.price),
        originalPrice: sp.originalPrice ? Number(sp.originalPrice) : null,
      }));

      const payload = {
        name: formData.name,
        slug: formData.slug,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        image: formData.image,
        categorySlug: formData.categorySlug || undefined,
        size: formData.size,
        sizePrices: parsedSizePrices,
        inStock: formData.inStock,
        isBestseller: formData.isBestseller,
        isNew: formData.isNew,
      };

    try {
      let result;

      if (editingProduct) {
        result = await updateProduct(editingProduct.id, payload);
      } else {
        result = await createProduct(payload);
      }

      if (result.success) {
        handleCloseModal();
        loadProducts();
      } else {
        toast.error(result.error || 'Error saving product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product');
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
          <Link href="/admin/products/bulk-upload">
            <Button variant="outline">
              Bulk Upload
            </Button>
          </Link>
          <Button onClick={() => handleOpenModal()}>
            Add Product
          </Button>
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
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>
                      Edit
                    </Button>
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

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : formData.image ? (
                    <img src={formData.image} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {formData.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image: '' }));
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categorySlug}
                onValueChange={(value) => setFormData({ ...formData, categorySlug: value || null })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Default Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => setFormData({ ...formData, size: value || "50ml" })}
              >
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30ml">30ml</SelectItem>
                  <SelectItem value="50ml">50ml</SelectItem>
                  <SelectItem value="100ml">100ml</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold">Size Pricing</Label>
              <div className="grid grid-cols-3 gap-3">
                {sizePrices.map((sp, i) => (
                  <div key={sp.size} className="space-y-2 p-3 border rounded-md">
                    <Label className="text-xs font-medium">{sp.size}</Label>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={sp.price}
                      onChange={(e) => {
                        const updated = [...sizePrices];
                        updated[i] = { ...updated[i], price: e.target.value };
                        setSizePrices(updated);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Original"
                      value={sp.originalPrice}
                      onChange={(e) => {
                        const updated = [...sizePrices];
                        updated[i] = { ...updated[i], originalPrice: e.target.value };
                        setSizePrices(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked as boolean })}
                />
                <Label htmlFor="stock" className="text-sm font-normal">In Stock</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.isBestseller}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBestseller: checked as boolean })}
                />
                <Label className="text-sm font-normal">Bestseller</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked as boolean })}
                />
                <Label className="text-sm font-normal">New</Label>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    slug: "",
                    price: "",
                    originalPrice: "",
                    categorySlug: "men",
                    size: "50ml",
                    inStock: true,
                    isBestseller: false,
                    isNew: false,
                    image: "",
                  });
                  setSizePrices(defaultSizePrices.map(s => ({ ...s })));
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
