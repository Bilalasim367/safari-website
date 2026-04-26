"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  categorySlug: string;
  size: string;
  fragranceFamily: string;
  inStock: boolean;
  isBestseller: boolean;
  isNew: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    originalPrice: "",
    categorySlug: "men",
    size: "50ml",
    fragranceFamily: "Floral",
    description: "",
    inStock: true,
    isBestseller: false,
    isNew: false,
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = ["men", "women", "unisex"];
  const sizes = ["30ml", "50ml", "100ml"];
  const fragranceFamilies = ["Floral", "Woody", "Oriental", "Fresh"];

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      console.log('Products response:', data);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeader = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.success || data.user.role !== 'admin') {
        window.location.href = '/admin/login';
        return null;
      }
      return res.headers.get('authorization') || '';
    } catch {
      window.location.href = '/admin/login';
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setImagePreview(product.image || "");
      setFormData({
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        originalPrice: String(product.originalPrice || ''),
        categorySlug: product.categorySlug || "men",
        size: product.size || "50ml",
        fragranceFamily: product.fragranceFamily || "Floral",
        description: "",
        inStock: product.inStock ?? true,
        isBestseller: product.isBestseller ?? false,
        isNew: product.isNew ?? false,
        image: product.image || "",
      });
    } else {
      setEditingProduct(null);
      setImagePreview("");
      setFormData({
        name: "",
        slug: "",
        price: "",
        originalPrice: "",
        categorySlug: "men",
        size: "50ml",
        fragranceFamily: "Floral",
        description: "",
        inStock: true,
        isBestseller: false,
        isNew: false,
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(formData.price);
    if (!formData.name || !formData.price || isNaN(priceValue) || !formData.image) {
      alert('Please fill in name, price, and image');
      return;
    }
    
    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price: priceValue,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      categorySlug: formData.categorySlug,
      size: formData.size,
      fragranceFamily: formData.fragranceFamily,
      description: formData.description || `${formData.name} - A luxury fragrance from Safari`,
      image: formData.image,
      images: [formData.image],
      inStock: formData.inStock,
      isBestseller: formData.isBestseller,
      isNew: formData.isNew,
      ...(editingProduct ? { id: editingProduct.id } : {}),
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'safari-admin-api-key-secure-2024'
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      console.log('Save response:', data);
      
      if (data.success) {
        alert(editingProduct ? 'Product updated!' : 'Product created!');
        fetchProducts();
        handleCloseModal();
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
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
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="bg-white rounded-xl shadow-sm p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg mb-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-black">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors rounded-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 text-black px-4 py-3 rounded-lg focus:outline-none focus:border-black min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Product</th>
                <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Category</th>
                <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Price</th>
                <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Stock</th>
                <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Status</th>
                <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image && (
                          <Image src={product.image} alt={product.name} width={56} height={56} className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">{product.name}</p>
                        <p className="text-gray-400 text-sm">{product.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{product.categorySlug}</td>
                  <td className="px-6 py-4">
                    <span className="text-black font-medium">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm ml-2 line-through">${product.originalPrice}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {product.isNew && <span className="px-3 py-1 text-xs rounded-full bg-black text-white font-medium">NEW</span>}
                      {product.isBestseller && <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-black font-medium">BEST</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Category</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                  >
                    {sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 text-sm block mb-2">Fragrance Family</label>
                  <select
                    value={formData.fragranceFamily}
                    onChange={(e) => setFormData({ ...formData, fragranceFamily: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:border-black"
                  >
                    {fragranceFamilies.map((family) => (
                      <option key={family} value={family}>{family}</option>
                    ))}
                  </select>
                </div>
              </div>

<div>
                  <label className="text-gray-700 text-sm block mb-2">Product Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div 
                    onClick={handleImageClick}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {imagePreview || formData.image ? (
                      <div className="relative w-full max-w-xs mx-auto">
                        <img 
                          src={imagePreview || formData.image} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <p className="text-gray-500 text-sm mt-2">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Click to upload image</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Best Seller</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 border border-gray-200 py-3 text-black hover:bg-gray-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-black text-white py-3 font-medium hover:bg-gray-800 rounded-lg transition-colors">
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}