import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Dumbbell,
  Edit,
  Save,
  X,
} from "lucide-react";
import {
  loadProducts,
  saveProducts,
  addProduct,
  deleteProduct,
  Product,
  CATEGORIES,
} from "@/store/products";
import { Link } from "wouter";

/* Notify the store page to reload */
function notifyUpdate() {
  window.dispatchEvent(new Event("gnr-products-updated"));
  window.dispatchEvent(new Event("storage"));
}

/* Form state for adding a product */
const EMPTY_FORM = {
  name: "",
  nameAr: "",
  category: "Protein",
  price: "",
  image: "",
  description: "",
  inStock: true,
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const reload = () => {
    setProducts(loadProducts());
  };

  useEffect(() => {
    reload();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price <= 0) {
      showToast("Please fill in name and a valid price.", "error");
      return;
    }

    if (editId) {
      /* Edit existing */
      const all = loadProducts();
      const idx = all.findIndex((p) => p.id === editId);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          name: form.name.trim(),
          nameAr: form.nameAr.trim(),
          category: form.category,
          price,
          image: form.image.trim() || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
          description: form.description.trim(),
          inStock: form.inStock,
        };
        saveProducts(all);
      }
      setEditId(null);
      showToast("Product updated successfully.");
    } else {
      addProduct({
        name: form.name.trim(),
        nameAr: form.nameAr.trim(),
        category: form.category,
        price,
        image:
          form.image.trim() ||
          "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
        description: form.description.trim(),
        inStock: form.inStock,
      });
      showToast("Product added successfully.");
    }

    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    reload();
    notifyUpdate();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    reload();
    notifyUpdate();
    showToast("Product deleted.");
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      nameAr: product.nameAr || "",
      category: product.category,
      price: String(product.price),
      image: product.image,
      description: product.description,
      inStock: product.inStock,
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStock = (id: string) => {
    const all = loadProducts();
    const idx = all.findIndex((p) => p.id === id);
    if (idx !== -1) {
      all[idx].inStock = !all[idx].inStock;
      saveProducts(all);
      reload();
      notifyUpdate();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-2xl border transition-all ${
            toast.type === "success"
              ? "bg-green-900/90 border-green-600/50 text-green-300"
              : "bg-red-900/90 border-red-600/50 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/40">
              <Dumbbell className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">
                Admin Dashboard
              </h1>
              <p className="text-yellow-600 text-xs font-semibold tracking-wider uppercase">
                Gold Nutrition Rouiba
              </p>
            </div>
          </div>

          <Link href="/">
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              Store
            </button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Products", value: products.length },
            {
              label: "In Stock",
              value: products.filter((p) => p.inStock).length,
            },
            {
              label: "Out of Stock",
              value: products.filter((p) => !p.inStock).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="admin-card rounded-xl px-4 py-4 text-center"
            >
              <span className="text-yellow-400 text-2xl font-black block">
                {value}
              </span>
              <span className="text-gray-500 text-xs mt-0.5 block">{label}</span>
            </div>
          ))}
        </div>

        {/* Add/Edit form toggle button */}
        {!showForm ? (
          <button
            onClick={() => {
              setForm({ ...EMPTY_FORM });
              setEditId(null);
              setShowForm(true);
            }}
            className="btn-gold flex items-center gap-2 px-5 py-3 rounded-xl text-sm mb-8"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        ) : (
          /* Add/Edit form */
          <form
            onSubmit={handleSubmit}
            className="admin-card rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-base">
                {editId ? "Edit Product" : "New Product"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm({ ...EMPTY_FORM });
                }}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Product Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Whey Protein Gold"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Arabic Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="اسم المنتج بالعربية"
                  dir="rtl"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm appearance-none"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Price (DA) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 3500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... (leave blank for default)"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short product description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.inStock}
                    onChange={(e) =>
                      setForm({ ...form, inStock: e.target.checked })
                    }
                  />
                  <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-yellow-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
                </label>
                <span className="text-gray-300 text-sm">
                  {form.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm"
              >
                <Save className="w-4 h-4" />
                {editId ? "Save Changes" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm({ ...EMPTY_FORM });
                }}
                className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Products table */}
        <div className="admin-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-yellow-900/20 flex items-center gap-2">
            <Package className="w-4 h-4 text-yellow-500" />
            <h2 className="text-white font-bold text-sm">
              Products ({products.length})
            </h2>
          </div>

          <div className="divide-y divide-yellow-900/15">
            {products.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="w-10 h-10 text-yellow-900/40 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products yet. Add your first product above.</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&q=50";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-yellow-500 text-xs font-bold">
                        {product.price.toLocaleString("fr-DZ")} DA
                      </span>
                      <span className="category-badge px-2 py-0.5 rounded-full text-[10px]">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Stock toggle */}
                  <button
                    onClick={() => handleToggleStock(product.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      product.inStock
                        ? "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                        : "text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out"}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg hover:bg-yellow-500/10 text-gray-500 hover:text-yellow-400 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-gray-700 text-xs text-center mt-8">
          All changes are saved automatically to LocalStorage and reflected on the store immediately.
        </p>
      </div>
    </div>
  );
}
