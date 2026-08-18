/* =========================================================
   COMPARAÇÃO DE CIDADES
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const LIMITE_COMPARACAO = 5;


/* =========================================================
   LISTA DE CIDADES COMPARADAS
   ========================================================= */

let cidadesComparadas = [];


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

let comparisonSection =
    document.getElementById(
        'comparison-section'
    );


let comparisonContainer =
    document.getElementById(
        'comparison-container'
    );


let addComparisonButton =
    document.getElementById(
        'add-comparison'
    );


/* =========================================================
   CRIAÇÃO DA ÁREA DE COMPARAÇÃO
   ========================================================= */

/*
   Caso o index.html ainda não possua
   a estrutura de comparação, o JavaScript
   cria automaticamente.

   Isso evita que a aplicação quebre
   durante a transição da estrutura antiga
   para a nova.
*/

function garantirEstruturaComparacao() {

    if (
        !comparisonSection
    ) {

        comparisonSection =
            document.createElement(
                'section'
            );


        comparisonSection.id =
            'comparison-section';


        comparisonSection.className =
            'comparison-section hidden';


        comparisonSection.innerHTML = `

            <div class="comparison-header">

                <h2>
                    Comparação de cidades
                </h2>

            </div>

            <div
                id="comparison-container"
                class="comparison-container"
            ></div>

        `;


        const weatherResult =
            document.getElementById(
                'weather-result'
            );


        if (weatherResult) {

            weatherResult.appendChild(
                comparisonSection
            );

        } else {

            document.body.appendChild(
                comparisonSection
            );
        }
    }


    comparisonContainer =
        document.getElementById(
            'comparison-container'
        );


    /*
       Procura novamente o botão caso
       ele já exista no HTML.
    */

    addComparisonButton =
        document.getElementById(
            'add-comparison'
        );
}


garantirEstruturaComparacao();


/* =========================================================
   NOTIFICAÇÃO
   ========================================================= */

