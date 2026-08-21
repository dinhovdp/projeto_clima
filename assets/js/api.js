/* =========================================================
   API DE CLIMA
   =========================================================

   Responsabilidades:

   - Buscar cidades por nome
   - Interpretar pesquisas simples e compostas
   - Permitir cidades homônimas
   - Permitir ambiguidades cidade/região/país
   - Controlar limite de interpretações
   - Evitar busca explosiva
   - Controlar concorrência de requisições
   - Buscar clima pelas coordenadas
   - Buscar previsão
   - Controlar cache
   - Controlar tema claro/escuro
   - Controlar fundo dinâmico
   - Atualizar interface
   - Validar dados recebidos
   - Controlar timeout
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

const QUANTIDADE_MAXIMA_CIDADES =
    10;

/*
   Limite de interpretações.

   IMPORTANTE:

   Não geramos todas as combinações possíveis das palavras.

   A pesquisa original sempre é prioridade.
   Depois são avaliadas somente algumas divisões
   controladas da expressão.

   Isso impede explosão combinatória.
*/
const MAXIMO_INTERPRETACOES =
    6;

/*
   Número máximo de consultas de geocodificação
   executadas simultaneamente.
*/
const MAXIMO_CONSULTAS_SIMULTANEAS =
    4;


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

/*
   Identificador da pesquisa atual.

   Uma resposta antiga nunca poderá atualizar a interface
   depois que uma pesquisa mais nova tiver começado.
*/
let requisicaoAtual = 0;

let cidadesEncontradasAtuais = [];


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
        elemento =>
            elemento !== null
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
   SELETOR DE CIDADES
   ========================================================= */

function criarSeletorCidades() {

    let seletor =
        document.getElementById(
            'city-selection'
        );

    if (seletor) {
        return seletor;
    }

    seletor =
        document.createElement(
            'section'
        );

    seletor.id =
        'city-selection';

    seletor.className =
        'city-selection hidden';

    seletor.setAttribute(
        'aria-labelledby',
        'city-selection-title'
    );

    const titulo =
        document.createElement(
            'h2'
        );

    titulo.id =
        'city-selection-title';

    titulo.textContent =
        'Selecione a cidade';

    const descricao =
        document.createElement(
            'p'
        );

    descricao.className =
        'city-selection-description';

    descricao.textContent =
        'Encontramos mais de uma localização compatível. Escolha a opção correta.';

    const lista =
        document.createElement(
            'div'
        );

    lista.id =
        'city-selection-list';

    lista.className =
        'city-selection-list';

    seletor.appendChild(
        titulo
    );

    seletor.appendChild(
        descricao
    );

    seletor.appendChild(
        lista
    );

    resultDiv.parentNode.insertBefore(
        seletor,
        resultDiv
    );

    return seletor;
}


const citySelection =
    criarSeletorCidades();

const citySelectionList =
    document.getElementById(
        'city-selection-list'
    );


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

