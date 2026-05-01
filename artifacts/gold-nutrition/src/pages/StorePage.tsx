import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Zap, Award, TrendingUp, ChevronDown } from "lucide-react";
import { Product, CATEGORIES } from "@/store/products";
import { subscribeProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

interface StorePageProps {
  onCartOpen: () => void;
}

export default function StorePage({ onCartOpen }: StorePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "الكل") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, activeCategory, sortBy]);

  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.inStock).length;
    return { total: products.length, inStock };
  }, [products]);

  return (
    <main className="min-h-screen bg-[#0d0d0d]" dir="rtl">
      {/* قسم الهيرو */}
      <section className="hero-bg pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* شارة */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Zap className="w-3.5 h-3.5" />
            المتجر الأول للمكملات في رويبة
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
            ارتقِ بمستواك{" "}
            <span className="text-gold-gradient">الرياضي</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            مكملات غذائية ممتازة للرياضيين الجادين. جودة تثق بها، نتائج ستشعر بها.
          </p>

          {/* إحصائيات */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-center mb-10">
            <div>
              <span className="text-yellow-400 text-2xl font-black block">
                {stats.total}+
              </span>
              <span className="text-gray-500 text-xs uppercase tracking-wider">
                منتج
              </span>
            </div>
            <div className="w-px h-8 bg-yellow-900/50" />
            <div>
              <span className="text-yellow-400 text-2xl font-black block">
                {stats.inStock}
              </span>
              <span className="text-gray-500 text-xs uppercase tracking-wider">
                متاح
              </span>
            </div>
            <div className="w-px h-8 bg-yellow-900/50" />
            <div>
              <span className="text-yellow-400 text-2xl font-black block">
                100%
              </span>
              <span className="text-gray-500 text-xs uppercase tracking-wider">
                أصلي
              </span>
            </div>
          </div>

          {/* بحث */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="search"
              placeholder="ابحث عن المنتجات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gold-input w-full pr-11 pl-4 py-3.5 rounded-xl text-sm"
            />
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* الفلاتر والمنتجات */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* صف الفلاتر */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* ترتيب */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="gold-input appearance-none pr-3 pl-8 py-2 rounded-lg text-xs cursor-pointer"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
            </select>
            <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>

          {/* أزرار الفئات */}
          <div className="flex flex-wrap gap-2 justify-end">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-yellow-500 text-black shadow-md shadow-yellow-900/40"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* معلومات النتائج */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-500 text-xs">
            {filtered.length} منتج
          </span>
          <Filter className="w-3.5 h-3.5 text-yellow-600" />
        </div>

        {/* شبكة المنتجات */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp className="w-12 h-12 text-yellow-900/50 mb-3" />
            <p className="text-gray-400 font-semibold">لم يتم العثور على منتجات</p>
            <p className="text-gray-600 text-sm mt-1">
              جرب بحثاً مختلفاً أو فئة أخرى
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("الكل");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors text-sm"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCartOpen={onCartOpen}
              />
            ))}
          </div>
        )}

        {/* ميزات */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Award,
              title: "100% أصلي",
              desc: "جميع المنتجات معتمدة ومصادرها موثوقة.",
            },
            {
              icon: Zap,
              title: "توصيل سريع",
              desc: "شحن في نفس اليوم للطلبات قبل الساعة 4 مساءً.",
            },
            {
              icon: TrendingUp,
              title: "نصيحة خبير",
              desc: "لست متأكداً مما تختار؟ اتصل بنا — نحن هنا لمساعدتك.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-yellow-900/20 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{title}</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
