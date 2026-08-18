# 🌤️ Clima API

Aplicação web desenvolvida em **HTML, CSS e JavaScript** para consulta de informações meteorológicas em tempo real.

O projeto utiliza a **Open-Meteo API** para obter dados geográficos e meteorológicos e apresentá-los de forma clara e visual para o usuário.

O desenvolvimento tem como objetivo praticar conceitos de desenvolvimento web front-end, consumo de APIs e organização de projetos.

---

## 📌 Objetivo

O objetivo da aplicação é permitir que o usuário informe o nome de uma cidade e visualize as condições climáticas atuais, além de uma previsão para os próximos 7 dias.

A interface foi desenvolvida para funcionar em computadores e dispositivos móveis.

---

## 🚀 Funcionalidades

### 🔎 Consulta por cidade

A aplicação permite pesquisar uma cidade pelo nome. Durante a consulta são obtidas:

- Nome da cidade
- País
- Latitude
- Longitude
- Dados climáticos atuais
- Horário local da cidade

A localização da cidade é obtida através do serviço de geocodificação da Open-Meteo.

### 🌡️ Informações climáticas

A aplicação apresenta informações meteorológicas da cidade pesquisada, incluindo:

- 🌡️ Temperatura atual
- 🌤️ Condição climática
- 💧 Umidade
- 🌡️ Sensação térmica
- 💨 Velocidade do vento
- 🕐 Horário local da cidade pesquisada
- 🕒 Horário da última atualização

### 📅 Previsão para 7 dias

A aplicação apresenta uma previsão para os próximos sete dias. Cada card apresenta:

- Dia da semana
- Data
- Ícone correspondente à condição climática
- Descrição do clima
- Temperatura máxima
- Temperatura mínima

Em telas menores, os cards podem ser percorridos horizontalmente para facilitar a visualização.

### 🏙️ Comparação entre cidades

A aplicação permite adicionar cidades para comparação. Os mini cards apresentam informações resumidas de cada cidade:

- 🏙️ Nome da cidade
- 🌤️ Condição climática
- 🌡️ Temperatura
- 💧 Umidade
- 🌡️ Sensação térmica
- 💨 Velocidade do vento

Também é possível remover cidades adicionadas à comparação. A aplicação evita a inclusão duplicada da mesma cidade e exibe uma notificação ao usuário quando uma cidade é adicionada com sucesso ("Cidade adicionada com sucesso!").

### 💾 Cache de dados

A aplicação utiliza o `localStorage` do navegador para armazenar temporariamente os dados consultados, reduzindo requisições desnecessárias quando uma cidade já foi pesquisada recentemente.

O cache possui validade de **10 minutos** e pode armazenar:

- Cidade pesquisada
- Informações de localização
- Clima atual
- Previsão de 7 dias
- Horário do armazenamento

Quando o cache está válido, a aplicação utiliza os dados armazenados em vez de realizar uma nova consulta.

### 🌓 Modo claro e modo escuro

A aplicação possui dois modos visuais:

**☀️ Modo claro**
Utiliza elementos visuais e efeitos relacionados às condições climáticas. A aplicação possui estrutura preparada para representar diferentes situações meteorológicas através do background.

**🌙 Modo escuro**
Utiliza uma interface em tons de azul escuro e permanece visualmente estático, independentemente do horário ou da condição climática — uma opção mais simples e sem animações.

### 🌦️ Background dinâmico e efeitos climáticos

A aplicação possui estrutura preparada para relacionar o background da página à condição climática atual, com diferentes ambientes para:

☀️ Céu limpo · 🌤️ Principalmente limpo · ⛅ Parcialmente nublado · ☁️ Nublado · 🌫️ Neblina · 🌧️ Chuva · 🌦️ Pancadas de chuva · ⛈️ Tempestade · ❄️ Neve · 💨 Ventos fortes

Esses efeitos são direcionados principalmente ao modo claro; o modo escuro permanece independente deles. A ideia é permitir que o usuário perceba visualmente a condição climática sem depender apenas das informações textuais.

---

## 📱 Responsividade

A aplicação foi desenvolvida para funcionar em diferentes tamanhos de tela.

**🖥️ Desktop**
- O conteúdo permanece dentro do container principal
- Os cards de comparação são distribuídos de forma responsiva
- A previsão de 7 dias utiliza uma estrutura em grade
- Os elementos são dimensionados para evitar que ultrapassem o container

