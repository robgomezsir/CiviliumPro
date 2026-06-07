"use client";

import {
  MAX_PESSOAS_POR_LOTE,
  pessoaPlanilhaSchema,
  type PessoaPlanilha,
} from "@civilium/shared";
import {
  IconClipboard,
  IconDownload,
  IconPlayerPlay,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import Papa from "papaparse";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  onPlanilhaValidada: (nomeArquivo: string, pessoas: PessoaPlanilha[]) => void;
  isLoading?: boolean;
};

type LinhaBruta = {
  nome: string;
  cpf: string;
  dataNascimento: string;
};

const LINHA_VAZIA: LinhaBruta = { nome: "", cpf: "", dataNascimento: "" };
const LINHAS_INICIAIS = 6;

function criarLinhasVazias(quantidade: number): LinhaBruta[] {
  return Array.from({ length: quantidade }, () => ({ ...LINHA_VAZIA }));
}

function normalizarChave(chave: string) {
  return chave
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarData(valor: string) {
  const match = valor.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return valor.trim();
  return `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${match[3]}`;
}

function normalizarCpfColado(cpf: string) {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length > 0 && digitos.length < 11) {
    return digitos.padStart(11, "0");
  }
  return cpf.trim();
}

function pareceCabecalho(cols: string[]) {
  const normalizadas = cols.map(normalizarChave);
  return (
    normalizadas.some((c) => c.includes("nome")) &&
    normalizadas.some((c) => c.includes("cpf"))
  );
}

function parseTextoColado(texto: string): LinhaBruta[] {
  const linhasTexto = texto.trim().split(/\r?\n/).filter((l) => l.trim());
  let cabecalhoIgnorado = false;

  return linhasTexto
    .map((linha) => {
      const separador = linha.includes("\t") ? "\t" : linha.includes(";") ? ";" : ",";
      const cols = linha.split(separador).map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        nome: cols[0] ?? "",
        cpf: normalizarCpfColado(cols[1] ?? ""),
        dataNascimento: normalizarData(cols[2] ?? ""),
      };
    })
    .filter((linha) => {
      if (
        !cabecalhoIgnorado &&
        pareceCabecalho([linha.nome, linha.cpf, linha.dataNascimento])
      ) {
        cabecalhoIgnorado = true;
        return false;
      }
      return Boolean(linha.nome || linha.cpf || linha.dataNascimento);
    });
}

function mesclarColagem(atual: LinhaBruta[], coladas: LinhaBruta[]): LinhaBruta[] {
  const existentes = atual.filter(linhaPreenchida);
  return [...existentes, ...coladas, ...criarLinhasVazias(2)];
}

function linhaPreenchida(linha: LinhaBruta) {
  return Boolean(linha.nome.trim() || linha.cpf.trim() || linha.dataNascimento.trim());
}

function validarLinha(
  linha: LinhaBruta,
  numeroLinha: number,
): { ok: true; pessoa: PessoaPlanilha } | { ok: false; erro: string } {
  const parsed = pessoaPlanilhaSchema.safeParse({
    nomeInformado: linha.nome.trim(),
    cpf: linha.cpf,
    dataNascimento: linha.dataNascimento,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
    return { ok: false, erro: `Linha ${numeroLinha}: ${msg}` };
  }

  return { ok: true, pessoa: parsed.data };
}

function linhaBrutaDeCsv(row: Record<string, string>): LinhaBruta {
  const mapa = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normalizarChave(k), v?.trim() ?? ""]),
  );

  return {
    nome: mapa.nome ?? mapa.nome_informado ?? mapa["nome informado"] ?? "",
    cpf: mapa.cpf ?? "",
    dataNascimento:
      mapa.data_nascimento ?? mapa.datanascimento ?? mapa["data nascimento"] ?? "",
  };
}

