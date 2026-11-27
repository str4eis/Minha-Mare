import type { Metadata } from "next";
import LegalPageShell from "@/components/ui/LegalPageShell";
import { CONTACT_EMAIL, LEGAL_UPDATED_AT } from "@/lib/utils/legal";

export const metadata: Metadata = {
  title: "Termos de Uso | Minha Maré",
  description: "Conheça as condições básicas de uso do Minha Maré.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Termos de Uso" updatedAt={LEGAL_UPDATED_AT}>
      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Como usar o aplicativo
        </h2>
        <p className="mt-2">
          O Minha Maré é uma ferramenta de apoio para seu uso pessoal. Ao criar
          uma conta, você concorda em usar o aplicativo de forma responsável e
          manter seus dados de acesso em segurança.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Seus lançamentos
        </h2>
        <p className="mt-2">
          Você é responsável pelas informações que registra, como valores,
          datas, vendas e gastos. Confira os lançamentos para que os resumos e
          relatórios sejam úteis para você.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Uma ferramenta de apoio
        </h2>
        <p className="mt-2">
          Os resultados ajudam a acompanhar sua atividade, mas não substituem a
          orientação de um contador ou de outro profissional.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Disponibilidade
        </h2>
        <p className="mt-2">
          Podemos fazer melhorias e manutenção no aplicativo. Por isso, podem
          ocorrer instabilidades ou períodos em que alguma função fique
          indisponível.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Ajuda e encerramento da conta
        </h2>
        <p className="mt-2">
          Para pedir ajuda, escreva para{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-mare-primary underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          . Você pode excluir sua conta e os dados associados pela opção{" "}
          <strong>Excluir minha conta</strong>, em <strong>Perfil</strong>.
        </p>
      </section>
    </LegalPageShell>
  );
}
