-- BrandMate chat sessions (run in Supabase SQL Editor)

create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  copilot_thread_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  role text not null,
  content text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists chat_threads_user_id_idx on chat_threads(user_id);
create index if not exists chat_threads_updated_at_idx on chat_threads(updated_at desc);
create index if not exists chat_messages_thread_id_idx on chat_messages(thread_id);
