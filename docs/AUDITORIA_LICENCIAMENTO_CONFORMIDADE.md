# 📄 Relatório de Auditoria de Licenciamento e Conformidade

**Projeto:** Clima API
**Etapa:** Tarefa 06 — Ética, Segurança e Documentação
**Gerado com apoio de IA**, revisado manualmente antes da entrega.

---

## 1. Escopo analisado

- Código-fonte do projeto (`index.html`, `assets/css/*`, `assets/js/*`)
- Serviços externos consumidos (Open-Meteo)
- Dependências de desenvolvimento mencionadas no `README.md` (Jest)

**Limitação declarada:** o arquivo `package.json` do projeto não foi
disponibilizado para esta auditoria. As conclusões sobre dependências
Node/npm foram baseadas na descrição do `README.md` (uso de **Jest**
como ferramenta de testes). Recomenda-se rodar os comandos indicados
na seção 4 e anexar o resultado real a este relatório antes de
publicar a branch `06_etica_seguranca`.

---

## 2. Dependências de execução (runtime — código enviado ao navegador)

| Componente | Tipo | Licença | Uso comercial permitido? | Exige atribuição? |
|---|---|---|---|---|
| HTML/CSS/JS próprios | Autoral | MIT (este projeto) | Sim | Não (é o próprio projeto) |

**Conclusão:** o projeto **não possui dependências de execução**
(nenhuma biblioteca JS, framework ou CSS de terceiros é enviada ao
navegador). Isso elimina, na prática, qualquer risco de
incompatibilidade de licença em produção.

---

## 3. Serviço externo: Open-Meteo (API)

| Item | Detalhe |
|---|---|
| Uso no projeto | Geocodificação de cidades + dados meteorológicos atuais e previsão de 7 dias |
| Licença dos dados | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Exige atribuição? | **Sim** — a licença CC BY exige crédito ao autor/fonte dos dados. |
| Uso comercial | Permitido para uso **não comercial** dentro dos limites gratuitos publicados pela Open-Meteo. **Uso comercial ou em maior volume pode exigir uma chave de API paga** — ver https://open-meteo.com/en/pricing. |
| Ação tomada nesta auditoria | Atribuição adicionada em três lugares: `NOTICE.md`, rodapé (`<footer>`) do `index.html` e aviso de privacidade/licenciamento (`#privacy-notice`) visível na tela inicial. |

**Recomendação de conformidade:** caso o projeto deixe de ser apenas
educacional e passe a ser usado comercialmente (ex.: monetizado,
integrado a um produto pago), é necessário revisar os termos de uso
atuais da Open-Meteo e, se aplicável, contratar um plano comercial com
chave de API antes do lançamento.

---

## 4. Dependências de desenvolvimento (não enviadas ao navegador)

**Atualização:** o `package.json` e o `package-lock.json` reais do
projeto foram fornecidos e auditados nesta revisão (`npm ci`, `npm
audit` e `npx license-checker`, com o ambiente de rede restrito ao
registro oficial do npm).

| Verificação | Resultado |
|---|---|
| Pacotes instalados (diretos + transitivos) | **294** |
| Vulnerabilidades conhecidas (`npm audit`) | **0** |
| `npm ci` (instalação reprodutível pelo lockfile) | ✅ Executa sem erros |
| `npx jest --version` | ✅ `30.4.1` — Jest funcional |

### Distribuição de licenças das 294 dependências

| Licença | Quantidade | Compatível com uso comercial/educacional? |
|---|---|---|
| MIT | 218 | ✅ Sim (permissiva) |
| ISC | 34 | ✅ Sim (permissiva, equivalente ao MIT) |
| BSD-3-Clause | 12 | ✅ Sim (permissiva) |
| Apache-2.0 | 5 | ✅ Sim (permissiva, com cláusula de patentes) |
| BlueOak-1.0.0 | 4 | ✅ Sim (permissiva, moderna) |
| BSD-2-Clause | 1 (`esprima`) | ✅ Sim (permissiva) |
| MIT OR CC0-1.0 | 1 (`type-fest`) | ✅ Sim (dupla licença permissiva) |
| CC-BY-4.0 | 1 (`caniuse-lite`) | ✅ Sim, mas **exige atribuição** — adicionada em `NOTICE.md` |

**Nenhuma dependência com licença restritiva (GPL, AGPL, LGPL, SSPL,
BUSL etc.) foi encontrada.** Todas as 294 dependências são bibliotecas
transitivas do **Jest** (test runner) e do **Babel** (usado pelo Jest
para transformar `import`/`export` durante os testes) — nenhuma delas
é enviada ao navegador do usuário final; fazem parte apenas do
ambiente de desenvolvimento/testes.

A lista completa (pacote, versão, licença e repositório) foi exportada
para [`docs/licencas-dependencias.csv`](./licencas-dependencias.csv).

### 🛠️ Correções aplicadas ao `package.json` nesta auditoria

| # | Problema encontrado | Correção aplicada |
|---|---|---|
| 1 | Campo `"license": "ISC"` divergente da licença real do projeto (o `LICENSE` do repositório é MIT) | Alterado para `"license": "MIT"`, consistente com o arquivo `LICENSE`. |
| 2 | Todas as **294 dependências transitivas do Jest** estavam listadas em `"dependencies"` (produção) em vez de `"devDependencies"` — provavelmente um efeito colateral de uma instalação feita sem a flag `--save-dev` | Removido o bloco `"dependencies"` incorreto; o projeto passa a declarar apenas `"devDependencies": { "jest": "^30.4.2" }`, que é tecnicamente correto (o Jest e suas dependências transitivas continuam resolvidos automaticamente pelo `package-lock.json`, sem afetar `npm test`). |
| 3 | `package-lock.json` desatualizado em relação à correção acima | Regenerado com `npm install` e revalidado com `npm ci` (reprodutibilidade confirmada). |

