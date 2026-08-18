const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const themeToggle = document.getElementById('theme-toggle');

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const resultDiv = document.getElementById('weather-result');

const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const localTimeEl = document.getElementById('local-time');

const descEl = document.getElementById('weather-description');
const windEl = document.getElementById('wind');
const updatedAtEl = document.getElementById('updated-at');


/* =========================
   CARREGAMENTO
   ========================= */

function mostrarCarregando(mostrar) {

    loadingEl.classList.toggle(
        'hidden',
        !mostrar
    );
}


/* =========================
   ERROS
   ========================= */

function mostrarErro(mensagem) {

    errorEl.textContent = mensagem;

    errorEl.classList.remove('hidden');
}


function limparMensagens() {

    errorEl.classList.add('hidden');

    errorEl.textContent = '';

    resultDiv.classList.add('hidden');

    /*
       Esconde a previsão anterior
       enquanto uma nova cidade
       está sendo pesquisada.
    */

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


/* =========================
   DESCRIÇÃO DO CLIMA
   ========================= */

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

        61: 'Chuva fraca',

        63: 'Chuva moderada',

        65: 'Chuva intensa',

        71: 'Neve fraca',

        73: 'Neve moderada',

        75: 'Neve intensa',

        80: 'Pancadas de chuva fracas',

        81: 'Pancadas de chuva moderadas',

        82: 'Pancadas de chuva intensas',

        95: 'Trovoada',

        96: 'Trovoada com granizo',

        99: 'Trovoada forte com granizo'

    };


    return descricoes[codigo] ||
        'Condição climática desconhecida';
}


/* =========================
   ÍCONE DO CLIMA
   ========================= */

function obterIconeClima(codigo, isDay) {

    if (codigo === 0) {

        return isDay ? '☀️' : '🌙';
    }


    if (codigo === 1) {

        return isDay ? '🌤️' : '🌙';
    }


    if (codigo === 2) {

        return isDay ? '⛅' : '☁️';
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
        codigo <= 55
    ) {

        return '🌦️';
    }


    if (
        codigo >= 61 &&
        codigo <= 65
    ) {

        return '🌧️';
    }


    if (
        codigo >= 71 &&
        codigo <= 75
    ) {

        return '❄️';
    }


    if (
        codigo >= 80 &&
        codigo <= 82
    ) {

        return '🌦️';
    }


    if (codigo >= 95) {

        return '⛈️';
    }


    return '🌤️';
}


/* =========================
   HORÁRIO
   ========================= */

/*
   Recebe:

   2026-08-17T12:45

   Retorna:

   12:45
*/

function formatarHorarioLocal(dataHora) {

    return dataHora.substring(11, 16);
}


/*
   Retorna o horário atual
   da máquina do usuário.
*/

function obterHorarioAtual() {

    return new Date().toLocaleTimeString(
        'pt-BR',
        {
            hour: '2-digit',
            minute: '2-digit'
        }
    );
}


/* =========================
   FASE DO DIA
   ========================= */

function definirFaseDoDia(dataHora) {

    const hora = Number(
        dataHora.substring(11, 13)
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

    } else if (
        hora >= 12 &&
        hora < 18
    ) {

        document.body.classList.add(
            'tarde'
        );

    } else if (
        hora >= 18 &&
        hora < 24
    ) {

        document.body.classList.add(
            'noite'
        );

    } else {

        document.body.classList.add(
            'madrugada'
        );
    }


    console.log(
        `Horário da cidade: ${hora}h`
    );


    console.log(
        `Classe aplicada: ${document.body.className}`
    );
}


/* =========================
   CACHE
   ========================= */

/*
   O cache permanece válido
   durante 10 minutos.

   10 minutos =
   10 × 60 × 1000
*/

const CACHE_TEMPO =
    10 * 60 * 1000;


/*
   Cria uma chave específica
   para cada cidade.
*/

function criarChaveCache(cidade) {

    return `clima_${cidade
        .trim()
        .toLowerCase()}`;
}


/*
   Salva:

   - cidade
   - clima atual
   - previsão de 7 dias
*/

