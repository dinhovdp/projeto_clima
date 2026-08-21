/* =========================================================
   PREVISÃO DE 7 DIAS
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const QUANTIDADE_MAXIMA_DIAS = 7;

const TEMPO_LIMITE_PREVISAO = 10000;


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const forecastSection =
    document.getElementById(
        'forecast-section'
    );


const forecastContainer =
    document.getElementById(
        'forecast-container'
    );


/* =========================================================
   DESCRIÇÃO DO CLIMA
   ========================================================= */

function obterDescricaoPrevisao(codigo) {

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


    return descricoes[codigo] ||
        'Condição desconhecida';
}


/* =========================================================
   ÍCONE DO CLIMA
   ========================================================= */

function obterIconePrevisao(codigo) {

    if (codigo === 0) {
        return '☀️';
    }

    if (codigo === 1) {
        return '🌤️';
    }

    if (codigo === 2) {
        return '⛅';
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

    if (codigo >= 95) {
        return '⛈️';
    }

    return '🌤️';
}


/* =========================================================
   VALIDAÇÃO DO CÓDIGO CLIMÁTICO
   ========================================================= */

function validarCodigoClimatico(codigo) {

    const numero = Number(codigo);

    if (!Number.isInteger(numero)) {
        return null;
    }

    return numero;
}


/* =========================================================
   DIA DA SEMANA
   ========================================================= */

function obterDiaSemana(data) {

    const dias = [

        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado'

    ];


    if (
        typeof data !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        return 'Data inválida';
    }


    const dataFormatada =
        new Date(`${data}T12:00:00`);


    if (
        Number.isNaN(
            dataFormatada.getTime()
        )
    ) {
        return 'Data inválida';
    }


    return dias[
        dataFormatada.getDay()
    ];
}


/* =========================================================
   FORMATAÇÃO DA DATA
   ========================================================= */

function formatarData(data) {

    if (typeof data !== 'string') {
        return '--/--';
    }


    const partes =
        data.split('-');


    if (partes.length !== 3) {
        return '--/--';
    }


    const [
        ano,
        mes,
        dia
    ] = partes;


    if (
        !/^\d{4}$/.test(ano) ||
        !/^\d{2}$/.test(mes) ||
        !/^\d{2}$/.test(dia)
    ) {
        return '--/--';
    }


    return `${dia}/${mes}`;
}


/* =========================================================
   FORMATAÇÃO DA TEMPERATURA
   ========================================================= */

function formatarTemperatura(temperatura) {

    const numero =
        Number(temperatura);


    if (!Number.isFinite(numero)) {
        return '--';
    }


    return Math.round(numero);
}


/* =========================================================
   CRIAÇÃO SEGURA DE ELEMENTO
   ========================================================= */

function criarElemento(
    elemento,
    classe,
    texto
) {

    const novoElemento =
        document.createElement(elemento);


    if (classe) {

        novoElemento.classList.add(
            classe
        );

    }


    novoElemento.textContent =
        texto;


    return novoElemento;
}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardPrevisao(
    data,
    temperaturaMaxima,
    temperaturaMinima,
    codigo
) {

    const card =
        document.createElement('article');


    card.classList.add(
        'forecast-card'
    );


    card.setAttribute(
        'aria-label',
        `Previsão para ${data}`
    );


    const codigoValidado =
        validarCodigoClimatico(codigo);


    const dia =
        obterDiaSemana(data);


    const dataFormatada =
        formatarData(data);


    const icone =
        obterIconePrevisao(
            codigoValidado
        );


    const descricao =
        obterDescricaoPrevisao(
            codigoValidado
        );


    const maxima =
        formatarTemperatura(
            temperaturaMaxima
        );


    const minima =
        formatarTemperatura(
            temperaturaMinima
        );


    const diaElemento =
        criarElemento(
            'div',
            'forecast-day',
            dia
        );


    const dataElemento =
        criarElemento(
            'div',
            'forecast-date',
            dataFormatada
        );


    const iconeElemento =
        criarElemento(
            'div',
            'forecast-icon',
            icone
        );


    iconeElemento.setAttribute(
        'aria-hidden',
        'true'
    );


    const descricaoElemento =
        criarElemento(
            'div',
            'forecast-description',
            descricao
        );


    const temperaturas =
        document.createElement('div');


    temperaturas.classList.add(
        'forecast-temperatures'
    );


    const maximaElemento =
        criarElemento(
            'span',
            'forecast-max',
            `Máx. ${maxima}°C`
        );


    const minimaElemento =
        criarElemento(
            'span',
            'forecast-min',
            `Mín. ${minima}°C`
        );


    temperaturas.appendChild(
        maximaElemento
    );


    temperaturas.appendChild(
        minimaElemento
    );


    card.appendChild(
        diaElemento
    );


    card.appendChild(
        dataElemento
    );


    card.appendChild(
        iconeElemento
    );


    card.appendChild(
        descricaoElemento
    );


    card.appendChild(
        temperaturas
    );


    return card;
}


/* =========================================================
   VALIDAR DADOS
   ========================================================= */

function validarDadosPrevisao(dados) {

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


    if (
        !Array.isArray(
            dados.daily.time
        )
    ) {
        return false;
    }


    if (
        !Array.isArray(
            dados.daily.temperature_2m_max
        )
    ) {
        return false;
    }


    if (
        !Array.isArray(
            dados.daily.temperature_2m_min
        )
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   EXIBIR PREVISÃO
   ========================================================= */

function exibirPrevisao(dados) {

    if (
        !forecastContainer ||
        !forecastSection
    ) {

        console.warn(
            'Elementos da previsão não encontrados no HTML.'
        );

        return;
    }


    if (
        !validarDadosPrevisao(dados)
    ) {

        throw new Error(
            'Dados de previsão inválidos.'
        );

    }


    forecastContainer.replaceChildren();


    const datas =
        dados.daily.time;


    const temperaturasMaximas =
        dados.daily.temperature_2m_max;


    const temperaturasMinimas =
        dados.daily.temperature_2m_min;


    const codigos =
        Array.isArray(
            dados.daily.weather_code
        )
            ? dados.daily.weather_code
            : (
                Array.isArray(
                    dados.daily.weathercode
                )
                    ? dados.daily.weathercode
                    : []
            );


    const quantidadeDias =
        Math.min(

            datas.length,

            temperaturasMaximas.length,

            temperaturasMinimas.length,

            QUANTIDADE_MAXIMA_DIAS

        );


    if (quantidadeDias === 0) {

        forecastSection.classList.add(
            'hidden'
        );

        return;
    }


    for (
        let i = 0;
        i < quantidadeDias;
        i++
    ) {

        const card =
            criarCardPrevisao(

                datas[i],

                temperaturasMaximas[i],

                temperaturasMinimas[i],

                codigos[i]

            );


        forecastContainer.appendChild(
            card
        );

    }


    forecastSection.classList.remove(
        'hidden'
    );
}


/* =========================================================
   CRIAR URL
   ========================================================= */

function criarUrlPrevisao(
    latitude,
    longitude
) {

    const numeroLatitude =
        Number(latitude);


    const numeroLongitude =
        Number(longitude);


    if (
        !Number.isFinite(numeroLatitude) ||
        !Number.isFinite(numeroLongitude)
    ) {

        throw new Error(
            'Latitude e longitude inválidas.'
        );

    }


    if (
        numeroLatitude < -90 ||
        numeroLatitude > 90
    ) {

        throw new Error(
            'Latitude fora dos limites permitidos.'
        );

    }


    if (
        numeroLongitude < -180 ||
        numeroLongitude > 180
    ) {

        throw new Error(
            'Longitude fora dos limites permitidos.'
        );

    }


    const url =
        new URL(
            'https://api.open-meteo.com/v1/forecast'
        );


    url.searchParams.set(
        'latitude',
        String(numeroLatitude)
    );


    url.searchParams.set(
        'longitude',
        String(numeroLongitude)
    );


    url.searchParams.set(
        'daily',
        'weather_code,temperature_2m_max,temperature_2m_min'
    );


    url.searchParams.set(
        'timezone',
        'auto'
    );


    url.searchParams.set(
        'forecast_days',
        String(
            QUANTIDADE_MAXIMA_DIAS
        )
    );


    return url.toString();
}


/* =========================================================
   REQUISIÇÃO COM TIMEOUT
   ========================================================= */

async function buscarComTimeoutPrevisao(
    url,
    tempoLimite = TEMPO_LIMITE_PREVISAO
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            tempoLimite
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
                    }
                }
            );


        return resposta;

    } finally {

        clearTimeout(timeout);

    }
}


