/* =========================================================
   CACHE.JS
   =========================================================

   Responsabilidades:

   - Criar chaves únicas de cache
   - Salvar dados meteorológicos
   - Recuperar dados meteorológicos
   - Validar cache
   - Expirar dados antigos
   - Controlar versão do cache
   - Evitar requisições desnecessárias

   Este módulo não manipula a interface.

   Compatibilidade:

   - Navegador / Live Server
   - GitHub Pages
   - ES Modules

   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CACHE_TEMPO =
    10 * 60 * 1000;

const CACHE_VERSAO =
    4;

const CACHE_PREFIXO =
    'clima_api_cache_';


/* =========================================================
   VALIDAÇÃO NUMÉRICA
   ========================================================= */

function numeroValidoCache(
    valor
) {
    return (
        typeof valor === 'number' &&
        Number.isFinite(valor)
    );
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarCidadeCache(
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


/* =========================================================
   CHAVE DO CACHE
   ========================================================= */

function criarChaveCache(
    cidade,
    latitude,
    longitude
) {
    const cidadeNormalizada =
        normalizarCidadeCache(
            cidade
        ).toLowerCase();

    const latitudeNormalizada =
        Number(latitude).toFixed(4);

    const longitudeNormalizada =
        Number(longitude).toFixed(4);

    return (
        `${CACHE_PREFIXO}` +
        `${encodeURIComponent(
            cidadeNormalizada
        )}_` +
        `${latitudeNormalizada}_` +
        `${longitudeNormalizada}`
    );
}


/* =========================================================
   VALIDAÇÃO DA ESTRUTURA DO CACHE
   ========================================================= */

function cachePossuiDadosValidos(
    dados
) {
    if (
        !dados ||
        typeof dados !== 'object'
    ) {
        return false;
    }

    if (
        !dados.cidadeEncontrada ||
        !dados.climaAtual
    ) {
        return false;
    }

    const cidade =
        dados.cidadeEncontrada;

    const clima =
        dados.climaAtual;

    if (
        !numeroValidoCache(
            cidade.latitude
        ) ||
        !numeroValidoCache(
            cidade.longitude
        )
    ) {
        return false;
    }

    return (
        typeof clima.time ===
            'string' &&

        numeroValidoCache(
            clima.temperature
        ) &&

        numeroValidoCache(
            clima.apparent_temperature
        ) &&

        numeroValidoCache(
            clima.relative_humidity_2m
        ) &&

        numeroValidoCache(
            clima.weathercode
        ) &&

        numeroValidoCache(
            clima.windspeed
        ) &&

        numeroValidoCache(
            clima.is_day
        )
    );
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
        !dados ||
        !dados.cidadeEncontrada
    ) {
        return false;
    }

    const latitude =
        dados.cidadeEncontrada.latitude;

    const longitude =
        dados.cidadeEncontrada.longitude;

    if (
        !numeroValidoCache(
            latitude
        ) ||
        !numeroValidoCache(
            longitude
        )
    ) {
        return false;
    }

    const cache = {

        versao:
            CACHE_VERSAO,

        cidade:
            normalizarCidadeCache(
                cidade
            ),

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

        return true;

    } catch (erro) {

        console.warn(
            'Não foi possível salvar o cache local.'
        );

        return false;
    }
}


/* =========================================================
   OBTER CACHE
   ========================================================= */

function obterCache(
    cidade,
    latitude,
    longitude
) {
    if (
        !numeroValidoCache(
            latitude
        ) ||
        !numeroValidoCache(
            longitude
        )
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


        /*
           Cache de uma versão incompatível
           não deve ser reutilizado.
        */

        if (
            cache.versao !==
            CACHE_VERSAO
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


        if (
            !cachePossuiDadosValidos(
                cache.dados
            )
        ) {

            localStorage.removeItem(
                chave
            );

            return null;
        }


        return cache.dados;

    } catch (erro) {

        try {

            localStorage.removeItem(
                chave
            );

        } catch (erroRemocao) {

            /*
               O armazenamento pode estar indisponível.
            */
        }

        return null;
    }
}


/* =========================================================
   VERIFICAR SE O CACHE POSSUI CLIMA ATUAL VÁLIDO
   ========================================================= */

function cachePossuiDadosNovos(
    dados
) {
    return cachePossuiDadosValidos(
        dados
    );
}


/* =========================================================
   REMOVER CACHE ESPECÍFICO
   ========================================================= */

function removerCache(
    cidade,
    latitude,
    longitude
) {
    if (
        !numeroValidoCache(
            latitude
        ) ||
        !numeroValidoCache(
            longitude
        )
    ) {
        return false;
    }

    try {

        localStorage.removeItem(

            criarChaveCache(
                cidade,
                latitude,
                longitude
            )
        );

        return true;

    } catch (erro) {

        return false;
    }
}


/* =========================================================
   EXPORTAÇÕES ES MODULE
   ========================================================= */

export {

    CACHE_TEMPO,

    CACHE_VERSAO,

    criarChaveCache,

    salvarCache,

    obterCache,

    removerCache,

    cachePossuiDadosValidos,

    cachePossuiDadosNovos
};


/* =========================================================
   CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    'cache.js carregado com sucesso.'
);