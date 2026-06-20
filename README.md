# Nomichi Trip Desk

A modern, responsive, and brand-aligned web application designed for Nomichi engineering build assignment. This application houses a public mobile-first traveler enquiry form and an authenticated admin panel (mini-CRM + trip CMS) with server-side Gemini AI features.

## Core Features & Decisions

1. **Evaluator-First Design (Mock/Supabase Dual Mode)**:
   - To ensure the app can be run and evaluated **immediately** without setting up database keys, the app detects if environment variables are missing and automatically falls back to a **local storage database**.
   - It pre-seeds the local storage with mock journeys, leads, and call logs. The app remains 100% interactive (leads can be edited, new logs added, status changed).
   - Once real Supabase environment variables are provided in `.env.local`, the app automatically switches to live database sync.

2. **Brand & Voice Alignment**:
   - The UI uses the exact color palette requested (Rust `#D55D27`, Ink `#1C1B1A`, Cream `#FFFBF5`, Olive `#45471D`, Sand `#D1B788`).
   - Clean, modern layout using Poppins and Outfit typography.
   - Text copy adheres strictly to Nomichi voice guidelines: warm, honest, second person, short sentences, zero AI buzzwords ("unlock", "elevate", etc.), and zero exclamation marks.

3. **Three AI-Assisted Features (Gemini-Powered)**:
   - **Vibe Evaluation**: On opening a lead's detail card, it reads the traveller's open-text answers and outlines whether they match Nomichi's slow travel ethos.
   - **First Message Composer**: Automatically drafts a warm, personalized initial WhatsApp message mentioning their specific hope details in under 45 words.
   - **Touchpoint Summarizer**: Condenses a timeline of logged call notes into a single line outlining the status and next step.
   - All AI calls run server-side using secure API routes. If the Gemini API key is not present, a local rule-based response generator creates context-relevant, brand-compliant drafts so the UI remains fully testable.

---

## Technical Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL) + LocalStorage fallback
- **Styling**: CSS Modules and Custom Tailwind-free CSS variables
- **Icons**: Lucide React
- **AI**: Gemini Developer API

---

## Setup & Running

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(If left empty or as default placeholders, the application will run in local evaluation mode with pre-seeded data).*

### 3. Run Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Public Enquiry Page**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - *(Mock Login Credentials: Email `admin@thenomichi.com` and Password `password123`)*

---

## Supabase Schema Configuration

To configure the live database, create a new Supabase project and execute the following SQL script in the **SQL Editor** tab to set up the schema and security policies:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (For CRM users/team members)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Trips Table (CMS)
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  price_inr numeric not null,
  total_seats integer not null,
  status text not null default 'open',
  description text
);

-- Enable RLS on Trips
alter table public.trips enable row level security;
create policy "Allow public read access to open trips" on public.trips for select using (status = 'open' or auth.role() = 'authenticated');
create policy "Allow authenticated users all access to trips" on public.trips for all using (auth.role() = 'authenticated');

-- 3. Leads Table (CRM Lead capture)
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  email text not null,
  trip_id uuid references public.trips(id) on delete cascade not null,
  group_type text not null,
  preferred_month text not null,
  what_they_hope_trip_feels_like text,
  status text not null default 'NEW',
  owner_id uuid references public.profiles(id) on delete set null
);

-- Enable RLS on Leads
alter table public.leads enable row level security;
create policy "Allow public insert to leads" on public.leads for insert with check (true);
create policy "Allow authenticated users to read/update leads" on public.leads for all using (auth.role() = 'authenticated');

-- 4. Call Logs Table (Touchpoints)
create table public.call_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lead_id uuid references public.leads(id) on delete cascade not null,
  note text not null,
  author_email text not null
);

-- Enable RLS on Call Logs
alter table public.call_logs enable row level security;
create policy "Allow authenticated users all access to call logs" on public.call_logs for all using (auth.role() = 'authenticated');
```
# nomichi