/* =========================================================
   BUSCAR PREVISÃO
   ========================================================= */

async function buscarPrevisao(
    latitude,
    longitude
) {

    const url =
        criarUrlPrevisao(
            latitude,
            longitude
        );


    try {

        const resposta =
            await buscarComTimeoutPrevisao(
                url
            );


        if (!resposta.ok) {

            throw new Error(
                'Erro ao consultar a previsão para os próximos dias.'
            );

        }


        const dados =
            await resposta.json();


        if (
            !validarDadosPrevisao(dados)
        ) {

            throw new Error(
                'Formato de previsão inválido.'
            );

        }


        exibirPrevisao(dados);


        return dados;

    } catch (erro) {

        if (
            erro.name === 'AbortError'
        ) {

            throw new Error(
                'A consulta da previsão demorou demais. Tente novamente.'
            );

        }


        console.error(
            'Erro na previsão:',
            erro
        );


        throw erro;

    }

}


/* =========================================================
   FUNÇÕES PÚBLICAS
   ========================================================= */

window.buscarPrevisao =
    buscarPrevisao;


window.exibirPrevisao =
    exibirPrevisao;


window.obterDescricaoPrevisao =
    obterDescricaoPrevisao;


window.obterIconePrevisao =
    obterIconePrevisao;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

console.log(
    'forecast.js carregado com sucesso.'
);