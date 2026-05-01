import { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, MessageCircle, Phone } from "lucide-react";
import { cart, CartItem } from "@/store/cart";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const update = () => {
      setItems(cart.getItems());
      setTotal(cart.getTotal());
    };
    update();
    return cart.subscribe(update);
  }, []);

  const formatPrice = (p: number) => `${p.toLocaleString("fr-DZ")} DA`;

  const handleWhatsApp = () => {
    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const itemsText = items
      .map(
        (i) =>
          `• ${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `🛒 *NEW ORDER - Gold Nutrition Rouiba*\n\n` +
        `👤 Name: ${customerName}\n` +
        `📞 Phone: ${customerPhone || "Not provided"}\n` +
        `📍 Address: ${customerAddress || "Not provided"}\n\n` +
        `*Order Details:*\n${itemsText}\n\n` +
        `💰 *Total: ${formatPrice(total)}*\n\n` +
        `Thank you! Please confirm my order.`
    );

    window.open(`https://wa.me/213549195666?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`cart-sidebar fixed top-0 right-0 h-full w-full sm:w-96 bg-[#0f0f0f] border-l border-yellow-900/30 z-50 flex flex-col shadow-2xl ${
          isOpen ? "open" : "closed"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-900/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-white text-lg">Shopping Cart</h2>
            {items.length > 0 && (
              <span className="cart-badge">{cart.getCount()}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag className="w-12 h-12 text-yellow-900/60 mb-3" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <p className="text-gray-600 text-xs mt-1">
                Add some supplements to get started
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 rounded-xl bg-white/3 border border-yellow-900/20"
              >
                {/* Product image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200&q=60";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {item.product.name}
                  </p>
                  <p className="text-yellow-400 text-sm font-bold mt-0.5">
                    {formatPrice(item.product.price)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        cart.updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-5 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        cart.updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                    <span className="text-gray-400 text-xs ml-auto">
                      = {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => cart.removeItem(item.product.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-600 transition-colors flex-shrink-0 self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-yellow-900/30 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-yellow-400 text-xl font-bold">
                {formatPrice(total)}
              </span>
            </div>

            {/* Customer form */}
            {showForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="gold-input w-full px-3 py-2.5 rounded-lg text-sm"
                />

                <button
                  onClick={handleWhatsApp}
                  className="btn-whatsapp w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Order via WhatsApp
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order via WhatsApp
                </button>

                <button
                  onClick={() => cart.clear()}
                  className="w-full py-2 text-gray-600 hover:text-red-400 text-xs transition-colors"
                >
                  Clear cart
                </button>
              </>
            )}

            {/* Contact shortcuts */}
            <div className="flex gap-2 pt-1">
              <a
                href="tel:0549195666"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-yellow-900/20 text-gray-400 hover:text-yellow-400 transition-colors text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                0549 195 666
              </a>
              <a
                href="tel:0557113327"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-yellow-900/20 text-gray-400 hover:text-yellow-400 transition-colors text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                0557 113 327
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
