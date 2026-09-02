/* =========================================================
   API.JS
   =========================================================

   RESPONSABILIDADE

   O api.js é o ORQUESTRADOR principal da aplicação.

   Ele NÃO implementa diretamente:

   - Geocodificação
   - Consulta meteorológica
   - Previsão
   - Cache
   - Background climático
   - Comparação entre cidades

   Essas responsabilidades pertencem aos módulos:

   - geocoding.js
   - weather.js
   - forecast.js
   - cache.js
   - background.js
   - comparison.js


   O api.js é responsável por:

   - Capturar a pesquisa
   - Validar a entrada
   - Coordenar os módulos
   - Controlar o fluxo da pesquisa
   - Controlar requisições concorrentes
   - Atualizar a interface principal
   - Controlar loading e erros
   - Manter estado da cidade atual
   - Integrar comparação
   - Manter compatibilidade entre módulos
   - Disponibilizar ClimaAPI globalmente


   Compatibilidade:

   - Navegador
   - Live Server
   - GitHub Pages
   - ES Modules

   ========================================================= */


/* =========================================================
   IMPORTAÇÕES
   ========================================================= */

import * as Weather
    from './weather.js';

import * as Forecast
    from './forecast.js';

import * as Geocoding
    from './geocoding.js';

import * as Cache
    from './cache.js';

import * as Background
    from './background.js';

import * as Comparison
    from './comparison.js';

/*
   weather-canvas.js se inicializa sozinho e escuta o evento
   'clima:condicao' disparado por background.js. Este import
   é apenas para garantir que ele seja carregado junto da
   aplicação — nenhuma função dele é usada diretamente aqui.
*/
import './weather-canvas.js';


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const TAMANHO_MAXIMO_CIDADE =
    100;


/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

/*
   Identificador da última pesquisa.

   Serve para impedir que uma requisição antiga
   sobrescreva uma pesquisa mais recente.
*/

let requisicaoAtual =
    0;


/*
   Resultado pendente de seleção.

   É utilizado quando a API de geocoding
   retorna mais de uma cidade possível.
*/

let localizacoesPendentes =
    [];


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

function obterElementoAPI(
    id
) {

    if (
        typeof document ===
        'undefined'
    ) {

        return null;

    }


    return document.getElementById(
        id
    );
}


const form =
    obterElementoAPI(
        'weather-form'
    );


const cityInput =
    obterElementoAPI(
        'city-input'
    );


const loadingEl =
    obterElementoAPI(
        'loading'
    );


const errorEl =
    obterElementoAPI(
        'error-message'
    );


const resultDiv =
    obterElementoAPI(
        'weather-result'
    );


const cityNameEl =
    obterElementoAPI(
        'city-name'
    );


const tempEl =
    obterElementoAPI(
        'temperature'
    );


const localTimeEl =
    obterElementoAPI(
        'local-time'
    );


const descEl =
    obterElementoAPI(
        'weather-description'
    );


const windEl =
    obterElementoAPI(
        'wind'
    );


const updatedAtEl =
    obterElementoAPI(
        'updated-at'
    );


const feelsLikeEl =
    obterElementoAPI(
        'feels-like'
    );


const humidityEl =
    obterElementoAPI(
        'humidity'
    );


/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

if (
    typeof window !==
    'undefined'
) {

    window.cidadeAtualPesquisada =
        undefined;


    window.climaAtualPesquisado =
        undefined;

}


/* =========================================================
   OBTENÇÃO SEGURA DE FUNÇÕES
   ========================================================= */

/*
   Essas funções evitam que o api.js
   precise conhecer detalhes internos
   dos outros módulos.
*/


function obterFuncao(
    modulo,
    nome
) {

    if (
        modulo &&
        typeof modulo[nome] ===
        'function'
    ) {

        return modulo[nome];

    }


    return null;
}


/* =========================================================
   WEATHER
   ========================================================= */

function obterFuncaoWeather(
    nome
) {

    return obterFuncao(
        Weather,
        nome
    );

}


/* =========================================================
   FORECAST
   ========================================================= */

function obterFuncaoForecast(
    nome
) {

    return obterFuncao(
        Forecast,
        nome
    );

}


/* =========================================================
   GEOCODING
   ========================================================= */

function obterFuncaoGeocoding(
    nome
) {

    return obterFuncao(
        Geocoding,
        nome
    );

}


/* =========================================================
   CACHE
   ========================================================= */

function obterFuncaoCache(
    nome
) {

    return obterFuncao(
        Cache,
        nome
    );

}


