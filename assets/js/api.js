/* =========================================================
   API DE CLIMA
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CACHE_TEMPO =
    10 * 60 * 1000;

const TEMPO_LIMITE_REQUISICAO =
    15000;

const TAMANHO_MAXIMO_CIDADE =
    100;


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const form =
    document.getElementById(
        'weather-form'
    );


const cityInput =
    document.getElementById(
        'city-input'
    );


const themeToggle =
    document.getElementById(
        'theme-toggle'
    );


const themeIcon =
    document.getElementById(
        'theme-icon'
    );


const themeText =
    document.getElementById(
        'theme-text'
    );


const loadingEl =
    document.getElementById(
        'loading'
    );


const errorEl =
    document.getElementById(
        'error-message'
    );


const resultDiv =
    document.getElementById(
        'weather-result'
    );


const cityNameEl =
    document.getElementById(
        'city-name'
    );


const tempEl =
    document.getElementById(
        'temperature'
    );


const localTimeEl =
    document.getElementById(
        'local-time'
    );


const descEl =
    document.getElementById(
        'weather-description'
    );


const weatherIconEl =
    document.getElementById(
        'weather-icon'
    );


const windEl =
    document.getElementById(
        'wind'
    );


const updatedAtEl =
    document.getElementById(
        'updated-at'
    );


const feelsLikeEl =
    document.getElementById(
        'feels-like'
    );


const humidityEl =
    document.getElementById(
        'humidity'
    );


/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

window.cidadeAtualPesquisada =
    undefined;


window.climaAtualPesquisado =
    undefined;


let requisicaoAtual = 0;


/* =========================================================
   VALIDAÇÃO INICIAL DO HTML
   ========================================================= */

function validarElementosObrigatorios() {

    const elementos = [

        form,

        cityInput,

        themeToggle,

        loadingEl,

        errorEl,

        resultDiv,

        cityNameEl,

        tempEl,

        localTimeEl,

        descEl,

        windEl,

        updatedAtEl

    ];


    return elementos.every(
        elemento => elemento !== null
    );
}


