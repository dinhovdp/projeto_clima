/* =========================================================
   WEATHER.JS
   =========================================================

   Responsabilidades:

   - Consultar o clima atual
   - Validar coordenadas
   - Controlar timeout
   - Validar dados recebidos
   - Traduzir códigos meteorológicos WMO
   - Definir ícones
   - Definir categorias climáticas

   Compatibilidade:

   - Navegador / Live Server
   - GitHub Pages
   - ES Modules
   - window.WeatherAPI

   Este módulo NÃO manipula a interface.

   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const WEATHER_TEMPO_LIMITE_REQUISICAO =
    15000;


/* =========================================================
   VALIDAÇÃO NUMÉRICA
   ========================================================= */

function numeroValidoWeather(valor) {
    return (
        typeof valor === 'number' &&
        Number.isFinite(valor)
    );
}


/* =========================================================
   VALIDAÇÃO DO CÓDIGO METEOROLÓGICO
   ========================================================= */

function codigoMeteorologicoValidoWeather(
    codigo
) {
    if (!Number.isInteger(codigo)) {
        return false;
    }

    return [
        0,
        1,
        2,
        3,
        45,
        48,
        51,
        53,
        55,
        56,
        57,
        61,
        63,
        65,
        66,
        67,
        71,
        73,
        75,
        77,
        80,
        81,
        82,
        85,
        86,
        95,
        96,
        99
    ].includes(codigo);
}


/* =========================================================
   TIMEOUT
   ========================================================= */

async function requisicaoWeatherComTimeout(
    url
) {
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            WEATHER_TEMPO_LIMITE_REQUISICAO
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
            erro.name === 'AbortError'
        ) {
            throw new Error(
                'A consulta demorou mais que o esperado.'
            );
        }

        throw new Error(
            'Não foi possível estabelecer conexão com o serviço de clima.'
        );

    } finally {

        clearTimeout(
            timeout
        );
    }
}


/* =========================================================
   VALIDAÇÃO DE COORDENADAS
   ========================================================= */

function validarCoordenadasWeather(
    latitude,
    longitude
) {
    if (
        !numeroValidoWeather(latitude) ||
        !numeroValidoWeather(longitude)
    ) {
        throw new Error(
            'Coordenadas inválidas.'
        );
    }

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error(
            'Coordenadas fora dos limites permitidos.'
        );
    }
}


/* =========================================================
   DESCRIÇÃO DO CLIMA
   ========================================================= */

function obterDescricaoClima(
    codigo
) {
    const descricoes = {

        0: 'Céu limpo',
        1: 'Principalmente limpo',
        2: 'Parcialmente nublado',
        3: 'Nublado',

        45: 'Neblina',
        48: 'Neblina com geada',

        51: 'Garoa fraca',
        53: 'Garoa moderada',
        55: 'Garoa intensa',
        56: 'Garoa congelante fraca',
        57: 'Garoa congelante intensa',

        61: 'Chuva fraca',
        63: 'Chuva moderada',
        65: 'Chuva intensa',
        66: 'Chuva congelante fraca',
        67: 'Chuva congelante intensa',

        71: 'Neve fraca',
        73: 'Neve moderada',
        75: 'Neve intensa',
        77: 'Granizo de neve',

        80: 'Pancadas de chuva fracas',
        81: 'Pancadas de chuva moderadas',
        82: 'Pancadas de chuva intensas',

        85: 'Pancadas de neve fracas',
        86: 'Pancadas de neve intensas',

        95: 'Trovoada',
        96: 'Trovoada com granizo',
        99: 'Trovoada forte com granizo'
    };

    return Object.prototype.hasOwnProperty.call(
        descricoes,
        codigo
    )
        ? descricoes[codigo]
        : 'Condição climática desconhecida';
}


/* =========================================================
   ÍCONE DO CLIMA
   ========================================================= */