/* =========================================================
   BACKGROUND
   ========================================================= */

function obterFuncaoBackground(
    nome
) {

    return obterFuncao(
        Background,
        nome
    );

}


/* =========================================================
   COMPARISON
   ========================================================= */

function obterFuncaoComparison(
    nome
) {

    return obterFuncao(
        Comparison,
        nome
    );

}


/* =========================================================
   NORMALIZAÇÃO DA CIDADE
   ========================================================= */

function normalizarCidade(
    cidade
) {

    if (
        typeof cidade !==
        'string'
    ) {

        return '';

    }


    return cidade
        .trim()
        .replace(
            /\s+/g,
            ' '
        )
        .normalize(
            'NFC'
        );

}


/* =========================================================
   VALIDAÇÃO DA CIDADE
   ========================================================= */

function validarCidade(
    cidade
) {

    if (!cidade) {

        return {

            valida: false,

            mensagem:
                'Digite o nome de uma cidade.'

        };

    }


    if (
        cidade.length >
        TAMANHO_MAXIMO_CIDADE
    ) {

        return {

            valida: false,

            mensagem:
                'O nome da cidade é muito longo.'

        };

    }


    const formatoValido =
        /^[\p{L}\p{N}][\p{L}\p{N}\s.'’()-]*$/u
            .test(
                cidade
            );


    if (!formatoValido) {

        return {

            valida: false,

            mensagem:
                'Informe um nome de cidade válido.'

        };

    }


    return {

        valida: true,

        mensagem: ''

    };

}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function mostrarCarregando(
    mostrar
) {

    if (!loadingEl) {

        return;

    }


    loadingEl.classList.toggle(
        'hidden',
        !mostrar
    );


    if (form) {

        form
            .querySelectorAll(
                'input, button'
            )
            .forEach(
                elemento => {

                    elemento.disabled =
                        mostrar;

                }
            );

    }

}


/* =========================================================
   ERROS
   ========================================================= */

function mostrarErro(
    mensagem
) {

    if (!errorEl) {

        return;

    }


    errorEl.textContent =
        mensagem;


    errorEl.classList.remove(
        'hidden'
    );

}


/* =========================================================
   LIMPAR ERRO
   ========================================================= */

function limparErro() {

    if (!errorEl) {

        return;

    }


    errorEl.textContent =
        '';


    errorEl.classList.add(
        'hidden'
    );

}


/* =========================================================
   LIMPAR RESULTADO
   ========================================================= */

function limparResultadoAnterior() {

    if (resultDiv) {

        resultDiv.classList.add(
            'hidden'
        );

    }


    const forecastSection =
        obterElementoAPI(
            'forecast-section'
        );


    if (forecastSection) {

        forecastSection.classList.add(
            'hidden'
        );

    }

}


/* =========================================================
   LIMPAR INTERFACE
   ========================================================= */

function limparMensagens() {

    limparErro();

    limparResultadoAnterior();

    limparOpcoesLocalizacao();

}


/* =========================================================
   DESCRIÇÃO DO CLIMA
   ========================================================= */

function obterDescricaoClima(
    codigo
) {

    const funcao =
        obterFuncaoWeather(
            'obterDescricaoClima'
        );


    if (!funcao) {

        return (
            'Condição climática desconhecida'
        );

    }


    return funcao(
        codigo
    );

}


/* =========================================================
   ÍCONE DO CLIMA
   ========================================================= */

function obterIconeClima(
    codigo,
    isDay
) {

    const funcao =
        obterFuncaoWeather(
            'obterIconeClima'
        );


    if (!funcao) {

        return '🌤️';

    }


    return funcao(
        codigo,
        isDay
    );

}


/* =========================================================
   HORÁRIO LOCAL DA CIDADE
   ========================================================= */

function formatarHorarioLocal(
    dataHora
) {

    if (
        typeof dataHora !==
        'string' ||
        dataHora.length <
        16
    ) {

        return '--:--';

    }


    return dataHora.substring(
        11,
        16
    );

}


/* =========================================================
   HORÁRIO LOCAL DO USUÁRIO
   ========================================================= */

function obterHorarioAtual() {

    return new Date()
        .toLocaleTimeString(
            'pt-BR',
            {

                hour:
                    '2-digit',

                minute:
                    '2-digit'

            }
        );

}


/* =========================================================
   BACKGROUND — FASE DO DIA
   ========================================================= */

function definirFaseDoDia(
    dataHora
) {

    const funcao =
        obterFuncaoBackground(
            'definirFaseDoDiaBackground'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        dataHora
    );

}


/* =========================================================
   BACKGROUND — CONDIÇÃO CLIMÁTICA
   ========================================================= */

function aplicarCondicaoClimatica(
    codigo,
    dataHora,
    extras
) {

    const funcao =
        obterFuncaoBackground(
            'aplicarCondicaoClimaticaBackground'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        codigo,
        dataHora,
        extras
    );

}


/* =========================================================
   CACHE — CRIAR CHAVE
   ========================================================= */

function criarChaveCache(
    cidade,
    latitude,
    longitude
) {

    const funcao =
        obterFuncaoCache(
            'criarChaveCache'
        );


    if (!funcao) {

        return '';

    }


    return funcao(
        cidade,
        latitude,
        longitude
    );

}


/* =========================================================
   CACHE — SALVAR
   ========================================================= */

function salvarCache(
    cidade,
    dados
) {

    const funcao =
        obterFuncaoCache(
            'salvarCache'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        cidade,
        dados
    );

}


/* =========================================================
   CACHE — OBTER
   ========================================================= */

function obterCache(
    cidade,
    latitude,
    longitude
) {

    const funcao =
        obterFuncaoCache(
            'obterCache'
        );


    if (!funcao) {

        return null;

    }


    return funcao(
        cidade,
        latitude,
        longitude
    );

}


/* =========================================================
   CACHE — REMOVER
   ========================================================= */

function removerCache(
    cidade,
    latitude,
    longitude
) {

    const funcao =
        obterFuncaoCache(
            'removerCache'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        cidade,
        latitude,
        longitude
    );

}


/* =========================================================
   CACHE — VALIDADE
   ========================================================= */

function cachePossuiDadosValidos(
    dados
) {

    const funcao =
        obterFuncaoCache(
            'cachePossuiDadosValidos'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        dados
    );

}


/* =========================================================
   CACHE — DADOS NOVOS
   ========================================================= */

function cachePossuiDadosNovos(
    dados
) {

    const funcao =
        obterFuncaoCache(
            'cachePossuiDadosNovos'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        dados
    );

}


/* =========================================================
   WEATHER — CLIMA ATUAL
   ========================================================= */

async function buscarClimaAtual(
    latitude,
    longitude
) {

    const funcao =
        obterFuncaoWeather(
            'buscarClimaAtual'
        );


    if (!funcao) {

        throw new Error(
            'A função buscarClimaAtual não está disponível no weather.js.'
        );

    }


    return await funcao(
        latitude,
        longitude
    );

}


/* =========================================================
   FORECAST — BUSCAR
   ========================================================= */

async function carregarPrevisao(
    latitude,
    longitude
) {

    const funcao =
        obterFuncaoForecast(
            'buscarPrevisao'
        );


    if (!funcao) {

        throw new Error(
            'A função buscarPrevisao não está disponível no forecast.js.'
        );

    }


    return await funcao(
        latitude,
        longitude
    );

}


/* =========================================================
   FORECAST — EXIBIR
   ========================================================= */

function exibirPrevisao(
    previsao
) {

    const funcao =
        obterFuncaoForecast(
            'exibirPrevisao'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        previsao
    );

}


/* =========================================================
   GEOCODING — TODAS AS LOCALIZAÇÕES
   ========================================================= */

async function buscarLocalizacoes(
    cidade,
    idRequisicao = null,
    obterIdRequisicaoAtual = null
) {

    const funcao =
        obterFuncaoGeocoding(
            'buscarLocalizacaoGeocoding'
        );


    if (!funcao) {

        throw new Error(
            'A função de geocodificação não está disponível no geocoding.js.'
        );

    }


    const resultados =
        await funcao(
            cidade,
            idRequisicao,
            obterIdRequisicaoAtual
        );


    if (
        !Array.isArray(
            resultados
        )
    ) {

        return [];

    }


    return resultados;

}


/* =========================================================
   GEOCODING — PRIMEIRA LOCALIZAÇÃO
   ========================================================= */

async function buscarLocalizacao(
    cidade,
    idRequisicao = null,
    obterIdRequisicaoAtual = null
) {

    const resultados =
        await buscarLocalizacoes(
            cidade,
            idRequisicao,
            obterIdRequisicaoAtual
        );


    if (
        resultados.length === 0
    ) {

        return null;

    }


    return resultados[0];

}


/* =========================================================
   GEOCODING — NOME
   ========================================================= */

function criarNomeLocalizacao(
    cidade
) {

    const funcao =
        obterFuncaoGeocoding(
            'criarNomeLocalizacaoGeocoding'
        );


    if (!funcao) {

        return (
            cidade?.name ||
            'Cidade'
        );

    }


    return funcao(
        cidade
    );

}


/* =========================================================
   GEOCODING — DETALHES
   ========================================================= */

function criarDetalhesLocalizacao(
    cidade
) {

    const funcao =
        obterFuncaoGeocoding(
            'criarDetalhesLocalizacaoGeocoding'
        );


    if (!funcao) {

        return '';

    }


    return funcao(
        cidade
    );

}


/* =========================================================
   OPÇÕES DE LOCALIZAÇÃO
   ========================================================= */

/*
   IMPORTANTE

   A API antiga utilizava count maior que 1
   para permitir resolver cidades homônimas.

   Durante a divisão dos módulos essa possibilidade
   não pode ser perdida.

   O usuário deve escolher a localização ANTES
   de consultar o clima daquela localização.
*/


function obterContainerOpcoesLocalizacao() {

    const existentes = [

        'location-options',

        'city-options',

        'geocoding-options',

        'location-selection'

    ];


    for (
        const id of existentes
    ) {

        const elemento =
            obterElementoAPI(
                id
            );


        if (elemento) {

            return elemento;

        }

    }


    return null;

}


/* =========================================================
   LIMPAR OPÇÕES
   ========================================================= */

function limparOpcoesLocalizacao() {

    localizacoesPendentes =
        [];


    const container =
        obterContainerOpcoesLocalizacao();


    if (!container) {

        return;

    }


    container.innerHTML =
        '';


    container.classList.add(
        'hidden'
    );

}


/* =========================================================
   EXIBIR OPÇÕES
   ========================================================= */

function exibirOpcoesLocalizacao(
    resultados,
    callback
) {

    if (
        !Array.isArray(
            resultados
        ) ||
        resultados.length === 0
    ) {

        return false;

    }


    const container =
        obterContainerOpcoesLocalizacao();


    /*
       Se o HTML já possuir um container
       específico, usamos ele.

       Caso não exista, criamos um
       container dedicado dentro do formulário.
    */

    let destino =
        container;


    if (!destino) {

        destino =
            document.createElement(
                'div'
            );


        destino.id =
            'location-options';


        destino.className =
            'location-options';


        if (form) {

            form.after(
                destino
            );

        } else {

            document.body.appendChild(
                destino
            );

        }

    }


    destino.innerHTML =
        '';


    destino.classList.remove(
        'hidden'
    );


    localizacoesPendentes =
        resultados;


    const titulo =
        document.createElement(
            'p'
        );


    titulo.className =
        'location-options-title';


    titulo.textContent =
        'Encontramos mais de uma localização. Escolha a cidade desejada:';


    destino.appendChild(
        titulo
    );


    resultados.forEach(
        (
            cidade,
            indice
        ) => {

            const botao =
                document.createElement(
                    'button'
                );


            botao.type =
                'button';


            botao.className =
                'location-option-card';


            botao.dataset.index =
                String(indice);


            const nome =
                criarNomeLocalizacao(
                    cidade
                );


            const detalhes =
                criarDetalhesLocalizacao(
                    cidade
                );


            const tituloCidade =
                document.createElement(
                    'strong'
                );


            tituloCidade.textContent =
                nome;


            botao.appendChild(
                tituloCidade
            );


            if (detalhes) {

                const detalhesCidade =
                    document.createElement(
                        'span'
                    );


                detalhesCidade.textContent =
                    detalhes;


                botao.appendChild(
                    detalhesCidade
                );

            }


            botao.addEventListener(
                'click',
                () => {

                    const cidadeSelecionada =
                        localizacoesPendentes[
                            indice
                        ];


                    limparOpcoesLocalizacao();


                    if (
                        typeof callback ===
                        'function'
                    ) {

                        callback(
                            cidadeSelecionada
                        );

                    }

                }
            );


            destino.appendChild(
                botao
            );

        }
    );


    return true;

}


/* =========================================================
   EXIBIR DADOS DO CLIMA
   ========================================================= */

function exibirDadosClima(
    cidadeEncontrada,
    climaAtual
) {

    if (
        !cidadeEncontrada ||
        !climaAtual
    ) {

        return false;

    }


    /* -----------------------------------------------------
       CIDADE
       ----------------------------------------------------- */

    if (cityNameEl) {

        cityNameEl.textContent =
            criarNomeLocalizacao(
                cidadeEncontrada
            );

    }


    /* -----------------------------------------------------
       HORÁRIO DA CIDADE
       ----------------------------------------------------- */

    if (localTimeEl) {

        localTimeEl.textContent =
            `Horário destino: ${
                formatarHorarioLocal(
                    climaAtual.time
                )
            }`;

    }


    /* -----------------------------------------------------
       TEMPERATURA
       ----------------------------------------------------- */

    if (tempEl) {

        tempEl.textContent =
            `${climaAtual.temperature} °C`;

    }


    /* -----------------------------------------------------
       CONDIÇÃO
       ----------------------------------------------------- */

    if (descEl) {

        descEl.textContent =
            `${obterIconeClima(
                climaAtual.weathercode,
                climaAtual.is_day
            )} ${
                obterDescricaoClima(
                    climaAtual.weathercode
                )
            }`;

    }


    /* -----------------------------------------------------
       VELOCIDADE DO VENTO
       ----------------------------------------------------- */

    if (windEl) {

        windEl.textContent =
            `💨 Vento: ${
                climaAtual.windspeed
            } km/h`;

    }


    /*
       A direção do vento NÃO é exibida.

       O dado não é necessário para o objetivo
       principal da aplicação.
    */


    /* -----------------------------------------------------
       SENSAÇÃO TÉRMICA
       ----------------------------------------------------- */

    if (feelsLikeEl) {

        feelsLikeEl.textContent =
            `Sensação térmica: ${
                climaAtual.apparent_temperature
            } °C`;

    }


    /* -----------------------------------------------------
       UMIDADE
       ----------------------------------------------------- */

    if (humidityEl) {

        humidityEl.textContent =
            `Umidade: ${
                climaAtual.relative_humidity_2m
            }%`;

    }


    /* -----------------------------------------------------
       ATUALIZAÇÃO
       ----------------------------------------------------- */

    if (updatedAtEl) {

        updatedAtEl.textContent =
            `Atualizado em: ${
                obterHorarioAtual()
            }`;

    }


    /* -----------------------------------------------------
       FASE DO DIA
       ----------------------------------------------------- */

    definirFaseDoDia(
        climaAtual.time
    );


    /* -----------------------------------------------------
       ESTADO GLOBAL
       ----------------------------------------------------- */

    if (
        typeof window !==
        'undefined'
    ) {

        window.cidadeAtualPesquisada =
            cidadeEncontrada;


        window.climaAtualPesquisado =
            climaAtual;

    }


    /* -----------------------------------------------------
       RESULTADO
       ----------------------------------------------------- */

    if (resultDiv) {

        resultDiv.classList.remove(
            'hidden'
        );

    }


    /* -----------------------------------------------------
       BACKGROUND
       ----------------------------------------------------- */

    aplicarCondicaoClimatica(
        climaAtual.weathercode,
        climaAtual.time,
        {
            windspeed: climaAtual.windspeed,
            isDay: climaAtual.is_day
        }
    );


    return true;

}


/* =========================================================
   BUSCAR DADOS COMPLETOS
   ========================================================= */

async function buscarDadosCompletos(
    cidadeEncontrada
) {

    if (
        !cidadeEncontrada ||
        typeof cidadeEncontrada !==
        'object'
    ) {

        throw new Error(
            'Localização da cidade inválida.'
        );

    }


    const latitude =
        cidadeEncontrada.latitude;


    const longitude =
        cidadeEncontrada.longitude;


    if (
        typeof latitude !==
        'number' ||
        !Number.isFinite(
            latitude
        ) ||
        typeof longitude !==
        'number' ||
        !Number.isFinite(
            longitude
        )
    ) {

        throw new Error(
            'As coordenadas da cidade são inválidas.'
        );

    }


    const nomeCidade =
        typeof cidadeEncontrada.name ===
        'string'

            ? cidadeEncontrada.name

            : 'cidade';


    /* -----------------------------------------------------
       CACHE
       ----------------------------------------------------- */

    const dadosCache =
        obterCache(
            nomeCidade,
            latitude,
            longitude
        );


    if (
        dadosCache &&
        cachePossuiDadosValidos(
            dadosCache
        )
    ) {

        console.log(
            `Cache utilizado para: ${nomeCidade}`
        );


        return dadosCache;

    }


    /* -----------------------------------------------------
       CLIMA ATUAL
       ----------------------------------------------------- */

    const climaAtual =
        await buscarClimaAtual(
            latitude,
            longitude
        );


    /* -----------------------------------------------------
       PREVISÃO
       ----------------------------------------------------- */

    const previsao =
        await carregarPrevisao(
            latitude,
            longitude
        );


    /* -----------------------------------------------------
       DADOS COMPLETOS
       ----------------------------------------------------- */

    const dados = {

        cidadeEncontrada,

        climaAtual,

        previsao

    };


    /* -----------------------------------------------------
       CACHE
       ----------------------------------------------------- */

    salvarCache(
        nomeCidade,
        dados
    );


    console.log(
        `Dados atualizados salvos no cache: ${nomeCidade}`
    );


    return dados;

}


/* =========================================================
   VERIFICAR REQUISIÇÃO ATUAL
   ========================================================= */

function requisicaoAindaAtual(
    id
) {

    return (
        id ===
        requisicaoAtual
    );

}


/* =========================================================
   PROCESSAR LOCALIZAÇÃO ESCOLHIDA
   ========================================================= */

async function processarCidadeSelecionada(
    cidadeEncontrada,
    idRequisicao
) {

    if (
        !requisicaoAindaAtual(
            idRequisicao
        )
    ) {

        return;

    }


    try {

        const dados =
            await buscarDadosCompletos(
                cidadeEncontrada
            );


        if (
            !requisicaoAindaAtual(
                idRequisicao
            )
        ) {

            return;

        }


        if (
            !dados ||
            !dados.climaAtual
        ) {

            throw new Error(
                'Não foi possível obter os dados meteorológicos.'
            );

        }


        exibirDadosClima(

            dados.cidadeEncontrada,

            dados.climaAtual

        );


        if (
            dados.previsao
        ) {

            exibirPrevisao(
                dados.previsao
            );

        }


    }

    catch (erro) {

        if (
            !requisicaoAindaAtual(
                idRequisicao
            )
        ) {

            return;

        }


        console.error(
            'Erro ao carregar cidade selecionada:',
            erro
        );


        mostrarErro(
            erro instanceof Error
                ? erro.message
                : 'Não foi possível carregar os dados do clima.'
        );

    }

}


/* =========================================================
   PESQUISA PRINCIPAL
   ========================================================= */

function inicializarPesquisaAPI() {

    if (!form) {

        console.warn(
            'Formulário de clima não encontrado.'
        );

        return false;

    }


    if (
        form.dataset.apiInitialized ===
        'true'
    ) {

        return true;

    }


    form.dataset.apiInitialized =
        'true';


    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            /* ---------------------------------------------
               CIDADE
               --------------------------------------------- */

            const cidade =
                normalizarCidade(
                    cityInput
                        ? cityInput.value
                        : ''
                );


            const validacao =
                validarCidade(
                    cidade
                );


            if (
                !validacao.valida
            ) {

                mostrarErro(
                    validacao.mensagem
                );

                return;

            }


            /* ---------------------------------------------
               NOVA REQUISIÇÃO
               --------------------------------------------- */

            const idRequisicao =
                ++requisicaoAtual;


            limparMensagens();


            mostrarCarregando(
                true
            );


            try {

                /* -----------------------------------------
                   GEOCODING
                   ----------------------------------------- */

                console.log(
                    `Pesquisando localização: ${cidade}`
                );


                const resultados =
                    await buscarLocalizacoes(
                        cidade,
                        idRequisicao,
                        () =>
                            requisicaoAtual
                    );


                if (
                    !requisicaoAindaAtual(
                        idRequisicao
                    )
                ) {

                    return;

                }


                if (
                    !resultados ||
                    resultados.length === 0
                ) {

                    mostrarErro(
                        'Cidade não encontrada. Verifique o nome informado.'
                    );

                    return;

                }


                /* -----------------------------------------
                   MAIS DE UMA LOCALIZAÇÃO
                   ----------------------------------------- */

                if (
                    resultados.length >
                    1
                ) {

                    mostrarCarregando(
                        false
                    );


                    exibirOpcoesLocalizacao(
                        resultados,
                        cidadeSelecionada => {

                            mostrarCarregando(
                                true
                            );


                            processarCidadeSelecionada(
                                cidadeSelecionada,
                                idRequisicao
                            )
                                .finally(
                                    () => {

                                        if (
                                            requisicaoAindaAtual(
                                                idRequisicao
                                            )
                                        ) {

                                            mostrarCarregando(
                                                false
                                            );

                                        }

                                    }
                                );

                        }
                    );


                    return;

                }


                /* -----------------------------------------
                   ÚNICO RESULTADO
                   ----------------------------------------- */

                await processarCidadeSelecionada(
                    resultados[0],
                    idRequisicao
                );


            }

            catch (erro) {

                if (
                    !requisicaoAindaAtual(
                        idRequisicao
                    )
                ) {

                    return;

                }


                console.error(
                    'Erro ao buscar dados:',
                    erro
                );


                mostrarErro(

                    erro instanceof Error
                        ? erro.message
                        : 'Não foi possível carregar os dados do clima. Verifique sua conexão com a internet.'

                );

            }

            finally {

                if (
                    requisicaoAindaAtual(
                        idRequisicao
                    )
                ) {

                    mostrarCarregando(
                        false
                    );

                }

            }

        }
    );


    return true;

}