if (
    !validarElementosObrigatorios()
) {

    throw new Error(
        'A estrutura necessária do index.html não foi encontrada.'
    );

}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function mostrarCarregando(mostrar) {

    loadingEl.classList.toggle(
        'hidden',
        !mostrar
    );


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


/* =========================================================
   ERROS
   ========================================================= */

function mostrarErro(mensagem) {

    errorEl.textContent =
        mensagem;


    errorEl.classList.remove(
        'hidden'
    );
}


function limparErro() {

    errorEl.textContent =
        '';


    errorEl.classList.add(
        'hidden'
    );
}


function limparResultadoAnterior() {

    resultDiv.classList.add(
        'hidden'
    );


    const forecastSection =
        document.getElementById(
            'forecast-section'
        );


    if (forecastSection) {

        forecastSection.classList.add(
            'hidden'
        );

    }
}


function limparMensagens() {

    limparErro();

    limparResultadoAnterior();

}


/* =========================================================
   NORMALIZAÇÃO DA CIDADE
   ========================================================= */

function normalizarCidade(cidade) {

    if (
        typeof cidade !== 'string'
    ) {

        return '';

    }


    return cidade
        .trim()
        .replace(/\s+/g, ' ')
        .normalize('NFC');
}


/* =========================================================
   VALIDAÇÃO DA CIDADE
   ========================================================= */

function validarCidade(cidade) {

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


    const cidadeValida =
        /^[\p{L}\p{N}][\p{L}\p{N}\s.'’()-]*$/u
            .test(cidade);


    if (!cidadeValida) {

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
   DESCRIÇÃO DO CLIMA
   ========================================================= */

function obterDescricaoClima(codigo) {

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

    if (codigo === 0) {

        return isDay
            ? '☀️'
            : '🌙';

    }


    if (codigo === 1) {

        return isDay
            ? '🌤️'
            : '🌙';

    }


    if (codigo === 2) {

        return isDay
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


    return '🌤️';
}


/* =========================================================
   HORÁRIO
   ========================================================= */

function formatarHorarioLocal(dataHora) {

    if (
        typeof dataHora !== 'string'
    ) {

        return '--:--';

    }


    const correspondencia =
        /^(\d{2}):(\d{2})$/.exec(
            dataHora.substring(
                11,
                16
            )
        );


    if (!correspondencia) {

        return '--:--';

    }


    return `${correspondencia[1]}:${correspondencia[2]}`;
}


/* =========================================================
   DATA E HORÁRIO
   ========================================================= */

function formatarDataHoraLocal(
    dataHora
) {

    if (
        typeof dataHora !== 'string'
    ) {

        return '--/--/---- --:--';

    }


    const correspondencia =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
            .exec(dataHora);


    if (!correspondencia) {

        return '--/--/---- --:--';

    }


    const [

        ,

        ano,

        mes,

        dia,

        hora,

        minuto

    ] = correspondencia;


    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}


/* =========================================================
   FASE DO DIA
   ========================================================= */

function definirFaseDoDia(dataHora) {

    if (
        typeof dataHora !== 'string'
    ) {

        return;

    }


    const correspondencia =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/
            .exec(dataHora);


    if (!correspondencia) {

        return;

    }


    const hora =
        Number(
            correspondencia[4]
        );


    document.body.classList.remove(

        'manha',

        'tarde',

        'noite',

        'madrugada'

    );


    if (
        hora >= 6 &&
        hora < 12
    ) {

        document.body.classList.add(
            'manha'
        );

    }

    else if (
        hora >= 12 &&
        hora < 18
    ) {

        document.body.classList.add(
            'tarde'
        );

    }

    else if (
        hora >= 18 &&
        hora < 24
    ) {

        document.body.classList.add(
            'noite'
        );

    }

    else {

        document.body.classList.add(
            'madrugada'
        );

    }
}


/* =========================================================
   CACHE
   ========================================================= */

function criarChaveCache(cidade) {

    const cidadeNormalizada =
        normalizarCidade(cidade)
            .toLowerCase();


    return `clima_api_cache_${encodeURIComponent(
        cidadeNormalizada
    )}`;
}


/* =========================================================
   SALVAR CACHE
   ========================================================= */

function salvarCache(
    cidade,
    dados
) {

    if (
        !cidade ||
        !dados
    ) {

        return;

    }


    const cache = {

        versao: 2,

        dados: dados,

        timestamp: Date.now()

    };


    try {

        localStorage.setItem(

            criarChaveCache(
                cidade
            ),

            JSON.stringify(cache)

        );

    }

    catch (erro) {

        console.warn(
            'Não foi possível salvar o cache local.'
        );

    }
}


/* =========================================================
   OBTER CACHE
   ========================================================= */

function obterCache(cidade) {

    const chave =
        criarChaveCache(
            cidade
        );


    let dadosSalvos;


    try {

        dadosSalvos =
            localStorage.getItem(
                chave
            );

    }

    catch (erro) {

        return null;

    }


    if (!dadosSalvos) {

        return null;

    }


    try {

        const cache =
            JSON.parse(
                dadosSalvos
            );


        if (
            !cache ||
            typeof cache !== 'object'
        ) {

            localStorage.removeItem(
                chave
            );

            return null;

        }


        if (
            typeof cache.timestamp !==
            'number'
        ) {

            localStorage.removeItem(
                chave
            );

            return null;

        }


        const idadeCache =
            Date.now() -
            cache.timestamp;


        if (
            idadeCache < 0 ||
            idadeCache > CACHE_TEMPO
        ) {

            localStorage.removeItem(
                chave
            );

            return null;

        }


        return cache.dados || null;

    }

    catch (erro) {

        try {

            localStorage.removeItem(
                chave
            );

        }

        catch (erroRemocao) {

            // Armazenamento indisponível.

        }


        return null;

    }
}


/* =========================================================
   VALIDAÇÃO DO CACHE
   ========================================================= */

function cachePossuiDadosNovos(
    dados
) {

    if (
        !dados ||
        !dados.cidadeEncontrada ||
        !dados.climaAtual
    ) {

        return false;

    }


    const clima =
        dados.climaAtual;


    return (

        typeof clima.time ===
            'string' &&

        typeof clima.temperature ===
            'number' &&

        typeof clima.apparent_temperature ===
            'number' &&

        typeof clima.relative_humidity_2m ===
            'number' &&

        typeof clima.weathercode ===
            'number' &&

        typeof clima.windspeed ===
            'number' &&

        typeof clima.is_day ===
            'number'

    );
}


/* =========================================================
   FETCH SEGURO COM TIMEOUT
   ========================================================= */

async function requisicaoComTimeout(
    url
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(

            () => controller.abort(),

            TEMPO_LIMITE_REQUISICAO

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

                    cache: 'no-store'

                }

            );


        return resposta;

    }

    catch (erro) {

        if (
            erro.name ===
            'AbortError'
        ) {

            throw new Error(
                'A consulta demorou mais que o esperado.'
            );

        }


        throw new Error(
            'Não foi possível estabelecer conexão com o serviço de clima.'
        );

    }

    finally {

        clearTimeout(
            timeout
        );

    }
}


/* =========================================================
   VALIDAÇÃO NUMÉRICA
   ========================================================= */

function numeroValido(valor) {

    return (

        typeof valor ===
            'number' &&

        Number.isFinite(
            valor
        )

    );
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

        return;

    }


    const nomeCidade =
        typeof cidadeEncontrada.name ===
            'string'

            ? cidadeEncontrada.name

            : 'Cidade';


    const pais =
        typeof cidadeEncontrada.country ===
            'string'

            ? cidadeEncontrada.country

            : '';


    cityNameEl.textContent =
        pais

            ? `${nomeCidade}, ${pais}`

            : nomeCidade;


    localTimeEl.textContent =
        `Horário local: ${formatarHorarioLocal(
            climaAtual.time
        )}`;


    tempEl.textContent =
        numeroValido(
            climaAtual.temperature
        )

            ? `${climaAtual.temperature} °C`

            : '-- °C';


    const icone =
        obterIconeClima(

            climaAtual.weathercode,

            climaAtual.is_day

        );


    if (weatherIconEl) {

        weatherIconEl.textContent =
            icone;


        weatherIconEl.setAttribute(

            'aria-label',

            obterDescricaoClima(
                climaAtual.weathercode
            )

        );

    }


    descEl.textContent =
        obterDescricaoClima(
            climaAtual.weathercode
        );


    windEl.textContent =
        numeroValido(
            climaAtual.windspeed
        )

            ? `${climaAtual.windspeed} km/h`

            : '--';


    if (feelsLikeEl) {

        feelsLikeEl.textContent =

            numeroValido(
                climaAtual.apparent_temperature
            )

                ? `${climaAtual.apparent_temperature} °C`

                : '--';

    }


    if (humidityEl) {

        humidityEl.textContent =

            numeroValido(
                climaAtual.relative_humidity_2m
            )

                ? `${climaAtual.relative_humidity_2m}%`

                : '--';

    }


    updatedAtEl.textContent =
        `Atualizado em ${formatarDataHoraLocal(
            climaAtual.time
        )}`;


    definirFaseDoDia(
        climaAtual.time
    );


    window.cidadeAtualPesquisada =
        cidadeEncontrada;


    window.climaAtualPesquisado =
        climaAtual;


    resultDiv.classList.remove(
        'hidden'
    );
}


/* =========================================================
   BUSCAR PREVISÃO
   ========================================================= */

async function carregarPrevisao(
    latitude,
    longitude
) {

    if (
        typeof window.buscarPrevisao !==
        'function'
    ) {

        throw new Error(
            'O módulo de previsão não foi carregado corretamente.'
        );

    }


    return await window.buscarPrevisao(

        latitude,

        longitude

    );
}


/* =========================================================
   BUSCAR CLIMA ATUAL
   ========================================================= */

async function buscarClimaAtual(
    latitude,
    longitude
) {

    if (
        !numeroValido(latitude) ||
        !numeroValido(longitude)
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
        `https://api.open-meteo.com/v1/forecast?${parametros.toString()}`;


    const resposta =
        await requisicaoComTimeout(
            url
        );


    if (!resposta.ok) {

        throw new Error(
            'O serviço de clima não respondeu corretamente.'
        );

    }


    const dados =
        await resposta.json();


    if (
        !dados ||
        !dados.current
    ) {

        throw new Error(
            'Os dados do clima atual não foram encontrados.'
        );

    }


    const current =
        dados.current;


    if (

        typeof current.time !==
            'string' ||

        !numeroValido(
            current.temperature_2m
        ) ||

        !numeroValido(
            current.apparent_temperature
        ) ||

        !numeroValido(
            current.relative_humidity_2m
        ) ||

        !numeroValido(
            current.weather_code
        ) ||

        !numeroValido(
            current.wind_speed_10m
        )

    ) {

        throw new Error(
            'Os dados recebidos do serviço de clima estão incompletos.'
        );

    }


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
   BUSCAR CIDADE
   ========================================================= */

async function buscarLocalizacao(
    cidade
) {

    const parametros =
        new URLSearchParams({

            name:
                cidade,

            count:
                '1',

            language:
                'pt',

            format:
                'json'

        });


    const url =
        `https://geocoding-api.open-meteo.com/v1/search?${parametros.toString()}`;


    const resposta =
        await requisicaoComTimeout(
            url
        );


    if (!resposta.ok) {

        throw new Error(
            'O serviço de localização não respondeu corretamente.'
        );

    }


    const localizacao =
        await resposta.json();


    if (
        !localizacao ||
        !Array.isArray(
            localizacao.results
        ) ||
        localizacao.results.length === 0
    ) {

        return null;

    }


    const resultado =
        localizacao.results[0];


    if (
        !resultado ||
        !numeroValido(
            resultado.latitude
        ) ||
        !numeroValido(
            resultado.longitude
        ) ||
        typeof resultado.name !==
            'string'
    ) {

        return null;

    }


    return resultado;
}


/* =========================================================
   BUSCAR DADOS COMPLETOS
   ========================================================= */

async function buscarDadosCompletos(
    cidadeEncontrada
) {

    const latitude =
        cidadeEncontrada.latitude;


    const longitude =
        cidadeEncontrada.longitude;


    const climaAtual =
        await buscarClimaAtual(

            latitude,

            longitude

        );


    const previsao =
        await carregarPrevisao(

            latitude,

            longitude

        );


    return {

        cidadeEncontrada:
            cidadeEncontrada,

        climaAtual:
            climaAtual,

        previsao:
            previsao

    };
}


/* =========================================================
   PESQUISA PRINCIPAL
   ========================================================= */

form.addEventListener(

    'submit',

    async evento => {

        evento.preventDefault();


        const cidade =
            normalizarCidade(
                cityInput.value
            );


        const validacao =
            validarCidade(
                cidade
            );


        if (!validacao.valida) {

            mostrarErro(
                validacao.mensagem
            );

            return;

        }


        const idRequisicao =
            ++requisicaoAtual;


        limparMensagens();


        mostrarCarregando(
            true
        );


        try {

            /* =================================================
               CACHE
               ================================================= */

            const dadosCache =
                obterCache(
                    cidade
                );


            if (
                dadosCache &&
                cachePossuiDadosNovos(
                    dadosCache
                )
            ) {

                if (
                    idRequisicao !==
                    requisicaoAtual
                ) {

                    return;

                }


                exibirDadosClima(

                    dadosCache.cidadeEncontrada,

                    dadosCache.climaAtual

                );


                if (

                    dadosCache.previsao &&

                    typeof window.exibirPrevisao ===
                        'function'

                ) {

                    window.exibirPrevisao(

                        dadosCache.previsao

                    );

                }

                else {

                    const previsao =
                        await carregarPrevisao(

                            dadosCache.cidadeEncontrada.latitude,

                            dadosCache.cidadeEncontrada.longitude

                        );


                    if (
                        idRequisicao !==
                        requisicaoAtual
                    ) {

                        return;

                    }


                    dadosCache.previsao =
                        previsao;


                    salvarCache(

                        cidade,

                        dadosCache

                    );


                    if (
                        typeof window.exibirPrevisao ===
                        'function'
                    ) {

                        window.exibirPrevisao(
                            previsao
                        );

                    }

                }


                return;

            }


            /* =================================================
               LOCALIZAÇÃO
               ================================================= */

            const cidadeEncontrada =
                await buscarLocalizacao(
                    cidade
                );


            if (
                idRequisicao !==
                requisicaoAtual
            ) {

                return;

            }


            if (!cidadeEncontrada) {

                mostrarErro(
                    'Cidade não encontrada. Verifique o nome informado.'
                );

                return;

            }


            /* =================================================
               CLIMA + PREVISÃO
               ================================================= */

            const dados =
                await buscarDadosCompletos(
                    cidadeEncontrada
                );


            if (
                idRequisicao !==
                requisicaoAtual
            ) {

                return;

            }


            /* =================================================
               CACHE
               ================================================= */

            salvarCache(

                cidade,

                dados

            );


            /* =================================================
               EXIBIR CLIMA
               ================================================= */

            exibirDadosClima(

                dados.cidadeEncontrada,

                dados.climaAtual

            );


            /* =================================================
               EXIBIR PREVISÃO
               ================================================= */

            if (

                dados.previsao &&

                typeof window.exibirPrevisao ===
                    'function'

            ) {

                window.exibirPrevisao(
                    dados.previsao
                );

            }

        }

        catch (erro) {

            if (
                idRequisicao !==
                requisicaoAtual
            ) {

                return;

            }


            console.error(

                'Falha na consulta do clima.',

                erro

            );


            if (
                erro instanceof Error
            ) {

                if (
                    erro.message ===
                    'A consulta demorou mais que o esperado.'
                ) {

                    mostrarErro(
                        erro.message
                    );

                }

                else if (
                    erro.message ===
                    'O módulo de previsão não foi carregado corretamente.'
                ) {

                    mostrarErro(
                        erro.message
                    );

                }

                else {

                    mostrarErro(
                        'Não foi possível carregar os dados do clima. Verifique sua conexão e tente novamente.'
                    );

                }

            }

            else {

                mostrarErro(
                    'Não foi possível carregar os dados do clima. Verifique sua conexão e tente novamente.'
                );

            }

        }

        finally {

            if (
                idRequisicao ===
                requisicaoAtual
            ) {

                mostrarCarregando(
                    false
                );

            }

        }

    }

);


/* =========================================================
   TEMA
   ========================================================= */

const CHAVE_TEMA =
    'clima_api_tema';


function aplicarTema(tema) {

    const modoEscuro =
        tema === 'dark';


    document.body.classList.toggle(

        'dark-mode',

        modoEscuro

    );


    themeToggle.setAttribute(

        'aria-pressed',

        String(modoEscuro)

    );


    if (themeIcon) {

        themeIcon.textContent =
            modoEscuro
                ? '☀️'
                : '🌙';

    }


    if (themeText) {

        themeText.textContent =
            modoEscuro
                ? 'Modo claro'
                : 'Modo escuro';

    }


    if (
        !themeIcon &&
        !themeText
    ) {

        themeToggle.textContent =
            modoEscuro
                ? '☀️ Modo claro'
                : '🌙 Modo escuro';

    }
}


function obterTemaInicial() {

    try {

        const temaSalvo =
            localStorage.getItem(
                CHAVE_TEMA
            );


        if (
            temaSalvo === 'dark' ||
            temaSalvo === 'light'
        ) {

            return temaSalvo;

        }

    }

    catch (erro) {

        // LocalStorage indisponível.

    }


    if (

        window.matchMedia &&

        window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches

    ) {

        return 'dark';

    }


    return 'light';
}


function salvarTema(tema) {

    try {

        localStorage.setItem(

            CHAVE_TEMA,

            tema

        );

    }

    catch (erro) {

        // O funcionamento do tema não depende do armazenamento.

    }
}


themeToggle.addEventListener(

    'click',

    () => {

        const modoEscuro =
            document.body.classList.contains(
                'dark-mode'
            );


        const novoTema =
            modoEscuro
                ? 'light'
                : 'dark';


        aplicarTema(
            novoTema
        );


        salvarTema(
            novoTema
        );

    }

);


/* =========================================================
   INICIALIZAÇÃO DO TEMA
   ========================================================= */

aplicarTema(
    obterTemaInicial()
);


/* =========================================================
   FUNÇÕES DISPONÍVEIS PARA OUTROS MÓDULOS
   ========================================================= */

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


/* =========================================================
   FINALIZAÇÃO
   ========================================================= */

console.log(
    'api.js carregado com sucesso.'
);