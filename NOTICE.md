# NOTICE

Este arquivo lista atribuições e créditos de APIs, bibliotecas e
componentes de terceiros utilizados no projeto **Clima API**, em
conformidade com as respectivas licenças.

_This file lists attributions and credits for third-party APIs,
libraries and components used in the **Clima API** project, in
compliance with their respective licenses._

---

## 🌦️ Open-Meteo

- **Uso no projeto / Used for:** geocodificação de cidades (Geocoding
  API) e dados meteorológicos atuais e de previsão (Forecast API).
- **Endpoints:**
  `https://geocoding-api.open-meteo.com/v1/search`
  `https://api.open-meteo.com/v1/forecast`
- **Licença dos dados / Data license:**
  [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
- **Site oficial:** https://open-meteo.com/
- **Termos de uso:** https://open-meteo.com/en/terms
- **Observação:** a Open-Meteo é gratuita para uso não comercial
  dentro dos limites de requisição publicados por eles. Uso comercial
  ou em maior escala pode exigir uma chave de API paga — consulte os
  termos oficiais antes de usar este projeto comercialmente.
- **Atribuição:** dados meteorológicos e de geocodificação fornecidos
  por Open-Meteo.com.

---

## 🧪 Jest

- **Uso no projeto / Used for:** testes automatizados durante o
  desenvolvimento (dependência de desenvolvimento — não é enviada ao
  navegador do usuário final).
- **Licença:** [MIT License](https://github.com/jestjs/jest/blob/main/LICENSE)
- **Mantido por:** OpenJS Foundation e colaboradores.
- **Site oficial:** https://jestjs.io/

---

## 📊 caniuse-lite (dependência transitiva do Jest/Browserslist)

- **Uso no projeto / Used for:** dados de compatibilidade de
  navegadores, usados internamente pelo Browserslist (dependência de
  desenvolvimento do Jest). Não é código executado no navegador do
  usuário final.
- **Licença:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Repositório:** https://github.com/browserslist/caniuse-lite
- **Atribuição:** dados de compatibilidade de navegadores mantidos
  pelo projeto Can I Use / caniuse-lite.

---

## 🔤 Fontes e ícones

- O projeto **não** utiliza fontes externas (Google Fonts, CDNs de
  ícones etc.). A tipografia usa a pilha de fontes do sistema
  operacional (`Arial, Helvetica, sans-serif`).
- Os ícones de condição climática são caracteres emoji nativos
  (Unicode), não uma biblioteca de ícones de terceiros.

---

## 📦 Dependências de execução (runtime)

Este projeto **não possui dependências de execução via npm/CDN**: todo
o HTML, CSS e JavaScript exibido ao usuário final é escrito pelo autor
do projeto e roda diretamente no navegador, sem frameworks, bundlers
ou bibliotecas externas.

_This project has **no runtime npm/CDN dependencies**: all HTML, CSS
and JavaScript shipped to the end user is authored by the project and
runs directly in the browser, without frameworks, bundlers or
third-party libraries._

---

## Como contribuir para este arquivo

Se uma nova dependência, API ou biblioteca de terceiros for adicionada
ao projeto, adicione uma nova seção aqui com: nome, uso, licença,
link oficial e qualquer restrição relevante (uso comercial,
atribuição obrigatória etc.), conforme exigido pela auditoria de
Licenciamento e Conformidade do projeto.