/* =========================================================
   INTEGRAÇÃO COM COMPARISON.JS
   ========================================================= */

/*
   A comparação continua sendo responsabilidade
   exclusiva do comparison.js.

   O api.js apenas fornece o estado atual
   e tenta inicializar o módulo quando
   uma função pública de inicialização
   estiver disponível.
*/


function inicializarComparacaoAPI() {

    const funcoesPossiveis = [

        'inicializarComparison',

        'inicializarComparacao',

        'inicializarComparisonAPI',

        'inicializarComparacaoAPI'

    ];


    for (
        const nome of
        funcoesPossiveis
    ) {

        const funcao =
            obterFuncaoComparison(
                nome
            );


        if (funcao) {

            try {

                funcao();

            }

            catch (erro) {

                console.error(
                    `Erro ao inicializar comparison.js através de ${nome}:`,
                    erro
                );

            }


            return true;

        }

    }


    /*
       comparison.js também pode possuir
       inicialização automática própria.

       Nesse caso não fazemos nada.
    */

    return false;

}


/* =========================================================
   TEMA
   ========================================================= */

/*
   O tema é responsabilidade exclusiva do background.js.

   Estas funções existiam aqui como uma implementação completa
   e independente — com seu próprio listener de clique no
   #theme-toggle — duplicando exatamente a mesma lógica que
   background.js também implementa e também anexa ao mesmo
   botão. Isso fazia os dois listeners disputarem o mesmo
   clique: um ligava o modo escuro, o outro (dessincronizado)
   desligava de novo no mesmo instante.

   api.js agora apenas delega para background.js, mantendo os
   mesmos nomes de função por compatibilidade (nenhum código
   que já chamava ClimaAPI.aplicarTema, por exemplo, precisa
   mudar).
*/


