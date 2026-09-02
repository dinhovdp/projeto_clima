/* =========================================================
   PREVISÃO DO CLIMA
   =========================================================

   Responsabilidades:

   - Validar coordenadas
   - Consultar previsão meteorológica
   - Controlar timeout das requisições
   - Validar resposta da API
   - Normalizar previsão
   - Exibir previsão na interface
   - Controlar estado da previsão

   Compatibilidade:

   - ES Modules
   - Navegador
   - Jest

   Dependência:

   - weather.js

   ========================================================= */


/* =========================================================
   DEPENDÊNCIA WEATHER
   ========================================================= */

import {
    numeroValidoWeather,
    obterDescricaoClima,
    obterIconeClima
} from './weather.js';


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const FORECAST_TEMPO_LIMITE_REQUISICAO =
    15000;

const FORECAST_QUANTIDADE_DIAS =
    7;


/* =========================================================
   ESTADO INTERNO
   ========================================================= */

let previsaoAtual =
    null;

let requisicaoPrevisaoAtual =
    0;


/* =========================================================
   VALIDAÇÃO DE COORDENADAS
   ========================================================= */

function validarCoordenadasForecast(
    latitude,
    longitude
) {
    if (
        !numeroValidoWeather(
            latitude
        ) ||
        !numeroValidoWeather(
            longitude
        )
    ) {
        return false;
    }

    return (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}


/* =========================================================
   TIMEOUT
   ========================================================= */

async function requisicaoForecastComTimeout(
    url
) {
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            FORECAST_TEMPO_LIMITE_REQUISICAO
        );

    try {

        const resposta =
            await fetch(
                url,
                {
                    method: 'GET',

                    signal:
                        controller.signal,

                    headers: {
                        Accept:
                            'application/json'
                    },

                    cache:
                        'no-store',

                    referrerPolicy:
                        'strict-origin-when-cross-origin'
                }
            );

        return resposta;

    } catch (erro) {

        if (
            erro &&
            erro.name ===
                'AbortError'
        ) {
            throw new Error(
                'A consulta da previsão demorou mais que o esperado.'
            );
        }

        throw new Error(
            'Não foi possível estabelecer conexão com o serviço de previsão.'
        );

    } finally {

        clearTimeout(
            timeout
        );
    }
}


/* =========================================================
   FORMATAÇÃO DE DATA
   ========================================================= */

function formatarDataForecast(
    data
) {
    if (
        typeof data !== 'string'
    ) {
        return '--/--';
    }

    const correspondencia =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            data
        );

    if (!correspondencia) {
        return '--/--';
    }

    return (
        correspondencia[3] +
        '/' +
        correspondencia[2]
    );
}


/* =========================================================
   DIA DA SEMANA
   ========================================================= */

function obterNomeDiaForecast(
    data
) {
    if (
        typeof data !== 'string'
    ) {
        return '--';
    }

    const correspondencia =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            data
        );

    if (!correspondencia) {
        return '--';
    }

    const ano =
        Number(
            correspondencia[1]
        );

    const mes =
        Number(
            correspondencia[2]
        );

    const dia =
        Number(
            correspondencia[3]
        );

    const dataObjeto =
        new Date(
            ano,
            mes - 1,
            dia
        );

    if (
        Number.isNaN(
            dataObjeto.getTime()
        )
    ) {
        return '--';
    }

    const nomes = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado'
    ];

    return nomes[
        dataObjeto.getDay()
    ];
}


/* =========================================================
   VALIDAÇÃO DA RESPOSTA
   ========================================================= */

