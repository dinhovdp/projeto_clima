/* =========================================================
   API DE CLIMA
   ========================================================= */


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


const windEl =
    document.getElementById(
        'wind'
    );


const updatedAtEl =
    document.getElementById(
        'updated-at'
    );


/* =========================================================
   DADOS DA CIDADE ATUAL
   ========================================================= */

/*
   Essas duas variáveis ficam disponíveis
   globalmente para o comparison.js.

   Quando uma cidade é pesquisada,
   elas recebem os dados da última pesquisa.
*/

window.cidadeAtualPesquisada =
    undefined;


window.climaAtualPesquisado =
    undefined;


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function mostrarCarregando(
    mostrar
) {

    loadingEl.classList.toggle(
        'hidden',
        !mostrar
    );
}


/* =========================================================
   ERROS
   ========================================================= */

function mostrarErro(
    mensagem
) {

    errorEl.textContent =
        mensagem;


    errorEl.classList.remove(
        'hidden'
    );
}


function limparMensagens() {

    errorEl.classList.add(
        'hidden'
    );


    errorEl.textContent =
        '';


    resultDiv.classList.add(
        'hidden'
    );


    /*
       Esconde a previsão anterior
       enquanto uma nova cidade
       está sendo pesquisada.
    */

    const forecastSection =
        document.getElementById(
            'forecast-section'
        );


    if (
        forecastSection
    ) {

        forecastSection.classList.add(
            'hidden'
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

        0:
            'Céu limpo',

        1:
            'Principalmente limpo',

        2:
            'Parcialmente nublado',

        3:
            'Nublado',

        45:
            'Neblina',

        48:
            'Neblina com geada',

        51:
            'Garoa fraca',

        53:
            'Garoa moderada',

        55:
            'Garoa intensa',

        61:
            'Chuva fraca',

        63:
            'Chuva moderada',

        65:
            'Chuva intensa',

        71:
            'Neve fraca',

        73:
            'Neve moderada',

        75:
            'Neve intensa',

        80:
            'Pancadas de chuva fracas',

        81:
            'Pancadas de chuva moderadas',

        82:
            'Pancadas de chuva intensas',

        95:
            'Trovoada',

        96:
            'Trovoada com granizo',

        99:
            'Trovoada forte com granizo'

    };


    return descricoes[codigo] ||
        'Condição climática desconhecida';
}


/* =========================================================
   ÍCONE DO CLIMA
   ========================================================= */

function obterIconeClima(
    codigo,
    isDay
) {

    if (
        codigo === 0
    ) {

        return isDay
            ? '☀️'
            : '🌙';
    }


    if (
        codigo === 1
    ) {

        return isDay
            ? '🌤️'
            : '🌙';
    }


    if (
        codigo === 2
    ) {

        return isDay
            ? '⛅'
            : '☁️';
    }


    if (
        codigo === 3
    ) {

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


    if (
        codigo >= 95
    ) {

        return '⛈️';
    }


    return '🌤️';
}


/* =========================================================
   HORÁRIO
   ========================================================= */

/*
   Exemplo:

   2026-08-18T14:35

   Resultado:

   14:35
*/

function formatarHorarioLocal(
    dataHora
) {

    if (
        !dataHora
    ) {

        return '--:--';
    }


    return dataHora.substring(
        11,
        16
    );
}


/*
   Horário atual da máquina
   do usuário.
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


/* =========================================================
   FASE DO DIA
   ========================================================= */

/*
   Agora a fase do dia continua
   sendo utilizada apenas para
   informações complementares.

   As futuras animações de clima
   serão controladas pelo clima
   atual e não apenas pelo horário.
*/

function definirFaseDoDia(
    dataHora
) {

    if (
        !dataHora
    ) {

        return;
    }


    const hora =
        Number(
            dataHora.substring(
                11,
                13
            )
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
}


/* =========================================================
   CACHE
   ========================================================= */

/*
   O cache permanece válido
   durante 10 minutos.
*/

const CACHE_TEMPO =
    10 * 60 * 1000;


/*
   Cria uma chave específica
   para cada cidade.
*/

function criarChaveCache(
    cidade
) {

    return `clima_${
        cidade
            .trim()
            .toLowerCase()
    }`;
}


/*
   Salva todos os dados necessários:

   - cidade;
   - clima atual;
   - previsão de 7 dias.
*/

function salvarCache(
    cidade,
    dados
) {

    const cache = {

        dados:
            dados,

        timestamp:
            Date.now()

    };


    localStorage.setItem(

        criarChaveCache(
            cidade
        ),

        JSON.stringify(
            cache
        )

    );
}


/*
   Recupera o cache.

   Retorna null quando:

   - não existe;
   - está expirado;
   - está corrompido.
*/

function obterCache(
    cidade
) {

    const chave =
        criarChaveCache(
            cidade
        );


    const dadosSalvos =
        localStorage.getItem(
            chave
        );


    if (
        !dadosSalvos
    ) {

        return null;
    }


    try {

        const cache =
            JSON.parse(
                dadosSalvos
            );


        const cacheExpirado =
            Date.now() -
            cache.timestamp >
            CACHE_TEMPO;


        if (
            cacheExpirado
        ) {

            localStorage.removeItem(
                chave
            );


            return null;
        }


        return cache.dados;

    } catch (
        erro
    ) {

        console.error(
            'Erro ao ler cache:',
            erro
        );


        localStorage.removeItem(
            chave
        );


        return null;
    }
}


/* =========================================================
   VALIDAÇÃO DO CACHE
   ========================================================= */

/*
   Caches antigos podem não possuir:

   - sensação térmica;
   - umidade.

   Nesse caso, o cache não será
   utilizado para evitar que os
   novos cards apareçam incompletos.
*/

function cachePossuiDadosNovos(
    dados
) {

    if (
        !dados ||
        !dados.climaAtual
    ) {

        return false;
    }


    const clima =
        dados.climaAtual;


    return (

        clima.temperature !==
            undefined &&

        clima.apparent_temperature !==
            undefined &&

        clima.relative_humidity_2m !==
            undefined &&

        clima.windspeed !==
            undefined

    );
}


/* =========================================================
   EXIBIR DADOS DO CLIMA
   ========================================================= */

function exibirDadosClima(
    cidadeEncontrada,
    climaAtual
) {

    /* =====================================================
       CIDADE
       ===================================================== */

    cityNameEl.textContent =
        `${cidadeEncontrada.name}${
            cidadeEncontrada.country
                ? ', ' +
                  cidadeEncontrada.country
                : ''
        }`;


    /* =====================================================
       HORÁRIO DA CIDADE
       ===================================================== */

    localTimeEl.textContent =
        `Horário destino: ${
            formatarHorarioLocal(
                climaAtual.time
            )
        }`;


    /* =====================================================
       TEMPERATURA
       ===================================================== */

    tempEl.textContent =
        `${climaAtual.temperature} °C`;


    /* =====================================================
       DESCRIÇÃO
       ===================================================== */

    descEl.textContent =
        `${obterIconeClima(
            climaAtual.weathercode,
            climaAtual.is_day
        )} ${
            obterDescricaoClima(
                climaAtual.weathercode
            )
        }`;


    /* =====================================================
       VENTO
       ===================================================== */

    windEl.textContent =
        `💨 Vento: ${
            climaAtual.windspeed
        } km/h`;


    /* =====================================================
       SENSAÇÃO TÉRMICA
       ===================================================== */

    const feelsLikeEl =
        document.getElementById(
            'feels-like'
        );


    if (
        feelsLikeEl
    ) {

        feelsLikeEl.textContent =
            `Sensação térmica: ${
                climaAtual.apparent_temperature
            } °C`;
    }


    /* =====================================================
       UMIDADE
       ===================================================== */

    const humidityEl =
        document.getElementById(
            'humidity'
        );


    if (
        humidityEl
    ) {

        humidityEl.textContent =
            `Umidade: ${
                climaAtual.relative_humidity_2m
            }%`;
    }


    /* =====================================================
       ATUALIZAÇÃO
       ===================================================== */

    updatedAtEl.textContent =
        `Atualizado em: ${
            obterHorarioAtual()
        }`;


    /* =====================================================
       FASE DO DIA
       ===================================================== */

    definirFaseDoDia(
        climaAtual.time
    );


    /* =====================================================
       DISPONIBILIZA DADOS PARA COMPARAÇÃO
       ===================================================== */

    window.cidadeAtualPesquisada =
        cidadeEncontrada;


    window.climaAtualPesquisado =
        climaAtual;


    /* =====================================================
       EXIBE RESULTADO
       ===================================================== */

    resultDiv.classList.remove(
        'hidden'
    );
}


/* =========================================================
   BUSCAR PREVISÃO
   ========================================================= */

/*
   A previsão é responsabilidade
   do forecast.js.

   Aqui apenas chamamos a função
   existente naquele arquivo.

   Isso evita manter duas versões
   da mesma função.
*/

async function carregarPrevisao(
    latitude,
    longitude
) {

    if (
        typeof buscarPrevisao !==
        'function'
    ) {

        throw new Error(
            'O arquivo forecast.js não foi carregado corretamente.'
        );
    }


    return await buscarPrevisao(

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

    /*
       Dados solicitados à Open-Meteo:

       temperature_2m
       relative_humidity_2m
       apparent_temperature
       weather_code
       wind_speed_10m
       wind_direction_10m
       is_day
    */

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
        `&timezone=auto`;


    const resposta =
        await fetch(
            url
        );


    if (
        !resposta.ok
    ) {

        throw new Error(
            'Erro ao consultar o clima atual.'
        );
    }


    const dados =
        await resposta.json();


    if (
        !dados.current
    ) {

        throw new Error(
            'Dados do clima atual não encontrados.'
        );
    }


    /*
       Normaliza os nomes recebidos
       pela API para manter compatibilidade
       com o restante da aplicação.
    */

    const climaAtual = {

        time:
            dados.current.time,

        temperature:
            dados.current.temperature_2m,

        apparent_temperature:
            dados.current.apparent_temperature,

        relative_humidity_2m:
            dados.current.relative_humidity_2m,

        weathercode:
            dados.current.weather_code,

        windspeed:
            dados.current.wind_speed_10m,

        winddirection:
            dados.current.wind_direction_10m,

        is_day:
            dados.current.is_day

    };


    return climaAtual;
}


/* =========================================================
   BUSCAR CIDADE
   ========================================================= */

async function buscarLocalizacao(
    cidade
) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            cidade
        )}&count=1&language=pt&format=json`;


    const resposta =
        await fetch(
            url
        );


    if (
        !resposta.ok
    ) {

        throw new Error(
            'Erro ao consultar a localização.'
        );
    }


    const localizacao =
        await resposta.json();


    if (
        !localizacao.results ||
        localizacao.results.length === 0
    ) {

        return null;
    }


    return localizacao.results[0];
}


/* =========================================================
   BUSCAR CLIMA COMPLETO
   ========================================================= */

async function buscarDadosCompletos(
    cidadeEncontrada
) {

    const latitude =
        cidadeEncontrada.latitude;


    const longitude =
        cidadeEncontrada.longitude;


    /* =====================================================
       CLIMA ATUAL
       ===================================================== */

    const climaAtual =
        await buscarClimaAtual(

            latitude,

            longitude

        );


    /* =====================================================
       PREVISÃO
       ===================================================== */

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
    async (
        e
    ) => {

        e.preventDefault();


        const cidade =
            cityInput.value.trim();


        if (
            !cidade
        ) {

            mostrarErro(
                'Digite o nome de uma cidade.'
            );

            return;
        }


        limparMensagens();


        mostrarCarregando(
            true
        );


        try {

            /* =================================================
               1. VERIFICA CACHE
               ================================================= */

            const dadosCache =
                obterCache(
                    cidade
                );


            /*
               Só utiliza cache se ele
               possuir os novos dados.
            */

            if (
                dadosCache &&
                cachePossuiDadosNovos(
                    dadosCache
                )
            ) {

                console.log(
                    `Cache utilizado para: ${cidade}`
                );


                /* =============================================
                   EXIBE CLIMA ATUAL
                   ============================================= */

                exibirDadosClima(

                    dadosCache
                        .cidadeEncontrada,

                    dadosCache
                        .climaAtual

                );


                /* =============================================
                   EXIBE PREVISÃO
                   ============================================= */

                if (
                    dadosCache.previsao &&
                    typeof exibirPrevisao ===
                        'function'
                ) {

                    exibirPrevisao(
                        dadosCache.previsao
                    );

                } else {

                    /*
                       Caso seja um cache antigo
                       sem previsão.
                    */

                    const previsao =
                        await carregarPrevisao(

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
                }


                return;
            }


            /* =================================================
               2. CACHE ANTIGO OU INEXISTENTE
               ================================================= */

            console.log(
                `Buscando dados atualizados para: ${cidade}`
            );


            /* =================================================
               3. GEOCODIFICAÇÃO
               ================================================= */

            const cidadeEncontrada =
                await buscarLocalizacao(
                    cidade
                );


            if (
                !cidadeEncontrada
            ) {

                mostrarErro(
                    'Cidade não encontrada. ' +
                    'Verifique o nome informado.'
                );

                return;
            }


            /* =================================================
               4. CLIMA + PREVISÃO
               ================================================= */

            const dados =
                await buscarDadosCompletos(
                    cidadeEncontrada
                );


            /* =================================================
               5. SALVA CACHE
               ================================================= */

            salvarCache(

                cidade,

                dados

            );


            console.log(
                `Dados completos salvos no cache: ${cidade}`
            );


            /* =================================================
               6. EXIBE CLIMA
               ================================================= */

            exibirDadosClima(

                dados.cidadeEncontrada,

                dados.climaAtual

            );


            /*
               A função buscarPrevisao()
               já chama exibirPrevisao().
            */

        } catch (
            erro
        ) {

            console.error(
                'Erro ao buscar dados:',
                erro
            );


            mostrarErro(
                'Não foi possível carregar os dados do clima. ' +
                'Verifique sua conexão com a internet.'
            );

        } finally {

            mostrarCarregando(
                false
            );
        }

    }
);


/* =========================================================
   TEMA DA APLICAÇÃO
   ========================================================= */

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


/* =========================================================
   FUNÇÕES DISPONÍVEIS GLOBALMENTE
   ========================================================= */

window.obterDescricaoClima =
    obterDescricaoClima;


window.obterIconeClima =
    obterIconeClima;


window.exibirDadosClima =
    exibirDadosClima;


window.buscarClimaAtual =
    buscarClimaAtual;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

console.log(
    'api.js carregado com sucesso.'
);  