function aplicarTema(
    tema
) {

    const funcao =
        obterFuncaoBackground(
            'aplicarTemaBackground'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        tema
    );

}


function obterTemaInicial() {

    const funcao =
        obterFuncaoBackground(
            'obterTemaInicialBackground'
        );


    if (!funcao) {

        return 'light';

    }


    return funcao();

}


function salvarTema(
    tema
) {

    const funcao =
        obterFuncaoBackground(
            'salvarTemaBackground'
        );


    if (!funcao) {

        return false;

    }


    return funcao(
        tema
    );

}


function inicializarTemaAPI() {

    /*
       background.js já se inicializa sozinho (ver o final
       daquele arquivo), incluindo o único listener de clique
       do #theme-toggle. Esta função existe apenas para manter
       compatibilidade de nome; ela delega para a inicialização
       idempotente de background.js em vez de anexar um segundo
       listener concorrente.
    */

    const funcao =
        obterFuncaoBackground(
            'inicializarTemaBackground'
        );


    if (!funcao) {

        return false;

    }


    funcao();

    return true;

}


/* =========================================================
   API PÚBLICA
   ========================================================= */

const ClimaAPI = {

    /* Interface */

    mostrarCarregando,

    mostrarErro,

    limparMensagens,


    /* Cidade */

    normalizarCidade,

    validarCidade,

    buscarLocalizacao,

    buscarLocalizacoes,

    criarNomeLocalizacao,

    criarDetalhesLocalizacao,

    exibirOpcoesLocalizacao,


    /* Weather */

    obterDescricaoClima,

    obterIconeClima,

    buscarClimaAtual,


    /* Forecast */

    carregarPrevisao,

    exibirPrevisao,


    /* Cache */

    criarChaveCache,

    salvarCache,

    obterCache,

    removerCache,

    cachePossuiDadosValidos,

    cachePossuiDadosNovos,


    /* Background */

    definirFaseDoDia,

    aplicarCondicaoClimatica,


    /* Dados */

    formatarHorarioLocal,

    obterHorarioAtual,

    exibirDadosClima,

    buscarDadosCompletos,


    /* Tema */

    aplicarTema,

    obterTemaInicial,

    salvarTema,


    /* Comparação */

    inicializarComparacaoAPI,


    /* Inicialização */

    inicializarPesquisaAPI,

    inicializarTemaAPI

};