function mostrarNotificacao(
    mensagem,
    tipo = 'sucesso'
) {

    let toast =
        document.getElementById(
            'weather-toast'
        );


    /*
       Cria o elemento caso ainda
       não exista no index.html.
    */

    if (!toast) {

        toast =
            document.createElement(
                'div'
            );


        toast.id =
            'weather-toast';


        toast.className =
            'weather-toast';


        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        mensagem;


    toast.classList.remove(
        'error',
        'warning',
        'show'
    );


    if (
        tipo === 'erro'
    ) {

        toast.classList.add(
            'error'
        );

    } else if (
        tipo === 'aviso'
    ) {

        toast.classList.add(
            'warning'
        );
    }


    /*
       Força a animação de entrada.
    */

    requestAnimationFrame(() => {

        toast.classList.add(
            'show'
        );

    });


    /*
       Remove a notificação
       depois de 3 segundos.
    */

    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(() => {

            toast.classList.remove(
                'show'
            );

        }, 3000);
}


/* =========================================================
   OBTER DADOS DA CIDADE ATUAL
   ========================================================= */

/*
   Esta função recebe:

   cidadeEncontrada
   climaAtual

   e transforma os dados no formato
   usado pelos cards de comparação.
*/

function criarDadosComparacao(
    cidadeEncontrada,
    climaAtual
) {

    return {

        id:
            `${cidadeEncontrada.latitude},${cidadeEncontrada.longitude}`,

        nome:
            cidadeEncontrada.name,

        pais:
            cidadeEncontrada.country || '',

        latitude:
            cidadeEncontrada.latitude,

        longitude:
            cidadeEncontrada.longitude,

        temperatura:
            climaAtual.temperature,

        sensacao:
            climaAtual.apparent_temperature ??
            climaAtual.temperature,

        umidade:
            climaAtual.relative_humidity_2m ??
            null,

        vento:
            climaAtual.windspeed ??
            0,

        weathercode:
            climaAtual.weathercode,

        is_day:
            climaAtual.is_day
    };
}


/* =========================================================
   ADICIONAR CIDADE
   ========================================================= */

function adicionarCidadeComparacao(
    cidadeEncontrada,
    climaAtual
) {

    if (
        !cidadeEncontrada ||
        !climaAtual
    ) {

        mostrarNotificacao(
            'Não foi possível adicionar esta cidade.',
            'erro'
        );

        return false;
    }


    const cidade =
        criarDadosComparacao(
            cidadeEncontrada,
            climaAtual
        );


    /* =====================================================
       VERIFICA CIDADE DUPLICADA
       ===================================================== */

    const cidadeJaExiste =
        cidadesComparadas.some(
            item =>
                item.id === cidade.id
        );


    if (
        cidadeJaExiste
    ) {

        mostrarNotificacao(
            `${cidade.nome} já está na comparação.`,
            'aviso'
        );

        return false;
    }


    /* =====================================================
       VERIFICA LIMITE
       ===================================================== */

    if (
        cidadesComparadas.length >=
        LIMITE_COMPARACAO
    ) {

        mostrarNotificacao(
            'Você pode comparar no máximo 5 cidades.',
            'aviso'
        );

        return false;
    }


    /* =====================================================
       ADICIONA
       ===================================================== */

    cidadesComparadas.push(
        cidade
    );


    renderizarComparacoes();


    mostrarNotificacao(
        `${cidade.nome} adicionada com sucesso!`
    );


    return true;
}


/* =========================================================
   REMOVER CIDADE
   ========================================================= */

function removerCidadeComparacao(
    id
) {

    const cidadeRemovida =
        cidadesComparadas.find(
            cidade =>
                cidade.id === id
        );


    cidadesComparadas =
        cidadesComparadas.filter(
            cidade =>
                cidade.id !== id
        );


    renderizarComparacoes();


    if (
        cidadeRemovida
    ) {

        mostrarNotificacao(
            `${cidadeRemovida.nome} removida da comparação.`
        );
    }
}


/* =========================================================
   RENDERIZAR COMPARAÇÕES
   ========================================================= */

function renderizarComparacoes() {

    if (
        !comparisonContainer
    ) {

        return;
    }


    comparisonContainer.innerHTML =
        '';


    /*
       Não existem cidades.
    */

    if (
        cidadesComparadas.length === 0
    ) {

        if (
            comparisonSection
        ) {

            comparisonSection.classList.add(
                'hidden'
            );
        }


        return;
    }


    /*
       Existem cidades.
    */

    if (
        comparisonSection
    ) {

        comparisonSection.classList.remove(
            'hidden'
        );
    }


    cidadesComparadas.forEach(
        cidade => {

            const card =
                criarCardComparacao(
                    cidade
                );


            comparisonContainer.appendChild(
                card
            );

        }
    );
}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardComparacao(
    cidade
) {

    const card =
        document.createElement(
            'article'
        );


    card.className =
        'comparison-card';


    /*
       Descrição do clima.

       A função pertence ao api.js.
    */

    let descricao =
        'Condição desconhecida';


    if (
        typeof obterDescricaoClima ===
        'function'
    ) {

        descricao =
            obterDescricaoClima(
                cidade.weathercode
            );
    }


    /*
       Ícone.

       Também aproveita a função
       existente no api.js.
    */

    let icone =
        '🌤️';


    if (
        typeof obterIconeClima ===
        'function'
    ) {

        icone =
            obterIconeClima(
                cidade.weathercode,
                cidade.is_day
            );
    }


    /*
       Umidade.

       Caso a API não tenha retornado,
       mostramos "--".
    */

    const umidade =
        cidade.umidade !== null &&
        cidade.umidade !== undefined
            ? `${cidade.umidade}%`
            : '--';


    /*
       Sensação térmica.
    */

    const sensacao =
        cidade.sensacao !== null &&
        cidade.sensacao !== undefined
            ? `${cidade.sensacao}°C`
            : '--';


    /*
       Velocidade do vento.
    */

    const vento =
        cidade.vento !== null &&
        cidade.vento !== undefined
            ? `${cidade.vento} km/h`
            : '--';


    card.innerHTML = `

        <button
            type="button"
            class="remove-comparison"
            data-id="${cidade.id}"
            aria-label="Remover ${cidade.nome}"
            title="Remover cidade"
        >
            ×
        </button>


        <div class="comparison-city">

            ${cidade.nome}

            ${
                cidade.pais
                    ? `<small>${cidade.pais}</small>`
                    : ''
            }

        </div>


        <div class="comparison-icon">

            ${icone}

        </div>


        <div class="comparison-temperature">

            ${cidade.temperatura}°C

        </div>


        <div class="comparison-description">

            ${descricao}

        </div>


        <div class="comparison-details">

            <div class="comparison-detail">

                <span>
                    Sensação
                </span>

                <strong>
                    ${sensacao}
                </strong>

            </div>


            <div class="comparison-detail">

                <span>
                    Umidade
                </span>

                <strong>
                    ${umidade}
                </strong>

            </div>


            <div class="comparison-detail">

                <span>
                    Vento
                </span>

                <strong>
                    ${vento}
                </strong>

            </div>

        </div>

    `;


    /*
       Evento para remover.
    */

    const removeButton =
        card.querySelector(
            '.remove-comparison'
        );


    removeButton.addEventListener(
        'click',
        () => {

            removerCidadeComparacao(
                cidade.id
            );

        }
    );


    return card;
}


/* =========================================================
   BOTÃO DE ADICIONAR
   ========================================================= */

function configurarBotaoComparacao() {

    if (
        !addComparisonButton
    ) {

        return;
    }


    addComparisonButton.addEventListener(
        'click',
        () => {

            /*
               Procura os dados da última
               cidade pesquisada.

               Essas variáveis serão
               disponibilizadas pelo api.js.
            */

            if (
                typeof window.cidadeAtualPesquisada ===
                'undefined' ||
                typeof window.climaAtualPesquisado ===
                'undefined'
            ) {

                mostrarNotificacao(
                    'Pesquise uma cidade antes de adicionar à comparação.',
                    'aviso'
                );

                return;
            }


            adicionarCidadeComparacao(

                window.cidadeAtualPesquisada,

                window.climaAtualPesquisado

            );

        }
    );
}


configurarBotaoComparacao();


/* =========================================================
   FUNÇÕES PÚBLICAS
   ========================================================= */

/*
   Disponibiliza a função para
   outros arquivos JavaScript.
*/

window.adicionarCidadeComparacao =
    adicionarCidadeComparacao;


window.removerCidadeComparacao =
    removerCidadeComparacao;


window.renderizarComparacoes =
    renderizarComparacoes;


/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    'comparison.js carregado.'
);