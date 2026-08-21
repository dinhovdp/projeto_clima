/* =========================================================
   COMPARAÇÃO DE CIDADES
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const LIMITE_COMPARACAO = 5;

const CHAVE_STORAGE_COMPARACAO =
    'clima_comparacoes';


/* =========================================================
   LISTA DE CIDADES COMPARADAS
   ========================================================= */

let cidadesComparadas = [];


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const comparisonSection =
    document.getElementById(
        'comparison-section'
    );


const comparisonContainer =
    document.getElementById(
        'comparison-container'
    );


const addComparisonButton =
    document.getElementById(
        'add-comparison'
    );


/* =========================================================
   NOTIFICAÇÃO
   ========================================================= */

function mostrarNotificacao(
    mensagem,
    tipo = 'sucesso'
) {

    const toast =
        document.getElementById(
            'weather-toast'
        );


    if (
        !toast
    ) {

        return;
    }


    toast.textContent =
        String(mensagem);


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


    requestAnimationFrame(
        () => {

            toast.classList.add(
                'show'
            );

        }
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    'show'
                );

            },
            3000
        );
}


/* =========================================================
   VALIDAÇÃO NUMÉRICA
   ========================================================= */

function numeroValido(
    valor
) {

    return Number.isFinite(
        Number(valor)
    );
}


/* =========================================================
   NORMALIZAÇÃO DE TEXTO
   ========================================================= */

function normalizarTexto(
    valor
) {

    if (
        typeof valor !== 'string'
    ) {

        return '';
    }


    return valor
        .trim()
        .replace(
            /\s+/g,
            ' '
        );
}


/* =========================================================
   CRIAÇÃO DO ID
   ========================================================= */

function criarIdCidade(
    latitude,
    longitude
) {

    return [
        Number(latitude).toFixed(6),
        Number(longitude).toFixed(6)
    ].join(',');
}


/* =========================================================
   VALIDAR CIDADE
   ========================================================= */

