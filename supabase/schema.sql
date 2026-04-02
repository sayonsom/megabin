create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  is_pro boolean default false,
  stripe_customer_id text,
  transfers_remaining integer default 0
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Enable insert for authenticated users only" 
on public.profiles for insert 
with check (auth.uid() = id);

create policy "Enable update for users based on id" 
on public.profiles for update 
using (auth.uid() = id);

-- Trigger to create profile seamlessly on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC to accurately decrement transfers natively
create or replace function public.decrement_transfer()
returns void as $$
begin
  update public.profiles
  set transfers_remaining = transfers_remaining - 1
  where id = auth.uid() and transfers_remaining > 0;
end;
$$ language plpgsql security definer;

-- Transfer History Table
create table public.transfer_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  file_name text not null,
  transfer_type text not null check (transfer_type in ('upload', 'download')),
  size_bytes bigint not null,
  created_at timestamp with time zone default now()
);

alter table public.transfer_history enable row level security;

create policy "Users can insert their own history" 
on public.transfer_history for insert 
with check (auth.uid() = user_id);

create policy "Users can read their own history" 
on public.transfer_history for select 
using (auth.uid() = user_id);
