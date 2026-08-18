# 🌤️ Clima API

Aplicação web desenvolvida em **JavaScript** para consulta de informações climáticas de uma cidade, utilizando uma API de previsão do tempo.

O projeto foi desenvolvido com foco em prática de **HTML, CSS, JavaScript, consumo de API, manipulação do DOM, tratamento de erros e testes automatizados com Jest**.

---

## 📌 Objetivo

O objetivo da aplicação é permitir que o usuário informe o nome de uma cidade e consulte suas condições climáticas de forma simples e intuitiva.

A aplicação realiza a comunicação com uma API de clima, processa os dados recebidos e apresenta as informações na interface.

---

## 🚀 Funcionalidades

* 🔎 Consulta do clima por cidade;
* 🌡️ Exibição da temperatura;
* 🌤️ Exibição das condições climáticas;
* ⚠️ Tratamento de erros durante a consulta;
* ⏳ Indicação de carregamento enquanto os dados são obtidos;
* 🌓 Alternância entre tema claro e escuro;
* 📱 Interface adaptável para diferentes tamanhos de tela;
* 🧪 Testes automatizados com Jest.

---

## 🛠️ Tecnologias utilizadas

* **HTML5** — estrutura da aplicação;
* **CSS3** — estilização e responsividade;
* **JavaScript** — lógica da aplicação e integração com a API;
* **Jest** — testes automatizados;
* **API de clima** — obtenção dos dados meteorológicos;
* **Git/GitHub** — versionamento do projeto.

---

## 📂 Estrutura do projeto

```text
clima_api/
│
├── index.html
├── README.md
├── .gitignore
│
├── assets/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── api.js
│
└── ...
```

A organização separa a estrutura HTML, os estilos CSS e a lógica JavaScript da aplicação.

---

## 💻 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entrar na pasta do projeto

```bash
cd clima_api
```

### 3. Instalar as dependências

Caso o projeto possua dependências configuradas no `package.json`:

```bash
npm install
```

### 4. Executar os testes

```bash
npm test
```

> Os comandos disponíveis podem variar de acordo com os scripts configurados no `package.json`.

### 5. Executar a aplicação

A aplicação pode ser aberta utilizando um servidor local compatível com o projeto.

Caso esteja sendo utilizado o **Visual Studio Code**, uma alternativa é utilizar uma extensão como **Live Server**, quando disponível.

---

## 🔑 Consumo da API

A aplicação utiliza uma API externa para obter os dados climáticos.

O JavaScript realiza a requisição, processa a resposta e utiliza os dados recebidos para atualizar os elementos da interface.

O tratamento de erros é importante para situações como:

* cidade não encontrada;
* resposta inválida da API;
* falha na comunicação;
* ausência de dados esperados;
* problemas de conexão.

---

## 🧪 Testes

O projeto utiliza **Jest** para realização de testes automatizados.

Os testes têm como objetivo verificar o comportamento das principais funcionalidades da aplicação e ajudar a identificar possíveis regressões após alterações no código.

Durante a revisão do projeto, os testes também são analisados para identificar:

* casos redundantes;
* funcionalidades sem cobertura;
* possibilidades de melhoria na cobertura de código;
* comportamentos que precisam ser validados.

Para executar os testes:

```bash
npm test
```

---

## 📝 Documentação do código

As funções JavaScript são documentadas utilizando o padrão **JSDoc**.

A documentação busca apresentar:

* finalidade da função;
* parâmetros recebidos;
* valores retornados;
* possíveis exceções;
* exemplos de utilização.

Exemplo:

```javascript
/**
 * Exemplo de documentação utilizando JSDoc.
 *
 * @param {string} cidade - Nome da cidade consultada.
 * @returns {Promise<Object>} Dados climáticos retornados pela API.
 */
```

A documentação facilita a compreensão e manutenção do código.

---

## 🔍 Revisão de código

Como parte do processo de desenvolvimento, o código foi analisado considerando:

* clareza;
* legibilidade;
* eficiência;
* organização;
* tratamento de exceções;
* qualidade dos testes;
* documentação das funções.

A utilização de ferramentas de Inteligência Artificial auxilia no processo de revisão e documentação, mas todas as sugestões devem ser analisadas antes de serem incorporadas ao projeto.

---

## 🌿 Versionamento

O projeto utiliza Git para controle de versão.

A etapa atual de documentação e revisão é desenvolvida na branch:

```text
04_doc_review
```

Para visualizar as branches:

```bash
git branch
```

Para verificar alterações:

```bash
git status
```

Para registrar as alterações:

```bash
git add .
git commit -m "docs: revisa codigo e adiciona documentacao"
```

Para enviar a branch ao repositório remoto:

```bash
git push -u origin 04_doc_review
```

---

## 📚 Etapa do projeto

Este README faz parte da **Etapa 04 — Documentação & Revisão de Código com IA**.

Nesta etapa são realizadas:

1. Revisão do código;
2. Revisão e atualização dos testes;
3. Documentação utilizando JSDoc;
4. Criação da primeira versão do README;
5. Testes da aplicação;
6. Revisão final do código;
7. Correção de eventuais problemas;
8. Versionamento das alterações;
9. Atualização do repositório remoto.

---

## 👨‍💻 Desenvolvedor

**Edson Silva**

Desenvolvedor Java Full Stack em formação, com estudos e projetos envolvendo desenvolvimento web, Java, Spring Boot, JavaScript, bancos de dados e outras tecnologias relacionadas ao desenvolvimento de software.

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e prática de desenvolvimento de software.