function salvarCache(
    cidade,
    dados
) {

    const cache = {

        dados: dados,

        timestamp: Date.now()

    };


    localStorage.setItem(

        criarChaveCache(cidade),

        JSON.stringify(cache)

    );
}


/*
   Recupera o cache.

   Retorna null quando:

   - não existe;
   - está expirado;
   - ocorreu erro ao ler.
*/

function obterCache(cidade) {

    const dadosSalvos =
        localStorage.getItem(
            criarChaveCache(cidade)
        );


    if (!dadosSalvos) {

        return null;
    }


    try {

        const cache =
            JSON.parse(dadosSalvos);


        const cacheExpirado =
            Date.now() -
            cache.timestamp >
            CACHE_TEMPO;


        if (cacheExpirado) {

            localStorage.removeItem(
                criarChaveCache(cidade)
            );

            return null;
        }


        return cache.dados;

    } catch (erro) {

        console.error(
            'Erro ao ler cache:',
            erro
        );


        localStorage.removeItem(
            criarChaveCache(cidade)
        );


        return null;
    }
}


/* =========================
   EXIBIR DADOS DO CLIMA
   ========================= */

function exibirDadosClima(
    cidadeEncontrada,
    climaAtual
) {

    /*
       Guarda os dados da cidade atualmente
       exibida na tela.

       O comparison.js utiliza essas
       informações para adicionar a cidade
       à comparação.
    */

    climaAtualPesquisado = {

        cidade: cidadeEncontrada,

        clima: climaAtual

    };


    cityNameEl.textContent =
        `${cidadeEncontrada.name}${
            cidadeEncontrada.country
                ? ', ' +
                  cidadeEncontrada.country
                : ''
        }`;

    
    /*
       Horário da cidade pesquisada.
    */

    localTimeEl.textContent =
        `Horário destino: ${
            formatarHorarioLocal(
                climaAtual.time
            )
        }`;


    tempEl.textContent =
        `${climaAtual.temperature} °C`;


    descEl.textContent =
        `${obterIconeClima(
            climaAtual.weathercode,
            climaAtual.is_day
        )} ${
            obterDescricaoClima(
                climaAtual.weathercode
            )
        }`;


    windEl.textContent =
        `💨 Vento: ${
            climaAtual.windspeed
        } km/h ` +
        `(direção ${
            climaAtual.winddirection
        }°)`;


    /*
       Horário local do usuário.
    */

    updatedAtEl.textContent =
        `Atualizado em: ${
            obterHorarioAtual()
        }`;


    /*
       Altera o ambiente da aplicação
       conforme o horário da cidade.
    */

    definirFaseDoDia(
        climaAtual.time
    );


    resultDiv.classList.remove(
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

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            'Erro ao consultar a previsão para os próximos 7 dias.'
        );
    }


    const dados =
        await resposta.json();


    if (
        !dados.daily ||
        !dados.daily.time ||
        !dados.daily.temperature_2m_max ||
        !dados.daily.temperature_2m_min ||
        !dados.daily.weathercode
    ) {

        throw new Error(
            'Formato de previsão inválido.'
        );
    }


    /*
       A função abaixo pertence
       ao arquivo forecast.js.

       Ela cria e exibe os
       cards da previsão.
    */

    if (
        typeof exibirPrevisao ===
        'function'
    ) {

        exibirPrevisao(dados);

    } else {

        console.error(
            'A função exibirPrevisao não foi encontrada.'
        );
    }


    return dados;
}


/* =========================
   BUSCAR CLIMA
   ========================= */

