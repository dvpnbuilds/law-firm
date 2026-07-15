-- Cosine-similarity retrieval for RAG. Called via service-role client only
-- (same access model as the rest of lexintake_* — no RLS bypass needed here
-- since the service role already ignores RLS).
create or replace function match_kb_chunks(
  query_embedding vector(1536),
  match_case_type_id uuid default null,
  match_count int default 5
)
returns table (
  id uuid,
  case_type_id uuid,
  source_title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    case_type_id,
    source_title,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from lexintake_kb_chunks
  where embedding is not null
    and (match_case_type_id is null or case_type_id = match_case_type_id or case_type_id is null)
  order by embedding <=> query_embedding
  limit match_count;
$$;
