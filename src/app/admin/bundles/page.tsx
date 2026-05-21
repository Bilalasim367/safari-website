'use client';

import React, { useState } from "react";
import { getAdminBundles, createBundle, updateBundle, deleteBundle } from "../actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  save: string | null;
  size: string | null;
  inStock: boolean;
  isActive: boolean;
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    save: "",
    size: "",
    inStock: true,
    isActive: true,
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadBundles = async () => {
    setLoading(true);
    setError("");

    const result = await getAdminBundles();

    if (result.error) {
      setError(result.error);
      if (result.error === 'Unauthorized' || result.error === 'Not authenticated') {
        window.location.href = '/admin/login';
      }
    } else {
      setBundles(result.bundles || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      const result = await getAdminBundles();

      if (result.error) {
        setError(result.error);
      } else {
        setBundles(result.bundles || []);
      }
      setLoading(false);
    })();
  }, []);

  const filteredBundles = bundles.filter((bundle) =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name,
        slug: bundle.slug,
        description: "",
        price: String(bundle.price),
        originalPrice: String(bundle.originalPrice || ''),
        save: bundle.save || "",
        size: bundle.size || "",
        inStock: bundle.inStock ?? true,
        isActive: bundle.isActive ?? true,
        image: bundle.image || "",
      });
      setImagePreview(null);
    } else {
      setEditingBundle(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        originalPrice: "",
        save: "",
        size: "",
        inStock: true,
        isActive: true,
        image: "",
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBundle(null);
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

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      image: formData.image || undefined,
      save: formData.save || undefined,
      size: formData.size || undefined,
      inStock: formData.inStock,
      isActive: formData.isActive,
    };

    try {
      let result;

      if (editingBundle) {
        result = await updateBundle(editingBundle.id, payload);
      } else {
        result = await createBundle(payload);
      }

      if (result.success) {
        handleCloseModal();
        loadBundles();
      } else {
        alert(result.error || 'Error saving bundle');
      }
    } catch (err) {
      console.error('Error saving bundle:', err);
      alert('Error saving bundle');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bundle?")) {
      const result = await deleteBundle(id);
      if (result.success) {
        loadBundles();
      } else {
        alert(result.error || 'Error deleting bundle');
      }
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
          <Button onClick={loadBundles} variant="destructive" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Bundles</h1>
        <Button onClick={() => handleOpenModal()}>
          Add Bundle
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search bundles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell>
                  <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                    {bundle.image ? (
                      <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">No img</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{bundle.name}</TableCell>
                <TableCell>${bundle.price}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!bundle.isActive && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {!bundle.inStock && bundle.isActive && (
                      <Badge variant="secondary">Out</Badge>
                    )}
                    {bundle.save && (
                      <Badge>Save {bundle.save}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(bundle)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bundle.id)}
                    >
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
              {editingBundle ? 'Edit Bundle' : 'Add Bundle'}
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="save">Save Badge (e.g. &quot;28%&quot;)</Label>
                <Input
                  id="save"
                  type="text"
                  value={formData.save}
                  onChange={(e) => setFormData({ ...formData, save: e.target.value })}
                  placeholder="28%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size Info (e.g. &quot;3 x 30ml&quot;)</Label>
                <Input
                  id="size"
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="3 x 30ml"
                />
              </div>
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
                    onClick={() => document.getElementById('bundle-image-upload')?.click()}
                  >
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    id="bundle-image-upload"
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
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked as boolean })}
                />
                <Label className="text-sm font-normal">In Stock</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <Label className="text-sm font-normal">Active</Label>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingBundle ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