/* =========================================================
   API GLOBAL DO NAVEGADOR
   ========================================================= */

if (
    typeof window !==
    'undefined'
) {

    window.ClimaAPI =
        ClimaAPI;


    /*
       Compatibilidade com módulos
       que ainda utilizam a API global
       antiga.
    */

    window.obterDescricaoClima =
        obterDescricaoClima;


    window.obterIconeClima =
        obterIconeClima;


    window.exibirDadosClima =
        exibirDadosClima;


    window.buscarClimaAtual =
        buscarClimaAtual;


    window.buscarLocalizacao =
        buscarLocalizacao;


    window.buscarLocalizacoes =
        buscarLocalizacoes;


    window.buscarDadosCompletos =
        buscarDadosCompletos;

}


/* =========================================================
   AVISO DE PRIVACIDADE E LICENCIAMENTO
   =========================================================

   Permite fechar o aviso; a preferência fica salva
   apenas no navegador do usuário (localStorage), sem
   nenhum envio a servidores.
   ========================================================= */

const CHAVE_AVISO_PRIVACIDADE_DISPENSADO =
    'clima_api_aviso_privacidade_dispensado';

function inicializarAvisoPrivacidadeAPI() {

    const aviso =
        document.getElementById(
            'privacy-notice'
        );

    const botaoFechar =
        document.getElementById(
            'privacy-notice-dismiss'
        );

    if (!aviso) {
        return;
    }

    let dispensadoAnteriormente = false;

    try {
        dispensadoAnteriormente =
            localStorage.getItem(
                CHAVE_AVISO_PRIVACIDADE_DISPENSADO
            ) === 'true';
    } catch (erro) {
        /* Sem localStorage, o aviso simplesmente continua visível. */
    }

    if (dispensadoAnteriormente) {
        aviso.classList.add('hidden');
        return;
    }

    if (botaoFechar) {

        botaoFechar.addEventListener(
            'click',
            () => {

                aviso.classList.add('hidden');

                try {
                    localStorage.setItem(
                        CHAVE_AVISO_PRIVACIDADE_DISPENSADO,
                        'true'
                    );
                } catch (erro) {
                    /* A preferência não é essencial ao funcionamento. */
                }
            }
        );
    }
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarAPI() {

    inicializarPesquisaAPI();

    inicializarTemaAPI();

    inicializarComparacaoAPI();

    inicializarAvisoPrivacidadeAPI();

}


/* =========================================================
   INICIALIZAÇÃO SEGURA DO NAVEGADOR
   ========================================================= */

if (
    typeof document !==
    'undefined'
) {

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            inicializarAPI,
            {
                once: true
            }
        );

    }

    else {

        inicializarAPI();

    }

}


