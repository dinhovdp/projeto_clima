/* =========================================================
   BACKGROUND.JS
   =========================================================

   Responsabilidades:

   - Definir fase do dia
   - Definir categoria climática visual (mais granular)
   - Calcular a fase da lua para o fundo noturno
   - Aplicar classes de fundo climático no <body>
   - Notificar o weather-canvas.js sobre mudanças
   - Controlar tema claro/escuro
   - Persistir preferência do tema
   - Atualizar elementos visuais do botão de tema

   Regra visual:

   - Modo claro:
       recebe os efeitos visuais de clima, horário e fase da lua.

   - Modo escuro:
       NÃO recebe os efeitos visuais climáticos.

   Este módulo não desenha nada sozinho: quem desenha as
   animações (chuva, neve, lua etc.) é o weather-canvas.js,
   que escuta o evento 'clima:condicao' disparado aqui.

   Compatibilidade:

   - Navegador / Live Server
   - GitHub Pages
   - ES Modules

   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const BACKGROUND_CHAVE_TEMA =
    'clima_api_tema';

/*
   Todas as classes climáticas possíveis no <body>.
   Precisam bater exatamente com o que backgrounds.css espera.
*/

const BACKGROUND_CLASSES_CLIMATICAS = [
    'clima-limpo',
    'clima-parcial',
    'clima-nublado',
    'clima-chuva-leve',
    'clima-chuva-forte',
    'clima-tempestade',
    'clima-granizo',
    'clima-neve'
];

const BACKGROUND_CLASSES_FASE_DIA = [
    'manha',
    'tarde',
    'noite',
    'madrugada'
];


/* =========================================================
   FASE DO DIA
   ========================================================= */

function definirFaseDoDiaBackground(
    dataHora
) {
    if (typeof dataHora !== 'string') {
        return null;
    }

    const correspondencia =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/.exec(dataHora);

    if (!correspondencia) {
        return null;
    }

    const hora = Number(correspondencia[4]);

    document.body.classList.remove(
        ...BACKGROUND_CLASSES_FASE_DIA
    );

    let fase = 'madrugada';

    if (hora >= 6 && hora < 12) {
        fase = 'manha';
    } else if (hora >= 12 && hora < 18) {
        fase = 'tarde';
    } else if (hora >= 18 && hora < 24) {
        fase = 'noite';
    }

    document.body.classList.add(fase);

    return fase;
}


/* =========================================================
   FASE DA LUA
   =========================================================

   Cálculo aproximado por ciclo sinódico (~29.53 dias),
   a partir de uma lua nova de referência conhecida
   (06/01/2000, 18:14 UTC).

   Retorna um valor de 0 a 1:

   0.00 -> lua nova
   0.25 -> quarto crescente
   0.50 -> lua cheia
   0.75 -> quarto minguante
   1.00 -> lua nova novamente

   ========================================================= */

const BACKGROUND_LUA_NOVA_REFERENCIA =
    Date.UTC(2000, 0, 6, 18, 14);

const BACKGROUND_CICLO_SINODICO_DIAS =
    29.53058867;

function calcularFaseDaLuaBackground(
    data = new Date()
) {
    const diasDesdeReferencia =
        (data.getTime() - BACKGROUND_LUA_NOVA_REFERENCIA) /
        86400000;

    let fase =
        (diasDesdeReferencia % BACKGROUND_CICLO_SINODICO_DIAS) /
        BACKGROUND_CICLO_SINODICO_DIAS;

    if (fase < 0) {
        fase += 1;
    }

    return fase;
}

function nomeFaseDaLuaBackground(
    fase
) {
    if (fase < 0.03 || fase > 0.97) return 'Lua nova';
    if (fase < 0.22) return 'Lua crescente';
    if (fase < 0.28) return 'Quarto crescente';
    if (fase < 0.47) return 'Lua gibosa crescente';
    if (fase < 0.53) return 'Lua cheia';
    if (fase < 0.72) return 'Lua gibosa minguante';
    if (fase < 0.78) return 'Quarto minguante';
    return 'Lua minguante';
}


/* =========================================================
   CATEGORIA CLIMÁTICA
   =========================================================

   Baseado nos códigos WMO retornados pela Open-Meteo.
   Mais granular que a versão anterior: distingue
   chuva leve de chuva forte, tempestade de granizo etc.

   ========================================================= */

