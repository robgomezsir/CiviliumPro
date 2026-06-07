DO $$ BEGIN
  CREATE TYPE status_lote AS ENUM (
    'AGUARDANDO',
    'EM_CONSULTA',
    'CONCLUIDO',
    'DESCARTADO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_consulta AS ENUM (
    'PENDENTE',
    'EM_ANDAMENTO',
    'CONFERE',
    'NAO_CONFERE',
    'ERRO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_arquivo text NOT NULL,
  status status_lote NOT NULL DEFAULT 'AGUARDANDO',
  total_pessoas integer NOT NULL,
  consultadas_count integer NOT NULL DEFAULT 0,
  pausado integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id),
  ordem_na_lista integer NOT NULL,
  nome_informado text NOT NULL,
  cpf text NOT NULL,
  data_nascimento text NOT NULL,
  nome_na_receita text,
  status status_consulta NOT NULL DEFAULT 'PENDENTE',
  erro_mensagem text,
  consultada_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditoria_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade text NOT NULL,
  entidade_id uuid NOT NULL,
  acao text NOT NULL,
  snapshot_antes jsonb,
  snapshot_depois jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consultas_lote_id_idx ON consultas(lote_id);
CREATE INDEX IF NOT EXISTS consultas_status_idx ON consultas(status);
CREATE INDEX IF NOT EXISTS lotes_deleted_at_idx ON lotes(deleted_at);