/* =========================================================
   EXPORTAÇÃO ES MODULE
   ========================================================= */

export {

    /* Interface */

    mostrarCarregando,

    mostrarErro,

    limparMensagens,


    /* Cidade */

    normalizarCidade,

    validarCidade,

    buscarLocalizacao,

    buscarLocalizacoes,

    criarNomeLocalizacao,

    criarDetalhesLocalizacao,

    exibirOpcoesLocalizacao,


    /* Weather */

    obterDescricaoClima,

    obterIconeClima,

    buscarClimaAtual,


    /* Forecast */

    carregarPrevisao,

    exibirPrevisao,


    /* Cache */

    criarChaveCache,

    salvarCache,

    obterCache,

    removerCache,

    cachePossuiDadosValidos,

    cachePossuiDadosNovos,


    /* Background */

    definirFaseDoDia,

    aplicarCondicaoClimatica,


    /* Dados */

    formatarHorarioLocal,

    obterHorarioAtual,

    exibirDadosClima,

    buscarDadosCompletos,


    /* Tema */

    aplicarTema,

    obterTemaInicial,

    salvarTema,


    /* Comparação */

    inicializarComparacaoAPI,


    /* Inicialização */

    inicializarPesquisaAPI,

    inicializarTemaAPI,


    /* API */

    ClimaAPI

};


/* =========================================================
   FINALIZAÇÃO
   ========================================================= */

console.log(
    'api.js modular carregado com sucesso.'
);