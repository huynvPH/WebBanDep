
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin','staff','warehouse','customer');
CREATE TYPE public.product_category AS ENUM ('clog','charm');
CREATE TYPE public.order_type AS ENUM ('online','pos');
CREATE TYPE public.order_status AS ENUM ('pending','paid','shipped','completed','cancelled');
CREATE TYPE public.delivery_method AS ENUM ('pickup','home');
CREATE TYPE public.discount_type AS ENUM ('percent','fixed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer fn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- get_my_roles helper
CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS SETOF app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = auth.uid() $$;

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category product_category NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_online INTEGER NOT NULL DEFAULT 0,
  stock_store INTEGER NOT NULL DEFAULT 0,
  size TEXT,
  color TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Vouchers
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type order_type NOT NULL DEFAULT 'online',
  status order_status NOT NULL DEFAULT 'pending',
  delivery_method delivery_method,
  grab_tracking_id TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS: user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RLS: products
CREATE POLICY "Anyone view active products" ON public.products FOR SELECT USING (active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'warehouse'));
CREATE POLICY "Admin manage products" ON public.products FOR ALL
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Warehouse update products" ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(),'warehouse')) WITH CHECK (public.has_role(auth.uid(),'warehouse'));

-- RLS: vouchers
CREATE POLICY "Anyone view active vouchers" ON public.vouchers FOR SELECT USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage vouchers" ON public.vouchers FOR ALL
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RLS: orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'warehouse'));
CREATE POLICY "Customers create own orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff/admin update orders" ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'warehouse'));

-- RLS: order_items
CREATE POLICY "View order items via order" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'warehouse'))));
CREATE POLICY "Create order items via order" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))));

-- Auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
