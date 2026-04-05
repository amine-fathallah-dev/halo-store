-- HALO Store — Supabase Schema

-- Categories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  image_url text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  description_long_fr text,
  description_long_en text,
  category_id uuid references categories(id),
  base_price numeric(10,3) not null,
  sale_price numeric(10,3),
  is_on_sale boolean default false,
  sale_percentage int,
  is_new boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Product Variants
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  size text not null,
  color text not null,
  stock int default 0,
  sku text unique,
  created_at timestamptz default now()
);

-- Product Images
create table if not exists product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  url text not null,
  position int default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);

-- Orders
create type order_status as enum (
  'en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  status order_status default 'en_attente',
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  address_full text not null,
  city text not null,
  governorate text not null,
  postal_code text,
  subtotal numeric(10,3) not null,
  shipping_fee numeric(10,3) default 7,
  total numeric(10,3) not null,
  admin_notes text,
  created_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name text not null,
  size text,
  color text,
  quantity int not null,
  unit_price numeric(10,3) not null,
  created_at timestamptz default now()
);

-- Order Status History
create table if not exists order_status_history (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  status order_status not null,
  changed_at timestamptz default now(),
  changed_by text
);

-- Blog Posts
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title_fr text not null,
  title_en text not null,
  content_fr text,
  content_en text,
  cover_image_url text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- RLS Policies
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table blog_posts enable row level security;

-- Public read access
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read active products" on products for select using (is_active = true);
create policy "Public can read variants" on product_variants for select using (true);
create policy "Public can read images" on product_images for select using (true);
create policy "Public can read published posts" on blog_posts for select using (is_published = true);

-- Public insert for orders (guest checkout)
create policy "Anyone can create orders" on orders for insert with check (true);
create policy "Anyone can create order items" on order_items for insert with check (true);
create policy "Anyone can read own order" on orders for select using (true);
create policy "Anyone can read order items" on order_items for select using (true);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('halo-images', 'halo-images', true)
on conflict (id) do nothing;

create policy "Public read images" on storage.objects for select using (bucket_id = 'halo-images');
create policy "Auth upload images" on storage.objects for insert with check (bucket_id = 'halo-images' and auth.role() = 'authenticated');
create policy "Auth delete images" on storage.objects for delete using (bucket_id = 'halo-images' and auth.role() = 'authenticated');

-- Seed categories
insert into categories (slug, name_fr, name_en, display_order) values
  ('robes', 'Robes', 'Dresses', 1),
  ('tops', 'Tops & Blouses', 'Tops & Blouses', 2),
  ('pantalons', 'Pantalons & Jupes', 'Pants & Skirts', 3),
  ('vestes', 'Vestes & Manteaux', 'Jackets & Coats', 4),
  ('accessoires', 'Accessoires', 'Accessories', 5)
on conflict (slug) do nothing;
