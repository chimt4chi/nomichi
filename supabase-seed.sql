-- =========================================================================
-- NOMiCHi Database Seed Script
-- Use this script in your Supabase SQL Editor to populate data for your CRM & CMS
-- =========================================================================

-- 1. Clean up existing data (Optional, uncomment if you want a clean slate)
-- truncate public.call_logs cascade;
-- truncate public.leads cascade;
-- truncate public.trips cascade;
-- truncate public.profiles cascade;

-- 2. Insert Seed Trips
insert into public.trips (id, name, destination, start_date, end_date, price_inr, total_seats, status, description)
values 
  ('11111111-1111-1111-1111-111111111111', 'Spiti Valley Roadtrip', 'Spiti Valley, Himachal Pradesh', '2026-07-10', '2026-07-18', 34999, 12, 'open', 'A journey through rugged terrains, high mountain passes, ancient monasteries, and beautiful lakes. Experience the cold desert mountain valley in its raw form.'),
  ('22222222-2222-2222-2222-222222222222', 'Meghalaya Rain-forest Trek', 'Cherrapunji & Mawlynnong, Meghalaya', '2026-08-12', '2026-08-18', 28500, 10, 'open', 'Walk behind waterfalls, cross living root bridges, and trek through lush sacred forests. A slow journey through the wettest place on earth.'),
  ('33333333-3333-3333-3333-333333333333', 'Ladakh Cultural Trail', 'Leh, Nubra & Pangong, Ladakh', '2026-09-05', '2026-09-13', 42000, 14, 'open', 'Immerse yourself in Ladakhi culture, visit monastic festivals, and sleep under starlit skies in Nubra Valley.'),
  ('44444444-4444-4444-4444-444444444444', 'Gokarna Slow Living Retreat', 'Gokarna, Karnataka', '2026-10-20', '2026-10-25', 18000, 8, 'closed', 'Yoga by the beach, organic meals, coastal walks, and slow sunsets. For those who want to rest, breathe, and unplug.');

-- 3. Insert Seed Profiles
-- IMPORTANT: Replace 'REPLACE_WITH_YOUR_COPIED_UUID' below with your actual Supabase Auth User ID UUID.
-- You can find this in the Supabase Dashboard -> Authentication -> Users.
insert into public.profiles (id, full_name, email)
values 
  ('23c85d7a-688b-4671-beb6-e919971e78c3', 'Siddharth Sen', 'admin@thenomichi.com'),
  ('00000000-0000-0000-0000-000000000002', 'Neha Roy', 'neha@thenomichi.com'),
  ('00000000-0000-0000-0000-000000000003', 'Vikram Singh', 'vikram@thenomichi.com');

-- 4. Insert Seed Leads
insert into public.leads (id, name, phone, email, trip_id, group_type, preferred_month, what_they_hope_trip_feels_like, status, owner_id)
values 
  ('11111111-2222-3333-4444-555555555551', 'Aarav Sharma', '+91 98765 43210', 'aarav.sharma@gmail.com', '11111111-1111-1111-1111-111111111111', 'solo', 'July 2026', 'Looking to disconnect from my startup life, read books by the river, and experience the quietude of high altitudes.', 'NEW', '23c85d7a-688b-4671-beb6-e919971e78c3'),
  ('11111111-2222-3333-4444-555555555552', 'Priya Patel', '+91 87654 32109', 'priya.patel@yahoo.com', '22222222-2222-2222-2222-222222222222', 'couple', 'August 2026', 'My partner and I want a trip that is slow and lets us experience local Khasi culture and food, not just checklist sightseeing. We love rains and mist.', 'QUALIFIED', '00000000-0000-0000-0000-000000000002'),
  ('11111111-2222-3333-4444-555555555553', 'Kabir Mehta', '+91 76543 21098', 'kabir@mehta.org', '33333333-3333-3333-3333-333333333333', 'friends', 'September 2026', 'A group of 3 high school friends looking for a peaceful getaway to catch up after years. We want a balance of short hikes and slow evenings.', 'CONTACTED', '23c85d7a-688b-4671-beb6-e919971e78c3'),
  ('11111111-2222-3333-4444-555555555554', 'Ananya Sen', '+91 95432 10987', 'ananya.sen@outlook.com', '11111111-1111-1111-1111-111111111111', 'solo', 'July 2026', 'Hoping for a challenging but slow-paced adventure. Want to meet like-minded, open travelers and learn about monastery lifestyles.', 'CONFIRMED', '00000000-0000-0000-0000-000000000002');

-- 5. Insert Seed Call Logs
insert into public.call_logs (id, lead_id, note, author_email)
values 
  ('11111111-aaaa-bbbb-cccc-dddddddddddd', '11111111-2222-3333-4444-555555555552', 'Spoke with Priya. She confirmed they are looking for a slow travel experience. They are fine with heavy rain in Meghalaya and actually prefer it.', 'neha@thenomichi.com'),
  ('22222222-aaaa-bbbb-cccc-dddddddddddd', '11111111-2222-3333-4444-555555555553', 'Left a voicemail for Kabir to schedule a quick vibe check call.', 'admin@thenomichi.com'),
  ('33333333-aaaa-bbbb-cccc-dddddddddddd', '11111111-2222-3333-4444-555555555553', 'Kabir called back. Had a great 15-minute vibe check. They seem perfect for Nomichi - very collaborative, outdoorsy, and respectful of local cultures. Moving to Contacted.', 'admin@thenomichi.com'),
  ('44444444-aaaa-bbbb-cccc-dddddddddddd', '11111111-2222-3333-4444-555555555554', 'Received booking payment. Seat confirmed for Spiti Valley. Sent confirmation pack via email.', 'neha@thenomichi.com');
