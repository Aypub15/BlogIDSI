-- WARNING: this deletes the current blog tables and all their data.
-- Run this only if you want to rebuild the schema from scratch.

drop table if exists public.media cascade;
drop table if exists public."comment" cascade;
drop table if exists public.article cascade;
drop table if exists public.categorie cascade;
drop table if exists public.users cascade;
drop table if exists public.app_user cascade;