function obterIconeClima(
    codigo,
    isDay
) {
    const duranteODia =
        isDay === 1 ||
        isDay === true;

    if (codigo === 0) {
        return duranteODia
            ? '☀️'
            : '🌙';
    }

    if (codigo === 1) {
        return duranteODia
            ? '🌤️'
            : '🌙';
    }

    if (codigo === 2) {
        return duranteODia
            ? '⛅'
            : '☁️';
    }

    if (codigo === 3) {
        return '☁️';
    }

    if (
        codigo === 45 ||
        codigo === 48
    ) {
        return '🌫️';
    }

    if (
        codigo >= 51 &&
        codigo <= 57
    ) {
        return '🌦️';
    }

    if (
        codigo >= 61 &&
        codigo <= 67
    ) {
        return '🌧️';
    }

    if (
        codigo >= 71 &&
        codigo <= 77
    ) {
        return '❄️';
    }

    if (
        codigo >= 80 &&
        codigo <= 82
    ) {
        return '🌦️';
    }

    if (
        codigo >= 85 &&
        codigo <= 86
    ) {
        return '❄️';
    }

    if (
        codigo >= 95 &&
        codigo <= 99
    ) {
        return '⛈️';
    }

    return duranteODia
        ? '🌤️'
        : '🌙';
}


/* =========================================================
   CATEGORIA CLIMÁTICA
   ========================================================= */

function obterCategoriaClima(
    codigo
) {
    if (
        codigo === 0 ||
        codigo === 1
    ) {
        return 'limpo';
    }

    if (codigo === 2) {
        return 'parcial';
    }

    if (
        codigo === 3 ||
        codigo === 45 ||
        codigo === 48
    ) {
        return 'nublado';
    }

    if (
        (
            codigo >= 51 &&
            codigo <= 67
        ) ||
        (
            codigo >= 80 &&
            codigo <= 82
        )
    ) {
        return 'chuva';
    }

    if (
        (
            codigo >= 71 &&
            codigo <= 77
        ) ||
        (
            codigo >= 85 &&
            codigo <= 86
        )
    ) {
        return 'neve';
    }

    if (
        codigo >= 95 &&
        codigo <= 99
    ) {
        return 'tempestade';
    }

    return 'desconhecido';
}


/* =========================================================
   VALIDAÇÃO DA RESPOSTA
   ========================================================= */

function validarDadosClimaWeather(
    current
) {
    if (
        !current ||
        typeof current !== 'object'
    ) {
        throw new Error(
            'Os dados do clima atual não foram encontrados.'
        );
    }

    if (
        typeof current.time !== 'string' ||
        !current.time.trim()
    ) {
        throw new Error(
            'O horário do clima não foi recebido corretamente.'
        );
    }

    if (
        !numeroValidoWeather(
            current.temperature_2m
        )
    ) {
        throw new Error(
            'A temperatura recebida é inválida.'
        );
    }

    if (
        !numeroValidoWeather(
            current.apparent_temperature
        )
    ) {
        throw new Error(
            'A sensação térmica recebida é inválida.'
        );
    }

    if (
        !numeroValidoWeather(
            current.relative_humidity_2m
        ) ||
        current.relative_humidity_2m < 0 ||
        current.relative_humidity_2m > 100
    ) {
        throw new Error(
            'A umidade recebida é inválida.'
        );
    }

    if (
        !codigoMeteorologicoValidoWeather(
            current.weather_code
        )
    ) {
        throw new Error(
            'O código meteorológico recebido é inválido.'
        );
    }

    if (
        !numeroValidoWeather(
            current.wind_speed_10m
        ) ||
        current.wind_speed_10m < 0
    ) {
        throw new Error(
            'A velocidade do vento recebida é inválida.'
        );
    }

    if (
        !numeroValidoWeather(
            current.is_day
        ) ||
        (
            current.is_day !== 0 &&
            current.is_day !== 1
        )
    ) {
        throw new Error(
            'A informação sobre o período do dia é inválida.'
        );
    }

    if (
        current.wind_direction_10m !==
            undefined &&
        current.wind_direction_10m !==
            null &&
        (
            !numeroValidoWeather(
                current.wind_direction_10m
            ) ||
            current.wind_direction_10m < 0 ||
            current.wind_direction_10m > 360
        )
    ) {
        throw new Error(
            'A direção do vento recebida é inválida.'
        );
    }
}


/* =========================================================
   BUSCAR CLIMA ATUAL
   ========================================================= */

