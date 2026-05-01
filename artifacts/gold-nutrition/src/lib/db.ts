/* =====================================================
   عمليات قاعدة البيانات — Firebase أولاً، LocalStorage احتياطياً
   ===================================================== */

import {
  ref,
  set,
  get,
  remove,
  push,
  onValue,
  off,
  update,
} from "firebase/database";
import { getFirebaseDb, isFirebaseConfigured } from "./firebase";
import {
  loadProducts,
  saveProducts,
  DEFAULT_PRODUCTS,
  Product,
} from "@/store/products";

const ORDERS_LS_KEY = "gnr_orders_v1";

/* ---- نوع الطلب ---- */
export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  wilaya: string;
  baladiya: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  createdAt: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
}

/* ============================================================
   المنتجات
   ============================================================ */

/** جلب المنتجات (مرة واحدة) */
export async function fetchProducts(): Promise<Product[]> {
  const fbDb = getFirebaseDb();
  if (!fbDb) return loadProducts();

  try {
    const snap = await get(ref(fbDb, "products"));
    if (snap.exists()) {
      const data = snap.val() as Record<string, Omit<Product, "id">>;
      return Object.entries(data).map(([id, p]) => ({ id, ...p }));
    }
    /* لا توجد منتجات — زرع الافتراضية */
    await seedDefaultProducts(fbDb);
    return DEFAULT_PRODUCTS;
  } catch {
    return loadProducts();
  }
}

async function seedDefaultProducts(fbDb: ReturnType<typeof getFirebaseDb>) {
  if (!fbDb) return;
  for (const p of DEFAULT_PRODUCTS) {
    const { id, ...rest } = p;
    await set(ref(fbDb, `products/${id}`), rest);
  }
}

/** الاستماع للتغييرات في الوقت الفعلي */
export function subscribeProducts(
  callback: (products: Product[]) => void
): () => void {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    callback(loadProducts());
    const handler = () => callback(loadProducts());
    window.addEventListener("gnr-products-updated", handler);
    return () => window.removeEventListener("gnr-products-updated", handler);
  }

  const dbRef = ref(fbDb, "products");
  const handler = (snap: ReturnType<typeof get> extends Promise<infer S> ? S : never) => {
    if ((snap as any).exists()) {
      const data = (snap as any).val() as Record<string, Omit<Product, "id">>;
      const list: Product[] = Object.entries(data).map(([id, p]) => ({
        id,
        ...p,
      }));
      callback(list);
    } else {
      callback([]);
    }
  };
  onValue(dbRef, handler as any);
  return () => off(dbRef, "value", handler as any);
}

/** إضافة منتج */
export async function dbAddProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    const all = loadProducts();
    const newP: Product = {
      ...product,
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    all.unshift(newP);
    saveProducts(all);
    window.dispatchEvent(new Event("gnr-products-updated"));
    return newP;
  }

  const newRef = push(ref(fbDb, "products"));
  await set(newRef, product);
  return { id: newRef.key!, ...product };
}

/** تعديل منتج */
export async function dbUpdateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<void> {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    const all = loadProducts();
    const idx = all.findIndex((p) => p.id === id);
    if (idx !== -1) Object.assign(all[idx], data);
    saveProducts(all);
    window.dispatchEvent(new Event("gnr-products-updated"));
    return;
  }
  await update(ref(fbDb, `products/${id}`), data);
}

/** حذف منتج */
export async function dbDeleteProduct(id: string): Promise<void> {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    saveProducts(loadProducts().filter((p) => p.id !== id));
    window.dispatchEvent(new Event("gnr-products-updated"));
    return;
  }
  await remove(ref(fbDb, `products/${id}`));
}

/* ============================================================
   الطلبات
   ============================================================ */

/** حفظ طلب جديد */
export async function dbSaveOrder(
  orderData: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const order: Omit<Order, "id"> = {
    ...orderData,
    createdAt: Date.now(),
    status: "pending",
  };

  const fbDb = getFirebaseDb();
  if (!fbDb) {
    const all = getLocalOrders();
    const newOrder: Order = {
      id: `o_${Date.now()}`,
      ...order,
    };
    all.unshift(newOrder);
    localStorage.setItem(ORDERS_LS_KEY, JSON.stringify(all));
    return newOrder;
  }

  const newRef = push(ref(fbDb, "orders"));
  await set(newRef, order);
  return { id: newRef.key!, ...order };
}

/** الاستماع للطلبات في الوقت الفعلي */
export function subscribeOrders(
  callback: (orders: Order[]) => void
): () => void {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    callback(getLocalOrders());
    return () => {};
  }

  const dbRef = ref(fbDb, "orders");
  const handler = (snap: any) => {
    if (snap.exists()) {
      const data = snap.val() as Record<string, Omit<Order, "id">>;
      const list: Order[] = Object.entries(data)
        .map(([id, o]) => ({ id, ...o }))
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    } else {
      callback([]);
    }
  };
  onValue(dbRef, handler);
  return () => off(dbRef, "value", handler);
}

/** تحديث حالة الطلب */
export async function dbUpdateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  const fbDb = getFirebaseDb();
  if (!fbDb) {
    const all = getLocalOrders();
    const idx = all.findIndex((o) => o.id === id);
    if (idx !== -1) all[idx].status = status;
    localStorage.setItem(ORDERS_LS_KEY, JSON.stringify(all));
    return;
  }
  await update(ref(fbDb, `orders/${id}`), { status });
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_LS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {}
  return [];
}
