-- ============================================================
-- 001_init_schema.sql
-- 유성 상권 지도 (yuseong-sangkwon-map) 초기 스키마
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. TABLES
-- ============================================================

-- profiles: auth.users 1:1 확장 테이블
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'entrepreneur', 'admin')),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- categories: 업종 코드표
create table if not exists public.categories (
  code text primary key,
  label text not null,
  color text not null
);

-- stores: 상가/점포
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  category text not null references public.categories (code),
  address text not null,
  road_address text not null,
  lat float8 not null,
  lng float8 not null,
  phone text,
  is_vacant boolean not null default false,
  image_url text,
  description text,
  business_hours jsonb,
  source text not null default 'user' check (source in ('user', 'public_data')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- districts: 유성구 행정동 통계
create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  vacancy_rate float4 not null default 0,
  total_stores int not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index if not exists idx_stores_lat_lng on public.stores (lat, lng);
create index if not exists idx_stores_category on public.stores (category);
create index if not exists idx_stores_is_vacant on public.stores (is_vacant);
create index if not exists idx_stores_owner_id on public.stores (owner_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.stores enable row level security;

-- profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- stores policies
create policy "stores_select_all"
  on public.stores for select
  using (true);

create policy "stores_insert_authenticated"
  on public.stores for insert
  with check (auth.uid() is not null);

create policy "stores_update_owner_or_admin"
  on public.stores for update
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "stores_delete_owner_or_admin"
  on public.stores for delete
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_stores
  before update on public.stores
  for each row execute function public.set_updated_at();

create trigger set_updated_at_districts
  before update on public.districts
  for each row execute function public.set_updated_at();

-- auth.users 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    'owner',
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. SEED DATA
-- ============================================================

insert into public.categories (code, label, color) values
  ('restaurant', '식당', '#FF6B6B'),
  ('cafe', '카페', '#4ECDC4'),
  ('beauty', '미용', '#A78BFA'),
  ('retail', '소매', '#F59E0B'),
  ('academy', '학원', '#3B82F6'),
  ('medical', '의료', '#10B981'),
  ('other', '기타', '#9CA3AF')
on conflict (code) do nothing;

insert into public.districts (name) values
  ('관평동'),
  ('구즉동'),
  ('노은1동'),
  ('노은2동'),
  ('노은3동'),
  ('봉명1동'),
  ('봉명2·구암동'),
  ('신성동'),
  ('온천1동'),
  ('온천2동'),
  ('원신흥동'),
  ('전민동'),
  ('진잠동'),
  ('하기동')
on conflict (name) do nothing;