async function buscarClimaAtual(
    latitude,
    longitude
) {
    validarCoordenadasWeather(
        latitude,
        longitude
    );

    const parametros =
        new URLSearchParams({

            latitude:
                String(latitude),

            longitude:
                String(longitude),

            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'weather_code',
                'wind_speed_10m',
                'wind_direction_10m',
                'is_day'
            ].join(','),

            timezone:
                'auto'
        });

    const url =
        'https://api.open-meteo.com/v1/forecast?' +
        parametros.toString();

    const resposta =
        await requisicaoWeatherComTimeout(
            url
        );

    if (!resposta.ok) {
        throw new Error(
            'O serviço de clima não respondeu corretamente.'
        );
    }

    let dados;

    try {

        dados =
            await resposta.json();

    } catch (erro) {

        throw new Error(
            'O serviço de clima retornou uma resposta inválida.'
        );
    }

    if (
        !dados ||
        typeof dados !== 'object'
    ) {
        throw new Error(
            'A resposta do serviço de clima é inválida.'
        );
    }

    if (!dados.current) {
        throw new Error(
            'Os dados do clima atual não foram encontrados.'
        );
    }

    validarDadosClimaWeather(
        dados.current
    );

    const current =
        dados.current;

    return {

        time:
            current.time,

        temperature:
            current.temperature_2m,

        apparent_temperature:
            current.apparent_temperature,

        relative_humidity_2m:
            current.relative_humidity_2m,

        weathercode:
            current.weather_code,

        windspeed:
            current.wind_speed_10m,

        winddirection:
            current.wind_direction_10m,

        is_day:
            current.is_day
    };
}


/* =========================================================
   ALIASES DE COMPATIBILIDADE
   =========================================================

   Alguns módulos da aplicação utilizam os nomes com
   o sufixo "Weather". Os aliases apontam para as mesmas
   funções, sem duplicar lógica.

   ========================================================= */

const obterDescricaoClimaWeather =
    obterDescricaoClima;

const obterIconeClimaWeather =
    obterIconeClima;

const obterCategoriaClimaWeather =
    obterCategoriaClima;

const buscarClimaAtualWeather =
    buscarClimaAtual;


/* =========================================================
   API PÚBLICA
   ========================================================= */

const WeatherAPI = {

    numeroValidoWeather,

    codigoMeteorologicoValidoWeather,

    requisicaoWeatherComTimeout,

    validarCoordenadasWeather,

    validarDadosClimaWeather,

    obterDescricaoClima,

    obterIconeClima,

    obterCategoriaClima,

    buscarClimaAtual,

    obterDescricaoClimaWeather,

    obterIconeClimaWeather,

    obterCategoriaClimaWeather,

    buscarClimaAtualWeather
};


/* =========================================================
   NAVEGADOR
   ========================================================= */

if (
    typeof window !== 'undefined'
) {
    window.WeatherAPI =
        WeatherAPI;

    /*
       Compatibilidade com código
       antigo da aplicação.
    */

    window.numeroValidoWeather =
        numeroValidoWeather;

    window.codigoMeteorologicoValidoWeather =
        codigoMeteorologicoValidoWeather;

    window.requisicaoWeatherComTimeout =
        requisicaoWeatherComTimeout;

    window.validarCoordenadasWeather =
        validarCoordenadasWeather;

    window.validarDadosClimaWeather =
        validarDadosClimaWeather;

    window.obterDescricaoClima =
        obterDescricaoClima;

    window.obterDescricaoClimaWeather =
        obterDescricaoClimaWeather;

    window.obterIconeClima =
        obterIconeClima;

    window.obterIconeClimaWeather =
        obterIconeClimaWeather;

    window.obterCategoriaClima =
        obterCategoriaClima;

    window.obterCategoriaClimaWeather =
        obterCategoriaClimaWeather;

    window.buscarClimaAtual =
        buscarClimaAtual;

    window.buscarClimaAtualWeather =
        buscarClimaAtualWeather;
}


/* =========================================================
   EXPORTAÇÕES ES MODULE
   =========================================================

   Necessário para imports como:

       import * as Weather from './weather.js';

   e também para imports nomeados, por exemplo:

       import {
           obterDescricaoClimaWeather
       } from './weather.js';

   ========================================================= */

export {

    numeroValidoWeather,

    codigoMeteorologicoValidoWeather,

    requisicaoWeatherComTimeout,

    validarCoordenadasWeather,

    validarDadosClimaWeather,

    obterDescricaoClima,

    obterIconeClima,

    obterCategoriaClima,

    buscarClimaAtual,

    obterDescricaoClimaWeather,

    obterIconeClimaWeather,

    obterCategoriaClimaWeather,

    buscarClimaAtualWeather,

    WeatherAPI
};


/* =========================================================
   COMMONJS / JEST
   ========================================================= */

if (
    typeof module !== 'undefined' &&
    module.exports
) {
    module.exports =
        WeatherAPI;
}


console.log(
    'weather.js carregado com sucesso.'
);