function obterCategoriaClimaBackground(
    codigo
) {
    if (codigo === 0 || codigo === 1) {
        return 'limpo';
    }

    if (codigo === 2) {
        return 'parcial';
    }

    if (codigo === 3 || codigo === 45 || codigo === 48) {
        return 'nublado';
    }

    /* Garoa / chuva leve / pancadas leves */
    if ([51, 53, 55, 56, 57, 61, 80].includes(codigo)) {
        return 'chuva-leve';
    }

    /* Chuva moderada/forte e pancadas fortes */
    if ([63, 65, 81, 82].includes(codigo)) {
        return 'chuva-forte';
    }

    /* Neve */
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) {
        return 'neve';
    }

    /* Tempestade com granizo */
    if (codigo === 96 || codigo === 99) {
        return 'granizo';
    }

    /* Tempestade sem granizo */
    if (codigo === 95) {
        return 'tempestade';
    }

    return 'limpo';
}


/* =========================================================
   EVENTO PARA O WEATHER-CANVAS.JS
   ========================================================= */

function dispararEventoCondicaoBackground(
    detalhe
) {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent('clima:condicao', {
            detail: detalhe
        })
    );
}


/* =========================================================
   DEFINIR FUNDO CLIMÁTICO
   ========================================================= */

function definirClimaFundoBackground(
    codigo,
    extras = {}
) {
    document.body.classList.remove(
        ...BACKGROUND_CLASSES_CLIMATICAS
    );

    const modoEscuro =
        document.body.classList.contains('dark-mode');

    const categoria =
        obterCategoriaClimaBackground(codigo);

    const faseDoDia =
        BACKGROUND_CLASSES_FASE_DIA.find(
            classe => document.body.classList.contains(classe)
        ) || 'tarde';

    const ehNoite =
        typeof extras.isDay === 'number'
            ? extras.isDay === 0
            : (faseDoDia === 'noite' || faseDoDia === 'madrugada');

    const faseDaLua =
        ehNoite
            ? calcularFaseDaLuaBackground(new Date())
            : null;

    if (!modoEscuro) {
        document.body.classList.add(`clima-${categoria}`);
    }

    /*
       O evento é disparado mesmo no modo escuro, com
       ativo:false, para que o weather-canvas.js limpe
       qualquer animação em curso.
    */

    dispararEventoCondicaoBackground({
        ativo: !modoEscuro,
        categoria,
        codigo,
        faseDoDia,
        ehNoite,
        faseDaLua,
        nomeFaseDaLua:
            faseDaLua !== null
                ? nomeFaseDaLuaBackground(faseDaLua)
                : null,
        windspeed:
            typeof extras.windspeed === 'number'
                ? extras.windspeed
                : null
    });
}


/* =========================================================
   ATUALIZAR FUNDO DE ACORDO COM O TEMA
   ========================================================= */

function atualizarFundoComTemaBackground() {
    const codigo =
        document.body.dataset.weatherCode;

    if (codigo === undefined || codigo === '') {
        return;
    }

    definirClimaFundoBackground(
        Number(codigo),
        {
            windspeed:
                document.body.dataset.windspeed !== undefined
                    ? Number(document.body.dataset.windspeed)
                    : null,
            isDay:
                document.body.dataset.isDay !== undefined
                    ? Number(document.body.dataset.isDay)
                    : null
        }
    );
}


/* =========================================================
   APLICAR CONDIÇÃO CLIMÁTICA
   =========================================================

   extras aceita, opcionalmente:

   - windspeed: velocidade do vento (km/h)
   - isDay: 1 (dia) ou 0 (noite), vindo direto da API

   ========================================================= */

function aplicarCondicaoClimaticaBackground(
    codigo,
    dataHora,
    extras = {}
) {
    if (
        typeof codigo !== 'number' ||
        !Number.isFinite(codigo)
    ) {
        return;
    }

    /*
       Guarda o estado atual no DOM.

       Isso permite que uma simples troca de tema
       reaplique o estado visual sem nova requisição.
    */

    document.body.dataset.weatherCode = String(codigo);

    if (typeof extras.windspeed === 'number') {
        document.body.dataset.windspeed = String(extras.windspeed);
    }

    if (typeof extras.isDay === 'number') {
        document.body.dataset.isDay = String(extras.isDay);
    }

    if (dataHora) {
        definirFaseDoDiaBackground(dataHora);
    }

    definirClimaFundoBackground(codigo, extras);
}


/* =========================================================
   ELEMENTOS DO TEMA
   ========================================================= */

function obterElementosTemaBackground() {
    return {
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        themeText: document.getElementById('theme-text')
    };
}


