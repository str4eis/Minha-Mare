import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";
import { CONTACT_EMAIL, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade | Minha Maré",
  description: "Saiba como o Minha Maré usa e protege seus dados.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Política de Privacidade" updatedAt={LEGAL_UPDATED_AT}>
      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Quem somos
        </h2>
        <p className="mt-2">
          O Minha Maré é um aplicativo do projeto Reginas. Ele ajuda você a
          organizar suas vendas e seus gastos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Quais dados usamos
        </h2>
        <p className="mt-2">Para o aplicativo funcionar, podemos usar:</p>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>Seu nome e e-mail da conta, inclusive se entrar com o Google.</li>
          <li>
            As vendas e os gastos que você registra, como valores, datas,
            categorias, descrições e compradores.
          </li>
          <li>
            Informações técnicas básicas sobre o acesso, usadas para manter o
            serviço funcionando e seguro.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Como usamos os dados
        </h2>
        <p className="mt-2">
          Usamos os dados para o aplicativo funcionar, mostrar seu histórico e
          seus resumos, e gerar relatórios. Não vendemos seus dados nem os
          compartilhamos para fazer propaganda.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Onde os dados ficam
        </h2>
        <p className="mt-2">
          Os dados ficam no Supabase, um banco de dados em nuvem. O aplicativo
          funciona na Vercel. Cada pessoa pode acessar apenas os dados da própria
          conta.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Login com Google
        </h2>
        <p className="mt-2">
          Se você escolher entrar com o Google, usamos seu nome, e-mail e foto
          básica de perfil para identificar sua conta. Não acessamos seu Gmail,
          seus contatos nem outros dados da conta Google.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Seus direitos e exclusão da conta
        </h2>
        <p className="mt-2">
          Você pode consultar, corrigir e apagar seus dados. Para excluir sua
          conta e os dados associados, acesse <strong>Perfil</strong> e escolha{" "}
          <strong>Excluir minha conta</strong>. Se precisar de ajuda, escreva
          para{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-mare-primary underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Por quanto tempo guardamos os dados
        </h2>
        <p className="mt-2">
          Mantemos os dados da sua conta até você pedir a exclusão da conta.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-mare-institutional">
          Mudanças nesta política
        </h2>
        <p className="mt-2">
          Podemos atualizar este texto quando o aplicativo mudar. A data no
          início da página mostra a revisão mais recente.
        </p>
      </section>
    </LegalPageShell>
  );
}
