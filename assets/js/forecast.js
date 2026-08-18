/* =========================
   PREVISÃO DE 7 DIAS
   ========================= */


/* =========================
   ELEMENTOS DA INTERFACE
   ========================= */

const forecastSection =
    document.getElementById('forecast-section');

const forecastContainer =
    document.getElementById('forecast-container');


/* =========================
   DESCRIÇÃO DO CLIMA
   ========================= */

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


/* =========================
   ÍCONE DO CLIMA
   ========================= */

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


/* =========================
   DIA DA SEMANA
   ========================= */

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


    const dataFormatada =
        new Date(`${data}T12:00:00`);


    return dias[dataFormatada.getDay()];
}


/* =========================
   FORMATAÇÃO DA DATA
   ========================= */

function formatarData(data) {

    const partes = data.split('-');


    if (partes.length !== 3) {
        return data;
    }


    return `${partes[2]}/${partes[1]}`;
}


/* =========================
   FORMATAÇÃO DA TEMPERATURA
   ========================= */

function formatarTemperatura(temperatura) {

    if (
        temperatura === null ||
        temperatura === undefined ||
        Number.isNaN(Number(temperatura))
    ) {
        return '--';
    }


    return Math.round(
        Number(temperatura)
    );
}


/* =========================
   CRIAR CARD
   ========================= */

function criarCardPrevisao(
    data,
    temperaturaMaxima,
    temperaturaMinima,
    codigo
) {

    const card =
        document.createElement('article');


    card.classList.add('forecast-card');


    const dia =
        obterDiaSemana(data);


    const dataFormatada =
        formatarData(data);


    const icone =
        obterIconePrevisao(codigo);


    const descricao =
        obterDescricaoPrevisao(codigo);


    const maxima =
        formatarTemperatura(
            temperaturaMaxima
        );


    const minima =
        formatarTemperatura(
            temperaturaMinima
        );


    card.innerHTML = `

        <div class="forecast-day">
            ${dia}
        </div>

        <div class="forecast-date">
            ${dataFormatada}
        </div>

        <div class="forecast-icon">
            ${icone}
        </div>

        <div class="forecast-description">
            ${descricao}
        </div>

        <div class="forecast-temperatures">

            <span class="forecast-max">
                Máx. ${maxima}°C
            </span>

            <span class="forecast-min">
                Mín. ${minima}°C
            </span>

        </div>

    `;


    return card;
}


/* =========================
   EXIBIR PREVISÃO
   ========================= */

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
        !dados ||
        !dados.daily
    ) {
        throw new Error(
            'Dados de previsão não encontrados.'
        );
    }


    forecastContainer.innerHTML = '';


    const datas =
        dados.daily.time || [];


    const temperaturasMaximas =
        dados.daily.temperature_2m_max || [];


    const temperaturasMinimas =
        dados.daily.temperature_2m_min || [];


    /*
     * A API pode retornar weather_code
     * ou weathercode dependendo da configuração.
     */
    const codigos =
        dados.daily.weather_code ||
        dados.daily.weathercode ||
        [];


    const quantidadeDias =
        Math.min(datas.length, 7);


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


        forecastContainer.appendChild(card);
    }


    forecastSection.classList.remove(
        'hidden'
    );
}


/* =========================
   BUSCAR PREVISÃO
   ========================= */

async function buscarPrevisao(
    latitude,
    longitude
) {

    if (
        latitude === undefined ||
        longitude === undefined
    ) {
        throw new Error(
            'Latitude e longitude são obrigatórias.'
        );
    }


    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;


    try {

        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                'Erro ao consultar a previsão para os próximos dias.'
            );
        }


        const dados =
            await resposta.json();


        if (
            !dados.daily ||
            !dados.daily.time
        ) {

            throw new Error(
                'Formato de previsão inválido.'
            );
        }


        exibirPrevisao(dados);


        return dados;

    } catch (error) {

        console.error(
            'Erro na previsão:',
            error
        );


        throw error;
    }
}