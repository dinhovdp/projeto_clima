/* =========================================================
   COMPARAÇÃO DE CIDADES
   =========================================================

   Compatibilidade:

   - Navegador / Live Server
   - GitHub Pages
   - ES Modules

   Dependência:
   - weather.js

   Responsabilidades:

   - Adicionar cidades à comparação
   - Buscar clima das cidades
   - Evitar cidades duplicadas
   - Limitar comparação a 5 cidades
   - Renderizar cards
   - Remover cidades
   - Limpar comparação
   - Controlar requisições concorrentes
   - Integrar o botão "Adicionar comparação"

   ========================================================= */


/* =========================================================
   DEPENDÊNCIA WEATHER
   ========================================================= */

import {
    buscarClimaAtual,
    obterDescricaoClimaWeather,
    obterIconeClimaWeather,
    numeroValidoWeather
} from './weather.js';


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const COMPARACAO_MAXIMO_CIDADES =
    5;

const COMPARACAO_MAXIMO_REQUISICOES =
    3;

const COMPARACAO_CHAVE_STORAGE =
    'clima_api_comparacoes';


/* =========================================================
   PERSISTÊNCIA (localStorage)
   =========================================================

   Funcionalidade recuperada do projeto anterior à
   modularização: a lista de cidades comparadas sobrevive a
   um recarregamento de página. Se o localStorage estiver
   indisponível ou os dados salvos estiverem corrompidos, a
   aplicação simplesmente continua com a comparação vazia —
   nunca quebra por causa disso.
   ========================================================= */

function validarListaComparacaoArmazenada(
    lista
) {
    if (!Array.isArray(lista)) {
        return [];
    }

    return lista.filter(
        (item) =>
            item &&
            typeof item === 'object' &&
            item.cidade &&
            localizacaoValidaComparacao(item.cidade) &&
            item.clima &&
            typeof item.clima === 'object'
    );
}

function salvarComparacoes() {
    if (typeof localStorage === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            COMPARACAO_CHAVE_STORAGE,
            JSON.stringify(cidadesComparadas)
        );
    } catch (erro) {
        console.warn(
            'Não foi possível salvar as comparações localmente.',
            erro
        );
    }
}

function carregarComparacoes() {
    if (typeof localStorage === 'undefined') {
        return [];
    }

    try {
        const dados =
            localStorage.getItem(
                COMPARACAO_CHAVE_STORAGE
            );

        if (!dados) {
            return [];
        }

        return validarListaComparacaoArmazenada(
            JSON.parse(dados)
        );
    } catch (erro) {
        console.warn(
            'Não foi possível carregar as comparações salvas.',
            erro
        );

        try {
            localStorage.removeItem(
                COMPARACAO_CHAVE_STORAGE
            );
        } catch (erroStorage) {
            /* Sem localStorage, não há o que limpar. */
        }

        return [];
    }
}


/* =========================================================
   ESTADO
   ========================================================= */

let cidadesComparadas =
    carregarComparacoes();

let idComparacaoAtual = 0;


/* =========================================================
   ELEMENTOS
   ========================================================= */

function obterElementoComparacao(
    id
) {
    if (
        typeof document === 'undefined'
    ) {
        return null;
    }

    return document.getElementById(
        id
    );
}


/* =========================================================
   CONTAINER PRINCIPAL / LISTA DE CARDS
   =========================================================

   O HTML atual usa:

   <section id="comparison-section">
       ...
       <div id="comparison-list"></div>
   </section>

   Mantemos "comparison-container" como alias de
   compatibilidade, caso uma versão anterior do HTML
   ainda esteja em uso.

   ========================================================= */

function obterListaComparacao() {
    return (
        obterElementoComparacao('comparison-list') ||
        obterElementoComparacao('comparison-container')
    );
}


function obterContainerComparacao() {
    return obterListaComparacao();
}


/* =========================================================
   SEÇÃO DA COMPARAÇÃO
   ========================================================= */

function obterSecaoComparacao() {
    return obterElementoComparacao(
        'comparison-section'
    );
}