**📱 Dispositivos móveis**
- A interface é reorganizada
- Os cards da previsão podem ser deslizados horizontalmente
- Os cards de comparação são adaptados à largura disponível
- Os elementos permanecem dentro dos limites da tela
- Os controles permanecem acessíveis

---

## 🛠️ Tecnologias utilizadas

- **HTML5** — estrutura da aplicação
- **CSS3** — estilização, responsividade, efeitos e animações
- **JavaScript** — lógica da aplicação e manipulação do DOM
- **Fetch API** — comunicação com APIs externas
- **Local Storage** — armazenamento temporário dos dados
- **Jest** — testes automatizados
- **Open-Meteo API** — dados meteorológicos e geográficos
- **Git / GitHub** — controle de versão e hospedagem do código-fonte

---

## 🌐 APIs utilizadas

### Open-Meteo

A aplicação utiliza os serviços da Open-Meteo para obter informações geográficas e meteorológicas.

**🔎 Geocoding API**
Utilizada para localizar a cidade informada pelo usuário.

```
https://geocoding-api.open-meteo.com/v1/search
```

Retorna: nome da cidade, país, latitude, longitude e demais informações de localização.

**🌤️ Forecast API**
Utilizada para consultar as condições climáticas atuais e a previsão.

```
https://api.open-meteo.com/v1/forecast
```

Retorna: temperatura, sensação térmica, umidade, velocidade e direção do vento, código meteorológico, horário local, temperaturas máxima/mínima e previsão diária.

---

## 📂 Estrutura do projeto

```
clima_api/
│
├── index.html
├── README.md
├── .gitignore
├── package.json
│
├── assets/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── api.js
│       ├── forecast.js
│       └── comparison.js
│
└── tests/
    └── ...
```

### 📄 Arquivos principais

**`index.html`**
Estrutura HTML da aplicação. Contém: título, formulário de pesquisa, campo de cidade, botão de busca, mensagem de carregamento, mensagens de erro, resultado do clima, informações meteorológicas, previsão de 7 dias, área de comparação e controle do tema.

**`assets/css/style.css`**
Apresentação visual da aplicação. Contém regras de layout, container principal, formulário, botões, cards, previsão, comparação, responsividade, modo claro/escuro, backgrounds, efeitos visuais e animações climáticas.

**`assets/js/api.js`**
Lógica principal da aplicação. Responsável por: capturar a cidade informada, consultar a API de geocodificação, consultar o clima atual, processar os dados recebidos, exibir os dados na interface, controlar o carregamento, exibir mensagens de erro, controlar o cache, gerenciar o tema, consultar a previsão e integrar as diferentes partes da aplicação.

**`assets/js/forecast.js`**
Funcionalidade de previsão para 7 dias. Responsável por: consultar a previsão, interpretar os códigos meteorológicos, determinar a descrição do clima e os ícones, identificar o dia da semana, formatar as datas, criar os cards e exibir temperaturas máximas e mínimas.

**`assets/js/comparison.js`**
Funcionalidade de comparação entre cidades. Responsável por: adicionar cidades, criar mini cards, exibir informações resumidas, remover cidades, evitar duplicidade, controlar a quantidade de cidades, atualizar a interface e exibir notificações de sucesso ou erro.

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

**3. Instalar as dependências** (caso existam configuradas no `package.json`)
```bash
npm install
```

**4. Executar os testes**
```bash
npm test
```

**5. Executar a aplicação**

A aplicação deve ser executada através de um servidor HTTP local. No Visual Studio Code, uma alternativa é utilizar a extensão **Live Server**. Também pode ser utilizado outro servidor HTTP local compatível com o projeto.

> ⚠️ A aplicação não deve ser aberta diretamente pelo navegador como página estática quando houver necessidade de um servidor local para o funcionamento adequado do projeto.

---

## 🧪 Testes automatizados

O projeto utiliza **Jest** para testes automatizados, com o objetivo de verificar o comportamento das principais funções da aplicação e ajudar a identificar possíveis regressões durante o desenvolvimento.

Entre os pontos avaliados estão:

- Funções de conversão
- Validações
- Tratamento de dados
- Interpretação dos códigos meteorológicos
- Tratamento de erros
- Comportamentos relacionados à aplicação
- Funções auxiliares

Para executar os testes:

```bash
npm test
```

---

## 📝 Documentação com JSDoc