function mostrarErro(
    mensagem
) {

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


/* =========================================================
   SELEÇÃO DE CIDADES
   ========================================================= */

function limparSelecaoCidades() {

    cidadesEncontradasAtuais =
        [];

    citySelectionList.innerHTML =
        '';

    citySelection.classList.add(
        'hidden'
    );
}


function mostrarSelecaoCidades(
    cidades,
    idRequisicao
) {

    limparSelecaoCidades();

    cidadesEncontradasAtuais =
        cidades;

    if (
        !Array.isArray(cidades) ||
        cidades.length === 0
    ) {
        return;
    }

    citySelection.classList.remove(
        'hidden'
    );

    cidades.forEach(
        cidade => {

            const botao =
                document.createElement(
                    'button'
                );

            botao.type =
                'button';

            botao.className =
                'city-selection-option';

            botao.setAttribute(
                'aria-label',
                `Selecionar ${criarNomeLocalizacao(cidade)}`
            );

            const nome =
                document.createElement(
                    'strong'
                );

            nome.textContent =
                cidade.name ||
                'Cidade';

            const detalhes =
                document.createElement(
                    'span'
                );

            detalhes.textContent =
                criarDetalhesLocalizacao(
                    cidade
                );

            botao.appendChild(
                nome
            );

            botao.appendChild(
                detalhes
            );

            botao.addEventListener(
                'click',
                async () => {

                    if (
                        idRequisicao !==
                        requisicaoAtual
                    ) {
                        return;
                    }

                    await selecionarCidade(
                        cidade,
                        idRequisicao
                    );
                }
            );

            citySelectionList.appendChild(
                botao
            );
        }
    );
}


function criarNomeLocalizacao(
    cidade
) {

    if (
        !cidade ||
        typeof cidade !== 'object'
    ) {
        return 'Cidade';
    }

    const nome =
        typeof cidade.name ===
            'string'
            ? cidade.name
            : 'Cidade';

    const regiao =
        typeof cidade.admin1 ===
            'string'
            ? cidade.admin1
            : '';

    const pais =
        typeof cidade.country ===
            'string'
            ? cidade.country
            : '';

    return [
        nome,
        regiao,
        pais
    ].filter(Boolean).join(
        ', '
    );
}


function criarDetalhesLocalizacao(
    cidade
) {

    if (
        !cidade ||
        typeof cidade !== 'object'
    ) {
        return '';
    }

    const partes = [];

    if (
        typeof cidade.admin1 ===
            'string' &&
        cidade.admin1.trim()
    ) {
        partes.push(
            cidade.admin1
        );
    }

    if (
        typeof cidade.country ===
            'string' &&
        cidade.country.trim()
    ) {
        partes.push(
            cidade.country
        );
    }

    if (
        typeof cidade.country_code ===
            'string' &&
        cidade.country_code.trim()
    ) {
        partes.push(
            cidade.country_code
                .toUpperCase()
        );
    }

    return partes.join(
        ' • '
    );
}


/* =========================================================
   LIMPAR RESULTADO ANTERIOR
   ========================================================= */

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

    limparSelecaoCidades();
}


/* =========================================================
   NORMALIZAÇÃO
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
        .normalize('NFC');
}


/*
   Remove acentos somente para comparação.

   O valor original continua sendo preservado
   para enviar à API.
*/
function normalizarParaComparacao(
    texto
) {

    if (
        typeof texto !==
        'string'
    ) {
        return '';
    }

    return texto
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .toLowerCase()
        .trim()
        .replace(
            /\s+/g,
            ' '
        );
}


/* =========================================================
   TOKENIZAÇÃO
   ========================================================= */

