/* =========================================================
   Products store — persists to localStorage
   Admin can add/delete; store reads the same data
   ========================================================= */

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

const STORAGE_KEY = "gnr_products";

/* Default seed products shown on first load */
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Whey Protein Gold",
    nameAr: "واي بروتين جولد",
    category: "Protein",
    price: 4500,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
    description: "Premium whey protein concentrate – 2.27 kg",
    inStock: true,
  },
  {
    id: "2",
    name: "Creatine Monohydrate",
    nameAr: "كرياتين مونوهيدرات",
    category: "Creatine",
    price: 2200,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    description: "Pure micronized creatine – 500 g",
    inStock: true,
  },
  {
    id: "3",
    name: "Mass Gainer Pro",
    nameAr: "ماس جينر برو",
    category: "Mass Gainer",
    price: 5800,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    description: "High-calorie mass gainer – 5 kg",
    inStock: true,
  },
  {
    id: "4",
    name: "Pre-Workout Blast",
    nameAr: "بري-ووركاوت بلاست",
    category: "Pre-Workout",
    price: 3100,
    image: "https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80",
    description: "Explosive energy pre-workout formula – 300 g",
    inStock: true,
  },
  {
    id: "5",
    name: "BCAA 8:1:1",
    nameAr: "بي سي أي أي",
    category: "Amino Acids",
    price: 2800,
    image: "https://images.unsplash.com/photo-1620714223084-8fcacc2523f0?w=400&q=80",
    description: "Branch-chain amino acids for recovery – 250 g",
    inStock: true,
  },
  {
    id: "6",
    name: "Omega-3 Fish Oil",
    nameAr: "أوميغا 3",
    category: "Vitamins",
    price: 1400,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
    description: "High-potency fish oil softgels – 90 caps",
    inStock: true,
  },
  {
    id: "7",
    name: "Fat Burner Thermo",
    nameAr: "حارق الدهون",
    category: "Fat Burners",
    price: 3500,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80",
    description: "Advanced thermogenic fat burner – 60 caps",
    inStock: true,
  },
  {
    id: "8",
    name: "Multivitamin Elite",
    nameAr: "مولتي فيتامين",
    category: "Vitamins",
    price: 1800,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    description: "Complete daily multivitamin complex – 30 packs",
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
  "All",
  "Protein",
  "Mass Gainer",
  "Creatine",
  "Pre-Workout",
  "Amino Acids",
  "Fat Burners",
  "Vitamins",
];
