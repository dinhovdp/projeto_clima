# 🌤️ Clima API

Aplicação web desenvolvida em **HTML, CSS e JavaScript** (ES Modules)
para consulta de informações meteorológicas em tempo real.

O projeto utiliza a **Open-Meteo API** para obter dados geográficos e
meteorológicos e apresentá-los de forma clara e visual para o usuário,
incluindo animações climáticas reais desenhadas em `<canvas>`.

O desenvolvimento tem como objetivo praticar conceitos de
desenvolvimento web front-end, consumo de APIs, organização de
projetos e boas práticas de segurança, privacidade e licenciamento.

---

## 📌 Objetivo

O objetivo da aplicação é permitir que o usuário informe o nome de uma
cidade e visualize as condições climáticas atuais, além de uma
previsão para os próximos 7 dias — com um fundo animado que reflete
visualmente o clima e o horário do local pesquisado.

A interface foi desenvolvida para funcionar em computadores e
dispositivos móveis.

---

## 🚀 Funcionalidades

### 🔎 Consulta por cidade

A aplicação permite pesquisar uma cidade pelo nome. Durante a consulta
são obtidas:

- Nome da cidade
- País / região
- Latitude
- Longitude
- Dados climáticos atuais
- Horário local da cidade

A localização é obtida através do serviço de geocodificação da
Open-Meteo, com normalização Unicode do texto digitado e validação
contra entradas vazias, longas demais (acima de 100 caracteres) ou com
caracteres inválidos (ex.: `<script>`, símbolos soltos).

**Cidades homônimas:** quando a pesquisa retorna mais de uma cidade
compatível (por exemplo, "São Paulo" existe em mais de um país), a
aplicação exibe as opções encontradas — com nome, país/região e demais
dados que ajudem a diferenciá-las — para que o usuário escolha a
cidade correta antes de continuar.

### 🌡️ Informações climáticas

A aplicação apresenta informações meteorológicas da cidade pesquisada,
incluindo:

- 🌡️ Temperatura atual
- 🌤️ Condição climática
- 💧 Umidade
- 🌡️ Sensação térmica
- 💨 Velocidade do vento *(apenas a velocidade — a direção do vento não
  é exibida, por não agregar valor prático à experiência do usuário
  comum)*
- 🕐 Horário local da cidade pesquisada
- 🕒 Horário da última atualização

### 📅 Previsão para 7 dias

A aplicação apresenta uma previsão para os próximos sete dias. Cada
card apresenta:

- Dia da semana
- Data
- Ícone correspondente à condição climática
- Descrição do clima
- Temperatura máxima
- Temperatura mínima

**Desktop:** os cards são exibidos lado a lado, em grade, com tamanho
compacto e centralizado.
**Dispositivos móveis:** os cards ficam em um container horizontal que
pode ser percorrido por arraste lateral, sem empilhar verticalmente.

### 🏙️ Comparação entre cidades

A aplicação permite adicionar até **5 cidades** para comparação lado a
lado. Os mini cards apresentam informações resumidas de cada cidade:

- 🏙️ Nome da cidade
- 🌤️ Condição climática
- 🌡️ Temperatura
- 💧 Umidade
- 🌡️ Sensação térmica
- 💨 Velocidade do vento

Também é possível remover cidades já adicionadas. Regras de
comparação:

| Situação | Mensagem exibida |
|---|---|
| Cidade adicionada com sucesso | "Cidade selecionada com sucesso." |
| Tentativa de adicionar cidade repetida | "Essa cidade já foi escolhida." |
| Tentativa de adicionar a 6ª cidade | "Limite de 5 cidades atingido." |

O botão de comparação só fica habilitado quando existem condições
válidas para comparar (uma cidade pesquisada, ainda não adicionada, e
limite não atingido).

### 💾 Cache de dados

A aplicação utiliza o `localStorage` do navegador para armazenar
temporariamente os dados consultados, reduzindo requisições
desnecessárias quando uma cidade já foi pesquisada recentemente.

O cache possui validade de **10 minutos** e armazena, por cidade:

- Cidade pesquisada (normalizada)
- Informações de localização
- Clima atual
- Previsão de 7 dias
- Horário do armazenamento

