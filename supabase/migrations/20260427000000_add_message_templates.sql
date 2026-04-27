-- =============================================================================
-- message_templates テーブル (Issue #11 Stage 2)
-- =============================================================================
-- シフト連絡で使う定型文テンプレートを格納する。
-- type: 'attend' (出勤) | 'off' (休み) の2種類、各1行のみ許容。
-- プレースホルダー記法と変数仕様は docs/template-spec.md を参照。
-- =============================================================================

create table public.message_templates (
  id         uuid        primary key default gen_random_uuid(),
  type       text        not null unique check (type in ('attend', 'off')),
  body       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- 読み取りは認証済みユーザー全員、書き込みはマネージャーのみ。
-- is_manager() は initial_schema で定義済み。
-- =============================================================================

alter table public.message_templates enable row level security;

create policy "authenticated_select_message_templates"
  on public.message_templates for select to authenticated
  using (true);

create policy "managers_insert_message_templates"
  on public.message_templates for insert to authenticated
  with check (public.is_manager());

create policy "managers_update_message_templates"
  on public.message_templates for update to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy "managers_delete_message_templates"
  on public.message_templates for delete to authenticated
  using (public.is_manager());

-- =============================================================================
-- 初期シードデータ (docs/template-spec.md §8 より)
-- =============================================================================

insert into public.message_templates (type, body) values
  ('attend', '明日 {date} は {time} からです'),
  ('off',    '明日 {date} はお休みです');
