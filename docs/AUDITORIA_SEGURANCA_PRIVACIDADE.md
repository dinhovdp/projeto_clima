# 🔐 Relatório de Auditoria de Segurança e Privacidade

**Projeto:** Clima API
**Etapa:** Tarefa 06 — Ética, Segurança e Documentação
**Gerado com apoio de IA**, revisado manualmente antes da entrega.

---

## 1. Escopo analisado

Foram revisados todos os arquivos-fonte do projeto:

- `index.html`
- `assets/css/*.css`
- `assets/js/api.js`, `background.js`, `cache.js`, `comparison.js`,
  `forecast.js`, `geocoding.js`, `weather.js`, `weather-canvas.js`

Não foi fornecido `package.json` para esta revisão — a seção 5 trata
disso separadamente.

---

## 2. Fluxo de dados da aplicação

```
Usuário digita o nome de uma cidade
            ↓
   geocoding.js valida e normaliza
   o texto (sem HTML/script, até 100
   caracteres, regex de nome geográfico)
            ↓
   Requisição HTTPS para
   geocoding-api.open-meteo.com
   (busca de coordenadas)
            ↓
   Requisição HTTPS para
   api.open-meteo.com/v1/forecast
   (clima atual e previsão)
            ↓
   Resultado exibido na interface
   e salvo em cache local
   (localStorage do navegador,
   validade de 10 minutos)
```

**Nenhum dado é enviado a um servidor próprio** — o projeto é 100%
estático (HTML/CSS/JS) e não possui backend. Os únicos destinos de
rede são os dois endpoints públicos da Open-Meteo.

---

## 3. Achados

### ✅ Pontos positivos identificados

| Item | Situação |
|---|---|
| Chaves de API / segredos no código | **Nenhum encontrado.** A Open-Meteo não exige chave para os endpoints usados. |
| Uso de `innerHTML` com dados do usuário | **Não ocorre.** Todo conteúdo dinâmico (nome de cidade, previsão, comparação, opções de localização) é inserido via `textContent`/`createElement`, prevenindo XSS. Os únicos usos de `innerHTML` limpam containers (`= ''`). |
| Comunicação com APIs externas | **Sempre via HTTPS** (`https://api.open-meteo.com`, `https://geocoding-api.open-meteo.com`). |
| Uso de `eval`, `document.write`, `Function()` | **Nenhum encontrado.** |
| Geolocalização do navegador (`navigator.geolocation`) | **Não utilizada.** A localização vem exclusivamente do texto digitado pelo usuário. |
| Cookies / rastreamento / analytics | **Nenhum encontrado.** |
| Scripts ou fontes de terceiros (CDNs externos) | **Nenhum.** Todo o CSS/JS é local; a tipografia usa fontes do sistema. |
| Validação de entrada | Cidade normalizada (Unicode NFC), limitada a 100 caracteres, validada por regex que rejeita `<script>`, `@`, `#`, `$` e caracteres de controle. |
| Timeout de requisições | Todas as chamadas `fetch` usam `AbortController` com limite de 15s, evitando requisições penduradas. |
| Corrida de requisições (race condition) | Um `idRequisicao` interno garante que uma resposta atrasada de uma pesquisa antiga não sobrescreva uma pesquisa mais recente. |

### ⚠️ Riscos identificados e correções já aplicadas nesta auditoria

| # | Risco | Severidade | Correção aplicada |
|---|---|---|---|
| 1 | Ausência de uma política de segurança de conteúdo (CSP) | Baixa/Média | Adicionada tag `<meta http-equiv="Content-Security-Policy">` em `index.html`, restringindo `script-src`/`style-src` a `'self'` e `connect-src` apenas aos domínios da Open-Meteo. Mitiga XSS residual e carregamento de scripts não autorizados. |
| 2 | `Referer` completo (com a cidade pesquisada na URL) potencialmente enviado à Open-Meteo | Baixa | Adicionado `referrerPolicy: 'strict-origin-when-cross-origin'` nas três chamadas `fetch` (`geocoding.js`, `weather.js`, `forecast.js`). |
| 3 | Ausência de aviso de privacidade visível ao usuário | Baixa (conformidade/transparência) | Adicionado um aviso (`#privacy-notice`) na tela inicial explicando o que é enviado à Open-Meteo, o que é armazenado localmente e por quanto tempo. Pode ser fechado e a preferência é lembrada localmente. |
| 4 | `clima_api_tema` (preferência de tema) gravado no `localStorage` sem expiração | Muito baixa | Aceitável: não é dado sensível (apenas `"dark"`/`"light"`), mas documentado explicitamente no aviso de privacidade e neste relatório para transparência. |
| 5 | Chaves de cache antigas (`clima_api_cache_*`) não são removidas ativamente após expirar, apenas ignoradas/sobrescritas | Muito baixa | Risco apenas de acúmulo de espaço em `localStorage` ao longo do tempo, não de exposição de dados. **Recomendação futura:** rotina de limpeza periódica (`Object.keys(localStorage)` + checagem de expiração) — não implementada nesta etapa por ser melhoria de manutenção, não uma vulnerabilidade de segurança. |

