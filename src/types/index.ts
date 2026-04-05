export interface Category {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  description_long_fr: string;
  description_long_en: string;
  category_id: string;
  category?: Category;
  base_price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number | null;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_cover: boolean;
}

export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "expediee"
  | "livree"
  | "annulee";

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address_full: string;
  city: string;
  governorate: string;
  postal_code: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  admin_notes: string | null;
  created_at: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_at: string;
  changed_by: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  content_fr: string;
  content_en: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const SCARF_SIZES = ["70x70 cm", "90x90 cm", "100x100 cm", "140x140 cm", "Unique"];
export const SHIPPING_FEE = parseFloat(process.env.NEXT_PUBLIC_SHIPPING_FEE ?? "8");

// Catégories sans taille (variante = couleur + stock uniquement)
export const NO_SIZE_CATEGORY_SLUGS = ["accessoires"];
// Catégories avec tailles foulard
export const SCARF_CATEGORY_SLUGS = ["foulards"];