/* =========================================================
   BOTÃO ADICIONAR COMPARAÇÃO
   =========================================================

   Compatível com o HTML atual:

   <button id="add-comparison">

   ========================================================= */

function obterBotaoAdicionarComparacao() {
    if (
        typeof document === 'undefined'
    ) {
        return null;
    }

    const seletores = [

        '#add-comparison',

        '#add-comparison-button',

        '#comparison-add',

        '#comparison-add-button',

        '#btn-add-comparison',

        '#adicionar-comparacao',

        '#adicionar-comparacao-btn',

        '.add-comparison',

        '.add-comparison-button',

        '[data-action="add-comparison"]',

        '[data-comparison="add"]'
    ];

    for (
        const seletor
        of seletores
    ) {

        const elemento =
            document.querySelector(
                seletor
            );

        if (elemento) {
            return elemento;
        }
    }

    return null;
}


/* =========================================================
   MENSAGEM DE COMPARAÇÃO (TOAST)
   =========================================================

   Reaproveita o mesmo #weather-toast usado pelo restante da
   aplicação (já estilizado em components.css: cores verde/
   vermelho/amarelo e a classe "show" com transição). Antes,
   este módulo procurava um elemento próprio
   (#comparison-message / #comparison-error) que nunca existiu
   no HTML, então nenhuma mensagem chegava a aparecer na tela.

   ========================================================= */

const COMPARACAO_TOAST_DURACAO_MS =
    5000;

function obterElementoMensagemComparacao() {
    if (
        typeof document === 'undefined'
    ) {
        return null;
    }

    return (
        document.getElementById('weather-toast') ||
        document.querySelector('.comparison-message') ||
        document.querySelector('.comparison-error')
    );
}


/* =========================================================
   MOSTRAR MENSAGEM
   ========================================================= */

function mostrarMensagemComparacao(
    mensagem,
    tipo = 'erro'
) {
    const elemento =
        obterElementoMensagemComparacao();

    if (!elemento) {
        console.warn(
            mensagem
        );

        return;
    }

    elemento.textContent =
        mensagem;

    elemento.dataset.type =
        tipo;

    elemento.classList.remove(
        'error',
        'warning'
    );

    if (tipo === 'erro') {
        elemento.classList.add('error');
    } else if (tipo === 'aviso' || tipo === 'warning') {
        elemento.classList.add('warning');
    }

    /*
       Reinicia o temporizador a cada nova mensagem, para que
       uma mensagem recente não seja escondida no meio do
       tempo de exibição de uma mensagem anterior.
    */
    if (elemento._timeoutComparacao) {
        clearTimeout(
            elemento._timeoutComparacao
        );
    }

    elemento.classList.add(
        'show'
    );

    elemento._timeoutComparacao =
        setTimeout(
            () => {
                elemento.classList.remove(
                    'show'
                );
            },
            COMPARACAO_TOAST_DURACAO_MS
        );
}


/* =========================================================
   LIMPAR MENSAGEM
   ========================================================= */

function limparMensagemComparacao() {
    const elemento =
        obterElementoMensagemComparacao();

    if (!elemento) {
        return;
    }

    if (elemento._timeoutComparacao) {
        clearTimeout(
            elemento._timeoutComparacao
        );

        elemento._timeoutComparacao = null;
    }

    elemento.classList.remove(
        'show',
        'error',
        'warning'
    );

    delete elemento.dataset.type;
}


/* =========================================================
   VALIDAÇÃO
   ========================================================= */

function localizacaoValidaComparacao(
    cidade
) {
    if (
        !cidade ||
        typeof cidade !== 'object'
    ) {
        return false;
    }

    if (
        !numeroValidoWeather(
            cidade.latitude
        ) ||
        !numeroValidoWeather(
            cidade.longitude
        )
    ) {
        return false;
    }

    if (
        cidade.latitude < -90 ||
        cidade.latitude > 90 ||
        cidade.longitude < -180 ||
        cidade.longitude > 180
    ) {
        return false;
    }

    return (
        typeof cidade.name ===
            'string' &&
        cidade.name.trim() !== ''
    );
}


/* =========================================================
   CHAVE ÚNICA
   ========================================================= */

