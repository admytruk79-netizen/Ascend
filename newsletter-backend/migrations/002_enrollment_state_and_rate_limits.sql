alter table newsletter_subscribers
  add column if not exists sync_status text not null default 'synced'
  check (sync_status in ('pending', 'synced', 'failed'));

create table if not exists newsletter_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash, window_started_at)
);

create index if not exists newsletter_rate_limits_updated_idx
  on newsletter_rate_limits (updated_at);