Quando o cache está válido, a aplicação utiliza os dados armazenados
em vez de realizar uma nova consulta. Uma requisição em andamento
possui um identificador interno (`idRequisicao`) que impede que uma
resposta atrasada de uma pesquisa antiga sobrescreva os dados de uma
pesquisa mais recente.

### 🌓 Modo claro e modo escuro

A aplicação possui dois modos visuais:

**☀️ Modo claro**
Recebe todos os efeitos visuais e animações relacionados à condição
climática e ao horário do local pesquisado (ver seção abaixo).

**🌙 Modo escuro**
Interface em tons de azul escuro, visualmente estática — não recebe
nenhum efeito climático nem animação, independentemente do horário ou
da condição do tempo. É a opção mais simples, pensada para leitura em
ambientes com pouca luz.

A preferência de tema é lembrada localmente entre visitas
(`localStorage`).

### 🌦️ Background dinâmico e efeitos climáticos animados

No modo claro, o fundo da aplicação muda de acordo com a condição
climática **e** com o horário local da cidade pesquisada (manhã,
tarde, noite ou madrugada), com **animações reais desenhadas em
`<canvas>`** — não apenas gradientes estáticos:

| Condição | Efeito animado |
|---|---|
| ☀️ Céu limpo (dia) | Sol com halo suave e raios que giram lentamente |
| 🌙 Céu limpo (noite) | Céu estrelado com estrelas cintilantes + **lua com a fase real do dia** (nova, crescente, cheia, minguante etc., calculada pelo ciclo sinódico lunar) |
| ⛅ Parcialmente nublado | Nuvens ambientes suaves, sol/lua parcialmente visível |
| ☁️ Nublado | Camadas de nuvem mais densas |
| 🌦️ Chuva leve | Gotas finas e esparsas, com respingo ao tocar o chão |
| 🌧️ Chuva forte | Chuva densa, com respingos mais intensos |
| ⛈️ Tempestade | Chuva forte + raios que surgem aleatoriamente, iluminando a tela |
| 🧊 Chuva com granizo | Chuva + bolinhas de gelo caindo e saltando ao tocar o chão, com raios ocasionais |
| ❄️ Neve | Flocos de neve com profundidade (tamanho/velocidade variam), criando sensação 3D |
| 💨 Vento forte | Rajadas visuais e folhas/detritos sendo levados pelo vento, ativadas automaticamente quando a velocidade do vento informada pela API é alta — combinável com qualquer uma das condições acima |

Esses efeitos são desenhados por um motor de animação em `<canvas>`
(`weather-canvas.js`), sem bibliotecas externas, e:

- **Ficam desativados no modo escuro.**
- Respeitam a preferência do sistema **`prefers-reduced-motion`**
  (usuários com essa preferência veem um quadro estático, sem
  animação contínua).
- São reaplicados automaticamente ao trocar de tema, sem precisar
  pesquisar a cidade novamente.

---

## 🔒 Privacidade

- O nome da cidade digitado é enviado **apenas** para a API pública da
  **Open-Meteo**, exclusivamente para localizar a cidade e consultar o
  clima. Não é coletado, armazenado em nenhum servidor próprio, nem
  compartilhado com terceiros além da Open-Meteo.
- A aplicação **não usa geolocalização por GPS** do dispositivo
  (`navigator.geolocation`) — a localização vem apenas do texto
  digitado.
- Os únicos dados salvos localmente (no `localStorage` do seu próprio
  navegador, nunca em um servidor) são: o cache de clima por cidade
  (expira em 10 minutos), a preferência de tema (claro/escuro) e a
  preferência de ter fechado o aviso de privacidade.
- A aplicação **não usa cookies, analytics ou scripts de
  rastreamento** de nenhum tipo.
- Um aviso de privacidade e licenciamento é exibido na tela inicial da
  aplicação, resumindo estes pontos para o usuário final.

Para o relatório completo de segurança e privacidade, veja
[`docs/AUDITORIA_SEGURANCA_PRIVACIDADE.md`](./docs/AUDITORIA_SEGURANCA_PRIVACIDADE.md).

---

## 📄 Licenciamento

- O código-fonte deste projeto é distribuído sob a
  **[Licença MIT](./LICENSE)** (disponível em inglês e português).