function criarChaveCidadeComparacao(
    cidade
) {
    if (
        !localizacaoValidaComparacao(
            cidade
        )
    ) {
        return '';
    }

    return [
        Number(
            cidade.latitude
        ).toFixed(5),

        Number(
            cidade.longitude
        ).toFixed(5)
    ].join('|');
}


/* =========================================================
   DUPLICIDADE
   ========================================================= */

function cidadeJaComparada(
    cidade
) {
    const chave =
        criarChaveCidadeComparacao(
            cidade
        );

    if (!chave) {
        return false;
    }

    return cidadesComparadas.some(
        item =>
            criarChaveCidadeComparacao(
                item.cidade
            ) === chave
    );
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function criarItemComparacao(
    cidade,
    clima
) {
    if (
        !localizacaoValidaComparacao(
            cidade
        ) ||
        !clima ||
        typeof clima !== 'object'
    ) {
        return null;
    }

    const codigo =
        clima.weathercode;

    return {

        cidade: {
            ...cidade
        },

        clima: {

            temperatura:
                clima.temperature,

            sensacao:
                clima.apparent_temperature,

            umidade:
                clima.relative_humidity_2m,

            vento:
                clima.windspeed,

            direcaoVento:
                clima.winddirection,

            codigo,

            isDay:
                clima.is_day,

            horario:
                clima.time,

            descricao:
                obterDescricaoClimaWeather(
                    codigo
                ),

            icone:
                obterIconeClimaWeather(
                    codigo,
                    clima.is_day
                )
        }
    };
}


/* =========================================================
   BUSCAR CLIMA DE UMA CIDADE
   ========================================================= */

async function buscarClimaCidadeComparacao(
    cidade
) {
    if (
        !localizacaoValidaComparacao(
            cidade
        )
    ) {
        throw new Error(
            'Localização inválida para comparação.'
        );
    }

    const clima =
        await buscarClimaAtual(
            cidade.latitude,
            cidade.longitude
        );

    return criarItemComparacao(
        cidade,
        clima
    );
}


/* =========================================================
   BUSCA CONTROLADA
   ========================================================= */

async function buscarClimasComparacao(
    cidades,
    idComparacao
) {
    const resultados = [];

    for (
        let inicio = 0;
        inicio < cidades.length;
        inicio +=
            COMPARACAO_MAXIMO_REQUISICOES
    ) {

        if (
            idComparacao !==
            idComparacaoAtual
        ) {
            return [];
        }

        const grupo =
            cidades.slice(
                inicio,
                inicio +
                    COMPARACAO_MAXIMO_REQUISICOES
            );

        const respostas =
            await Promise.allSettled(
                grupo.map(
                    cidade =>
                        buscarClimaCidadeComparacao(
                            cidade
                        )
                )
            );

        if (
            idComparacao !==
            idComparacaoAtual
        ) {
            return [];
        }

        respostas.forEach(
            resposta => {

                if (
                    resposta.status ===
                        'fulfilled' &&
                    resposta.value
                ) {
                    resultados.push(
                        resposta.value
                    );
                }
            }
        );
    }

    return resultados;
}


/* =========================================================
   ADICIONAR CIDADE
   ========================================================= */

async function adicionarCidadeComparacao(
    cidade
) {
    if (
        !localizacaoValidaComparacao(
            cidade
        )
    ) {
        return {
            sucesso: false,

            mensagem:
                'A cidade selecionada é inválida.'
        };
    }

    if (
        cidadesComparadas.length >=
        COMPARACAO_MAXIMO_CIDADES
    ) {
        return {
            sucesso: false,

            mensagem:
                'Limite de 5 cidades atingido.'
        };
    }

    if (
        cidadeJaComparada(
            cidade
        )
    ) {
        return {
            sucesso: false,

            mensagem:
                'Essa cidade já foi escolhida.'
        };
    }

    const id =
        ++idComparacaoAtual;

    try {

        const item =
            await buscarClimaCidadeComparacao(
                cidade
            );

        if (
            id !==
            idComparacaoAtual
        ) {
            return {
                sucesso: false,

                mensagem:
                    'A comparação foi atualizada.'
            };
        }

        if (!item) {
            return {
                sucesso: false,

                mensagem:
                    'Não foi possível preparar os dados dessa cidade.'
            };
        }

        cidadesComparadas.push(
            item
        );

        salvarComparacoes();

        renderizarComparacao();

        return {
            sucesso: true,

            item
        };

    } catch (erro) {

        if (
            id !==
            idComparacaoAtual
        ) {
            return {
                sucesso: false,

                mensagem:
                    'A comparação foi atualizada.'
            };
        }

        console.error(
            'Erro ao adicionar cidade à comparação.',
            erro
        );

        return {
            sucesso: false,

            mensagem:
                erro instanceof Error
                    ? erro.message
                    : 'Não foi possível obter o clima dessa cidade.'
        };
    }
}


/* =========================================================
   COMPARAR VÁRIAS CIDADES
   ========================================================= */

async function compararCidades(
    cidades
) {
    if (
        !Array.isArray(cidades)
    ) {
        return [];
    }

    const cidadesValidas =
        cidades.filter(
            localizacaoValidaComparacao
        );

    const cidadesUnicas = [];

    const chaves =
        new Set();

    cidadesValidas.forEach(
        cidade => {

            if (
                cidadesUnicas.length >=
                COMPARACAO_MAXIMO_CIDADES
            ) {
                return;
            }

            const chave =
                criarChaveCidadeComparacao(
                    cidade
                );

            if (
                chave &&
                !chaves.has(chave)
            ) {
                chaves.add(
                    chave
                );

                cidadesUnicas.push(
                    cidade
                );
            }
        }
    );

    const id =
        ++idComparacaoAtual;

    const resultados =
        await buscarClimasComparacao(
            cidadesUnicas,
            id
        );

    if (
        id !==
        idComparacaoAtual
    ) {
        return [];
    }

    cidadesComparadas =
        resultados.slice(
            0,
            COMPARACAO_MAXIMO_CIDADES
        );

    renderizarComparacao();

    return cidadesComparadas.slice();
}


/* =========================================================
   REMOVER
   ========================================================= */

function removerCidadeComparacao(
    indice
) {
    if (
        !Number.isInteger(indice) ||
        indice < 0 ||
        indice >=
            cidadesComparadas.length
    ) {
        return false;
    }

    ++idComparacaoAtual;

    cidadesComparadas.splice(
        indice,
        1
    );

    salvarComparacoes();

    renderizarComparacao();

    return true;
}


/* =========================================================
   LIMPAR
   ========================================================= */

function limparComparacao() {
    ++idComparacaoAtual;

    cidadesComparadas = [];

    salvarComparacoes();

    renderizarComparacao();
}


/* =========================================================
   DADO DO CARD
   ========================================================= */

function adicionarDadoComparacao(
    lista,
    nome,
    valor
) {
    const titulo =
        document.createElement(
            'dt'
        );

    titulo.textContent =
        nome;

    const conteudo =
        document.createElement(
            'dd'
        );

    conteudo.textContent =
        valor;

    lista.appendChild(
        titulo
    );

    lista.appendChild(
        conteudo
    );
}


/* =========================================================
   NOME DA CIDADE
   ========================================================= */

function criarNomeCidadeComparacao(
    cidade
) {
    const nome =
        typeof cidade.name === 'string'
            ? cidade.name
            : 'Cidade';

    const regiao =
        typeof cidade.admin1 === 'string'
            ? cidade.admin1
            : '';

    const pais =
        typeof cidade.country === 'string'
            ? cidade.country
            : '';

    return [
        nome,
        regiao,
        pais
    ]
        .filter(Boolean)
        .join(', ');
}


/* =========================================================
   CARD
   ========================================================= */

function criarCardComparacao(
    item,
    indice
) {
    const cidade =
        item.cidade;

    const clima =
        item.clima;

    const card =
        document.createElement(
            'article'
        );

    card.className =
        'comparison-card';

    card.dataset.index =
        String(indice);

    const cabecalho =
        document.createElement(
            'header'
        );

    const titulo =
        document.createElement(
            'h3'
        );

    titulo.textContent =
        criarNomeCidadeComparacao(
            cidade
        );

    const remover =
        document.createElement(
            'button'
        );

    remover.type =
        'button';

    remover.className =
        'comparison-remove';

    remover.textContent =
        '×';

    remover.setAttribute(
        'aria-label',
        `Remover ${cidade.name || 'cidade'} da comparação`
    );

    remover.addEventListener(
        'click',
        () => {
            removerCidadeComparacao(
                indice
            );
        }
    );

    cabecalho.appendChild(
        titulo
    );

    cabecalho.appendChild(
        remover
    );

    const climaAtual =
        document.createElement(
            'div'
        );

    climaAtual.className =
        'comparison-current';

    const icone =
        document.createElement(
            'span'
        );

    icone.className =
        'comparison-icon';

    icone.textContent =
        clima.icone;

    icone.setAttribute(
        'role',
        'img'
    );

    icone.setAttribute(
        'aria-label',
        clima.descricao
    );

    const temperatura =
        document.createElement(
            'strong'
        );

    temperatura.className =
        'comparison-temperature';

    temperatura.textContent =
        numeroValidoWeather(
            clima.temperatura
        )
            ? `${clima.temperatura} °C`
            : '-- °C';

    climaAtual.appendChild(
        icone
    );

    climaAtual.appendChild(
        temperatura
    );

    const descricao =
        document.createElement(
            'p'
        );

    descricao.className =
        'comparison-description';

    descricao.textContent =
        clima.descricao;

    const dados =
        document.createElement(
            'dl'
        );

    dados.className =
        'comparison-details';

    adicionarDadoComparacao(
        dados,
        'Sensação',
        numeroValidoWeather(
            clima.sensacao
        )
            ? `${clima.sensacao} °C`
            : '--'
    );

    adicionarDadoComparacao(
        dados,
        'Umidade',
        numeroValidoWeather(
            clima.umidade
        )
            ? `${clima.umidade}%`
            : '--'
    );

    adicionarDadoComparacao(
        dados,
        'Vento',
        numeroValidoWeather(
            clima.vento
        )
            ? `${clima.vento} km/h`
            : '--'
    );

    /*
       Regra: mostrar apenas a velocidade do vento.
       wind_direction_10m não é exibido — não agrega
       valor para o usuário comum e o dado continua
       disponível em clima.direcaoVento se precisar
       futuramente.
    */

    card.appendChild(
        cabecalho
    );

    card.appendChild(
        climaAtual
    );

    card.appendChild(
        descricao
    );

    card.appendChild(
        dados
    );

    return card;
}


/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderizarComparacao() {
    const secao =
        obterSecaoComparacao();

    const container =
        obterContainerComparacao();

    const lista =
        obterListaComparacao();

    if (
        !secao ||
        !container ||
        !lista
    ) {
        console.warn(
            'A estrutura HTML da comparação não foi encontrada.'
        );

        return false;
    }

    lista.innerHTML =
        '';

    if (
        cidadesComparadas.length ===
        0
    ) {
        secao.classList.add(
            'hidden'
        );

        return true;
    }

    cidadesComparadas.forEach(
        (
            item,
            indice
        ) => {

            const card =
                criarCardComparacao(
                    item,
                    indice
                );

            lista.appendChild(
                card
            );
        }
    );

    secao.classList.remove(
        'hidden'
    );

    return true;
}


/* =========================================================
   OBTER CIDADE ATUAL DA API
   ========================================================= */

function obterCidadeAtualParaComparacao() {
    if (
        typeof window === 'undefined'
    ) {
        return null;
    }

    /*
       A API principal mantém a cidade
       pesquisada em window.cidadeAtualPesquisada.
    */

    if (
        window.cidadeAtualPesquisada &&
        localizacaoValidaComparacao(
            window.cidadeAtualPesquisada
        )
    ) {
        return {
            ...window.cidadeAtualPesquisada
        };
    }

    /*
       Compatibilidade adicional caso algum
       componente utilize ClimaAPI.
    */

    if (
        window.ClimaAPI &&
        typeof window.ClimaAPI
            .obterCidadeAtual ===
            'function'
    ) {

        const cidade =
            window.ClimaAPI
                .obterCidadeAtual();

        if (
            localizacaoValidaComparacao(
                cidade
            )
        ) {
            return {
                ...cidade
            };
        }
    }

    return null;
}


/* =========================================================
   ATUALIZAR ESTADO DO BOTÃO
   ========================================================= */

function atualizarBotaoAdicionarComparacao() {
    const botao =
        obterBotaoAdicionarComparacao();

    if (!botao) {
        return;
    }

    const cidade =
        obterCidadeAtualParaComparacao();

    const podeAdicionar =
        cidade &&
        cidadesComparadas.length <
            COMPARACAO_MAXIMO_CIDADES &&
        !cidadeJaComparada(
            cidade
        );

    botao.disabled =
        !podeAdicionar;

    if (
        cidadesComparadas.length >=
        COMPARACAO_MAXIMO_CIDADES
    ) {

        botao.title =
            'Limite de 5 cidades atingido.';

    } else if (
        cidade &&
        cidadeJaComparada(
            cidade
        )
    ) {

        botao.title =
            'Esta cidade já foi escolhida.';

    } else if (!cidade) {

        botao.title =
            'Pesquise uma cidade antes de adicionar à comparação.';

    } else {

        botao.title =
            'Adicionar a cidade atual à comparação.';
    }
}


/* =========================================================
   EVENTO DO BOTÃO
   ========================================================= */

async function tratarCliqueAdicionarComparacao(
    evento
) {
    if (evento) {
        evento.preventDefault();
    }

    limparMensagemComparacao();

    const botao =
        obterBotaoAdicionarComparacao();

    const cidade =
        obterCidadeAtualParaComparacao();

    if (!cidade) {

        mostrarMensagemComparacao(
            'Pesquise uma cidade antes de adicioná-la à comparação.'
        );

        return;
    }

    if (
        cidadeJaComparada(
            cidade
        )
    ) {

        mostrarMensagemComparacao(
            'Essa cidade já foi escolhida.'
        );

        atualizarBotaoAdicionarComparacao();

        return;
    }

    if (
        cidadesComparadas.length >=
        COMPARACAO_MAXIMO_CIDADES
    ) {

        mostrarMensagemComparacao(
            'Limite de 5 cidades atingido.'
        );

        atualizarBotaoAdicionarComparacao();

        return;
    }

    if (botao) {
        botao.disabled = true;

        botao.dataset.loading =
            'true';
    }

    try {

        const resultado =
            await adicionarCidadeComparacao(
                cidade
            );

        if (
            !resultado ||
            resultado.sucesso !== true
        ) {

            mostrarMensagemComparacao(
                resultado &&
                resultado.mensagem
                    ? resultado.mensagem
                    : 'Não foi possível adicionar a cidade à comparação.'
            );

            return;
        }

        mostrarMensagemComparacao(
            'Cidade selecionada com sucesso.',
            'sucesso'
        );

    } catch (erro) {

        console.error(
            'Erro ao adicionar cidade à comparação:',
            erro
        );

        mostrarMensagemComparacao(
            erro instanceof Error
                ? erro.message
                : 'Não foi possível adicionar a cidade à comparação.'
        );

    } finally {

        if (botao) {
            delete botao.dataset.loading;
        }

        atualizarBotaoAdicionarComparacao();
    }
}


/* =========================================================
   INICIALIZAÇÃO DA COMPARAÇÃO
   ========================================================= */

function inicializarComparacao() {
    if (
        typeof document === 'undefined'
    ) {
        return false;
    }

    const botao =
        obterBotaoAdicionarComparacao();

    if (!botao) {

        console.warn(
            'Botão "Adicionar comparação" não foi encontrado.'
        );

        return false;
    }

    /*
       Evita registrar o evento duas vezes.
    */

    if (
        botao.dataset.comparisonInitialized ===
        'true'
    ) {
        atualizarBotaoAdicionarComparacao();

        return true;
    }

    botao.dataset.comparisonInitialized =
        'true';

    botao.addEventListener(
        'click',
        tratarCliqueAdicionarComparacao
    );

    atualizarBotaoAdicionarComparacao();

    /*
       Se havia cidades salvas de uma sessão anterior
       (localStorage), exibe-as imediatamente, sem esperar
       uma nova pesquisa.
    */
    if (cidadesComparadas.length > 0) {
        renderizarComparacao();
    }

    console.log(
        'Botão de comparação inicializado com sucesso.'
    );

    return true;
}


/* =========================================================
   OBSERVAR MUDANÇA DA CIDADE ATUAL
   ========================================================= */

let intervaloComparacao =
    null;


function iniciarMonitoramentoComparacao() {
    if (
        typeof window === 'undefined'
    ) {
        return;
    }

    if (
        intervaloComparacao !== null
    ) {
        return;
    }

    intervaloComparacao =
        window.setInterval(
            () => {

                atualizarBotaoAdicionarComparacao();

            },
            500
        );
}


function pararMonitoramentoComparacao() {
    if (
        typeof window === 'undefined'
    ) {
        return;
    }

    if (
        intervaloComparacao === null
    ) {
        return;
    }

    window.clearInterval(
        intervaloComparacao
    );

    intervaloComparacao =
        null;
}


/* =========================================================
   ESTADO PÚBLICO
   ========================================================= */

function obterCidadesComparadas() {
    return cidadesComparadas.map(
        item => ({

            cidade: {
                ...item.cidade
            },

            clima: {
                ...item.clima
            }
        })
    );
}


function quantidadeCidadesComparadas() {
    return cidadesComparadas.length;
}


function obterMaximoCidadesComparacao() {
    return COMPARACAO_MAXIMO_CIDADES;
}


function obterIdComparacaoAtual() {
    return idComparacaoAtual;
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

const ComparisonAPI = {

    localizacaoValidaComparacao,

    criarChaveCidadeComparacao,

    cidadeJaComparada,

    criarItemComparacao,

    buscarClimaCidadeComparacao,

    buscarClimasComparacao,

    adicionarCidadeComparacao,

    compararCidades,

    removerCidadeComparacao,

    limparComparacao,

    renderizarComparacao,

    obterCidadesComparadas,

    quantidadeCidadesComparadas,

    obterMaximoCidadesComparacao,

    obterIdComparacaoAtual,

    obterCidadeAtualParaComparacao,

    atualizarBotaoAdicionarComparacao,

    tratarCliqueAdicionarComparacao,

    inicializarComparacao,

    iniciarMonitoramentoComparacao,

    pararMonitoramentoComparacao
};


/* =========================================================
   API GLOBAL DO NAVEGADOR
   ========================================================= */

if (
    typeof window !== 'undefined'
) {

    window.ComparisonAPI =
        ComparisonAPI;
}


/* =========================================================
   INICIALIZAÇÃO NO NAVEGADOR
   ========================================================= */

if (
    typeof document !== 'undefined'
) {

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            () => {

                inicializarComparacao();

                iniciarMonitoramentoComparacao();

            },
            {
                once: true
            }
        );

    } else {

        inicializarComparacao();

        iniciarMonitoramentoComparacao();
    }
}


/* =========================================================
   EXPORTAÇÕES ES MODULE
   ========================================================= */

export {

    localizacaoValidaComparacao,

    criarChaveCidadeComparacao,

    cidadeJaComparada,

    criarItemComparacao,

    buscarClimaCidadeComparacao,

    buscarClimasComparacao,

    adicionarCidadeComparacao,

    compararCidades,

    removerCidadeComparacao,

    limparComparacao,

    renderizarComparacao,

    obterCidadesComparadas,

    quantidadeCidadesComparadas,

    obterMaximoCidadesComparacao,

    obterIdComparacaoAtual,

    obterCidadeAtualParaComparacao,

    atualizarBotaoAdicionarComparacao,

    tratarCliqueAdicionarComparacao,

    inicializarComparacao,

    iniciarMonitoramentoComparacao,

    pararMonitoramentoComparacao,

    ComparisonAPI
};


/* =========================================================
   CONFIRMAÇÃO
   ========================================================= */

console.log(
    'comparison.js carregado com sucesso.'
);