export function UploadPlanilha({ onPlanilhaValidada, isLoading }: Props) {
  const [linhas, setLinhas] = useState<LinhaBruta[]>(() => criarLinhasVazias(LINHAS_INICIAIS));
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const tabelaRef = useRef<HTMLDivElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const linhasPreenchidas = linhas.filter(linhaPreenchida).length;

  const atualizarLinha = (indice: number, campo: keyof LinhaBruta, valor: string) => {
    setLinhas((atual) =>
      atual.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha)),
    );
    setNomeArquivo(null);
  };

  const aplicarColagem = useCallback((texto: string) => {
    const coladas = parseTextoColado(texto);

    if (!coladas.length) {
      toast.error("Não foi possível interpretar os dados colados");
      return;
    }

    setLinhas((atual) => {
      const existentes = atual.filter(linhaPreenchida);
      const total = existentes.length + coladas.length;

      if (total > MAX_PESSOAS_POR_LOTE) {
        toast.error(
          `Máximo de ${MAX_PESSOAS_POR_LOTE} pessoas por pesquisa. Você já tem ${existentes.length} e tentou colar ${coladas.length}.`,
        );
        return atual;
      }

      toast.success(
        coladas.length === 1
          ? "1 linha adicionada"
          : `${coladas.length} linhas adicionadas`,
      );
      return mesclarColagem(atual, coladas);
    });
    setNomeArquivo(null);
  }, []);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const texto = event.clipboardData.getData("text/plain");
      if (!texto.trim()) return;

      event.preventDefault();
      event.stopPropagation();
      aplicarColagem(texto);
    },
    [aplicarColagem],
  );

  const processarArquivo = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecione um arquivo no formato CSV");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          toast.error("O arquivo CSV está vazio");
          return;
        }

        if (results.data.length > MAX_PESSOAS_POR_LOTE) {
          toast.error(
            `O arquivo tem mais de ${MAX_PESSOAS_POR_LOTE} pessoas. Divida em lotes menores.`,
          );
          return;
        }

        const importadas: LinhaBruta[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const bruta = linhaBrutaDeCsv(results.data[i]);
          const resultado = validarLinha(bruta, i + 2);

          if (!resultado.ok) {
            toast.error(resultado.erro);
            return;
          }

          importadas.push({
            nome: resultado.pessoa.nomeInformado,
            cpf: resultado.pessoa.cpf,
            dataNascimento: resultado.pessoa.dataNascimento,
          });
        }

        setLinhas((atual) => {
          const existentes = atual.filter(linhaPreenchida);
          const total = existentes.length + importadas.length;

          if (total > MAX_PESSOAS_POR_LOTE) {
            toast.error(
              `Máximo de ${MAX_PESSOAS_POR_LOTE} pessoas por pesquisa.`,
            );
            return atual;
          }

          return mesclarColagem(atual, importadas);
        });
        setNomeArquivo(file.name);
        toast.success(`${importadas.length} pessoas importadas do CSV`);
      },
      error: () => {
        toast.error("Não foi possível ler o arquivo CSV");
      },
    });
  }, []);

  const adicionarLinha = () => {
    setLinhas((atual) => [...atual, { ...LINHA_VAZIA }]);
  };

  const iniciarVerificacao = () => {
    const preenchidas = linhas
      .map((linha, indice) => ({ linha, indice }))
      .filter(({ linha }) => linhaPreenchida(linha));

    if (!preenchidas.length) {
      toast.error("Cole ou preencha pelo menos uma pessoa na tabela");
      return;
    }

    if (preenchidas.length > MAX_PESSOAS_POR_LOTE) {
      toast.error(`Máximo de ${MAX_PESSOAS_POR_LOTE} pessoas por pesquisa`);
      return;
    }

    const pessoas: PessoaPlanilha[] = [];

    for (const { linha, indice } of preenchidas) {
      const resultado = validarLinha(linha, indice + 1);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      pessoas.push(resultado.pessoa);
    }

    const nome =
      nomeArquivo ??
      `pesquisa-${dayjs().format("DD-MM-YYYY-HHmm")}.csv`;

    onPlanilhaValidada(nome, pessoas);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Lista de pessoas</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Cole do Excel ou preencha manualmente. Ordem: nome, CPF, data de
            nascimento (DD/MM/AAAA).
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/modelo-planilha.csv" download="modelo-planilha.csv">
            <IconDownload className="h-4 w-4" />
            Modelo CSV
          </a>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          ref={tabelaRef}
          tabIndex={0}
          onPasteCapture={handlePaste}
          className="overflow-x-auto rounded-lg border border-slate-200 outline-none focus-within:ring-2 focus-within:ring-blue-200 focus:ring-2 focus:ring-blue-200"
        >
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="w-10 px-3 py-2 font-medium">#</th>
                <th className="min-w-[200px] px-3 py-2 font-medium">Nome</th>
                <th className="min-w-[140px] px-3 py-2 font-medium">CPF</th>
                <th className="min-w-[130px] px-3 py-2 font-medium">
                  Data de nascimento
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, indice) => (
                <tr key={indice} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-400">{indice + 1}</td>
                  <td className="px-2 py-1">
                    <Input
                      value={linha.nome}
                      onChange={(e) => atualizarLinha(indice, "nome", e.target.value)}
                      placeholder="Nome completo"
                      className="h-9 border-slate-200"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      value={linha.cpf}
                      onChange={(e) => atualizarLinha(indice, "cpf", e.target.value)}
                      placeholder="00000000000"
                      className="h-9 border-slate-200"
                      inputMode="numeric"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      value={linha.dataNascimento}
                      onChange={(e) =>
                        atualizarLinha(indice, "dataNascimento", e.target.value)
                      }
                      placeholder="DD/MM/AAAA"
                      className="h-9 border-slate-200"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-center gap-2 text-sm text-slate-600">
          <IconClipboard className="h-4 w-4 shrink-0" />
          Cole quantas vezes quiser com <strong>Ctrl+V</strong> — cada colagem
          adiciona linhas ao final da lista. Máximo de {MAX_PESSOAS_POR_LOTE}{" "}
          pessoas.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={adicionarLinha}>
            <IconPlus className="h-4 w-4" />
            Adicionar linha
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => inputArquivoRef.current?.click()}
          >
            <IconUpload className="h-4 w-4" />
            Buscar CSV no computador
          </Button>

          <input
            ref={inputArquivoRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processarArquivo(file);
              e.target.value = "";
            }}
          />
        </div>

        {linhasPreenchidas > 0 && (
          <p className="text-sm font-medium text-slate-800">
            {linhasPreenchidas} {linhasPreenchidas === 1 ? "pessoa" : "pessoas"}{" "}
            na lista
            {nomeArquivo ? ` — importado de ${nomeArquivo}` : ""}
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={isLoading || linhasPreenchidas === 0}
          onClick={iniciarVerificacao}
        >
          <IconPlayerPlay className="h-5 w-5" />
          Iniciar verificação
        </Button>
      </CardContent>
    </Card>
  );
}