- Os dados meteorológicos e de geocodificação são fornecidos pela
  **[Open-Meteo](https://open-meteo.com/)**, sob licença
  **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** — uso
  comercial em maior escala pode exigir uma chave de API paga; veja os
  [termos oficiais](https://open-meteo.com/en/terms).
- Atribuições completas de bibliotecas, APIs e demais componentes de
  terceiros estão em [`NOTICE.md`](./NOTICE.md).
- As **294 dependências de desenvolvimento** (Jest e sua árvore de
  dependências transitivas) foram auditadas: **0 vulnerabilidades**
  conhecidas e **nenhuma licença incompatível** com uso comercial ou
  educacional. Lista completa em
  [`docs/licencas-dependencias.csv`](./docs/licencas-dependencias.csv).
- Para a análise completa de conformidade de licenças, veja
  [`docs/AUDITORIA_LICENCIAMENTO_CONFORMIDADE.md`](./docs/AUDITORIA_LICENCIAMENTO_CONFORMIDADE.md).

---

## 📱 Responsividade

A aplicação foi desenvolvida para funcionar em diferentes tamanhos de
tela.

**🖥️ Desktop**

- O conteúdo permanece dentro do container principal
- Os cards de comparação são distribuídos de forma responsiva
- A previsão de 7 dias utiliza uma estrutura em grade, com cards
  pequenos e centralizados
- Os elementos são dimensionados para evitar que ultrapassem o
  container

**📱 Dispositivos móveis**

- A interface é reorganizada
- Os cards da previsão são percorridos horizontalmente (arraste
  lateral), sem empilhar verticalmente
- Os cards de comparação são adaptados à largura disponível
- Os elementos permanecem dentro dos limites da tela
- Os controles permanecem acessíveis

---

## 🛠️ Tecnologias utilizadas

- **HTML5** — estrutura da aplicação
- **CSS3** — estilização, responsividade, gradientes de humor por
  clima/horário e acessibilidade (`prefers-reduced-motion`)
- **JavaScript (ES Modules)** — lógica da aplicação, manipulação do
  DOM e o motor de animação em `<canvas>`
- **Canvas API** — animações climáticas reais (chuva, neve, granizo,
  raios, sol, lua com fase real, vento)
- **Fetch API** (com `AbortController` e `referrerPolicy`) —
  comunicação com APIs externas
- **Local Storage** — armazenamento temporário dos dados, apenas no
  navegador do usuário
- **Content Security Policy (CSP)** — restrição de origens de script e
  de rede, definida via `<meta>` em `index.html`
- **Jest** — testes automatizados (dependência de desenvolvimento)
- **Open-Meteo API** — dados meteorológicos e geográficos
- **Git / GitHub** — controle de versão e hospedagem do código-fonte

---

## 🌐 APIs utilizadas

### Open-Meteo

A aplicação utiliza os serviços da Open-Meteo para obter informações
geográficas e meteorológicas. Nenhuma chave de API é necessária para
os endpoints utilizados.

**🔎 Geocoding API**
Utilizada para localizar a(s) cidade(s) compatível(is) com o texto
informado pelo usuário (com suporte a até 6 interpretações do nome
digitado e até 10 resultados retornados pela API por consulta).

```
https://geocoding-api.open-meteo.com/v1/search
```

Retorna: nome da cidade, país, latitude, longitude e demais
informações de localização.

**🌤️ Forecast API**
Utilizada para consultar as condições climáticas atuais e a previsão.

```
https://api.open-meteo.com/v1/forecast
```

Retorna: temperatura, sensação térmica, umidade, velocidade e direção
do vento, código meteorológico, indicador de dia/noite, horário local,
temperaturas máxima/mínima e previsão diária.

---

## 📂 Estrutura do projeto

```
clima_api/
│
├── index.html
├── README.md
├── LICENSE
├── NOTICE.md
├── .gitignore
├── package.json
│
├── docs/
│   ├── AUDITORIA_SEGURANCA_PRIVACIDADE.md
│   ├── AUDITORIA_LICENCIAMENTO_CONFORMIDADE.md
│   └── licencas-dependencias.csv
│
├── assets/
│   ├── css/
│   │   ├── base.css            → variáveis, reset, tipografia
│   │   ├── layout.css          → estrutura geral da página
│   │   ├── components.css      → formulário, cards, avisos, botões
│   │   ├── backgrounds.css     → posicionamento do <canvas> de clima
│   │   ├── theme.css           → cores de fundo por clima + horário
│   │   ├── responsive.css      → regras de responsividade
│   │   ├── accessibility.css   → prefers-reduced-motion e afins
│   │   └── style.css           → ajustes finais / overrides
│   │
│   └── js/
│       ├── api.js              → orquestração geral (ES Modules)
│       ├── geocoding.js        → busca e validação de localização
│       ├── weather.js          → consulta do clima atual
│       ├── forecast.js         → previsão de 7 dias
│       ├── comparison.js       → comparação entre cidades
│       ├── cache.js            → cache local (localStorage)
│       ├── background.js       → categoria climática, fase do dia/lua
│       └── weather-canvas.js   → motor de animação em <canvas>
│
└── tests/
    └── ...
```

### 📄 Arquivos principais

**`index.html`**
Estrutura HTML da aplicação: formulário de pesquisa, aviso de
privacidade/licenciamento, mensagens de carregamento e erro, resultado
do clima, previsão de 7 dias, comparação entre cidades, controle de
tema, canvas de animação climática e rodapé com créditos.

**`assets/js/api.js`**
Módulo orquestrador. Importa e coordena os demais módulos, captura a
cidade informada, controla o fluxo de carregamento/erro, gerencia o
tema e inicializa o aviso de privacidade — sem duplicar a lógica que
já pertence aos módulos especializados.

**`assets/js/geocoding.js`**
Responsável exclusivamente pela localização: normalização e validação
do nome da cidade, consulta à Geocoding API, tratamento de cidades
homônimas e seleção pelo usuário.

**`assets/js/weather.js`**
Responsável exclusivamente pela consulta do clima atual: requisição
com timeout, validação da resposta e dos dados numéricos recebidos.

**`assets/js/forecast.js`**
Funcionalidade de previsão para 7 dias: interpretação dos códigos
meteorológicos, ícones, dias da semana, formatação de datas e criação
dos cards.

**`assets/js/comparison.js`**
Funcionalidade de comparação entre cidades: adicionar/remover cidades,
limite de 5 cidades, prevenção de duplicidade e mensagens ao usuário.

**`assets/js/cache.js`**
Cache local independente: criação de chaves, validade de 10 minutos e
leitura/escrita no `localStorage`.

**`assets/js/background.js`**
Define a categoria climática visual (a partir do código meteorológico
da API), a fase do dia e a fase real da lua; controla o tema
claro/escuro; e notifica o `weather-canvas.js` sobre o que desenhar.

**`assets/js/weather-canvas.js`**
Motor de animação em `<canvas>`, independente e sem bibliotecas
externas, responsável por desenhar chuva, neve, granizo, raios, sol,
lua (com fase real) e efeitos de vento — apenas no modo claro e
respeitando `prefers-reduced-motion`.

---

## 💻 Como executar o projeto

**1. Clonar o repositório**

```bash
git clone URL_DO_REPOSITORIO
```

**2. Entrar na pasta do projeto**

```bash
cd clima_api
```

**3. Instalar as dependências** (caso existam configuradas no
`package.json`, como o Jest para testes)

```bash
npm install
```

**4. Executar os testes**

```bash
npm test
```

**5. Executar a aplicação**

A aplicação deve ser executada através de um servidor HTTP local,
pois utiliza **ES Modules** (`import`/`export`), que exigem o
protocolo `http://` (e não funcionam ao abrir o arquivo diretamente
como `file://`). No Visual Studio Code, uma alternativa é utilizar a
extensão **Live Server**. Também pode ser utilizado outro servidor
HTTP local compatível com o projeto.

> ⚠️ A aplicação não deve ser aberta diretamente pelo navegador como
> página estática (`file://`) — os módulos ES6 e a Content Security
> Policy configurada exigem um servidor HTTP local para funcionar
> corretamente.

---

## 🧪 Testes automatizados

O projeto utiliza **Jest** (com Babel, via `babel.config.js`, para
suportar `import`/`export` nos testes) para testes automatizados que
importam e exercitam diretamente o código-fonte real da aplicação —
não apenas simulações isoladas de `fetch`.

**128 testes, 100% passando**, distribuídos em 6 arquivos (um por
módulo):

| Arquivo | O que cobre |
|---|---|
| `tests/geocoding.test.js` | Normalização Unicode, validação de nome de cidade (regex, limite de 100 caracteres, rejeição de `<script>`/símbolos), validação de coordenadas, chaves de cidades homônimas |
| `tests/weather.test.js` | Validação numérica, códigos WMO, descrições/ícones, classificação por categoria, `buscarClimaAtual` com `fetch` mockado (sucesso, erro HTTP, timeout, dados incompletos) |
| `tests/cache.test.js` | Geração de chave, expiração após 10 minutos (com `Date.now` mockado), remoção de cache expirado, JSON corrompido no `localStorage` |
| `tests/background.test.js` | Categorização climática (incluindo chuva leve/forte, granizo), cálculo real da fase da lua, fase do dia, aplicação de classes no modo claro/escuro |
| `tests/comparison.test.js` | Limite de 5 cidades, prevenção de duplicidade, mensagens exatas, remoção/limpeza |
| `tests/forecast.test.js` | Formatação de data, nome do dia da semana, validação e normalização da previsão de 7 dias |

Para executar os testes:

```bash
npm install
npm test
```

---

## 📝 Documentação com JSDoc

As funções JavaScript são documentadas utilizando o padrão JSDoc,
apresentando: finalidade da função, parâmetros recebidos, tipo dos
parâmetros, valor retornado, possíveis exceções e exemplos de
utilização.

Exemplo:

```javascript
/**
 * Consulta os dados climáticos de uma cidade.
 *
 * @param {string} cidade - Nome da cidade consultada.
 * @returns {Promise<Object>} Dados retornados pela API.
 */
```

A documentação facilita a compreensão, manutenção e evolução do
código.

---

## 🔐 Tratamento de erros

A aplicação possui mecanismos de tratamento de erros para diferentes
situações:

- Cidade não encontrada
- Pesquisa vazia ou com mais de 100 caracteres
- Nome de cidade com caracteres inválidos
- Falha na geocodificação
- Falha na consulta meteorológica
- Coordenadas fora do intervalo válido (latitude/longitude)
- Resposta HTTP inválida (`response.ok === false`)
- Dados incompletos ou não numéricos quando deveriam ser
- Timeout de requisição (acima de 15 segundos)
- Problemas de conexão
- Erros durante a leitura do cache
- Tentativa de adicionar cidade duplicada à comparação
- Tentativa de exceder o limite de 5 cidades na comparação

Quando necessário, a aplicação apresenta uma mensagem amigável ao
usuário.

---

## 💾 Funcionamento do cache

O cache utiliza o `localStorage` do navegador, com validade de **10
minutos**. A chave utilizada para identificar uma cidade é criada a
partir do nome pesquisado, já normalizado (exemplo conceitual:
`clima_api_cache_sao paulo`).

Fluxo ao pesquisar uma cidade:

```
Usuário pesquisa cidade
        ↓
  Verifica o cache
        ↓
 Existe cache válido?
      /      \
   SIM        NÃO
    ↓           ↓
Usa dados   Consulta API
    ↓           ↓
    └─────┬─────┘
          ↓
  Atualiza interface
  e o background animado
```

O objetivo é reduzir consultas repetidas e melhorar a experiência do
usuário.

---

## 🌿 Versionamento

O projeto utiliza Git para controle de versão. A etapa atual —
documentação, segurança, privacidade e licenciamento — está sendo
desenvolvida na branch `06_etica_seguranca`.

```bash
git branch                                                    # visualizar branches
git status                                                     # verificar alterações
git add .                                                      # adicionar alterações
git commit -m "docs: auditorias de seguranca, privacidade e licenciamento"
git push -u origin 06_etica_seguranca                          # enviar branch ao remoto
```

---

## 🩹 Correções pós-modularização (07 — Estabilização)

Depois da divisão em módulos (etapas anteriores), uma comparação
detalhada com a versão anterior (`05_feat`, monolítica) revelou
funcionalidades que regrediram silenciosamente durante o split, além
de alguns bugs novos introduzidos junto com as animações em
`<canvas>`. Todos foram corrigidos e cobertos por testes:

| # | Problema | Causa raiz | Correção |
|---|---|---|---|
| 1 | Animação do clima travava com `ReferenceError: desenharNuvens is not defined` | Função removida, mas as chamadas a ela ficaram esquecidas no loop de animação | Chamadas órfãs removidas de `weather-canvas.js` |
| 2 | Modo escuro não ligava/desligava de forma confiável | `api.js` tinha uma implementação de tema **duplicada e independente**, com seu próprio listener de clique no mesmo botão que `background.js` também usava — os dois disputavam o mesmo clique | Implementação duplicada removida de `api.js`; agora ele apenas delega para `background.js` (fonte única de verdade) |
| 3 | Cidade era adicionada à comparação mas não aparecia na tela | `comparison.js` procurava o elemento `#comparison-container`, que não existe mais no HTML atual (`#comparison-list`) | Seletor corrigido, com `comparison-container` mantido como alias de compatibilidade |
| 4 | Nenhum popup de sucesso/erro/aviso aparecia na comparação | As mensagens procuravam `#comparison-message`/`#comparison-error`, que nunca existiram no HTML | Reconectado ao `#weather-toast` já existente e estilizado, com auto-ocultar em 5s |
| 5 | Cards da previsão de 7 dias ficavam empilhados e não respondiam ao redimensionar a janela | O container no HTML usava `id="forecast-list"`, mas todo o CSS responsivo (grid no desktop, scroll horizontal no mobile) estilizava `.forecast-container` | ID/classe do HTML corrigidos para `forecast-container` |
| 6 | A lista de cidades comparadas sumia ao recarregar a página | Funcionalidade existente no `05_feat` (persistência via `localStorage`) nunca foi portada para o `comparison.js` modular | Persistência recuperada: salva a cada adição/remoção, recarrega automaticamente ao abrir a página |
| 7 | O card de clima atual parecia levemente descentralizado | O ícone do clima dividia espaço com a temperatura dentro do mesmo flex-row, empurrando o conjunto para fora do centro real da página | Temperatura promovida a um bloco isolado (sem ícone ao lado); trocou de posição com o cabeçalho de cidade/horário |
| 8 | Aviso `frame-ancestors ignored` no console | Diretiva de CSP que só funciona via cabeçalho HTTP, nunca via `<meta>` | Removida do `<meta>`; documentado que produção deve configurar isso no servidor |
| 9 | `favicon.ico 404` no console | Nenhum favicon definido | Favicon inline (SVG em data URI) adicionado |
| 10 | `localizacaoValidaGeocoding(null)` retornava `null` em vez de `false` | Uso de `&&` em cadeia sem forçar booleano | Envolvido em `Boolean(...)` |

> ℹ️ Um aviso que **não é bug**: a CSP bloqueia (corretamente) um
> script inline que o **Live Server** injeta automaticamente para o
> auto-reload ao salvar arquivos. A aplicação funciona 100% normal;
> só é preciso atualizar a página manualmente após salvar, já que a
> CSP está fazendo exatamente o que deveria.

Nenhuma funcionalidade foi removida durante essas correções — todas
as regressões foram restauradas nos módulos originalmente
responsáveis por elas (ver [`docs/AUDITORIA_SEGURANCA_PRIVACIDADE.md`](./docs/AUDITORIA_SEGURANCA_PRIVACIDADE.md) para o histórico completo de decisões).

---

## 📚 Etapa atual do projeto

**Etapa 06 — Ética, Segurança e Documentação**

Atividades realizadas nesta etapa:

1. Atualização completa do README com as funcionalidades da Tarefa 05
2. Auditoria de Segurança e Privacidade do código-fonte
3. Auditoria de Licenciamento e Conformidade das dependências e APIs
4. Adição de alertas de privacidade e licenciamento visíveis na
   interface
5. Reforço de segurança no código (Content Security Policy,
   `referrerPolicy` nas requisições)
6. Criação do arquivo `LICENSE` (MIT, inglês e português)
7. Criação do arquivo `NOTICE.md` com atribuições de terceiros
8. Revisão e correção de inconsistências encontradas entre módulos
   (nomes de classes CSS/JS, mensagens de comparação, exibição
   indevida da direção do vento) e no `package.json` (campo `license`
   divergente, dependências do Jest listadas incorretamente como
   dependências de produção)
9. Auditoria real de dependências com `npm audit` e `license-checker`
   — 0 vulnerabilidades, nenhuma licença incompatível encontrada
10. Testes manuais das funcionalidades descritas neste README
11. Versionamento das alterações na branch `06_etica_seguranca`

---

## 🔄 Evolução do projeto

O projeto foi desenvolvido de forma incremental:

```
Consulta básica
      ↓
 Clima atual
      ↓
Tratamento de erros
      ↓
Modo claro / escuro
      ↓
Horário da cidade
      ↓
   Cache
      ↓
Previsão de 7 dias
      ↓
Informações climáticas adicionais
      ↓
Comparação entre cidades
      ↓
Notificações
      ↓
Responsividade
      ↓
Melhorias visuais
      ↓
Modularização em ES Modules
(api, weather, forecast, geocoding,
 cache, background, comparison)
      ↓
Efeitos climáticos animados em <canvas>
(chuva, neve, granizo, raios,
 sol, lua com fase real, vento)
      ↓
Ética, Segurança, Privacidade
e Licenciamento
```

A estrutura do projeto continua sendo evoluída gradualmente conforme
novas funcionalidades são implementadas e testadas.

---

## 🎯 Próximas melhorias

- 🌫️ Efeito visual dedicado para neblina (`fog`), hoje tratado
  visualmente como "nublado"
- 🧹 Rotina de limpeza automática de chaves de cache expiradas no
  `localStorage`
- 🧪 Ampliação da cobertura de testes automatizados (incluindo os
  módulos `background.js` e `weather-canvas.js`)
- ♻️ Melhorias contínuas na organização do código
- 📱 Melhorias contínuas na experiência em dispositivos móveis

---

## 📈 Objetivos de aprendizado

Este projeto busca desenvolver conhecimentos práticos em:

HTML5 · CSS3 · JavaScript (ES Modules) · Manipulação do DOM · Eventos
· Funções assíncronas (`async/await`) · `fetch` · APIs REST · JSON ·
Canvas API · Local Storage · Responsividade · Tratamento de erros ·
Testes automatizados (Jest) · JSDoc · Segurança e privacidade em
aplicações front-end · Licenciamento de software e de dados · Git ·
GitHub · Organização de projetos front-end

---

## 🤖 Utilização de Inteligência Artificial

Utilizo ferramentas de Inteligência Artificial como apoio durante o
desenvolvimento, principalmente para:

- Análise de código
- Identificação de possíveis problemas (incluindo bugs de integração
  entre módulos e riscos de segurança/privacidade)
- Sugestões de melhorias
- Organização do projeto
- Documentação (README, auditorias, `LICENSE`, `NOTICE.md`)
- Explicação de conceitos
- Apoio na criação de testes
- Revisão de funcionalidades

As sugestões geradas pela IA são sempre analisadas, testadas e
compreendidas antes de serem incorporadas ao projeto. Os relatórios de
auditoria presentes em `docs/` foram gerados com apoio de IA e
revisados manualmente antes da entrega — eles não substituem uma
auditoria profissional formal, especialmente em caso de uso comercial
do projeto. O objetivo não é substituir o meu aprendizado, mas
utilizar a ferramenta como apoio durante o processo de
desenvolvimento.

---

## 👨‍💻 Desenvolvedor

**Edson Silva**

Desenvolvedor Java Full Stack em formação, com estudos e projetos
envolvendo:

Java · Spring Boot · JavaScript · HTML · CSS · React · Bancos de dados
· APIs REST · Git · GitHub · Desenvolvimento de aplicações web

---

## 📄 Licença

Este projeto está licenciado sob os termos da **Licença MIT** — veja o
arquivo [`LICENSE`](./LICENSE) para o texto completo em inglês e
português. Foi desenvolvido para fins de estudo e prática de
desenvolvimento de software e não possui finalidade comercial no
momento. Os dados meteorológicos exibidos pertencem à Open-Meteo e
estão sujeitos aos termos e à licença descritos em
[`NOTICE.md`](./NOTICE.md).
