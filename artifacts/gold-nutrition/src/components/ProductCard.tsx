import { useState } from "react";
import { ShoppingCart, Check, Tag } from "lucide-react";
import { Product } from "@/store/products";
import { cart } from "@/store/cart";

interface ProductCardProps {
  product: Product;
  onCartOpen: () => void;
}

export default function ProductCard({ product, onCartOpen }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    cart.addItem(product);
    setAdded(true);
    onCartOpen();
    setTimeout(() => setAdded(false), 1800);
  };

  const formatPrice = (p: number) => `${p.toLocaleString("fr-DZ")} DA`;

  return (
    <div className="product-card rounded-2xl overflow-hidden animate-fade-up flex flex-col">
      {/* Image */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=60";
          }}
        />
        {/* Category badge */}
        <span className="category-badge absolute top-3 left-3 px-2.5 py-1 rounded-full font-semibold">
          {product.category}
        </span>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider border border-red-500/50 px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-white font-bold text-base leading-snug">
            {product.name}
          </h3>
          {product.nameAr && (
            <p className="text-gray-500 text-xs mt-0.5" dir="rtl">
              {product.nameAr}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-yellow-400 font-extrabold text-lg">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              added
                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                : product.inStock
                ? "btn-gold"
                : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
