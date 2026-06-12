-- EventSphere Supabase Database Schema
-- Paste this script into the Supabase SQL Editor and run it.

-- 1. Create Public Users Table (Linked to Auth.Users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for Users
alter table public.users enable row level security;

-- Create Policies for Users
create policy "Allow public read access to user profiles"
  on public.users for select
  using (true);

create policy "Allow users to update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- 2. Create Events Table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null check (category in ('Music', 'Cultural', 'College', 'Sports', 'Technology', 'Food Festival', 'Workshops')),
  date date not null,
  time text not null,
  venue text not null,
  organizer text not null,
  image_url text,
  ticket_price numeric default 0 not null,
  is_approved boolean default false not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Events
alter table public.events enable row level security;

-- Create Policies for Events
create policy "Allow anyone to view approved events"
  on public.events for select
  using (is_approved = true or (auth.role() = 'authenticated' and (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    ) or created_by = auth.uid()
  )));

create policy "Allow authenticated users to insert events"
  on public.events for insert
  with check (auth.role() = 'authenticated');

create policy "Allow event creators to update their own events"
  on public.events for update
  using (created_by = auth.uid() or exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Allow admins and creators to delete events"
  on public.events for delete
  using (created_by = auth.uid() or exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

-- 3. Create Registrations Table
create table public.registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, event_id)
);

-- Enable RLS for Registrations
alter table public.registrations enable row level security;

-- Create Policies for Registrations
create policy "Allow users to view their own registrations"
  on public.registrations for select
  using (auth.uid() = user_id or exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "Allow authenticated users to register for events"
  on public.registrations for insert
  with check (auth.uid() = user_id);

create policy "Allow users to cancel registration"
  on public.registrations for delete
  using (auth.uid() = user_id);

-- 4. Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  comment text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Comments
alter table public.comments enable row level security;

-- Create Policies for Comments
create policy "Allow public read access to comments"
  on public.comments for select
  using (true);

create policy "Allow authenticated users to add comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Allow comment owners to update their comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Allow comment owners and admins to delete comments"
  on public.comments for delete
  using (auth.uid() = user_id or exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

-- 5. Create Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Notifications
alter table public.notifications enable row level security;

-- Create Policies for Notifications
create policy "Allow users to view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Allow users to update/read their notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Allow system insert notifications"
  on public.notifications for insert
  with check (true);


-- 6. Trigger to automatically create a public user profile on Auth Signup
-- Note: In React Native we will write directly to public.users to be robust,
-- but this trigger serves as a safety backup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 7. Seed Initial Event Data
-- Insert mock admin user profile if it doesn't exist
-- Note: Replace the UUID with a real user UUID after sign up to make them an admin, or do it in the dashboard.
-- For demo purposes, we will seed approved events with no creator (null).

insert into public.events (id, title, description, category, date, time, venue, organizer, image_url, ticket_price, is_approved)
values
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Neon Beats Music Festival',
    'Experience the ultimate electronic music festival featuring world-renowned DJs, stunning light shows, and an immersive audiovisual experience in the heart of the city.',
    'Music',
    current_date + interval '10 days',
    '18:00 - 23:30',
    'Grand Arena Plaza, Chennai',
    'Beatwave Events',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
    1499.00,
    true
  ),
  (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Heritage & Roots Cultural Expo',
    'A vibrant celebration of traditional dances, authentic regional cuisine, handcraft exhibitions, and live folklore performances representing our rich cultural legacy.',
    'Cultural',
    current_date + interval '15 days',
    '10:00 - 20:00',
    'State Exhibition Grounds, Bengaluru',
    'Chams Cultural Forum',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600',
    0.00,
    true
  ),
  (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'TechPulse 2026 Hackathon',
    'Join developers, designers, and innovators from across the country for a 36-hour hackathon. Build solutions for real-world problems using AI, Web3, and IoT.',
    'Technology',
    current_date + interval '25 days',
    '09:00 (Sat) - 21:00 (Sun)',
    'Silicon Hub Innovation Center, Bengaluru',
    'TechPulse Lab',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600',
    250.00,
    true
  ),
  (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'Inter-Collegiate Sports Championship',
    'The biggest college sports event of the season! Watch top universities compete in basketball, football, and athletics for the championship trophy.',
    'Sports',
    current_date + interval '5 days',
    '08:00 - 18:00',
    'National Sports Complex, Chennai',
    'University Sports Board',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600',
    100.00,
    true
  ),
  (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    'Gourmet Street Food Festival',
    'Indulge in a culinary journey featuring over 50 food trucks, artisanal desserts, masterclasses by celebrity chefs, and live acoustic sessions.',
    'Food Festival',
    current_date + interval '8 days',
    '12:00 - 22:00',
    'Lakefront Promenade, Bengaluru',
    'TasteBuds Co.',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
    150.00,
    true
  ),
  (
    'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    'Creative Writing & Storytelling Workshop',
    'An intensive interactive workshop for aspiring writers. Learn the art of character development, plotting, and publishing from award-winning novelists.',
    'Workshops',
    current_date + interval '12 days',
    '14:00 - 17:30',
    'Central Library Auditorium, Chennai',
    'Literary Society',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
    500.00,
    true
  );
