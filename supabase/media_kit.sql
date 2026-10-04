-- Medya kiti: tek satırlık JSON belge. RLS açık, politika yok → yalnızca sunucu (servis anahtarı) erişir.
create table if not exists media_kit (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table media_kit enable row level security;
