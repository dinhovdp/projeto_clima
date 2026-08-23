/* =========================================================
   GEOCODING.JS
   =========================================================

   Responsabilidades:

   - Normalizar pesquisas
   - Validar entrada do usuário
   - Interpretar pesquisas simples e compostas
   - Evitar explosão combinatória
   - Buscar localizações na API de geocodificação
   - Validar resultados recebidos
   - Permitir cidades homônimas
   - Validar cidade + região
   - Remover duplicidades
   - Controlar quantidade de resultados
   - Controlar concorrência de requisições
   - Controlar timeout

   Compatibilidade:

   - Navegador / Live Server
   - GitHub Pages
   - ES Modules
   - Jest

   Exposição no navegador:

   - window.GeocodingAPI

   Este módulo NÃO manipula a interface.

   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const GEOCODING_TEMPO_LIMITE_REQUISICAO =
    15000;

const GEOCODING_TAMANHO_MAXIMO_CIDADE =
    100;

const GEOCODING_QUANTIDADE_MAXIMA_CIDADES =
    10;

const GEOCODING_MAXIMO_INTERPRETACOES =
    6;

const GEOCODING_MAXIMO_CONSULTAS_SIMULTANEAS =
    4;


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarCidadeGeocoding(
    cidade
) {
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


function normalizarParaComparacaoGeocoding(
    texto
) {
    if (
        typeof texto !== 'string'
    ) {
        return '';
    }

    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}


/* =========================================================
   TOKENIZAÇÃO
   ========================================================= */

function obterPalavrasGeocoding(
    texto
) {
    const normalizado =
        normalizarParaComparacaoGeocoding(
            texto
        );

    if (!normalizado) {
        return [];
    }

    return normalizado.split(' ');
}


/* =========================================================
   VALIDAÇÃO DA PESQUISA
   ========================================================= */

