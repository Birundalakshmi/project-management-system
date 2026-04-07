-- ==========================================
-- Nexus Project Management Database Schema
-- ==========================================

-- 1. Users Extension (Using public.users tied to auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Toggle RLS
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- 2. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  status text default 'planning',
  client_name text,
  start_date date,
  end_date date,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;
create policy "Projects viewable by authenticated users." on public.projects for select using (auth.role() = 'authenticated');
create policy "Projects insertable by authenticated users." on public.projects for insert with check (auth.role() = 'authenticated');

-- 3. Tasks Table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo', -- 'todo', 'inProgress', 'review', 'done'
  priority text default 'Medium', -- 'High', 'Medium', 'Low'
  tag text, 
  progress int default 0,
  assignee_id uuid references public.users(id),
  created_by uuid references public.users(id),
  due_date date,
  position int default 0, -- For Kanban ordering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;
create policy "Tasks viewable by authenticated users." on public.tasks for select using (auth.role() = 'authenticated');
create policy "Tasks modifiable by authenticated users." on public.tasks for all using (auth.role() = 'authenticated');

-- 4. Comments Table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;
create policy "Comments viewable by authenticated users." on public.comments for select using (auth.role() = 'authenticated');
create policy "Comments modifiable by authenticated users." on public.comments for all using (auth.role() = 'authenticated');
