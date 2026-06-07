"use client";

import {
  COLUNAS_PLANILHA,
  MAX_PESSOAS_POR_LOTE,
  pessoaPlanilhaSchema,
  type PessoaPlanilha,
} from "@civilium/shared";
import { IconDownload, IconFileSpreadsheet, IconUpload } from "@tabler/icons-react";
import Papa from "papaparse";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  onPlanilhaValidada: (nomeArquivo: string, pessoas: PessoaPlanilha[]) => void;
  isLoading?: boolean;
};

function normalizarChave(chave: string) {
  return chave
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapearLinha(
  row: Record<string, string>,
): { ok: true; pessoa: PessoaPlanilha } | { ok: false; erro: string } {
  const mapa = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normalizarChave(k), v?.trim() ?? ""]),
  );

  const nome =
    mapa.nome ?? mapa.nome_informado ?? mapa["nome informado"] ?? "";
  const cpf = mapa.cpf ?? "";
  const dataNascimento =
    mapa.data_nascimento ?? mapa.datanascimento ?? mapa["data nascimento"] ?? "";

  const parsed = pessoaPlanilhaSchema.safeParse({
    nomeInformado: nome,
    cpf,
    dataNascimento,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
    return { ok: false, erro: msg };
  }

  return { ok: true, pessoa: parsed.data };
}

export function UploadPlanilha({ onPlanilhaValidada, isLoading }: Props) {
  const [preview, setPreview] = useState<PessoaPlanilha[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processarArquivo = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Envie uma planilha no formato CSV");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          toast.error("A planilha está vazia");
          return;
        }

        if (results.data.length > MAX_PESSOAS_POR_LOTE) {
          toast.error(
            `A planilha tem mais de ${MAX_PESSOAS_POR_LOTE} pessoas. Divida em lotes menores.`,
          );
          return;
        }

        const pessoas: PessoaPlanilha[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const linha = i + 2;
          const resultado = mapearLinha(results.data[i]);

          if (!resultado.ok) {
            toast.error(`Linha ${linha}: ${resultado.erro}`);
            setPreview([]);
            setNomeArquivo(null);
            return;
          }

          pessoas.push(resultado.pessoa);
        }

        setNomeArquivo(file.name);
        setPreview(pessoas);
        toast.success(`${pessoas.length} pessoas prontas para verificação`);
      },
      error: () => {
        toast.error("Não foi possível ler a planilha");
      },
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processarArquivo(file);
    },
    [processarArquivo],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle>Enviar planilha</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href="/modelo-planilha.csv" download="modelo-planilha.csv">
            <IconDownload className="h-4 w-4" />
            Baixar modelo CSV
          </a>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Colunas obrigatórias: {COLUNAS_PLANILHA.join(", ")}. Data de
          nascimento no formato DD/MM/AAAA. Máximo de {MAX_PESSOAS_POR_LOTE}{" "}
          pessoas por lote.
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <IconFileSpreadsheet className="h-10 w-10 text-slate-500" />
          <p className="text-center text-sm text-slate-600">
            Arraste sua planilha CSV aqui ou selecione o arquivo
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
            <IconUpload className="h-4 w-4" />
            Selecionar planilha
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processarArquivo(file);
              }}
            />
          </label>
        </div>

        {preview.length > 0 && nomeArquivo && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-800">
              {nomeArquivo} — {preview.length} pessoas
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Nome</th>
                    <th className="px-3 py-2 text-left">CPF</th>
                    <th className="px-3 py-2 text-left">Nascimento</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{p.nomeInformado}</td>
                      <td className="px-3 py-2">{p.cpf}</td>
                      <td className="px-3 py-2">{p.dataNascimento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 5 && (
              <p className="text-xs text-slate-500">
                e mais {preview.length - 5} pessoas...
              </p>
            )}
            <Button
              size="lg"
              className="w-full"
              disabled={isLoading}
              onClick={() => onPlanilhaValidada(nomeArquivo, preview)}
            >
              <IconUpload className="h-5 w-5" />
              Iniciar verificação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