function validarDadosForecast(
    dados
) {
    if (
        !dados ||
        typeof dados !== 'object'
    ) {
        return false;
    }

    if (
        !dados.daily ||
        typeof dados.daily !== 'object'
    ) {
        return false;
    }

    const daily =
        dados.daily;

    const camposObrigatorios = [
        'time',
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min'
    ];

    for (
        const campo
        of camposObrigatorios
    ) {
        if (
            !Array.isArray(
                daily[campo]
            )
        ) {
            return false;
        }
    }

    const quantidade =
        daily.time.length;

    if (
        quantidade === 0 ||
        quantidade >
            FORECAST_QUANTIDADE_DIAS
    ) {
        return false;
    }

    for (
        const campo
        of camposObrigatorios
    ) {
        if (
            daily[campo].length !==
            quantidade
        ) {
            return false;
        }
    }

    for (
        let indice = 0;
        indice < quantidade;
        indice++
    ) {

        if (
            typeof daily.time[
                indice
            ] !== 'string'
        ) {
            return false;
        }

        if (
            !numeroValidoWeather(
                daily.weather_code[
                    indice
                ]
            )
        ) {
            return false;
        }

        if (
            !numeroValidoWeather(
                daily.temperature_2m_max[
                    indice
                ]
            )
        ) {
            return false;
        }

        if (
            !numeroValidoWeather(
                daily.temperature_2m_min[
                    indice
                ]
            )
        ) {
            return false;
        }
    }

    return true;
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarPrevisao(
    dados
) {
    if (
        !validarDadosForecast(
            dados
        )
    ) {
        throw new Error(
            'Os dados da previsão estão incompletos ou inválidos.'
        );
    }

    const daily =
        dados.daily;

    const dias =
        daily.time.map(
            (
                data,
                indice
            ) => {

                const codigo =
                    daily.weather_code[
                        indice
                    ];

                const probabilidade =
                    Array.isArray(
                        daily.precipitation_probability_max
                    )
                        ? daily
                            .precipitation_probability_max[
                                indice
                            ]
                        : null;

                const precipitacao =
                    Array.isArray(
                        daily.precipitation_sum
                    )
                        ? daily
                            .precipitation_sum[
                                indice
                            ]
                        : null;

                return {

                    data,

                    diaSemana:
                        obterNomeDiaForecast(
                            data
                        ),

                    dataFormatada:
                        formatarDataForecast(
                            data
                        ),

                    temperaturaMaxima:
                        daily.temperature_2m_max[
                            indice
                        ],

                    temperaturaMinima:
                        daily.temperature_2m_min[
                            indice
                        ],

                    codigo,

                    descricao:
                        obterDescricaoClima(
                            codigo
                        ),

                    icone:
                        obterIconeClima(
                            codigo,
                            true
                        ),

                    probabilidadeChuva:
                        numeroValidoWeather(
                            probabilidade
                        )
                            ? probabilidade
                            : null,

                    precipitacao:
                        numeroValidoWeather(
                            precipitacao
                        )
                            ? precipitacao
                            : null
                };
            }
        );

    return {

        timezone:
            typeof dados.timezone ===
            'string'
                ? dados.timezone
                : null,

        timezoneAbbreviation:
            typeof dados.timezone_abbreviation ===
            'string'
                ? dados.timezone_abbreviation
                : null,

        dias
    };
}


/* =========================================================
   BUSCAR PREVISÃO
   ========================================================= */

async function buscarPrevisao(
    latitude,
    longitude
) {
    if (
        !validarCoordenadasForecast(
            latitude,
            longitude
        )
    ) {
        throw new Error(
            'Coordenadas inválidas para a previsão.'
        );
    }

    const idRequisicao =
        ++requisicaoPrevisaoAtual;

    const parametros =
        new URLSearchParams({

            latitude:
                String(latitude),

            longitude:
                String(longitude),

            daily: [
                'weather_code',
                'temperature_2m_max',
                'temperature_2m_min',
                'precipitation_sum',
                'precipitation_probability_max'
            ].join(','),

            timezone:
                'auto',

            forecast_days:
                String(
                    FORECAST_QUANTIDADE_DIAS
                )
        });

    const url =
        'https://api.open-meteo.com/v1/forecast?' +
        parametros.toString();

    const resposta =
        await requisicaoForecastComTimeout(
            url
        );

    if (!resposta.ok) {
        throw new Error(
            'O serviço de previsão não respondeu corretamente.'
        );
    }

    let dados;

    try {

        dados =
            await resposta.json();

    } catch (erro) {

        throw new Error(
            'A resposta da previsão possui formato inválido.'
        );
    }

    if (
        idRequisicao !==
        requisicaoPrevisaoAtual
    ) {
        return null;
    }

    const previsao =
        normalizarPrevisao(
            dados
        );

    previsao.latitude =
        latitude;

    previsao.longitude =
        longitude;

    previsao.recebidaEm =
        Date.now();

    previsaoAtual =
        previsao;

    return previsao;
}


/* =========================================================
   ELEMENTOS
   ========================================================= */

function obterSecaoPrevisao() {
    if (
        typeof document ===
        'undefined'
    ) {
        return null;
    }

    return document.getElementById(
        'forecast-section'
    );
}


/* =========================================================
   LISTA / CONTAINER DA PREVISÃO
   =========================================================

   O HTML atual utiliza:

       #forecast-section
           └── #forecast-container

   Mantemos também os seletores antigos como
   compatibilidade adicional.

   ========================================================= */

function obterListaPrevisao() {
    const secao =
        obterSecaoPrevisao();

    if (!secao) {
        return null;
    }

    return (
        secao.querySelector(
            '#forecast-container'
        ) ||
        secao.querySelector(
            '.forecast-container'
        ) ||
        secao.querySelector(
            '#forecast-list'
        ) ||
        secao.querySelector(
            '.forecast-list'
        )
    );
}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardPrevisao(
    dia,
    indice
) {
    const card =
        document.createElement(
            'article'
        );

    card.className =
        'forecast-card';

    card.dataset.index =
        String(indice);

    const titulo =
        document.createElement(
            'h3'
        );

    titulo.textContent =
        indice === 0
            ? 'Hoje'
            : dia.diaSemana;

    const data =
        document.createElement(
            'span'
        );

    data.className =
        'forecast-date';

    data.textContent =
        dia.dataFormatada;

    const icone =
        document.createElement(
            'span'
        );

    icone.className =
        'forecast-icon';

    icone.textContent =
        dia.icone;

    icone.setAttribute(
        'role',
        'img'
    );

    icone.setAttribute(
        'aria-label',
        dia.descricao
    );

    const descricao =
        document.createElement(
            'p'
        );

    descricao.className =
        'forecast-description';

    descricao.textContent =
        dia.descricao;

    const temperaturas =
        document.createElement(
            'p'
        );

    temperaturas.className =
        'forecast-temperatures';

    temperaturas.textContent =
        numeroValidoWeather(
            dia.temperaturaMaxima
        ) &&
        numeroValidoWeather(
            dia.temperaturaMinima
        )
            ? `${dia.temperaturaMaxima} °C / ${dia.temperaturaMinima} °C`
            : '-- °C / -- °C';

    card.appendChild(
        titulo
    );

    card.appendChild(
        data
    );

    card.appendChild(
        icone
    );

    card.appendChild(
        descricao
    );

    card.appendChild(
        temperaturas
    );

    if (
        numeroValidoWeather(
            dia.probabilidadeChuva
        )
    ) {
        const chuva =
            document.createElement(
                'span'
            );

        chuva.className =
            'forecast-rain';

        chuva.textContent =
            `💧 ${dia.probabilidadeChuva}%`;

        chuva.setAttribute(
            'aria-label',
            `Probabilidade de precipitação: ${dia.probabilidadeChuva}%`
        );

        card.appendChild(
            chuva
        );
    }

    if (
        numeroValidoWeather(
            dia.precipitacao
        )
    ) {
        const precipitacao =
            document.createElement(
                'span'
            );

        precipitacao.className =
            'forecast-precipitation';

        precipitacao.textContent =
            `Precipitação: ${dia.precipitacao} mm`;

        card.appendChild(
            precipitacao
        );
    }

    return card;
}


/* =========================================================
   EXIBIR PREVISÃO
   ========================================================= */

function exibirPrevisao(
    previsao
) {
    if (
        !previsao ||
        !Array.isArray(
            previsao.dias
        )
    ) {
        return false;
    }

    const secao =
        obterSecaoPrevisao();

    const lista =
        obterListaPrevisao();

    if (
        !secao ||
        !lista
    ) {
        console.warn(
            'A estrutura HTML da previsão não foi encontrada.'
        );

        return false;
    }

    lista.innerHTML =
        '';

    previsao.dias.forEach(
        (
            dia,
            indice
        ) => {

            if (
                !dia ||
                typeof dia !==
                    'object'
            ) {
                return;
            }

            lista.appendChild(
                criarCardPrevisao(
                    dia,
                    indice
                )
            );
        }
    );

    if (
        previsao.dias.length > 0
    ) {
        secao.classList.remove(
            'hidden'
        );

        return true;
    }

    secao.classList.add(
        'hidden'
    );

    return false;
}


/* =========================================================
   LIMPAR
   ========================================================= */

function limparPrevisao() {
    ++requisicaoPrevisaoAtual;

    previsaoAtual =
        null;

    const secao =
        obterSecaoPrevisao();

    const lista =
        obterListaPrevisao();

    if (lista) {
        lista.innerHTML =
            '';
    }

    if (secao) {
        secao.classList.add(
            'hidden'
        );
    }
}


/* =========================================================
   ESTADO
   ========================================================= */

function obterPrevisaoAtual() {
    return previsaoAtual;
}


function obterRequisicaoPrevisaoAtual() {
    return requisicaoPrevisaoAtual;
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

const ForecastAPI = {

    validarCoordenadasForecast,

    requisicaoForecastComTimeout,

    validarDadosForecast,

    normalizarPrevisao,

    buscarPrevisao,

    exibirPrevisao,

    limparPrevisao,

    obterPrevisaoAtual,

    obterRequisicaoPrevisaoAtual,

    formatarDataForecast,

    obterNomeDiaForecast
};


/* =========================================================
   API GLOBAL DO NAVEGADOR
   ========================================================= */

if (
    typeof window !== 'undefined'
) {
    window.ForecastAPI =
        ForecastAPI;
}


/* =========================================================
   EXPORTAÇÃO ES MODULE
   ========================================================= */

export {

    validarCoordenadasForecast,

    requisicaoForecastComTimeout,

    validarDadosForecast,

    normalizarPrevisao,

    buscarPrevisao,

    exibirPrevisao,

    limparPrevisao,

    obterPrevisaoAtual,

    obterRequisicaoPrevisaoAtual,

    formatarDataForecast,

    obterNomeDiaForecast,

    ForecastAPI
};


/* =========================================================
   CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    'forecast.js carregado com sucesso.'
);