function validarCidadeComparacao(
    cidade
) {

    if (
        !cidade ||
        typeof cidade !== 'object'
    ) {

        return false;
    }


    if (
        !normalizarTexto(
            cidade.nome
        )
    ) {

        return false;
    }


    if (
        !numeroValido(
            cidade.latitude
        ) ||
        !numeroValido(
            cidade.longitude
        )
    ) {

        return false;
    }


    if (
        !numeroValido(
            cidade.temperatura
        )
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   CRIAR DADOS DA COMPARAÇÃO
   ========================================================= */

function criarDadosComparacao(
    cidadeEncontrada,
    climaAtual
) {

    if (
        !cidadeEncontrada ||
        !climaAtual
    ) {

        return null;
    }


    if (
        !numeroValido(
            cidadeEncontrada.latitude
        ) ||
        !numeroValido(
            cidadeEncontrada.longitude
        )
    ) {

        return null;
    }


    if (
        !numeroValido(
            climaAtual.temperature
        )
    ) {

        return null;
    }


    const latitude =
        Number(
            cidadeEncontrada.latitude
        );


    const longitude =
        Number(
            cidadeEncontrada.longitude
        );


    const nome =
        normalizarTexto(
            cidadeEncontrada.name
        );


    if (
        !nome
    ) {

        return null;
    }


    return {

        id:
            criarIdCidade(
                latitude,
                longitude
            ),

        nome:

            nome,

        pais:

            normalizarTexto(
                cidadeEncontrada.country
            ),

        latitude:

            latitude,

        longitude:

            longitude,

        temperatura:

            Number(
                climaAtual.temperature
            ),

        sensacao:

            numeroValido(
                climaAtual.apparent_temperature
            )
                ? Number(
                    climaAtual.apparent_temperature
                )
                : Number(
                    climaAtual.temperature
                ),

        umidade:

            numeroValido(
                climaAtual.relative_humidity_2m
            )
                ? Number(
                    climaAtual.relative_humidity_2m
                )
                : null,

        vento:

            numeroValido(
                climaAtual.windspeed
            )
                ? Number(
                    climaAtual.windspeed
                )
                : null,

        weathercode:

            Number.isInteger(
                Number(
                    climaAtual.weathercode
                )
            )
                ? Number(
                    climaAtual.weathercode
                )
                : null,

        is_day:

            climaAtual.is_day === 1

    };
}


/* =========================================================
   VALIDAR LISTA DE COMPARAÇÃO
   ========================================================= */

function validarListaComparacao(
    lista
) {

    if (
        !Array.isArray(
            lista
        )
    ) {

        return [];
    }


    const listaValida =
        lista
            .filter(
                validarCidadeComparacao
            )
            .slice(
                0,
                LIMITE_COMPARACAO
            );


    const cidadesUnicas =
        [];


    const ids =
        new Set();


    listaValida.forEach(
        cidade => {

            const id =
                cidade.id ||
                criarIdCidade(
                    cidade.latitude,
                    cidade.longitude
                );


            if (
                ids.has(id)
            ) {

                return;
            }


            ids.add(
                id
            );


            cidadesUnicas.push({

                ...cidade,

                id:

                    id

            });

        }
    );


    return cidadesUnicas;
}


/* =========================================================
   SALVAR COMPARAÇÕES
   ========================================================= */

function salvarComparacoes() {

    try {

        localStorage.setItem(

            CHAVE_STORAGE_COMPARACAO,

            JSON.stringify(
                cidadesComparadas
            )

        );

    } catch (
        erro
    ) {

        /*
         * O armazenamento local pode estar
         * bloqueado pelo navegador ou indisponível.
         *
         * A aplicação continua funcionando
         * normalmente sem persistência.
         */

        console.warn(
            'Não foi possível salvar as comparações localmente.',
            erro
        );
    }
}


/* =========================================================
   CARREGAR COMPARAÇÕES
   ========================================================= */

function carregarComparacoes() {

    try {

        const dados =
            localStorage.getItem(
                CHAVE_STORAGE_COMPARACAO
            );


        if (
            !dados
        ) {

            return [];
        }


        const lista =
            JSON.parse(
                dados
            );


        return validarListaComparacao(
            lista
        );

    } catch (
        erro
    ) {

        console.warn(
            'Não foi possível carregar as comparações salvas.',
            erro
        );


        try {

            localStorage.removeItem(
                CHAVE_STORAGE_COMPARACAO
            );

        } catch (
            erroStorage
        ) {

            console.warn(
                'Não foi possível limpar o armazenamento da comparação.',
                erroStorage
            );
        }


        return [];
    }
}


/* =========================================================
   ADICIONAR CIDADE
   ========================================================= */

function adicionarCidadeComparacao(
    cidadeEncontrada,
    climaAtual
) {

    if (
        cidadesComparadas.length >=
        LIMITE_COMPARACAO
    ) {

        mostrarNotificacao(
            'Você pode comparar no máximo 5 cidades.',
            'aviso'
        );


        atualizarEstadoBotao();


        return false;
    }


    const cidade =
        criarDadosComparacao(
            cidadeEncontrada,
            climaAtual
        );


    if (
        !cidade
    ) {

        mostrarNotificacao(
            'Os dados desta cidade não são válidos para comparação.',
            'erro'
        );


        return false;
    }


    const cidadeJaExiste =
        cidadesComparadas.some(
            item =>
                item.id ===
                cidade.id
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


    cidadesComparadas.push(
        cidade
    );


    salvarComparacoes();


    renderizarComparacoes();


    atualizarEstadoBotao();


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

    if (
        typeof id !== 'string'
    ) {

        return;
    }


    const cidadeRemovida =
        cidadesComparadas.find(
            cidade =>
                cidade.id ===
                id
        );


    const novaLista =
        cidadesComparadas.filter(
            cidade =>
                cidade.id !==
                id
        );


    if (
        novaLista.length ===
        cidadesComparadas.length
    ) {

        return;
    }


    cidadesComparadas =
        novaLista;


    salvarComparacoes();


    renderizarComparacoes();


    atualizarEstadoBotao();


    if (
        cidadeRemovida
    ) {

        mostrarNotificacao(
            `${cidadeRemovida.nome} removida da comparação.`
        );
    }
}


/* =========================================================
   CRIAR ELEMENTO
   ========================================================= */

function criarElementoComparacao(
    elemento,
    classe,
    texto
) {

    const novoElemento =
        document.createElement(
            elemento
        );


    if (
        classe
    ) {

        novoElemento.classList.add(
            classe
        );
    }


    novoElemento.textContent =
        String(
            texto ?? ''
        );


    return novoElemento;
}


/* =========================================================
   CRIAR DETALHE
   ========================================================= */

function criarDetalheComparacao(
    nome,
    valor
) {

    const detalhe =
        document.createElement(
            'div'
        );


    detalhe.classList.add(
        'comparison-detail'
    );


    const nomeElemento =
        criarElementoComparacao(
            'span',
            '',
            nome
        );


    const valorElemento =
        criarElementoComparacao(
            'strong',
            '',
            valor
        );


    detalhe.appendChild(
        nomeElemento
    );


    detalhe.appendChild(
        valorElemento
    );


    return detalhe;
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


    card.classList.add(
        'comparison-card'
    );


    card.setAttribute(
        'aria-label',
        `Comparação climática de ${cidade.nome}`
    );


    /* =====================================================
       BOTÃO REMOVER
       ===================================================== */

    const removeButton =
        document.createElement(
            'button'
        );


    removeButton.type =
        'button';


    removeButton.classList.add(
        'remove-comparison'
    );


    removeButton.setAttribute(
        'aria-label',
        `Remover ${cidade.nome} da comparação`
    );


    removeButton.title =
        'Remover cidade';


    removeButton.textContent =
        '×';


    removeButton.dataset.id =
        cidade.id;


    /* =====================================================
       CIDADE
       ===================================================== */

    const cityElement =
        document.createElement(
            'div'
        );


    cityElement.classList.add(
        'comparison-city'
    );


    cityElement.textContent =
        cidade.nome;


    if (
        cidade.pais
    ) {

        const countryElement =
            document.createElement(
                'small'
            );


        countryElement.textContent =
            cidade.pais;


        cityElement.appendChild(
            countryElement
        );
    }


    /* =====================================================
       DESCRIÇÃO
       ===================================================== */

    let descricao =
        'Condição desconhecida';


    if (
        typeof window.obterDescricaoClima ===
        'function'
    ) {

        descricao =
            window.obterDescricaoClima(
                cidade.weathercode
            );
    }


    /* =====================================================
       ÍCONE
       ===================================================== */

    let icone =
        '🌤️';


    if (
        typeof window.obterIconeClima ===
        'function'
    ) {

        icone =
            window.obterIconeClima(

                cidade.weathercode,

                cidade.is_day ? 1 : 0

            );
    }


    const iconElement =
        criarElementoComparacao(
            'div',
            'comparison-icon',
            icone
        );


    iconElement.setAttribute(
        'aria-hidden',
        'true'
    );


    /* =====================================================
       TEMPERATURA
       ===================================================== */

    const temperatura =
        criarElementoComparacao(

            'div',

            'comparison-temperature',

            `${Math.round(
                cidade.temperatura
            )}°C`

        );


    /* =====================================================
       DESCRIÇÃO
       ===================================================== */

    const descricaoElement =
        criarElementoComparacao(

            'div',

            'comparison-description',

            descricao

        );


    /* =====================================================
       DETALHES
       ===================================================== */

    const details =
        document.createElement(
            'div'
        );


    details.classList.add(
        'comparison-details'
    );


    const sensacao =
        numeroValido(
            cidade.sensacao
        )
            ? `${Math.round(
                cidade.sensacao
            )}°C`
            : '--';


    const umidade =
        numeroValido(
            cidade.umidade
        )
            ? `${Math.round(
                cidade.umidade
            )}%`
            : '--';


    const vento =
        numeroValido(
            cidade.vento
        )
            ? `${Math.round(
                cidade.vento
            )} km/h`
            : '--';


    details.appendChild(
        criarDetalheComparacao(
            'Sensação',
            sensacao
        )
    );


    details.appendChild(
        criarDetalheComparacao(
            'Umidade',
            umidade
        )
    );


    details.appendChild(
        criarDetalheComparacao(
            'Vento',
            vento
        )
    );


    /* =====================================================
       MONTAGEM
       ===================================================== */

    card.appendChild(
        removeButton
    );


    card.appendChild(
        cityElement
    );


    card.appendChild(
        iconElement
    );


    card.appendChild(
        temperatura
    );


    card.appendChild(
        descricaoElement
    );


    card.appendChild(
        details
    );


    return card;
}


/* =========================================================
   RENDERIZAR COMPARAÇÕES
   ========================================================= */

function renderizarComparacoes() {

    if (
        !comparisonContainer ||
        !comparisonSection
    ) {

        return;
    }


    comparisonContainer.replaceChildren();


    if (
        cidadesComparadas.length === 0
    ) {

        comparisonSection.classList.add(
            'hidden'
        );


        return;
    }


    comparisonSection.classList.remove(
        'hidden'
    );


    const fragment =
        document.createDocumentFragment();


    cidadesComparadas.forEach(
        cidade => {

            const card =
                criarCardComparacao(
                    cidade
                );


            fragment.appendChild(
                card
            );

        }
    );


    comparisonContainer.appendChild(
        fragment
    );
}


/* =========================================================
   EVENTO DE REMOÇÃO
   ========================================================= */

function configurarRemocaoComparacao() {

    if (
        !comparisonContainer
    ) {

        return;
    }


    comparisonContainer.addEventListener(
        'click',
        evento => {

            const botao =
                evento.target.closest(
                    '.remove-comparison'
                );


            if (
                !botao ||
                !comparisonContainer.contains(
                    botao
                )
            ) {

                return;
            }


            const id =
                botao.dataset.id;


            removerCidadeComparacao(
                id
            );
        }
    );
}


/* =========================================================
   ESTADO DO BOTÃO
   ========================================================= */

function atualizarEstadoBotao() {

    if (
        !addComparisonButton
    ) {

        return;
    }


    const limiteAtingido =
        cidadesComparadas.length >=
        LIMITE_COMPARACAO;


    addComparisonButton.disabled =
        limiteAtingido;


    if (
        limiteAtingido
    ) {

        addComparisonButton.setAttribute(
            'aria-label',
            'Limite de cinco cidades atingido'
        );

        addComparisonButton.title =
            'Limite de 5 cidades atingido';

    } else {

        addComparisonButton.removeAttribute(
            'aria-label'
        );

        addComparisonButton.removeAttribute(
            'title'
        );
    }
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

            if (
                cidadesComparadas.length >=
                LIMITE_COMPARACAO
            ) {

                mostrarNotificacao(
                    'Você pode comparar no máximo 5 cidades.',
                    'aviso'
                );


                return;
            }


            const cidadeAtual =
                window.cidadeAtualPesquisada;


            const climaAtual =
                window.climaAtualPesquisado;


            if (
                !cidadeAtual ||
                !climaAtual
            ) {

                mostrarNotificacao(
                    'Pesquise uma cidade antes de adicioná-la à comparação.',
                    'aviso'
                );


                return;
            }


            adicionarCidadeComparacao(

                cidadeAtual,

                climaAtual

            );
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarComparacao() {

    cidadesComparadas =
        carregarComparacoes();


    renderizarComparacoes();


    atualizarEstadoBotao();


    configurarRemocaoComparacao();


    configurarBotaoComparacao();


    console.log(
        'comparison.js carregado com sucesso.'
    );
}


inicializarComparacao();


/* =========================================================
   FUNÇÕES DISPONÍVEIS GLOBALMENTE
   ========================================================= */

window.adicionarCidadeComparacao =
    adicionarCidadeComparacao;


window.removerCidadeComparacao =
    removerCidadeComparacao;


window.renderizarComparacoes =
    renderizarComparacoes;