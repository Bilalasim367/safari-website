"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (!cancelled && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setImagePreview(category.image || "");
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      });
    } else {
      setEditingCategory(null);
      setImagePreview("");
      setFormData({ name: "", slug: "", description: "", image: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/products';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = editingCategory 
        ? { ...formData, id: editingCategory._id, categorySlug: editingCategory.slug }
        : { ...formData, categorySlug: formData.slug };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchCategories();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => (
          <div 
            key={category._id} 
            className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="relative h-40 bg-muted">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{category.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-muted">
                <span className="text-xs text-muted-foreground capitalize">{category.slug}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(category)}
                    className="h-8 w-8"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category._id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-muted">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h.01M5 11h.01" />
          </svg>
          <p className="text-muted-foreground mb-4">No categories yet</p>
          <Button 
            onClick={() => handleOpenModal()} 
          >
            Add First Category
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image"
              />
              <div 
                onClick={handleImageClick}
                className="border-2 border-dashed border-muted rounded-xl p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                {imagePreview || formData.image ? (
                  <div className="relative w-full h-32">
                    <img 
                      src={imagePreview || formData.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-muted-foreground text-sm">Click to upload</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  setFormData({ name: '', slug: '', description: '', image: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
              >
                {editingCategory ? "Update" : "Add"} Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
