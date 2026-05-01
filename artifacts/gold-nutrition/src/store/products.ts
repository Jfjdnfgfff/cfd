/* =========================================================
   قاعدة بيانات المنتجات — تُحفظ في localStorage
   ========================================================= */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

const STORAGE_KEY = "gnr_products_ar_v2";

/* المنتجات الافتراضية عند أول تشغيل */
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "واي بروتين جولد",
    category: "بروتين",
    price: 4500,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
    description: "بروتين واي ممتاز – 2.27 كغ",
    inStock: true,
  },
  {
    id: "2",
    name: "كرياتين مونوهيدرات",
    category: "كرياتين",
    price: 2200,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    description: "كرياتين نقي مجهري – 500 غ",
    inStock: true,
  },
  {
    id: "3",
    name: "ماس جينر برو",
    category: "زيادة الوزن",
    price: 5800,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    description: "مكمل ضخامة سعرات حرارية عالية – 5 كغ",
    inStock: true,
  },
  {
    id: "4",
    name: "بري-ووركاوت بلاست",
    category: "ما قبل التمرين",
    price: 3100,
    image: "https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80",
    description: "مكمل طاقة انفجارية قبل التمرين – 300 غ",
    inStock: true,
  },
  {
    id: "5",
    name: "BCAA 8:1:1",
    category: "أحماض أمينية",
    price: 2800,
    image: "https://images.unsplash.com/photo-1620714223084-8fcacc2523f0?w=400&q=80",
    description: "أحماض أمينية متشعبة للتعافي – 250 غ",
    inStock: true,
  },
  {
    id: "6",
    name: "أوميغا 3 زيت السمك",
    category: "فيتامينات",
    price: 1400,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
    description: "كبسولات زيت السمك عالي الفاعلية – 90 كبسولة",
    inStock: true,
  },
  {
    id: "7",
    name: "حارق الدهون ثيرمو",
    category: "حرق الدهون",
    price: 3500,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80",
    description: "حارق دهون حراري متقدم – 60 كبسولة",
    inStock: true,
  },
  {
    id: "8",
    name: "مولتي فيتامين إيليت",
    category: "فيتامينات",
    price: 1800,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    description: "مجمع فيتامينات يومي متكامل – 30 كيس",
    inStock: true,
  },
];

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  saveProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id">): Product {
  const products = loadProducts();
  const newProduct: Product = {
    ...product,
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function deleteProduct(id: string): void {
  const products = loadProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

export const CATEGORIES = [
  "الكل",
  "بروتين",
  "زيادة الوزن",
  "كرياتين",
  "ما قبل التمرين",
  "أحماض أمينية",
  "حرق الدهون",
  "فيتامينات",
];

/* قائمة ولايات الجزائر الـ 58 */
export const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار",
  "البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر",
  "الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة",
  "قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض",
  "إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي",
  "خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت",
  "غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس",
  "عين صالح","عين قزام","توقرت","جانت","المغير","المنيعة",
];