form.addEventListener(
    'submit',
    async (e) => {

        e.preventDefault();


        const cidade =
            cityInput.value.trim();


        if (!cidade) {

            mostrarErro(
                'Digite o nome de uma cidade.'
            );

            return;
        }


        limparMensagens();

        mostrarCarregando(true);


        try {

            /* =========================
               1. VERIFICA O CACHE
               ========================= */

            const dadosCache =
                obterCache(cidade);


            /*
               Se existir cache válido,
               utiliza os dados armazenados.
            */

            if (dadosCache) {

                console.log(
                    `Cache utilizado para: ${cidade}`
                );


                exibirDadosClima(

                    dadosCache.cidadeEncontrada,

                    dadosCache.climaAtual

                );


                /*
                   A previsão também fica
                   armazenada no cache.

                   Porém, existe compatibilidade
                   com caches antigos que ainda
                   não possuem previsão.
                */

                if (
                    dadosCache.previsao
                ) {

                    if (
                        typeof exibirPrevisao ===
                        'function'
                    ) {

                        exibirPrevisao(
                            dadosCache.previsao
                        );
                    }

                } else {

                    /*
                       Cache antigo.

                       Busca apenas a previsão
                       e atualiza o cache.
                    */

                    try {

                        const previsao =
                            await buscarPrevisao(

                                dadosCache
                                    .cidadeEncontrada
                                    .latitude,

                                dadosCache
                                    .cidadeEncontrada
                                    .longitude

                            );


                        salvarCache(

                            cidade,

                            {

                                cidadeEncontrada:
                                    dadosCache
                                        .cidadeEncontrada,

                                climaAtual:
                                    dadosCache
                                        .climaAtual,

                                previsao:
                                    previsao

                            }

                        );

                    } catch (erro) {

                        console.error(
                            'Erro ao atualizar previsão:',
                            erro
                        );
                    }
                }


                return;
            }


            console.log(
                `Cache não encontrado ou expirado: ${cidade}`
            );


            /* =========================
               2. GEOCODIFICAÇÃO
               ========================= */

            const respostaLocalizacao =
                await fetch(

                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`

                );


            if (
                !respostaLocalizacao.ok
            ) {

                throw new Error(
                    'Erro ao consultar a localização.'
                );
            }


            const localizacao =
                await respostaLocalizacao.json();


            if (
                !localizacao.results ||
                localizacao.results.length === 0
            ) {

                mostrarErro(
                    'Cidade não encontrada. ' +
                    'Verifique o nome informado.'
                );

                return;
            }


            const cidadeEncontrada =
                localizacao.results[0];


            const latitude =
                cidadeEncontrada.latitude;


            const longitude =
                cidadeEncontrada.longitude;


            /* =========================
               3. CONSULTA DO CLIMA ATUAL
               ========================= */

            const respostaClima =
                await fetch(

                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`

                );


            if (!respostaClima.ok) {

                throw new Error(
                    'Erro ao consultar o clima.'
                );
            }


            const dadosClima =
                await respostaClima.json();


            const climaAtual =
                dadosClima.current_weather;


            if (!climaAtual) {

                throw new Error(
                    'Dados do clima atual não encontrados.'
                );
            }


            /* =========================
               4. CONSULTA PREVISÃO
               ========================= */

            const previsao =
                await buscarPrevisao(

                    latitude,

                    longitude

                );


            /* =========================
               5. SALVA NO CACHE
               ========================= */

            salvarCache(

                cidade,

                {

                    cidadeEncontrada:
                        cidadeEncontrada,

                    climaAtual:
                        climaAtual,

                    previsao:
                        previsao

                }

            );


            console.log(
                `Dados atuais e previsão salvos no cache: ${cidade}`
            );


            /* =========================
               6. ATUALIZA CLIMA ATUAL
               ========================= */

            exibirDadosClima(

                cidadeEncontrada,

                climaAtual

            );


            /*
               A previsão já foi exibida
               pela função buscarPrevisao().
            */


        } catch (erro) {

            console.error(
                'Erro ao buscar dados:',
                erro
            );


            mostrarErro(
                'Não foi possível carregar os dados do clima. ' +
                'Verifique sua conexão com a internet.'
            );

        } finally {

            mostrarCarregando(false);
        }

    }
);


/* =========================
   TEMA DA APLICAÇÃO
   ========================= */

themeToggle.addEventListener(
    'click',
    () => {

        document.body.classList.toggle(
            'dark-mode'
        );


        if (
            document.body.classList.contains(
                'dark-mode'
            )
        ) {

            themeToggle.textContent =
                '☀️ Modo claro';

        } else {

            themeToggle.textContent =
                '🌙 Modo escuro';
        }

    }
);