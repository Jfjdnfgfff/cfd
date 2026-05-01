import { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, MessageCircle, Phone, ChevronDown } from "lucide-react";
import { cart, CartItem } from "@/store/cart";
import { WILAYAS } from "@/store/products";
import { dbSaveOrder } from "@/lib/db";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  wilaya: "",
  baladiya: "",
  phone: "",
};

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  useEffect(() => {
    const update = () => {
      setItems(cart.getItems());
      setTotal(cart.getTotal());
    };
    update();
    return cart.subscribe(update);
  }, []);

  const formatPrice = (p: number) =>
    `${p.toLocaleString("fr-DZ")} دج`;

  const validate = () => {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!form.firstName.trim()) errs.firstName = "مطلوب";
    if (!form.lastName.trim()) errs.lastName = "مطلوب";
    if (!form.wilaya) errs.wilaya = "اختر الولاية";
    if (!form.baladiya.trim()) errs.baladiya = "مطلوب";
    if (!form.phone.trim()) errs.phone = "مطلوب";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWhatsApp = async () => {
    if (!validate()) return;
    if (items.length === 0) {
      alert("السلة فارغة!");
      return;
    }

    /* حفظ الطلب في قاعدة البيانات */
    try {
      await dbSaveOrder({
        firstName: form.firstName,
        lastName: form.lastName,
        wilaya: form.wilaya,
        baladiya: form.baladiya,
        phone: form.phone,
        items: items.map((i) => ({
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price,
        })),
        total,
      });
    } catch {
      /* لا نوقف الطلب إذا فشل الحفظ */
    }

    const itemsText = items
      .map(
        (i) =>
          `• ${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `🛒 *طلب جديد - غولد نيوتريشن رويبة*\n\n` +
      `👤 الاسم الكامل: ${form.firstName} ${form.lastName}\n` +
      `📍 الولاية: ${form.wilaya}\n` +
      `🏘️ البلدية: ${form.baladiya}\n` +
      `📞 رقم الهاتف: ${form.phone}\n\n` +
      `*تفاصيل الطلب:*\n${itemsText}\n\n` +
      `💰 *المجموع: ${formatPrice(total)}*\n\n` +
      `شكراً! أرجو تأكيد طلبي.`
    );

    cart.clear();
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    window.open(`https://wa.me/213549195666?text=${message}`, "_blank");
  };

  const field = (
    key: keyof typeof EMPTY_FORM,
    label: string,
    placeholder: string,
    type = "text"
  ) => (
    <div>
      <label className="text-gray-400 text-xs mb-1 block font-medium">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => {
          setForm({ ...form, [key]: e.target.value });
          if (errors[key]) setErrors({ ...errors, [key]: undefined });
        }}
        className={`gold-input w-full px-3 py-2.5 rounded-lg text-sm ${
          errors[key] ? "border-red-500/60" : ""
        }`}
      />
      {errors[key] && (
        <p className="text-red-400 text-xs mt-0.5">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <>
      {/* طبقة التعتيم */}
      <div
        className={`cart-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* الشريط الجانبي */}
      <div
        className={`cart-sidebar fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0f0f0f] border-l border-yellow-900/30 z-50 flex flex-col shadow-2xl ${
          isOpen ? "open" : "closed"
        }`}
        dir="rtl"
      >
        {/* الرأس */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-900/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-white text-lg">سلة التسوق</h2>
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

        {/* المنتجات */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag className="w-12 h-12 text-yellow-900/60 mb-3" />
              <p className="text-gray-500 text-sm">السلة فارغة</p>
              <p className="text-gray-600 text-xs mt-1">
                أضف منتجات للبدء
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 rounded-xl bg-white/3 border border-yellow-900/20"
              >
                {/* صورة المنتج */}
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

                {/* المعلومات */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {item.product.name}
                  </p>
                  <p className="text-yellow-400 text-sm font-bold mt-0.5">
                    {formatPrice(item.product.price)}
                  </p>

                  {/* الكمية */}
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
                    <span className="text-gray-400 text-xs mr-auto">
                      = {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* حذف */}
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

        {/* الجزء السفلي */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-yellow-900/30 space-y-4">
            {/* المجموع */}
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 text-xl font-bold">
                {formatPrice(total)}
              </span>
              <span className="text-gray-400 text-sm">المجموع</span>
            </div>

            {/* نموذج التوصيل */}
            {showForm ? (
              <div className="space-y-3">
                <p className="text-yellow-400 text-sm font-bold text-center pb-1 border-b border-yellow-900/30">
                  معلومات التوصيل
                </p>

                {/* الاسم واللقب */}
                <div className="grid grid-cols-2 gap-2">
                  {field("firstName", "الاسم", "مثال: محمد")}
                  {field("lastName", "اللقب", "مثال: بوعلام")}
                </div>

                {/* الولاية */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block font-medium">
                    الولاية <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.wilaya}
                      onChange={(e) => {
                        setForm({ ...form, wilaya: e.target.value });
                        if (errors.wilaya)
                          setErrors({ ...errors, wilaya: undefined });
                      }}
                      className={`gold-input w-full px-3 py-2.5 rounded-lg text-sm appearance-none ${
                        errors.wilaya ? "border-red-500/60" : ""
                      }`}
                    >
                      <option value="">-- اختر الولاية --</option>
                      {WILAYAS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.wilaya && (
                    <p className="text-red-400 text-xs mt-0.5">
                      {errors.wilaya}
                    </p>
                  )}
                </div>

                {/* البلدية */}
                {field("baladiya", "البلدية", "مثال: رويبة")}

                {/* رقم الهاتف */}
                {field("phone", "رقم الهاتف", "مثال: 0555 123 456", "tel")}

                <button
                  onClick={handleWhatsApp}
                  className="btn-whatsapp w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm mt-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  إرسال الطلب عبر واتساب
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  طلب عبر واتساب
                </button>

                <button
                  onClick={() => cart.clear()}
                  className="w-full py-2 text-gray-600 hover:text-red-400 text-xs transition-colors"
                >
                  إفراغ السلة
                </button>
              </>
            )}

            {/* أرقام الاتصال */}
            <div className="flex gap-2 pt-1">
              <a
                href="tel:0549195666"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-yellow-900/20 text-gray-400 hover:text-yellow-400 transition-colors text-xs"
              >
                0549 195 666
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href="tel:0557113327"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-yellow-900/20 text-gray-400 hover:text-yellow-400 transition-colors text-xs"
              >
                0557 113 327
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