/* =========================================================
   APLICAR TEMA
   ========================================================= */

function aplicarTemaBackground(
    tema
) {
    const { themeToggle, themeIcon, themeText } =
        obterElementosTemaBackground();

    const modoEscuro = tema === 'dark';

    document.body.classList.toggle('dark-mode', modoEscuro);

    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(modoEscuro));
    }

    if (themeIcon) {
        themeIcon.textContent = modoEscuro ? '☀️' : '🌙';
    }

    if (themeText) {
        themeText.textContent = modoEscuro ? 'Modo claro' : 'Modo escuro';
    }

    if (themeToggle && !themeIcon && !themeText) {
        themeToggle.textContent = modoEscuro ? '☀️ Modo claro' : '🌙 Modo escuro';
    }

    /*
       Se voltou para o modo escuro, os efeitos climáticos
       são removidos (o weather-canvas.js recebe ativo:false).

       Se voltou para o modo claro, o clima anteriormente
       pesquisado é reaplicado.
    */

    atualizarFundoComTemaBackground();
}


/* =========================================================
   OBTER TEMA INICIAL
   ========================================================= */

function obterTemaInicialBackground() {
    try {
        const temaSalvo =
            localStorage.getItem(BACKGROUND_CHAVE_TEMA);

        if (temaSalvo === 'dark' || temaSalvo === 'light') {
            return temaSalvo;
        }
    } catch (erro) {
        /* O funcionamento do tema não depende do localStorage. */
    }

    if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark';
    }

    return 'light';
}


/* =========================================================
   SALVAR TEMA
   ========================================================= */

function salvarTemaBackground(
    tema
) {
    try {
        localStorage.setItem(BACKGROUND_CHAVE_TEMA, tema);
    } catch (erro) {
        /* O tema continua funcionando mesmo sem armazenamento persistente. */
    }
}


/* =========================================================
   ALTERNAR TEMA
   ========================================================= */

function alternarTemaBackground() {
    const modoEscuro =
        document.body.classList.contains('dark-mode');

    const novoTema = modoEscuro ? 'light' : 'dark';

    aplicarTemaBackground(novoTema);
    salvarTemaBackground(novoTema);
}


/* =========================================================
   INICIALIZAÇÃO DO TEMA
   ========================================================= */

function inicializarTemaBackground() {
    const { themeToggle } = obterElementosTemaBackground();

    if (!themeToggle) {
        return;
    }

    if (themeToggle.dataset.themeInitialized === 'true') {
        return;
    }

    themeToggle.dataset.themeInitialized = 'true';

    themeToggle.addEventListener('click', alternarTemaBackground);

    aplicarTemaBackground(obterTemaInicialBackground());
}


/* =========================================================
   API PÚBLICA DO MÓDULO
   ========================================================= */

const BackgroundAPI = {
    definirFaseDoDia: definirFaseDoDiaBackground,
    obterCategoriaClima: obterCategoriaClimaBackground,
    calcularFaseDaLua: calcularFaseDaLuaBackground,
    nomeFaseDaLua: nomeFaseDaLuaBackground,
    definirClimaFundo: definirClimaFundoBackground,
    aplicarCondicaoClimatica: aplicarCondicaoClimaticaBackground,
    aplicarTema: aplicarTemaBackground,
    obterTemaInicial: obterTemaInicialBackground,
    salvarTema: salvarTemaBackground,
    alternarTema: alternarTemaBackground,
    inicializarTema: inicializarTemaBackground
};


/* =========================================================
   API GLOBAL DO NAVEGADOR
   ========================================================= */

if (typeof window !== 'undefined') {
    window.BackgroundAPI = BackgroundAPI;
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            inicializarTemaBackground,
            { once: true }
        );
    } else {
        inicializarTemaBackground();
    }
}


/* =========================================================
   EXPORTAÇÕES ES MODULE
   ========================================================= */

export {
    definirFaseDoDiaBackground,
    obterCategoriaClimaBackground,
    calcularFaseDaLuaBackground,
    nomeFaseDaLuaBackground,
    definirClimaFundoBackground,
    atualizarFundoComTemaBackground,
    aplicarCondicaoClimaticaBackground,
    obterElementosTemaBackground,
    aplicarTemaBackground,
    obterTemaInicialBackground,
    salvarTemaBackground,
    alternarTemaBackground,
    inicializarTemaBackground,
    BackgroundAPI
};


console.log('background.js carregado com sucesso.');
