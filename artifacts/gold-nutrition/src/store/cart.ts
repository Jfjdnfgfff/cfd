/* =========================================================
   Cart store — in-memory state (no persistence needed)
   ========================================================= */

import { Product } from "./products";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CartStore = {
  items: CartItem[];
  isOpen: boolean;
};

type Listener = () => void;

class CartManager {
  private items: CartItem[] = [];
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  addItem(product: Product) {
    const existing = this.items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.notify();
  }

  removeItem(productId: string) {
    this.items = this.items.filter((i) => i.product.id !== productId);
    this.notify();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.notify();
    }
  }

  clear() {
    this.items = [];
    this.notify();
  }
}

export const cart = new CartManager();
