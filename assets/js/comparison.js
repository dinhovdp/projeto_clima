/* =========================
   COMPARAÇÃO DE CIDADES
   ========================= */


/* =========================
   ELEMENTOS DA INTERFACE
   ========================= */

const comparisonSection =
    document.getElementById(
        'comparison-section'
    );


const comparisonContainer =
    document.getElementById(
        'comparison-container'
    );


/* =========================
   LISTA DE CIDADES
   ========================= */

let cidadesComparacao = [];


/* =========================
   LIMITE
   ========================= */

const LIMITE_CIDADES = 5;


/* =========================
   ADICIONAR CIDADE
   ========================= */

function adicionarClimaAtualNaComparacao() {

    /*
       Verifica se existe uma cidade
       atualmente pesquisada.
    */

    if (!climaAtualPesquisado) {

        alert(
            'Pesquise uma cidade antes de adicioná-la à comparação.'
        );

        return;
    }


    const cidade =
        climaAtualPesquisado.cidade;


    const clima =
        climaAtualPesquisado.clima;


    /*
       Verifica se a cidade já está
       na comparação.
    */

    const cidadeJaExiste =
        cidadesComparacao.some(
            item =>
                item.cidade.name
                    .toLowerCase() ===
                cidade.name
                    .toLowerCase()
        );


    if (cidadeJaExiste) {

        alert(
            'Essa cidade já está na comparação.'
        );

        return;
    }


    /*
       Verifica o limite de 5 cidades.
    */

    if (
        cidadesComparacao.length >=
        LIMITE_CIDADES
    ) {

        alert(
            'Você pode comparar no máximo 5 cidades.'
        );

        return;
    }


    /*
       Adiciona a cidade.
    */

    cidadesComparacao.push({

        cidade: cidade,

        clima: clima

    });


    /*
       Atualiza a interface.
    */

    exibirComparacao();

}


/* =========================
   CRIAR CARD
   ========================= */

function criarCardComparacao(
    item,
    indice
) {

    const card =
        document.createElement(
            'article'
        );


    card.classList.add(
        'comparison-card'
    );


    const cidade =
        item.cidade;


    const clima =
        item.clima;


    const descricao =
        obterDescricaoClima(
            clima.weathercode
        );


    const icone =
        obterIconeClima(
            clima.weathercode,
            clima.is_day
        );


    card.innerHTML = `

        <div class="comparison-header">

            <h3
                title="${cidade.name}"
            >
                ${cidade.name}
            </h3>

            <button
                type="button"
                class="remove-comparison"
                data-index="${indice}"
                title="Remover cidade"
                aria-label="Remover ${cidade.name}"
            >
                ×
            </button>

        </div>


        <div class="comparison-icon">
            ${icone}
        </div>


        <div class="comparison-temperature">
            ${clima.temperature}°C
        </div>


        <div class="comparison-description">
            ${descricao}
        </div>


        <div class="comparison-details">

            <div class="comparison-detail">

                <span>
                    Vento
                </span>

                <strong>
                    ${clima.windspeed} km/h
                </strong>

            </div>


            <div class="comparison-detail">

                <span>
                    Direção
                </span>

                <strong>
                    ${clima.winddirection}°
                </strong>

            </div>

        </div>

    `;


    /*
       Botão de remover.
    */

    const removeButton =
        card.querySelector(
            '.remove-comparison'
        );


    removeButton.addEventListener(
        'click',
        () => {

            removerDaComparacao(
                indice
            );

        }
    );


    return card;
}


/* =========================
   EXIBIR COMPARAÇÃO
   ========================= */

function exibirComparacao() {

    comparisonContainer.innerHTML = '';


    /*
       Se não houver cidades,
       esconde a seção.
    */

    if (
        cidadesComparacao.length === 0
    ) {

        comparisonSection.classList.add(
            'hidden'
        );

        return;
    }


    /*
       Cria os cards.
    */

    cidadesComparacao.forEach(
        (
            item,
            indice
        ) => {

            const card =
                criarCardComparacao(
                    item,
                    indice
                );


            comparisonContainer.appendChild(
                card
            );

        }
    );


    comparisonSection.classList.remove(
        'hidden'
    );
}


/* =========================
   REMOVER CIDADE
   ========================= */

function removerDaComparacao(
    indice
) {

    cidadesComparacao.splice(
        indice,
        1
    );


    exibirComparacao();

}


/* =========================
   LIMPAR COMPARAÇÃO
   ========================= */

function limparComparacao() {

    cidadesComparacao = [];


    exibirComparacao();

}