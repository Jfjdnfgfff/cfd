import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, Plus, Trash2,
  Edit, Save, X, CheckCircle, AlertTriangle, Eye, ChevronDown,
  TrendingUp, Lock, Dumbbell, ChevronLeft, Menu, RefreshCw,
  Circle, ArrowUpRight, Wifi, WifiOff,
} from "lucide-react";
import { Link } from "wouter";
import {
  subscribeProducts, subscribeOrders, dbAddProduct,
  dbUpdateProduct, dbDeleteProduct, Order,
} from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Product, CATEGORIES, DEFAULT_PRODUCTS } from "@/store/products";

/* ─── كلمة السر ─── */
const ADMIN_PASS =
  import.meta.env.VITE_ADMIN_PASSWORD || "gold2024";

/* ─── نموذج فارغ ─── */
const EMPTY_FORM = {
  name: "", category: "بروتين", price: "",
  image: "", description: "", inStock: true,
};

type Tab = "dashboard" | "products" | "add" | "orders";

/* ─── ألوان حالة الطلب ─── */
const STATUS_LABELS: Record<Order["status"], { ar: string; cls: string }> = {
  pending:   { ar: "قيد الانتظار",  cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  confirmed: { ar: "مؤكد",          cls: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  delivered: { ar: "تم التوصيل",    cls: "text-green-400 bg-green-500/10 border-green-500/30" },
  cancelled: { ar: "ملغى",          cls: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export default function AdminPage() {
  /* ─── المصادقة ─── */
  const [authed, setAuthed] = useState(() =>
    sessionStorage.getItem("gnr_admin_authed") === "1"
  );
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);

  /* ─── الحالة العامة ─── */
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const firebaseOk = isFirebaseConfigured();

  /* ─── نموذج المنتج ─── */
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* ─── اشتراكات قاعدة البيانات ─── */
  useEffect(() => {
    if (!authed) return;
    const unsubP = subscribeProducts((list) => {
      setProducts(list);
      setLoading(false);
    });
    const unsubO = subscribeOrders(setOrders);
    return () => { unsubP(); unsubO(); };
  }, [authed]);

  /* ─── إشعار ─── */
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ─── تسجيل الدخول ─── */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      sessionStorage.setItem("gnr_admin_authed", "1");
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
      setPassInput("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("gnr_admin_authed");
    setAuthed(false);
  };

  /* ─── حفظ المنتج ─── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price <= 0) {
      showToast("يرجى إدخال الاسم والسعر بشكل صحيح.", "error");
      return;
    }
    setSaving(true);
    const data = {
      name: form.name.trim(),
      category: form.category,
      price,
      image: form.image.trim() || DEFAULT_PRODUCTS[0].image,
      description: form.description.trim(),
      inStock: form.inStock,
    };
    try {
      if (editId) {
        await dbUpdateProduct(editId, data);
        showToast("تم تحديث المنتج بنجاح.");
      } else {
        await dbAddProduct(data);
        showToast("تمت إضافة المنتج بنجاح.");
      }
      setForm({ ...EMPTY_FORM });
      setEditId(null);
      setTab("products");
    } catch {
      showToast("حدث خطأ، حاول مجدداً.", "error");
    }
    setSaving(false);
  };

  /* ─── حذف منتج ─── */
  const handleDelete = async (id: string) => {
    try {
      await dbDeleteProduct(id);
      setDeleteConfirm(null);
      showToast("تم حذف المنتج.");
    } catch {
      showToast("فشل الحذف.", "error");
    }
  };

  /* ─── تعديل ─── */
  const startEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, price: String(p.price),
               image: p.image, description: p.description, inStock: p.inStock });
    setEditId(p.id);
    setTab("add");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const statsCards = [
    { label: "إجمالي المنتجات", value: products.length, icon: Package, color: "yellow" },
    { label: "متاح", value: products.filter((p) => p.inStock).length, icon: TrendingUp, color: "green" },
    { label: "إجمالي الطلبات", value: orders.length, icon: ShoppingBag, color: "blue" },
    { label: "طلبات اليوم", value: orders.filter((o) => {
        const d = new Date(o.createdAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length, icon: ArrowUpRight, color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    green:  "text-green-400 bg-green-500/10 border-green-500/20",
    blue:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  /* ============================================================
     شاشة تسجيل الدخول
  ============================================================ */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4" dir="rtl">
        <div className="w-full max-w-sm">
          {/* الشعار */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-2xl shadow-yellow-900/50 mb-4">
              <Dumbbell className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-white font-black text-2xl">غولد نيوتريشن</h1>
            <p className="text-yellow-500 text-xs tracking-widest font-semibold mt-0.5">لوحة التحكم — رويبة</p>
          </div>

          <form onSubmit={handleLogin} className="admin-card rounded-2xl p-6 shadow-2xl border border-yellow-900/30">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-yellow-400" />
              <p className="text-gray-300 text-sm font-medium">أدخل كلمة المرور للدخول</p>
            </div>

            <input
              type="password"
              placeholder="كلمة المرور"
              value={passInput}
              onChange={(e) => { setPassInput(e.target.value); setPassError(false); }}
              className={`gold-input w-full px-4 py-3 rounded-xl text-center text-sm tracking-widest mb-3 ${
                passError ? "border-red-500/60" : ""
              }`}
              autoFocus
            />
            {passError && (
              <p className="text-red-400 text-xs text-center mb-3">كلمة المرور غير صحيحة</p>
            )}
            <button type="submit" className="btn-gold w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              دخول
            </button>

            <Link href="/">
              <p className="text-gray-600 text-xs text-center mt-4 hover:text-gray-400 cursor-pointer transition-colors">
                العودة للمتجر
              </p>
            </Link>
          </form>
        </div>
      </div>
    );
  }

  /* ============================================================
     الواجهة الرئيسية
  ============================================================ */
  const navItems: { id: Tab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "الرئيسية" },
    { id: "products",  icon: Package,         label: "المنتجات" },
    { id: "add",       icon: Plus,            label: editId ? "تعديل منتج" : "إضافة منتج" },
    { id: "orders",    icon: ShoppingBag,     label: "الطلبات" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" dir="rtl">
      {/* ─── الشريط الجانبي ─── */}
      <>
        {/* طبقة التعتيم على الجوال */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 right-0 h-full w-64 bg-[#0d0d0d] border-l border-yellow-900/25 z-40 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          {/* رأس الشريط */}
          <div className="px-5 py-5 border-b border-yellow-900/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/40 flex-shrink-0">
                <Dumbbell className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">غولد نيوتريشن</p>
                <p className="text-yellow-500 text-xs font-semibold mt-0.5">رويبة</p>
              </div>
            </div>

            {/* حالة Firebase */}
            <div className={`flex items-center gap-1.5 mt-3 text-xs font-medium ${
              firebaseOk ? "text-green-400" : "text-yellow-600"
            }`}>
              {firebaseOk
                ? <><Wifi className="w-3 h-3" /> متصل بـ Firebase</>
                : <><WifiOff className="w-3 h-3" /> وضع غير متصل (LocalStorage)</>
              }
            </div>
          </div>

          {/* روابط التنقل */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-right ${
                  tab === id
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {id === "orders" && orders.filter((o) => o.status === "pending").length > 0 && (
                  <span className="cart-badge mr-auto">
                    {orders.filter((o) => o.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* روابط سفلية */}
          <div className="px-3 py-4 border-t border-yellow-900/20 space-y-2">
            <Link href="/">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                العودة للمتجر
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </aside>
      </>

      {/* ─── المحتوى الرئيسي ─── */}
      <main className="flex-1 md:mr-64 min-h-screen flex flex-col">
        {/* شريط أعلوي */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-yellow-900/20 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">
              {navItems.find((n) => n.id === tab)?.label}
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 text-yellow-500 animate-spin" />}
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* إشعار */}
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-2xl border ${
            toast.type === "success"
              ? "bg-green-900/95 border-green-600/50 text-green-300"
              : "bg-red-900/95 border-red-600/50 text-red-300"
          }`}>
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4" />
              : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        <div className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto">

          {/* ===== TAB: لوحة التحكم ===== */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* بطاقات الإحصائيات */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statsCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`admin-card rounded-2xl p-4 border ${colorMap[color].split(" ").slice(2).join(" ")}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color].split(" ").slice(1, 3).join(" ")}`}>
                      <Icon className={`w-4 h-4 ${colorMap[color].split(" ")[0]}`} />
                    </div>
                    <p className={`text-2xl font-black ${colorMap[color].split(" ")[0]}`}>
                      {value}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* أحدث الطلبات */}
              <div className="admin-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-yellow-900/20 flex items-center justify-between">
                  <button
                    onClick={() => setTab("orders")}
                    className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors"
                  >
                    عرض الكل
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">أحدث الطلبات</h3>
                    <ShoppingBag className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
                {orders.slice(0, 5).length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-600 text-sm">
                    لا توجد طلبات بعد
                  </div>
                ) : (
                  <div className="divide-y divide-yellow-900/10">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_LABELS[o.status].cls}`}>
                          {STATUS_LABELS[o.status].ar}
                        </span>
                        <div className="text-right flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {o.firstName} {o.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">{o.wilaya} — {o.baladiya}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-yellow-400 text-sm font-bold">
                            {o.total.toLocaleString("fr-DZ")} دج
                          </p>
                          <p className="text-gray-600 text-xs">
                            {new Date(o.createdAt).toLocaleDateString("ar-DZ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* أحدث المنتجات */}
              <div className="admin-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-yellow-900/20 flex items-center justify-between">
                  <button onClick={() => setTab("products")} className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors">
                    عرض الكل
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">المنتجات</h3>
                    <Package className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                  {products.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/3 border border-yellow-900/15">
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                        <p className="text-yellow-400 text-xs font-bold">{p.price.toLocaleString("fr-DZ")} دج</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCTS[0].image; }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: المنتجات ===== */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setForm({ ...EMPTY_FORM }); setEditId(null); setTab("add"); }}
                  className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منتج
                </button>
                <h2 className="text-white font-bold text-base">
                  المنتجات ({products.length})
                </h2>
              </div>

              <div className="admin-card rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="py-16 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري التحميل...
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-16 text-center text-gray-500 text-sm">
                    لا توجد منتجات بعد
                  </div>
                ) : (
                  <div className="divide-y divide-yellow-900/10">
                    {products.map((p) => (
                      <div key={p.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                        {/* أزرار */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(p.id)}
                                className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">تأكيد</button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300">إلغاء</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(p.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => startEdit(p)}
                            className="p-2 rounded-lg hover:bg-yellow-500/10 text-gray-600 hover:text-yellow-400 transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* حالة */}
                        <button
                          onClick={() => dbUpdateProduct(p.id, { inStock: !p.inStock })}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 transition-colors ${
                            p.inStock
                              ? "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                              : "text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                          }`}
                        >
                          {p.inStock ? "متاح" : "نفذ"}
                        </button>

                        {/* المعلومات */}
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                          <div className="flex items-center justify-end gap-2 mt-0.5">
                            <span className="category-badge px-2 py-0.5 rounded-full text-[10px]">{p.category}</span>
                            <span className="text-yellow-500 text-xs font-bold">{p.price.toLocaleString("fr-DZ")} دج</span>
                          </div>
                        </div>

                        {/* الصورة */}
                        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCTS[0].image; }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: إضافة / تعديل منتج ===== */}
          {tab === "add" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ─── النموذج ─── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { setTab("products"); setEditId(null); setForm({ ...EMPTY_FORM }); }}
                    className="text-gray-500 hover:text-gray-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-base">
                    {editId ? "تعديل المنتج" : "إضافة منتج جديد"}
                  </h2>
                </div>

                <form onSubmit={handleSave} className="admin-card rounded-2xl p-5 space-y-4">
                  {/* الاسم */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">اسم المنتج *</label>
                    <input required type="text" placeholder="مثال: واي بروتين جولد"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="gold-input w-full px-3 py-2.5 rounded-lg text-sm" />
                  </div>

                  {/* الفئة */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">الفئة *</label>
                    <div className="relative">
                      <select value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="gold-input w-full px-3 py-2.5 rounded-lg text-sm appearance-none">
                        {CATEGORIES.filter((c) => c !== "الكل").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* السعر */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">السعر (دج) *</label>
                    <input required type="number" min="0" step="100" placeholder="مثال: 3500"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="gold-input w-full px-3 py-2.5 rounded-lg text-sm" />
                  </div>

                  {/* رابط الصورة */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">
                      رابط الصورة
                      <span className="text-gray-600 mr-1">(URL)</span>
                    </label>
                    <input type="url" placeholder="https://..."
                      value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="gold-input w-full px-3 py-2.5 rounded-lg text-sm" />
                  </div>

                  {/* الوصف */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">الوصف</label>
                    <textarea rows={2} placeholder="وصف قصير للمنتج..."
                      value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="gold-input w-full px-3 py-2.5 rounded-lg text-sm resize-none" />
                  </div>

                  {/* المخزون */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer"
                        checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
                      <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-yellow-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:-translate-x-5" />
                    </label>
                    <span className="text-gray-300 text-sm">
                      {form.inStock ? "متاح في المخزون" : "نفذ المخزون"}
                    </span>
                  </div>

                  <button type="submit" disabled={saving}
                    className="btn-gold w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                      : <><Save className="w-4 h-4" />{editId ? "حفظ التعديلات" : "إضافة المنتج"}</>}
                  </button>
                </form>
              </div>

              {/* ─── المعاينة المباشرة ─── */}
              <div>
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <h2 className="text-white font-bold text-base">معاينة المنتج</h2>
                  <Eye className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="product-card rounded-2xl overflow-hidden max-w-xs mr-auto">
                  <div className="relative h-52 overflow-hidden bg-gray-900">
                    {form.image ? (
                      <img src={form.image} alt="معاينة"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCTS[0].image; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-700" />
                      </div>
                    )}
                    <span className="category-badge absolute top-3 right-3 px-2.5 py-1 rounded-full font-semibold">
                      {form.category || "الفئة"}
                    </span>
                    {!form.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm border border-red-500/50 px-3 py-1 rounded">نفذ المخزون</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-base">
                      {form.name || "اسم المنتج"}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {form.description || "وصف المنتج سيظهر هنا"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <button className="btn-gold flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold">
                        أضف
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <span className="text-yellow-400 font-extrabold text-lg">
                        {form.price ? `${Number(form.price).toLocaleString("fr-DZ")} دج` : "0 دج"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-xs text-center mt-4">
                  هذا ما سيراه الزبون في المتجر
                </p>
              </div>
            </div>
          )}

          {/* ===== TAB: الطلبات ===== */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <h2 className="text-white font-bold text-base">
                  الطلبات ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="admin-card rounded-2xl py-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-yellow-900/40 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">لا توجد طلبات بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="admin-card rounded-2xl p-4">
                      {/* رأس الطلب */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <select
                            value={o.status}
                            onChange={(e) => dbUpdateProduct /* reuse pattern — actually call orders */ }
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border appearance-none cursor-pointer bg-transparent ${STATUS_LABELS[o.status].cls}`}
                            onClick={(e) => e.stopPropagation()}
                            onChange={async (e) => {
                              const { dbUpdateOrderStatus } = await import("@/lib/db");
                              await dbUpdateOrderStatus(o.id, e.target.value as Order["status"]);
                            }}
                          >
                            {(Object.keys(STATUS_LABELS) as Order["status"][]).map((s) => (
                              <option key={s} value={s} className="bg-gray-900 text-white">
                                {STATUS_LABELS[s].ar}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-base">
                            {o.firstName} {o.lastName}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {o.wilaya} — {o.baladiya}
                          </p>
                          <a href={`tel:${o.phone}`}
                            className="text-yellow-400 text-xs font-medium hover:text-yellow-300 transition-colors">
                            📞 {o.phone}
                          </a>
                        </div>
                      </div>

                      {/* عناصر الطلب */}
                      <div className="bg-white/3 rounded-xl p-3 space-y-1.5 mb-3 border border-yellow-900/10">
                        {o.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-yellow-400 font-bold">
                              {(item.price * item.qty).toLocaleString("fr-DZ")} دج
                            </span>
                            <span className="text-gray-300">
                              {item.name} × {item.qty}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* المجموع + التاريخ */}
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs">
                          {new Date(o.createdAt).toLocaleString("ar-DZ")}
                        </p>
                        <p className="text-yellow-400 font-black text-base">
                          {o.total.toLocaleString("fr-DZ")} دج
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
