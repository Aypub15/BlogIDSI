-- Blog schema for Supabase/Postgres.
-- If you already have a table named "users", rename it to "app_user" after backup,
-- or create "app_user" and migrate your data into it.

create table if not exists public.app_user (
    id bigint generated always as identity primary key,
    nom text not null,
    email text not null unique,
    mot_pass text not null,
    role text not null default 'USER',
    constraint app_user_role_check check (role in ('USER', 'ADMIN'))
);

create table if not exists public.categorie (
    id bigint generated always as identity primary key,
    libelle text not null unique,
    description text,
    icon text
);

create table if not exists public.article (
    id bigint generated always as identity primary key,
    titre text not null,
    contenue text,
    date timestamp without time zone,
    statut text not null default 'PUBLISHED',
    vues integer not null default 0,
    image text,
    user_id bigint not null references public.app_user(id) on delete cascade,
    categorie_id bigint references public.categorie(id) on delete set null,
    constraint article_statut_check check (statut in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

create table if not exists public."comment" (
    id bigint generated always as identity primary key,
    text text not null,
    postdate timestamp without time zone,
    is_valitade boolean not null default true,
    article_id bigint not null references public.article(id) on delete cascade,
    user_id bigint not null references public.app_user(id) on delete cascade
);

create table if not exists public.media (
    id bigint generated always as identity primary key,
    url text,
    type text,
    filesize double precision not null default 0,
    article_id bigint references public.article(id) on delete cascade
);

create index if not exists idx_article_user_id on public.article(user_id);
create index if not exists idx_article_categorie_id on public.article(categorie_id);
create index if not exists idx_article_date on public.article(date desc);
create index if not exists idx_comment_article_id on public."comment"(article_id);
create index if not exists idx_comment_user_id on public."comment"(user_id);
create index if not exists idx_media_article_id on public.media(article_id);