### 🚫 Riscos não aplicáveis a este projeto

- **Autenticação/autorização:** o projeto não possui login, sessões ou dados de usuário identificáveis — não se aplica.
- **Injeção de SQL/NoSQL:** não há banco de dados nem backend.
- **CSRF:** não há formulários que alterem estado em um servidor próprio; toda a "escrita" acontece localmente no navegador (`localStorage`).
- **Exposição de variáveis de ambiente (`.env`):** não há build step nem variáveis de ambiente no projeto atual.

---

## 4. Dados coletados, armazenados e utilizados (Privacidade)

| Dado | Origem | Onde fica | Por quanto tempo | Compartilhado com |
|---|---|---|---|---|
| Nome da cidade digitada | Usuário | Enviado por HTTPS à Open-Meteo; também salvo como parte da chave de cache no `localStorage` do próprio navegador | Cache: 10 minutos. Não expira automaticamente do `localStorage`, mas é ignorado após expirar | Open-Meteo (apenas para localizar a cidade) |
| Latitude/longitude da cidade encontrada | Resposta da Open-Meteo | `localStorage` (cache) | 10 minutos (lógico) | Reenviado à própria Open-Meteo para buscar o clima |
| Dados meteorológicos (temperatura, umidade, vento etc.) | Open-Meteo | `localStorage` (cache) | 10 minutos (lógico) | Não compartilhado com terceiros |
| Preferência de tema (claro/escuro) | Escolha do usuário na interface | `localStorage` | Indefinido (até o usuário limpar os dados do navegador) | Não compartilhado |
| Preferência "aviso de privacidade dispensado" | Escolha do usuário | `localStorage` | Indefinido | Não compartilhado |

**Nenhum dado pessoal identificável (nome, e-mail, IP, geolocalização
via GPS) é coletado pela aplicação.** A única informação fornecida
pelo usuário é o nome de uma cidade, que é um dado de localização
genérico (não vinculado a uma pessoa específica pela aplicação).
O tratamento que a Open-Meteo faz das requisições que recebe (por
exemplo, registro de IP em seus próprios logs de servidor) é regido
pela política de privacidade deles, não pela deste projeto.

---

## 5. Observações sobre dependências (Node/Jest)

O `package.json` do projeto não foi disponibilizado para esta
auditoria de código. Com base no `README.md` do projeto:

- **Jest** é usado apenas como dependência de **desenvolvimento** para
  testes automatizados — não é enviado ao navegador do usuário final,
  portanto não representa superfície de ataque em produção.
- **Recomendação:** antes de publicar/atualizar o repositório, rodar
  `npm audit` e `npm ls --all` para confirmar que não há
  vulnerabilidades conhecidas nas dependências de desenvolvimento, e
  anexar o resultado a este relatório.

---

## 6. Recomendações para o ambiente de produção

1. **Hospedar exclusivamente via HTTPS** (GitHub Pages já atende a
   este requisito por padrão).
2. **Manter a tag CSP** adicionada nesta auditoria; revisar a lista de
   `connect-src` caso novas APIs sejam integradas no futuro.
3. **Não introduzir chaves de API no código-fonte no futuro** — caso a
   aplicação evolua para usar um endpoint pago/autenticado da
   Open-Meteo (ou outro serviço), a chave deve ficar em uma variável
   de ambiente/backend proxy, nunca em JavaScript exposto ao
   navegador.
4. **Revisar periodicamente `npm audit`** enquanto o Jest (ou outras
   dependências de desenvolvimento) fizer parte do projeto.
5. **Manter o aviso de privacidade visível** e atualizá-lo caso a
   aplicação passe a coletar outros tipos de dado (ex.: geolocalização
   por GPS, analytics, etc.).
6. Considerar, no futuro, adicionar cabeçalhos HTTP de segurança
   (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`)
   caso o projeto passe a ser servido por um servidor próprio em vez
   de hospedagem estática simples (esses cabeçalhos não podem ser
   definidos via `<meta>` e dependem da configuração do servidor).

---

## 7. Conclusão

O projeto apresenta uma **superfície de risco baixa**: é uma aplicação
100% front-end, sem backend próprio, sem autenticação, sem
armazenamento de dados sensíveis e sem dependências de execução em
produção. As correções aplicadas nesta auditoria (CSP, `referrerPolicy`
e aviso de privacidade visível) reforçam a postura de segurança e a
transparência com o usuário, adequadas ao estágio atual do projeto
(estudo/portfólio, sem fins comerciais).

> Este relatório foi elaborado com apoio de ferramentas de IA e revisado
> manualmente. Ele não substitui uma auditoria de segurança profissional
> formal, especialmente caso o projeto venha a ser usado comercialmente
> ou passe a tratar dados pessoais sensíveis.
