-- 
-- SUPABASE DATABASE SCHEMA FOR NORTHSTAR GOAL INTELLIGENCE
-- Supports multi-tenant isolation (company-level) and user-level access control.
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- A. Companies (Tenants)
create table public.companies (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- B. User Profiles (Extends Supabase Auth users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    company_id uuid references public.companies(id) on delete set null,
    name text not null,
    role text,
    email text unique not null,
    timezone text default 'America/Los_Angeles'::text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- C. Organization Goals (Strategic Objectives)
create table public.organization_goals (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    name text not null,
    goal text not null, -- Copy of name for compatibility
    owner_id uuid references public.profiles(id) on delete set null,
    department text not null,
    progress integer default 0 check (progress >= 0 and progress <= 100) not null,
    status text default 'Not Started'::text not null,
    start_date date not null,
    end_date date not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. SMART Goals (Measurable Targets)
create table public.smart_goals (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    org_goal_id uuid references public.organization_goals(id) on delete cascade not null,
    title text not null,
    owner_id uuid references public.profiles(id) on delete set null,
    progress integer default 0 check (progress >= 0 and progress <= 100) not null,
    status text default 'Not Started'::text not null,
    start_date date not null,
    due_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- E. Action Items (Tactical Tasks / Action Plans)
create table public.action_items (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    smart_goal_id uuid references public.smart_goals(id) on delete cascade not null,
    task text not null,
    assigned_to uuid references public.profiles(id) on delete set null,
    priority text default 'Medium'::text not null, -- Low, Medium, High, Urgent
    progress integer default 0 check (progress >= 0 and progress <= 100) not null,
    status text default 'Todo'::text not null, -- Todo, In Progress, Done
    due_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- F. Challenges (Risks & Blockers)
create table public.challenges (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    related_goal_id uuid references public.organization_goals(id) on delete cascade not null,
    action_item_id uuid references public.action_items(id) on delete set null,
    title text not null,
    description text,
    severity text default 'Medium'::text not null, -- Low, Medium, High, Critical
    owner_id uuid references public.profiles(id) on delete set null,
    raised_by_id uuid references public.profiles(id) on delete set null,
    status text default 'Open'::text not null, -- Open, Investigating, Resolved
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- G. Solutions (Proposed Resolutions)
create table public.solutions (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    related_challenge_id uuid references public.challenges(id) on delete cascade not null,
    title text not null,
    description text,
    director_id uuid references public.profiles(id) on delete set null,
    impact integer check (impact >= 1 and impact <= 10) not null,
    status text default 'Proposed'::text not null, -- Proposed, In Review, Implemented, Archived
    owner_id uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 2. SECURE UTILITY FUNCTION FOR RLS
-- ==========================================

-- Retrieves the company ID of the currently authenticated user
create or replace function public.get_user_company_id()
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;


-- ==========================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_goals enable row level security;
alter table public.smart_goals enable row level security;
alter table public.action_items enable row level security;
alter table public.challenges enable row level security;
alter table public.solutions enable row level security;


-- A. Companies Table Policies
create policy "Users can view their own company"
on public.companies for select
using (id = public.get_user_company_id());

create policy "Authenticated users can create a company"
on public.companies for insert
to authenticated
with check (true);

create policy "Users can update their own company name"
on public.companies for update
to authenticated
using (id = public.get_user_company_id())
with check (id = public.get_user_company_id());


-- B. Profiles Table Policies
create policy "Users can read all profiles in their company"
on public.profiles for select
using (company_id = public.get_user_company_id());

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- C. Organization Goals Table Policies

-- Option Set 1: Company-Wide Visibility (Users can see all goals in their company, but only update their own)
create policy "Users can read all org goals of their company"
on public.organization_goals for select
using (company_id = public.get_user_company_id());

create policy "Users can insert/update org goals they own"
on public.organization_goals for all
using (company_id = public.get_user_company_id() and (owner_id = auth.uid() or owner_id is null))
with check (company_id = public.get_user_company_id() and owner_id = auth.uid());

-- Option Set 2: Strict User-Only Visibility (UNCOMMENT if you want users to ONLY see goals they own)
/*
create policy "Users can only read org goals they own"
on public.organization_goals for select
using (company_id = public.get_user_company_id() and owner_id = auth.uid());
*/


-- D. SMART Goals Table Policies

-- Users can see SMART goals under organization goals belonging to their company
create policy "Users can read all smart goals in their company"
on public.smart_goals for select
using (company_id = public.get_user_company_id());

create policy "Users can modify smart goals they own"
on public.smart_goals for all
using (company_id = public.get_user_company_id() and (owner_id = auth.uid() or owner_id is null))
with check (company_id = public.get_user_company_id() and owner_id = auth.uid());

-- Option Set 2: Strict User-Only Visibility (UNCOMMENT if you want users to ONLY see SMART goals they own)
/*
create policy "Users can only read smart goals they own"
on public.smart_goals for select
using (company_id = public.get_user_company_id() and owner_id = auth.uid());
*/


-- E. Action Items Table Policies

-- Users can see all action items in their company
create policy "Users can read all action items in their company"
on public.action_items for select
using (company_id = public.get_user_company_id());

create policy "Users can modify action items assigned to them"
on public.action_items for all
using (company_id = public.get_user_company_id() and (assigned_to = auth.uid() or assigned_to is null))
with check (company_id = public.get_user_company_id() and assigned_to = auth.uid());

-- Option Set 2: Strict User-Only Visibility (UNCOMMENT if you want users to ONLY see action items assigned to them)
/*
create policy "Users can only read action items assigned to them"
on public.action_items for select
using (company_id = public.get_user_company_id() and assigned_to = auth.uid());
*/


-- F. Challenges Table Policies
create policy "Users can read all challenges in their company"
on public.challenges for select
using (company_id = public.get_user_company_id());

create policy "Users can modify challenges they raised or own"
on public.challenges for all
using (company_id = public.get_user_company_id() and (owner_id = auth.uid() or raised_by_id = auth.uid()))
with check (company_id = public.get_user_company_id() and (owner_id = auth.uid() or raised_by_id = auth.uid()));


-- G. Solutions Table Policies
create policy "Users can read all solutions in their company"
on public.solutions for select
using (company_id = public.get_user_company_id());

create policy "Users can modify solutions they proposed or own"
on public.solutions for all
using (company_id = public.get_user_company_id() and (owner_id = auth.uid() or director_id = auth.uid()))
with check (company_id = public.get_user_company_id() and (owner_id = auth.uid() or director_id = auth.uid()));


-- ==========================================
-- 4. AUTOMATIC USER REGISTRATION TRIGGER
-- ==========================================

-- Create a profile trigger function when a user signs up on Supabase Auth.
-- Sets their initial company to a dummy or default company if needed, or null to be assigned.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Member'),
    coalesce(new.raw_user_meta_data->>'timezone', 'America/Los_Angeles')
  );
  return new;
end;
$$;

-- Bind trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