As funções JavaScript são documentadas utilizando o padrão JSDoc, apresentando: finalidade da função, parâmetros recebidos, tipo dos parâmetros, valor retornado, possíveis exceções e exemplos de utilização.

Exemplo:

```javascript
/**
 * Consulta os dados climáticos de uma cidade.
 *
 * @param {string} cidade - Nome da cidade consultada.
 * @returns {Promise<Object>} Dados retornados pela API.
 */
```

A documentação facilita a compreensão, manutenção e evolução do código.

---

## 🔐 Tratamento de erros

A aplicação possui mecanismos de tratamento de erros para diferentes situações:

- Cidade não encontrada
- Falha na geocodificação
- Falha na consulta meteorológica
- Resposta inválida da API
- Dados incompletos
- Problemas de conexão
- Erros durante a leitura do cache
- Tentativa de adicionar cidade duplicada

Quando necessário, a aplicação apresenta uma mensagem amigável ao usuário.

---

## 💾 Funcionamento do cache

O cache utiliza o `localStorage` do navegador, com validade de **10 minutos**. A chave utilizada para identificar uma cidade é criada a partir do nome pesquisado (exemplo conceitual: `clima_sao paulo`).

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
```

O objetivo é reduzir consultas repetidas e melhorar a experiência do usuário.

---

## 🌿 Versionamento

O projeto utiliza Git para controle de versão. A etapa atual de documentação e revisão está sendo desenvolvida na branch `04_doc_review`.

```bash
git branch                                          # visualizar branches
git status                                           # verificar alterações
git add .                                            # adicionar alterações
git commit -m "docs: atualiza README e documentacao" # criar commit
git push -u origin 04_doc_review                     # enviar branch ao remoto
```

---

## 📚 Etapa atual do projeto

**Etapa 04 — Documentação & Revisão de Código com IA**

Atividades realizadas nesta etapa:

1. Revisão do código
2. Organização dos arquivos
3. Revisão dos testes
4. Documentação utilizando JSDoc
5. Atualização do README
6. Implementação e revisão do cache
7. Implementação da previsão de 7 dias
8. Implementação da comparação entre cidades
9. Melhorias na responsividade
10. Melhorias na interface
11. Tratamento de erros
12. Revisão das funcionalidades
13. Testes da aplicação
14. Correção de eventuais problemas
15. Versionamento das alterações
16. Atualização do repositório remoto

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
Efeitos climáticos
```

A estrutura do projeto continua sendo evoluída gradualmente conforme novas funcionalidades são implementadas e testadas.

---

## 🎯 Próximas melhorias

- 🌧️ Animação de chuva
- ❄️ Animação de neve
- ⛈️ Efeitos de tempestade
- 🌫️ Efeito de neblina
- 💨 Efeitos relacionados a ventos fortes
- ☀️ Efeitos visuais para céu limpo
- ☁️ Animações de nuvens
- 🌈 Maior integração entre condição climática e background
- 🧪 Ampliação da cobertura de testes
- ♻️ Melhorias contínuas na organização do código
- 📱 Melhorias contínuas na experiência em dispositivos móveis

---

## 📈 Objetivos de aprendizado

Este projeto busca desenvolver conhecimentos práticos em:

HTML5 · CSS3 · JavaScript · Manipulação do DOM · Eventos · Funções assíncronas (`async/await`) · `fetch` · APIs REST · JSON · Local Storage · Responsividade · Tratamento de erros · Testes automatizados (Jest) · JSDoc · Git · GitHub · Organização de projetos front-end

---

## 🤖 Utilização de Inteligência Artificial

Utilizo ferramentas de Inteligência Artificial como apoio durante o desenvolvimento, principalmente para:

- Análise de código
- Identificação de possíveis problemas
- Sugestões de melhorias
- Organização do projeto
- Documentação
- Explicação de conceitos
- Apoio na criação de testes
- Revisão de funcionalidades

As sugestões geradas pela IA são sempre analisadas, testadas e compreendidas antes de serem incorporadas ao projeto. O objetivo não é substituir o meu aprendizado, mas utilizar a ferramenta como apoio durante o processo de desenvolvimento.

---

## 👨‍💻 Desenvolvedor

**Edson Silva**

Desenvolvedor Java Full Stack em formação, com estudos e projetos envolvendo:

Java · Spring Boot · JavaScript · HTML · CSS · React · Bancos de dados · APIs REST · Git · GitHub · Desenvolvimento de aplicações web

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e prática de desenvolvimento de software. Não possui finalidade comercial no momento.
