create table if not exists newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  email_normalized text generated always as (lower(btrim(email))) stored,
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'ascend-keys-app',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_email_length
    check (char_length(email_normalized) between 3 and 254),
  constraint newsletter_email_unique unique (email_normalized)
);
