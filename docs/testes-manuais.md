# Testes manuais: Minha Maré

Rode estes testes antes de cada merge que mexa em armazenamento, datas, totais ou formulários.

## Preparação

- Rode `npm run dev` em **uma única porta**. Encerre servidores antigos com `pkill -f "next dev"`.
- Use sempre a **mesma aba e o mesmo endereço**: o `localStorage` é separado por endereço (porta diferente = dados diferentes).
- Abra o DevTools (`F12`), vá na aba **Console**, digite `allow pasting` (digitando, não colando) e aperte Enter.

---

## 1. JSON corrompido no localStorage

**Objetivo:** o app não pode apagar nem sobrescrever dados ilegíveis antes da primeira alteração da usuária.

**Passo 1: limpar as chaves**
```js
localStorage.removeItem("minha-mare:v1");
localStorage.removeItem("minha-mare:v1:backup");
localStorage.removeItem("minha-mare:v1:backup-2");
```

**Passo 2: corromper e recarregar**
```js
localStorage.setItem("minha-mare:v1", "{json inválido");
location.reload();
```

**Passo 3: conferir logo após o reload, SEM registrar nada**
```js
({
  principal: localStorage.getItem("minha-mare:v1"),
  backup: localStorage.getItem("minha-mare:v1:backup"),
  backup2: localStorage.getItem("minha-mare:v1:backup-2"),
})
```
Esperado:
- `principal`: `"{json inválido"` (não foi sobrescrita)
- `backup`: `"{json inválido"` (cópia criada)
- `backup2`: `null`
- O app abre zerado, sem erro na tela

**Passo 4: primeira alteração.** Registre uma venda de `10` e rode a linha do passo 3 de novo.

Esperado:
- `principal`: JSON válido, com a venda dentro
- `backup`: continua `"{json inválido"`

**Passo 5: segunda corrupção** (requer o commit corretivo da Fase 2)
```js
localStorage.setItem("minha-mare:v1", "{outro erro");
location.reload();
```
Rode a linha do passo 3.

Esperado: `backup` continua `"{json inválido"` e `backup2` tem `"{outro erro"`.

**Se falhar:**
- `principal` vazia ou com estado válido logo após o passo 2 → o app sobrescreveu a chave antes da primeira alteração.
- `backup` igual a `null` → o backup não foi criado.

---

## 2. Dados de exemplo antigos

**Objetivo:** dados de demonstração antigos somem; lançamentos reais permanecem.

```js
localStorage.setItem("minha-mare:v1", JSON.stringify({
  userName: "Maria da Maré",
  onboarded: true,
  metaAposentadoria: 500,
  poupancaAposentadoria: 225,
  sales: [
    { id: "s1", category: "peixe", buyer: "Exemplo", quantity: 1, unit: "kg", value: 120, date: new Date().toISOString() },
    { id: "s9999", category: "ostra", buyer: "Venda real", quantity: 2, unit: "dz", value: 50, date: new Date().toISOString() }
  ],
  expenses: []
}));
location.reload();
```

Esperado:
- Em `/vendas` aparece só **"Venda real"**; o total do mês é **R$ 50,00**
- "Exemplo" (id `s1`) não aparece
- A saudação da home é **"Olá!"**, sem nome

Obs.: a chave só é regravada depois da primeira alteração. Para ver o estado migrado em disco, registre ou edite um lançamento e consulte `localStorage.getItem("minha-mare:v1")`.

---

## 3. Checklist da Fase 2 (histórico, edição, exclusão)

- [ ] Venda com **data de 3 dias atrás**: aparece na lista e entra nos totais.
- [ ] Venda no **1º dia de um mês anterior**: cai no mês certo e o seletor vai para esse mês.
- [ ] **Editar só o valor** de uma venda antiga (sem mexer na data): data e hora originais permanecem; o total do mês muda.
- [ ] Editar a **data** de uma venda: ela muda de dia (e de mês, se for o caso).
- [ ] **Excluir** pelo diálogo: confirma e o item some. Testar também `Esc` e o botão "Cancelar".
- [ ] Busca por `peixe` e por `PEIXE`: mesmo resultado. Busca por termo sem acento encontra texto com acento.
- [ ] Em `/gastos`: filtro por categoria dentro de Pesca e dentro de Casa.
- [ ] Abrir `/vendas/id-que-nao-existe/editar` e `/gastos/id-que-nao-existe/editar`: aparece mensagem amigável, sem tela quebrada.
- [ ] Trocar de mês: totais **e listas** mudam; estados vazios aparecem ("Nenhum lançamento em <mês>").
- [ ] Data futura: o campo de data não permite escolher (e o formulário rejeita se forçado).
- [ ] Console do navegador **sem erro de hidratação**.
- [ ] No celular (ou modo responsivo do DevTools): diálogo de exclusão e campo de data cabem na tela.
- [ ] Rodar também: `npm run build`, `npm run lint`, `npm test`.

---

## 4. Teste de virada de dia (à noite, horário de Recife)

Depois das 21h, em Recife já é o dia seguinte em UTC. Conferir que:
- [ ] Uma venda registrada às 22h aparece no dia certo da lista (dia de Recife, não o UTC).
- [ ] Uma venda registrada às 23h do último dia do mês fica no mês certo, não no seguinte.

---

## Registro de execução

| Data | Branch | Testes feitos | Resultado | Observações |
|------|--------|---------------|-----------|-------------|
|      |        |               |           |             |