function obterPalavras(
    texto
) {

    const normalizado =
        normalizarParaComparacao(
            texto
        );

    if (!normalizado) {
        return [];
    }

    return normalizado.split(
        ' '
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
   ÍCONE
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

function formatarHorarioLocal(
    dataHora
) {

    if (
        typeof dataHora !==
        'string'
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
        typeof dataHora !==
        'string'
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

function definirFaseDoDia(
    dataHora
) {

    if (
        typeof dataHora !==
        'string'
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
   CATEGORIA VISUAL
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

    return 'limpo';
}


/* =========================================================
   FUNDO
   ========================================================= */

function definirClimaFundo(
    codigo
) {

    const categoria =
        obterCategoriaClima(
            codigo
        );

    const classesClimaticas = [
        'clima-limpo',
        'clima-parcial',
        'clima-nublado',
        'clima-chuva',
        'clima-neve',
        'clima-tempestade'
    ];

    document.body.classList.remove(
        ...classesClimaticas
    );

    document.body.classList.add(
        `clima-${categoria}`
    );
}


/* =========================================================
   CACHE
   ========================================================= */

function criarChaveCache(
    cidade,
    latitude,
    longitude
) {

    const cidadeNormalizada =
        normalizarCidade(
            cidade
        ).toLowerCase();

    const latitudeNormalizada =
        Number(latitude)
            .toFixed(4);

    const longitudeNormalizada =
        Number(longitude)
            .toFixed(4);

    return `clima_api_cache_${encodeURIComponent(
        cidadeNormalizada
    )}_${latitudeNormalizada}_${longitudeNormalizada}`;
}


function salvarCache(
    cidade,
    dados
) {

    if (
        !cidade ||
        !dados ||
        !dados.cidadeEncontrada
    ) {
        return;
    }

    const latitude =
        dados.cidadeEncontrada.latitude;

    const longitude =
        dados.cidadeEncontrada.longitude;

    if (
        !numeroValido(latitude) ||
        !numeroValido(longitude)
    ) {
        return;
    }

    const cache = {

        versao: 4,

        cidade,

        dados,

        timestamp:
            Date.now()
    };

    try {

        localStorage.setItem(

            criarChaveCache(
                cidade,
                latitude,
                longitude
            ),

            JSON.stringify(
                cache
            )
        );

    } catch (erro) {

        console.warn(
            'Não foi possível salvar o cache local.'
        );
    }
}


function obterCache(
    cidade,
    latitude,
    longitude
) {

    if (
        !numeroValido(latitude) ||
        !numeroValido(longitude)
    ) {
        return null;
    }

    const chave =
        criarChaveCache(
            cidade,
            latitude,
            longitude
        );

    let dadosSalvos;

    try {

        dadosSalvos =
            localStorage.getItem(
                chave
            );

    } catch (erro) {

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

        return cache.dados ||
            null;

    } catch (erro) {

        try {

            localStorage.removeItem(
                chave
            );

        } catch (erroRemocao) {
            // Armazenamento indisponível.
        }

        return null;
    }
}


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
   FETCH SEGURO
   ========================================================= */

async function requisicaoComTimeout(
    url
) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () =>
                controller.abort(),
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

                    cache:
                        'no-store'
                }
            );

        return resposta;

    } catch (erro) {

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

    } finally {

        clearTimeout(
            timeout
        );
    }
}


/* =========================================================
   VALIDAÇÃO NUMÉRICA
   ========================================================= */

function numeroValido(
    valor
) {

    return (
        typeof valor ===
            'number' &&
        Number.isFinite(
            valor
        )
    );
}


/* =========================================================
   VALIDAÇÃO DE LOCALIZAÇÃO
   ========================================================= */

function localizacaoValida(
    resultado
) {

    return (

        resultado &&

        typeof resultado ===
            'object' &&

        numeroValido(
            resultado.latitude
        ) &&

        numeroValido(
            resultado.longitude
        ) &&

        typeof resultado.name ===
            'string' &&

        resultado.name.trim()
    );
}


/* =========================================================
   COMPARAÇÃO DE PALAVRAS
   ========================================================= */

/*
   Verifica se a expressão pesquisada aparece como
   sequência de palavras completas.

   Exemplo:

   "Jose"
   aceita:
   "Jose"

   rejeita:
   "Josefina"

   "São José"
   aceita:
   "São José dos Campos"

   rejeita:
   "São Paulo"
*/
function expressaoCompatívelComNome(
    consulta,
    nome
) {

    const palavrasConsulta =
        obterPalavras(
            consulta
        );

    const palavrasNome =
        obterPalavras(
            nome
        );

    if (
        palavrasConsulta.length === 0 ||
        palavrasNome.length === 0
    ) {
        return false;
    }

    if (
        palavrasConsulta.length >
        palavrasNome.length
    ) {
        return false;
    }

    for (
        let inicio = 0;
        inicio <=
        palavrasNome.length -
        palavrasConsulta.length;
        inicio++
    ) {

        let corresponde =
            true;

        for (
            let indice = 0;
            indice <
            palavrasConsulta.length;
            indice++
        ) {

            if (
                palavrasConsulta[indice] !==
                palavrasNome[
                    inicio + indice
                ]
            ) {

                corresponde =
                    false;

                break;
            }
        }

        if (corresponde) {
            return true;
        }
    }

    return false;
}


/* =========================================================
   INTERPRETAÇÃO DA CONSULTA
   ========================================================= */

/*
   Esta função NÃO gera todas as combinações possíveis.

   Exemplo:

   São José dos Campos

   Poderá produzir no máximo:

   1. São José dos Campos
   2. São José dos
   3. São José
   4. São

   Isso é deliberadamente limitado.

   A consulta original sempre vem primeiro.
*/

function gerarInterpretacoesPesquisa(
    cidade
) {

    const consulta =
        normalizarCidade(
            cidade
        );

    const palavras =
        consulta.split(
            ' '
        );

    const interpretacoes = [];

    function adicionar(
        nomeCidade,
        regiao = ''
    ) {

        const chave =
            `${normalizarParaComparacao(nomeCidade)}|${normalizarParaComparacao(regiao)}`;

        if (
            interpretacoes.some(
                item =>
                    item.chave === chave
            )
        ) {
            return;
        }

        if (
            interpretacoes.length >=
            MAXIMO_INTERPRETACOES
        ) {
            return;
        }

        interpretacoes.push({
            cidade:
                nomeCidade,
            regiao,
            chave
        });
    }

    /*
       PRIMEIRA E MAIS IMPORTANTE:

       pesquisa exatamente como o usuário digitou.
    */

    adicionar(
        consulta
    );

    if (
        palavras.length <= 1
    ) {
        return interpretacoes;
    }

    /*
       Depois testamos somente divisões progressivas.

       Exemplo:

       São Paulo São Paulo

       São Paulo São Paulo
       São Paulo
       São
       
       Não fazemos:
       São + Paulo + São + Paulo
       Paulo + São
       etc.

       Isso evita explosão combinatória.
    */

    const limite =
        Math.min(
            palavras.length - 1,
            MAXIMO_INTERPRETACOES - 1
        );

    for (
        let quantidade = 1;
        quantidade <= limite;
        quantidade++
    ) {

        const cidadeParte =
            palavras
                .slice(
                    0,
                    palavras.length -
                        quantidade
                )
                .join(' ');

        const regiaoParte =
            palavras
                .slice(
                    palavras.length -
                        quantidade
                )
                .join(' ');

        /*
           A consulta da cidade é mantida em sua forma
           original de capitalização/acento sempre que possível.
        */

        const cidadePalavras =
            consulta.split(' ');

        const cidadeOriginal =
            cidadePalavras
                .slice(
                    0,
                    palavras.length -
                        quantidade
                )
                .join(' ');

        const regiaoOriginal =
            cidadePalavras
                .slice(
                    palavras.length -
                        quantidade
                )
                .join(' ');

        adicionar(
            cidadeOriginal,
            regiaoOriginal
        );
    }

    return interpretacoes;
}


/* =========================================================
   CONSULTA DE GEOCODIFICAÇÃO
   ========================================================= */

async function consultarGeocodificacao(
    nome
) {

    const parametros =
        new URLSearchParams({

            name:
                nome,

            count:
                String(
                    QUANTIDADE_MAXIMA_CIDADES
                ),

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
        )
    ) {
        return [];
    }

    return localizacao.results
        .filter(
            localizacaoValida
        );
}


/* =========================================================
   VALIDAÇÃO DE RESULTADO DE PESQUISA
   ========================================================= */

/*
   A consulta original deve respeitar as palavras.

   Para interpretações cidade + região:

   cidade:
      precisa corresponder à expressão da parte cidade.

   região:
      precisa corresponder ao admin1 retornado.

   país:
      caso a API tenha retornado country, ele poderá
      participar da validação em futuras extensões.

   Não aceitamos simplesmente "qualquer texto parecido".
*/

function resultadoCompatívelComInterpretacao(
    resultado,
    interpretacao
) {

    if (
        !localizacaoValida(
            resultado
        )
    ) {
        return false;
    }

    const nomeCidade =
        resultado.name;

    /*
       Quando não há região explícita na hipótese,
       aceitamos a expressão como parte do nome da cidade.
    */

    if (
        !interpretacao.regiao
    ) {

        return expressaoCompatívelComNome(
            interpretacao.cidade,
            nomeCidade
        );
    }

    /*
       Quando existe uma região na hipótese,
       ela precisa ser encontrada na informação administrativa
       retornada pela API.

       Isso é justamente o que impede que uma hipótese
       inventada vire um card.
    */

    const regiaoApi =
        typeof resultado.admin1 ===
            'string'
            ? resultado.admin1
            : '';

    if (!regiaoApi) {
        return false;
    }

    const cidadeCompativel =
        expressaoCompatívelComNome(
            interpretacao.cidade,
            nomeCidade
        );

    if (!cidadeCompativel) {
        return false;
    }

    /*
       A região também é comparada por palavras completas.

       Exemplo:

       "São Paulo"
       é compatível com
       "São Paulo".

       "SP"
       não será considerado automaticamente igual a
       "São Paulo" nesta etapa.

       A API precisa retornar uma compatibilidade real
       ou a interpretação será descartada.
    */

    const regiaoNormalizada =
        normalizarParaComparacao(
            interpretacao.regiao
        );

    const regiaoApiNormalizada =
        normalizarParaComparacao(
            regiaoApi
        );

    return (
        regiaoNormalizada ===
        regiaoApiNormalizada
    );
}


/* =========================================================
   CHAVE ÚNICA DE LOCALIZAÇÃO
   ========================================================= */

function criarChaveLocalizacao(
    cidade
) {

    if (
        !localizacaoValida(
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
        ).toFixed(5),

        normalizarParaComparacao(
            cidade.name
        ),

        normalizarParaComparacao(
            cidade.admin1 || ''
        ),

        normalizarParaComparacao(
            cidade.country || ''
        )
    ].join('|');
}


/* =========================================================
   REMOVER DUPLICIDADES
   ========================================================= */

function removerDuplicidadesLocalizacao(
    cidades
) {

    const mapa =
        new Map();

    cidades.forEach(
        cidade => {

            const chave =
                criarChaveLocalizacao(
                    cidade
                );

            if (
                chave &&
                !mapa.has(chave)
            ) {

                mapa.set(
                    chave,
                    cidade
                );
            }
        }
    );

    return Array.from(
        mapa.values()
    );
}


/* =========================================================
   BUSCAR LOCALIZAÇÕES
   ========================================================= */

/*
   Esta é a nova camada principal da busca.

   IMPORTANTE:

   - nunca cria busca infinita;
   - possui quantidade máxima;
   - executa somente interpretações controladas;
   - espera todas terminarem;
   - só então decide se encontrou ou não;
   - uma pesquisa antiga não pode contaminar a atual.
*/

async function buscarLocalizacao(
    cidade,
    idRequisicao = requisicaoAtual
) {

    const consulta =
        normalizarCidade(
            cidade
        );

    const interpretacoes =
        gerarInterpretacoesPesquisa(
            consulta
        );

    if (
        interpretacoes.length === 0
    ) {
        return [];
    }

    const resultados = [];

    /*
       Executamos em pequenos grupos.

       Não dispararemos uma quantidade ilimitada
       de requisições simultaneamente.
    */

    for (
        let inicio = 0;
        inicio <
        interpretacoes.length;
        inicio +=
            MAXIMO_CONSULTAS_SIMULTANEAS
    ) {

        /*
           Se o usuário iniciou outra pesquisa,
           abandonamos esta imediatamente.
        */

        if (
            idRequisicao !==
            requisicaoAtual
        ) {
            return [];
        }

        const grupo =
            interpretacoes.slice(
                inicio,
                inicio +
                    MAXIMO_CONSULTAS_SIMULTANEAS
            );

        const respostas =
            await Promise.allSettled(

                grupo.map(
                    interpretacao =>
                        consultarGeocodificacao(
                            interpretacao.cidade
                        )
                )
            );

        if (
            idRequisicao !==
            requisicaoAtual
        ) {
            return [];
        }

        respostas.forEach(
            (
                resposta,
                indice
            ) => {

                if (
                    resposta.status !==
                    'fulfilled'
                ) {
                    return;
                }

                const interpretacao =
                    grupo[indice];

                resposta.value.forEach(
                    resultado => {

                        if (
                            resultadoCompatívelComInterpretacao(
                                resultado,
                                interpretacao
                            )
                        ) {

                            resultados.push(
                                resultado
                            );
                        }
                    }
                );
            }
        );
    }

    if (
        idRequisicao !==
        requisicaoAtual
    ) {
        return [];
    }

    return removerDuplicidadesLocalizacao(
        resultados
    ).slice(
        0,
        QUANTIDADE_MAXIMA_CIDADES
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
        ) ||

        !numeroValido(
            current.is_day
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
   EXIBIR DADOS
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

    const regiao =
        typeof cidadeEncontrada.admin1 ===
            'string'
            ? cidadeEncontrada.admin1
            : '';

    const localizacao = [
        nomeCidade,
        regiao,
        pais
    ].filter(Boolean);

    cityNameEl.textContent =
        localizacao.join(
            ', '
        );

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

    definirClimaFundo(
        climaAtual.weathercode
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
   SELECIONAR CIDADE
   ========================================================= */

async function selecionarCidade(
    cidadeEncontrada,
    idRequisicao
) {

    if (
        !cidadeEncontrada
    ) {
        return;
    }

    if (
        idRequisicao !==
        requisicaoAtual
    ) {
        return;
    }

    const cidade =
        normalizarCidade(
            cityInput.value
        );

    const latitude =
        cidadeEncontrada.latitude;

    const longitude =
        cidadeEncontrada.longitude;

    if (
        !numeroValido(latitude) ||
        !numeroValido(longitude)
    ) {

        mostrarErro(
            'A localização selecionada possui coordenadas inválidas.'
        );

        return;
    }

    limparSelecaoCidades();

    mostrarCarregando(
        true
    );

    try {

        const dadosCache =
            obterCache(
                cidade,
                latitude,
                longitude
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

            } else {

                const previsao =
                    await carregarPrevisao(
                        latitude,
                        longitude
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

        salvarCache(
            cidade,
            dados
        );

        exibirDadosClima(
            dados.cidadeEncontrada,
            dados.climaAtual
        );

        if (
            dados.previsao &&
            typeof window.exibirPrevisao ===
                'function'
        ) {

            window.exibirPrevisao(
                dados.previsao
            );
        }

    } catch (erro) {

        if (
            idRequisicao !==
            requisicaoAtual
        ) {
            return;
        }

        console.error(
            'Falha ao carregar a cidade selecionada.',
            erro
        );

        if (
            erro instanceof Error &&
            erro.message ===
                'A consulta demorou mais que o esperado.'
        ) {

            mostrarErro(
                erro.message
            );

        } else if (
            erro instanceof Error &&
            erro.message ===
                'O módulo de previsão não foi carregado corretamente.'
        ) {

            mostrarErro(
                erro.message
            );

        } else {

            mostrarErro(
                'Não foi possível carregar os dados do clima. Verifique sua conexão e tente novamente.'
            );
        }

    } finally {

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

        if (
            !validacao.valida
        ) {

            mostrarErro(
                validacao.mensagem
            );

            return;
        }

        /*
           Toda nova pesquisa invalida imediatamente
           qualquer pesquisa anterior.
        */

        const idRequisicao =
            ++requisicaoAtual;

        limparMensagens();

        mostrarCarregando(
            true
        );

        try {

            /*
               A busca de localização é uma etapa fechada.

               Quando ela retornar:

               []  → pesquisa terminou sem resultados.

               [...] → pesquisa terminou com resultados.

               erro → pesquisa terminou com falha.

               Não existe estado infinito.
            */

            const cidades =
                await buscarLocalizacao(
                    cidade,
                    idRequisicao
                );

            if (
                idRequisicao !==
                requisicaoAtual
            ) {
                return;
            }

            /*
               NENHUM RESULTADO

               Somente aqui mostramos "Cidade não encontrada".
               Todas as interpretações já terminaram.
            */

            if (
                !cidades ||
                cidades.length === 0
            ) {

                mostrarErro(
                    'Cidade não encontrada. Verifique o nome informado.'
                );

                return;
            }

            /*
               UMA ÚNICA LOCALIZAÇÃO
            */

            if (
                cidades.length === 1
            ) {

                await selecionarCidade(
                    cidades[0],
                    idRequisicao
                );

                return;
            }

            /*
               AMBIGUIDADE

               A pesquisa terminou.

               Não estamos mais carregando.

               O usuário pode escolher um card.
            */

            mostrarSelecaoCidades(
                cidades,
                idRequisicao
            );

        } catch (erro) {

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
                erro instanceof Error &&
                erro.message ===
                    'A consulta demorou mais que o esperado.'
            ) {

                mostrarErro(
                    erro.message
                );

            } else {

                mostrarErro(
                    'Não foi possível consultar o serviço de localização. Verifique sua conexão e tente novamente.'
                );
            }

        } finally {

            /*
               IMPORTANTE:

               Quando existem cards, a pesquisa terminou.
               Portanto o loading também termina.

               Não aguardamos o clique do usuário.
            */

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


function aplicarTema(
    tema
) {

    const modoEscuro =
        tema === 'dark';

    document.body.classList.toggle(
        'dark-mode',
        modoEscuro
    );

    themeToggle.setAttribute(
        'aria-pressed',
        String(
            modoEscuro
        )
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

    } catch (erro) {
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


function salvarTema(
    tema
) {

    try {

        localStorage.setItem(
            CHAVE_TEMA,
            tema
        );

    } catch (erro) {
        // Funcionamento do tema não depende do armazenamento.
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

window.obterCategoriaClima =
    obterCategoriaClima;

window.definirClimaFundo =
    definirClimaFundo;

window.definirFaseDoDia =
    definirFaseDoDia;

window.exibirDadosClima =
    exibirDadosClima;

window.buscarClimaAtual =
    buscarClimaAtual;

window.buscarLocalizacao =
    buscarLocalizacao;

window.buscarDadosCompletos =
    buscarDadosCompletos;

window.selecionarCidade =
    selecionarCidade;


/* =========================================================
   FINALIZAÇÃO
   ========================================================= */

console.log(
    'api.js carregado com sucesso.'
);