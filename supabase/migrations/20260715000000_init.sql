-- LexIntake schema. Tables prefixed lexintake_ to isolate from other apps
-- sharing this Supabase project (broker-copilot). RLS denies anon/authenticated
-- by default; all app access goes through the service role key server-side.

create extension if not exists vector;

create table if not exists lexintake_case_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, -- personal_injury | family_law | immigration | other
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists lexintake_staff (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists lexintake_intakes (
  id uuid primary key default gen_random_uuid(),
  case_type_id uuid references lexintake_case_types(id),
  status text not null default 'in_progress', -- in_progress | completed | handoff
  client_name text,
  client_email text,
  client_phone text,
  details jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lexintake_messages (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references lexintake_intakes(id) on delete cascade,
  role text not null, -- user | assistant | system
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists lexintake_checklist_templates (
  id uuid primary key default gen_random_uuid(),
  case_type_id uuid not null references lexintake_case_types(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create table if not exists lexintake_checklists (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references lexintake_intakes(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists lexintake_checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references lexintake_checklists(id) on delete cascade,
  label text not null,
  received boolean not null default false,
  sort_order int not null default 0
);

create table if not exists lexintake_reminders (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references lexintake_intakes(id) on delete cascade,
  checklist_item_id uuid references lexintake_checklist_items(id) on delete cascade,
  status text not null default 'pending', -- pending | sent
  message text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists lexintake_kb_chunks (
  id uuid primary key default gen_random_uuid(),
  case_type_id uuid references lexintake_case_types(id),
  source_title text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists lexintake_kb_chunks_embedding_idx
  on lexintake_kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table lexintake_case_types enable row level security;
alter table lexintake_staff enable row level security;
alter table lexintake_intakes enable row level security;
alter table lexintake_messages enable row level security;
alter table lexintake_checklist_templates enable row level security;
alter table lexintake_checklists enable row level security;
alter table lexintake_checklist_items enable row level security;
alter table lexintake_reminders enable row level security;
alter table lexintake_kb_chunks enable row level security;
-- No policies defined: anon/authenticated roles get zero access.
-- All reads/writes happen server-side via the service role key, which bypasses RLS.
