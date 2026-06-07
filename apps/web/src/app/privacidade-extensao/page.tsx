import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidade — Civilium Bridge",
  description:
    "Política de privacidade da extensão Chrome Civilium Bridge para consultas na Receita Federal.",
};

export default function PrivacidadeExtensaoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <p className="mb-6">
        <Link href="/" className="text-blue-700 hover:underline">
          ← Voltar ao Civilium
        </Link>
      </p>

      <h1 className="text-3xl font-bold text-slate-900">
        Política de privacidade — Civilium Bridge
      </h1>
      <p className="mt-2 text-slate-600">Última atualização: junho de 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Resumo</h2>
          <p>
            A extensão <strong>Civilium Bridge</strong> atua como ponte entre o
            aplicativo web Civilium e o portal oficial da Receita Federal do
            Brasil. Ela não vende dados, não exibe anúncios e não rastreia
            navegação fora dos sites necessários para a consulta cadastral.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Dados processados
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Dados de consulta:</strong> nome, CPF e data de
              nascimento informados no lote Civilium, usados somente para
              preencher o formulário da Receita e devolver o resultado da
              verificação.
            </li>
            <li>
              <strong>Configuração local:</strong> URL do Civilium e chave de
              integração informada pelo administrador, armazenadas em{" "}
              <code>chrome.storage.local</code> no dispositivo do usuário.
            </li>
            <li>
              <strong>Estado temporário de sessão:</strong> identificadores de
              consulta e aba ativa, mantidos apenas enquanto a verificação está
              em andamento.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Onde os dados trafegam
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Civilium</strong> (<code>civiliumpro.vercel.app</code>) —
              início da consulta e recebimento do resultado.
            </li>
            <li>
              <strong>Receita Federal</strong> (
              <code>servicos.receita.fazenda.gov.br</code>) — formulário
              público de consulta com CAPTCHA resolvido manualmente pelo
              usuário.
            </li>
          </ul>
          <p className="mt-3">
            A extensão não envia dados a terceiros, analytics ou redes
            publicitárias.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Permissões</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>tabs</strong> — abrir e reutilizar a aba do portal da
              Receita durante consultas em lote.
            </li>
            <li>
              <strong>storage</strong> — salvar configuração e estado temporário
              da consulta no navegador.
            </li>
            <li>
              <strong>host_permissions</strong> — acesso restrito ao Civilium e
              ao portal da Receita Federal.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Retenção</h2>
          <p>
            Resultados definitivos ficam no servidor Civilium conforme a
            política do aplicativo web. A extensão mantém apenas dados
            temporários de sessão e configuração local até ser desinstalada ou
            reconfigurada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contato</h2>
          <p>
            Dúvidas sobre privacidade ou uso da extensão devem ser encaminhadas
            ao administrador do Civilium na sua organização.
          </p>
        </section>
      </div>
    </main>
  );
}
