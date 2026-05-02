import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Dumbbell, LayoutDashboard } from "lucide-react";
import { cart } from "@/store/cart";
import { Link } from "wouter";

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = cart.subscribe(() => setCartCount(cart.getCount()));
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => {
      unsub();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/50 border-b border-yellow-900/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* زر السلة + القائمة الجوالة */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-lg hover:bg-yellow-500/10 transition-colors group"
              aria-label="فتح السلة"
            >
              <ShoppingCart
                className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors"
                strokeWidth={1.8}
              />
              {cartCount > 0 && (
                <span className="cart-badge absolute -top-1 -left-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
              aria-label="فتح القائمة"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>

          {/* القائمة للسطح المكتب */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/admin">
              <span className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-semibold cursor-pointer border border-yellow-500/40 hover:border-yellow-400/70 px-3 py-1.5 rounded-md">
                <LayoutDashboard className="w-3.5 h-3.5" />
                لوحة التحكم
              </span>
            </Link>
            <a
              href="https://maps.app.goo.gl/xucjzoRFYjSK6dUF6?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
            >
              موقعنا
            </a>
            <a
              href="https://www.facebook.com/share/1KTFBn2dV7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
            >
              فيسبوك
            </a>
            <Link href="/">
              <span className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium cursor-pointer">
                المنتجات
              </span>
            </Link>
          </nav>

          {/* الشعار */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div>
                <span className="font-bold text-white text-sm leading-none block text-right">
                  Gold Nutrition
                </span>
                <span className="text-yellow-500 text-xs font-semibold tracking-widest text-right block">
                  Rouiba
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/40 group-hover:shadow-yellow-500/30 transition-shadow">
                <Dumbbell className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* القائمة الجوالة */}
      {mobileOpen && (
        <div className="md:hidden border-t border-yellow-900/30 bg-black/98 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <Link href="/">
              <span
                className="block text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium py-2 cursor-pointer text-right"
                onClick={() => setMobileOpen(false)}
              >
                المنتجات
              </span>
            </Link>
            <a
              href="https://www.facebook.com/share/1KTFBn2dV7/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium py-2 text-right"
              onClick={() => setMobileOpen(false)}
            >
              فيسبوك
            </a>
            <a
              href="https://maps.app.goo.gl/xucjzoRFYjSK6dUF6?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium py-2 text-right"
              onClick={() => setMobileOpen(false)}
            >
              موقعنا
            </a>
            <Link href="/admin">
              <span
                className="flex items-center gap-1.5 justify-end text-yellow-400 text-sm font-semibold py-2 cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                لوحة التحكم
                <LayoutDashboard className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
