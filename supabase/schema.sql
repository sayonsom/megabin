create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  is_pro boolean default false,
  stripe_customer_id text
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