function validarCidadeGeocoding(
    cidade
) {
    const cidadeNormalizada =
        normalizarCidadeGeocoding(
            cidade
        );

    if (!cidadeNormalizada) {
        return {
            valida: false,
            mensagem:
                'Digite o nome de uma cidade.'
        };
    }

    if (
        cidadeNormalizada.length >
        GEOCODING_TAMANHO_MAXIMO_CIDADE
    ) {
        return {
            valida: false,
            mensagem:
                'O nome da cidade é muito longo.'
        };
    }

    const cidadeValida =
        /^[\p{L}\p{N}][\p{L}\p{N}\s.'’()-]*$/u.test(
            cidadeNormalizada
        );

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
   COMPARAÇÃO DE PALAVRAS
   ========================================================= */

function expressaoCompativelComNomeGeocoding(
    consulta,
    nome
) {
    const palavrasConsulta =
        obterPalavrasGeocoding(
            consulta
        );

    const palavrasNome =
        obterPalavrasGeocoding(
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
        let corresponde = true;

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
                corresponde = false;
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

function gerarInterpretacoesPesquisaGeocoding(
    cidade
) {
    const consulta =
        normalizarCidadeGeocoding(
            cidade
        );

    if (!consulta) {
        return [];
    }

    const palavras =
        consulta.split(' ');

    const interpretacoes = [];


    function adicionar(
        nomeCidade,
        regiao = ''
    ) {
        const chave =
            `${normalizarParaComparacaoGeocoding(
                nomeCidade
            )}|${normalizarParaComparacaoGeocoding(
                regiao
            )}`;

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
            GEOCODING_MAXIMO_INTERPRETACOES
        ) {
            return;
        }

        interpretacoes.push({
            cidade: nomeCidade,
            regiao,
            chave
        });
    }


    /*
       Primeira interpretação:

       "São Paulo"
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
       Interpretações adicionais:

       "São Paulo Brasil"

       pode ser interpretado como:

       cidade = São Paulo
       região = Brasil
    */

    const limite =
        Math.min(
            palavras.length - 1,
            GEOCODING_MAXIMO_INTERPRETACOES - 1
        );


    for (
        let quantidade = 1;
        quantidade <= limite;
        quantidade++
    ) {
        const cidadeOriginal =
            palavras
                .slice(
                    0,
                    palavras.length -
                        quantidade
                )
                .join(' ');

        const regiaoOriginal =
            palavras
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
   FETCH COM TIMEOUT
   ========================================================= */

async function requisicaoGeocodingComTimeout(
    url
) {
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            GEOCODING_TEMPO_LIMITE_REQUISICAO
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

                    /*
                       Reforço de privacidade: não envia a URL
                       completa da página (com a cidade pesquisada
                       na querystring) como Referer para a
                       Open-Meteo, apenas a origem.
                    */
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
                'A consulta de localização demorou mais que o esperado.'
            );
        }

        throw new Error(
            'Não foi possível estabelecer conexão com o serviço de localização.'
        );

    } finally {

        clearTimeout(
            timeout
        );
    }
}


/* =========================================================
   VALIDAÇÃO DE LOCALIZAÇÃO
   ========================================================= */

function numeroValidoGeocoding(
    valor
) {
    return (
        typeof valor === 'number' &&
        Number.isFinite(valor)
    );
}


function localizacaoValidaGeocoding(
    resultado
) {
    return Boolean(
        resultado &&
        typeof resultado === 'object' &&

        numeroValidoGeocoding(
            resultado.latitude
        ) &&

        numeroValidoGeocoding(
            resultado.longitude
        ) &&

        typeof resultado.name ===
            'string' &&

        resultado.name.trim().length > 0
    );
}


/* =========================================================
   CONSULTA DE GEOCODIFICAÇÃO
   ========================================================= */

async function consultarGeocodificacao(
    nome
) {
    const nomeNormalizado =
        normalizarCidadeGeocoding(
            nome
        );

    if (!nomeNormalizado) {
        return [];
    }


    const parametros =
        new URLSearchParams({

            name:
                nomeNormalizado,

            count:
                String(
                    GEOCODING_QUANTIDADE_MAXIMA_CIDADES
                ),

            language:
                'pt',

            format:
                'json'
        });


    const url =
        'https://geocoding-api.open-meteo.com/v1/search?' +
        parametros.toString();


    const resposta =
        await requisicaoGeocodingComTimeout(
            url
        );


    if (!resposta.ok) {
        throw new Error(
            'O serviço de localização não respondeu corretamente.'
        );
    }


    let localizacao;

    try {

        localizacao =
            await resposta.json();

    } catch (erro) {

        throw new Error(
            'O serviço de localização retornou uma resposta inválida.'
        );
    }


    if (
        !localizacao ||
        !Array.isArray(
            localizacao.results
        )
    ) {
        return [];
    }


    return localizacao.results.filter(
        localizacaoValidaGeocoding
    );
}


/* =========================================================
   VALIDAÇÃO DA INTERPRETAÇÃO
   ========================================================= */

function resultadoCompativelComInterpretacaoGeocoding(
    resultado,
    interpretacao
) {
    if (
        !localizacaoValidaGeocoding(
            resultado
        ) ||
        !interpretacao ||
        typeof interpretacao !==
            'object'
    ) {
        return false;
    }


    const nomeCidade =
        resultado.name;


    /*
       Quando não existe região,
       basta validar o nome da cidade.
    */

    if (
        !interpretacao.regiao
    ) {
        return expressaoCompativelComNomeGeocoding(
            interpretacao.cidade,
            nomeCidade
        );
    }


    /*
       Quando existe região,
       precisamos validar:

       cidade + região
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
        expressaoCompativelComNomeGeocoding(
            interpretacao.cidade,
            nomeCidade
        );


    if (!cidadeCompativel) {
        return false;
    }


    const regiaoNormalizada =
        normalizarParaComparacaoGeocoding(
            interpretacao.regiao
        );


    const regiaoApiNormalizada =
        normalizarParaComparacaoGeocoding(
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

function criarChaveLocalizacaoGeocoding(
    cidade
) {
    if (
        !localizacaoValidaGeocoding(
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

        normalizarParaComparacaoGeocoding(
            cidade.name
        ),

        normalizarParaComparacaoGeocoding(
            cidade.admin1 || ''
        ),

        normalizarParaComparacaoGeocoding(
            cidade.country || ''
        )

    ].join('|');
}


/* =========================================================
   REMOÇÃO DE DUPLICIDADES
   ========================================================= */

function removerDuplicidadesLocalizacaoGeocoding(
    cidades
) {
    if (!Array.isArray(cidades)) {
        return [];
    }


    const mapa =
        new Map();


    cidades.forEach(
        cidade => {

            const chave =
                criarChaveLocalizacaoGeocoding(
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

async function buscarLocalizacaoGeocoding(
    cidade,
    idRequisicao = null,
    obterIdRequisicaoAtual = null
) {
    const consulta =
        normalizarCidadeGeocoding(
            cidade
        );


    const validacao =
        validarCidadeGeocoding(
            consulta
        );


    if (!validacao.valida) {
        return [];
    }


    const interpretacoes =
        gerarInterpretacoesPesquisaGeocoding(
            consulta
        );


    if (
        interpretacoes.length === 0
    ) {
        return [];
    }


    const resultados = [];


    function requisicaoAindaValida() {

        if (
            typeof obterIdRequisicaoAtual !==
            'function'
        ) {
            return true;
        }


        return (
            idRequisicao ===
            obterIdRequisicaoAtual()
        );
    }


    /*
       As consultas são executadas
       em grupos para impedir
       requisições excessivas.
    */

    for (
        let inicio = 0;
        inicio < interpretacoes.length;
        inicio +=
            GEOCODING_MAXIMO_CONSULTAS_SIMULTANEAS
    ) {

        if (
            !requisicaoAindaValida()
        ) {
            return [];
        }


        const grupo =
            interpretacoes.slice(
                inicio,
                inicio +
                    GEOCODING_MAXIMO_CONSULTAS_SIMULTANEAS
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
            !requisicaoAindaValida()
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
                            resultadoCompativelComInterpretacaoGeocoding(
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
        !requisicaoAindaValida()
    ) {
        return [];
    }


    return removerDuplicidadesLocalizacaoGeocoding(
        resultados
    ).slice(
        0,
        GEOCODING_QUANTIDADE_MAXIMA_CIDADES
    );
}


/* =========================================================
   ALIAS COMPATÍVEL COM API.JS
   =========================================================

   O api.js trabalha com:

       buscarLocalizacao()

   O geocoding.js mantém internamente:

       buscarLocalizacaoGeocoding()

   Portanto, as duas funções apontam
   para a mesma implementação.

   ========================================================= */

const buscarLocalizacao =
    buscarLocalizacaoGeocoding;


/* =========================================================
   FUNÇÕES AUXILIARES PÚBLICAS
   ========================================================= */

function criarNomeLocalizacaoGeocoding(
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
    ]
        .filter(Boolean)
        .join(', ');
}


function criarDetalhesLocalizacaoGeocoding(
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
            cidade.country_code.toUpperCase()
        );
    }


    return partes.join(
        ' • '
    );
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

const GeocodingAPI = {

    normalizarCidadeGeocoding,

    normalizarParaComparacaoGeocoding,

    obterPalavrasGeocoding,

    validarCidadeGeocoding,

    expressaoCompativelComNomeGeocoding,

    gerarInterpretacoesPesquisaGeocoding,

    requisicaoGeocodingComTimeout,

    numeroValidoGeocoding,

    localizacaoValidaGeocoding,

    consultarGeocodificacao,

    resultadoCompativelComInterpretacaoGeocoding,

    criarChaveLocalizacaoGeocoding,

    removerDuplicidadesLocalizacaoGeocoding,

    buscarLocalizacaoGeocoding,

    /*
       Nome compatível com api.js
    */

    buscarLocalizacao,

    criarNomeLocalizacaoGeocoding,

    criarDetalhesLocalizacaoGeocoding
};


/* =========================================================
   API GLOBAL DO NAVEGADOR
   ========================================================= */

if (
    typeof window !== 'undefined'
) {

    window.GeocodingAPI =
        GeocodingAPI;


    /*
       Exposição individual para
       compatibilidade com outros
       módulos da aplicação.
    */

    window.normalizarCidadeGeocoding =
        normalizarCidadeGeocoding;

    window.normalizarParaComparacaoGeocoding =
        normalizarParaComparacaoGeocoding;

    window.obterPalavrasGeocoding =
        obterPalavrasGeocoding;

    window.validarCidadeGeocoding =
        validarCidadeGeocoding;

    window.expressaoCompativelComNomeGeocoding =
        expressaoCompativelComNomeGeocoding;

    window.gerarInterpretacoesPesquisaGeocoding =
        gerarInterpretacoesPesquisaGeocoding;

    window.requisicaoGeocodingComTimeout =
        requisicaoGeocodingComTimeout;

    window.numeroValidoGeocoding =
        numeroValidoGeocoding;

    window.localizacaoValidaGeocoding =
        localizacaoValidaGeocoding;

    window.consultarGeocodificacao =
        consultarGeocodificacao;

    window.resultadoCompativelComInterpretacaoGeocoding =
        resultadoCompativelComInterpretacaoGeocoding;

    window.criarChaveLocalizacaoGeocoding =
        criarChaveLocalizacaoGeocoding;

    window.removerDuplicidadesLocalizacaoGeocoding =
        removerDuplicidadesLocalizacaoGeocoding;

    window.buscarLocalizacaoGeocoding =
        buscarLocalizacaoGeocoding;

    /*
       Alias principal para api.js
    */

    window.buscarLocalizacao =
        buscarLocalizacao;

    window.criarNomeLocalizacaoGeocoding =
        criarNomeLocalizacaoGeocoding;

    window.criarDetalhesLocalizacaoGeocoding =
        criarDetalhesLocalizacaoGeocoding;
}


/* =========================================================
   EXPORTAÇÃO ES MODULE
   ========================================================= */

export {

    normalizarCidadeGeocoding,

    normalizarParaComparacaoGeocoding,

    obterPalavrasGeocoding,

    validarCidadeGeocoding,

    expressaoCompativelComNomeGeocoding,

    gerarInterpretacoesPesquisaGeocoding,

    requisicaoGeocodingComTimeout,

    numeroValidoGeocoding,

    localizacaoValidaGeocoding,

    consultarGeocodificacao,

    resultadoCompativelComInterpretacaoGeocoding,

    criarChaveLocalizacaoGeocoding,

    removerDuplicidadesLocalizacaoGeocoding,

    buscarLocalizacaoGeocoding,

    /*
       Exportação compatível com api.js
    */

    buscarLocalizacao,

    criarNomeLocalizacaoGeocoding,

    criarDetalhesLocalizacaoGeocoding,

    GeocodingAPI
};


/* =========================================================
   CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    'geocoding.js carregado com sucesso.'
);