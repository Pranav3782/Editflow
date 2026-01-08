
-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  plan_type text default 'free' check (plan_type in ('free', 'pro')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create editors table
create table public.editors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  weekly_capacity integer default 40,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  editor_id uuid references public.editors(id) on delete cascade not null,
  title text not null,
  client_name text,
  scheduled_date integer not null, -- 0-6 (Mon-Sun)
  week_start date not null, -- Store as date for easier querying
  estimated_hours integer default 0,
  priority text default 'medium',
  status text default 'queued',
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.editors enable row level security;
alter table public.jobs enable row level security;

-- Profiles policies
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Editors policies
create policy "Users can view their own editors" 
  on public.editors for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own editors" 
  on public.editors for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own editors" 
  on public.editors for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own editors" 
  on public.editors for delete 
  using (auth.uid() = user_id);

-- Jobs policies
create policy "Users can view their own jobs" 
  on public.jobs for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs" 
  on public.jobs for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own jobs" 
  on public.jobs for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own jobs" 
  on public.jobs for delete 
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