> **Por que isso importa para conformidade:** listar dependências de
> teste como "dependencies" de produção não causa um problema de
> *licenciamento* em si (todas são permissivas), mas é uma
> inconsistência que pode levar, no futuro, a alguém instalar o Jest
> inteiro em um ambiente de produção/deploy por engano, ou a
> ferramentas de auditoria de terceiros classificarem erroneamente o
> projeto como dependente de Jest em runtime. Corrigido preventivamente.

Comandos usados nesta auditoria (reprodutíveis por qualquer pessoa com
o `package.json`/`package-lock.json` do repositório):

```bash
npm ci                          # instalação reprodutível
npm audit                       # 0 vulnerabilidades encontradas
npx license-checker --summary   # distribuição de licenças acima
npx license-checker --csv \
  --out docs/licencas-dependencias.csv   # relatório completo
```

### ℹ️ Observação informativa: `"type": "commonjs"` x ES Modules do app

O `package.json` declara `"type": "commonjs"` (padrão do Node), mas os
arquivos em `assets/js/*.js` usam `import`/`export` (ES Modules). Isso
**não afeta o funcionamento da aplicação no navegador** (que carrega
os scripts via `<script type="module">` no `index.html`, e o
navegador ignora completamente o `package.json`) **nem os testes com
Jest** (que usam Babel, via `babel-jest`, para transformar
`import`/`export` antes da execução — confirmado nas dependências já
presentes no projeto). O único cenário afetado seria tentar executar
algum desses arquivos diretamente com `node arquivo.js` fora do
ambiente de teste, o que já não é um caso de uso do projeto. Não foi
necessária nenhuma alteração por conta disso — registrado aqui apenas
por transparência técnica.

---

## 5. Fontes, ícones e outros ativos

| Item | Situação |
|---|---|
| Fontes | Nenhuma fonte externa; usa a pilha padrão do sistema operacional (`Arial, Helvetica, sans-serif`). Sem licenciamento aplicável. |
| Ícones | Emojis Unicode nativos (ex.: 🌧️, ❄️, ⛈️), não uma biblioteca de ícones de terceiros. Sem licenciamento aplicável. |
| Imagens | Nenhuma imagem de terceiros incluída no repositório. |

---

## 6. Compatibilidade de licenças

Como o projeto **não possui dependências de execução de terceiros**, e
o único uso externo é uma **API de dados** (não uma biblioteca de
código), não há conflito de licenças de software a resolver. O ponto
de atenção real é puramente contratual/de uso justo: **respeitar os
limites de requisição e os termos da Open-Meteo**, e **atribuir a
fonte dos dados**, o que já foi implementado nesta auditoria.

---

## 7. Ações de conformidade aplicadas nesta auditoria

- [x] Criado `LICENSE` (MIT, em inglês e português) para o
      código-fonte do projeto.
- [x] Criado `NOTICE.md` com atribuição da Open-Meteo (CC BY 4.0) e do
      Jest (MIT).
- [x] Adicionado aviso de licenciamento visível na interface
      (`#privacy-notice`) e no rodapé (`<footer>`).
- [x] Seção de licenciamento incluída no `README.md`.
- [x] Rodado `npm ci`, `npm audit` e `npx license-checker` com o
      `package.json`/`package-lock.json` reais do projeto — **0
      vulnerabilidades** e **nenhuma licença restritiva** encontrada.
- [x] Corrigido `"license": "ISC"` → `"license": "MIT"` em
      `package.json`, para bater com o `LICENSE` do repositório.
- [x] Movidas as dependências transitivas do Jest de `dependencies`
      para apenas `devDependencies: { jest }`, com `package-lock.json`
      regenerado e revalidado (`npm ci` funcionando).
- [x] Exportado relatório completo de licenças para
      `docs/licencas-dependencias.csv`.
- [x] Adicionada atribuição do `caniuse-lite` (CC BY 4.0) ao
      `NOTICE.md`.

---

## 8. Conclusão

O projeto está em conformidade com boas práticas de licenciamento:
não distribui código de terceiros ao usuário final, atribui
corretamente a fonte dos dados meteorológicos (Open-Meteo, CC BY 4.0)
e possui um arquivo `LICENSE` claro (MIT) definindo os termos de uso
do próprio código — agora também refletido corretamente no
`package.json`. A auditoria real das 294 dependências de
desenvolvimento (`npm audit` + `license-checker`) não encontrou
**nenhuma vulnerabilidade conhecida** nem **nenhuma licença
incompatível** com uso comercial ou educacional; a única exigência
adicional (atribuição do `caniuse-lite`, CC BY 4.0) já foi registrada
em `NOTICE.md`. Duas inconsistências de configuração foram
encontradas e corrigidas no `package.json` (campo `license` e
localização incorreta das dependências do Jest).

> Este relatório foi elaborado com apoio de ferramentas de IA e revisado
> manualmente. Ele não substitui uma opinião jurídica formal sobre
> licenciamento, especialmente em caso de uso comercial do projeto.
