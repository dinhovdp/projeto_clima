/* =========================================================
   WEATHER-CANVAS.JS
   =========================================================

   Responsabilidade única: desenhar as animações climáticas
   de fundo usando <canvas>, no mesmo espírito de um
   "matrix rain" — um loop de requestAnimationFrame,
   sem bibliotecas externas.

   Este módulo:

   - NÃO busca dados na API
   - NÃO decide qual é a condição climática
   - Apenas escuta o evento 'clima:condicao', disparado
     pelo background.js, e desenha o efeito correspondente

   Efeitos suportados:

   - limpo (dia)      -> sol suave com raios de luz
   - limpo (noite)    -> lua com fase real + estrelas
   - parcial          -> nuvens leves + sol/lua ao fundo
   - nublado          -> camadas de nuvem densas
   - chuva-leve       -> chuva fina, poucas gotas
   - chuva-forte      -> chuva densa, com respingos
   - tempestade       -> chuva forte + raios aleatórios
   - granizo          -> chuva + bolinhas de gelo saltando
   - neve             -> flocos em diferentes profundidades

   Sobreposição de vento:

   - Ativada quando windspeed >= LIMITE_VENTO, independente
     da categoria (mostra folhas/rajadas passando).

   Regras de acessibilidade:

   - Respeita prefers-reduced-motion (desenha só um quadro
     estático e para).
   - Só desenha no modo claro (o background.js envia
     ativo:false no modo escuro, e o canvas é limpo).

   ========================================================= */


/* =========================================================
   ELEMENTOS E CONTEXTO
   ========================================================= */

const WEATHER_CANVAS_LIMITE_VENTO = 30; // km/h

let canvas = null;
let ctx = null;
let largura = 0;
let altura = 0;
let quadroAnimacao = null;
let reducedMotion = false;

let estadoAtual = {
    ativo: false,
    categoria: 'limpo',
    ehNoite: false,
    faseDaLua: null,
    windspeed: null
};

/* Estruturas de partículas reaproveitadas entre frames */
let gotasChuva = [];
let flocosNeve = [];
let pedrasGranizo = [];
let particulasSplash = [];
let particulasVento = [];
let estrelas = [];
let proximoRaioEm = 0;
let flashRaio = 0; // 0..1, intensidade do flash atual


/* =========================================================
   CRIAÇÃO DO CANVAS
   ========================================================= */

function obterOuCriarCanvas() {
    let elemento = document.getElementById('weather-canvas');

    if (elemento) {
        return elemento;
    }

    const container =
        document.getElementById('day-background') ||
        document.body;

    elemento = document.createElement('canvas');
    elemento.id = 'weather-canvas';
    elemento.setAttribute('aria-hidden', 'true');

    container.appendChild(elemento);

    return elemento;
}


/* =========================================================
   REDIMENSIONAMENTO
   ========================================================= */

function redimensionarCanvas() {
    if (!canvas) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;

    largura = window.innerWidth;
    altura = window.innerHeight;

    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    canvas.style.width = largura + 'px';
    canvas.style.height = altura + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    inicializarParticulas();
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function aleatorio(min, max) {
    return min + Math.random() * (max - min);
}

function limitarQuantidade(base) {
    /*
       Em telas muito grandes ou muito pequenas,
       ajusta a densidade das partículas proporcionalmente.
    */
    const area = largura * altura;
    const referencia = 1920 * 1080;
    return Math.max(6, Math.round(base * (area / referencia)));
}


/* =========================================================
   INICIALIZAÇÃO DE PARTÍCULAS POR CATEGORIA
   ========================================================= */

function inicializarParticulas() {
    gotasChuva = [];
    flocosNeve = [];
    pedrasGranizo = [];
    particulasSplash = [];
    particulasVento = [];
    estrelas = [];

    const { categoria, ehNoite } = estadoAtual;

    if (ehNoite && (categoria === 'limpo' || categoria === 'parcial' || categoria === 'nublado')) {
        criarEstrelas();
    }

    if (categoria === 'chuva-leve') {
        criarChuva(limitarQuantidade(70), 3.5, 6.5);
    }

    if (categoria === 'chuva-forte' || categoria === 'tempestade') {
        criarChuva(limitarQuantidade(180), 7, 13);
    }

    if (categoria === 'granizo') {
        criarChuva(limitarQuantidade(120), 7, 12);
        criarGranizo(limitarQuantidade(40));
    }

    if (categoria === 'neve') {
        criarNeve(limitarQuantidade(90));
    }

    if (
        typeof estadoAtual.windspeed === 'number' &&
        estadoAtual.windspeed >= WEATHER_CANVAS_LIMITE_VENTO
    ) {
        criarVento(limitarQuantidade(18));
    }
}

function criarEstrelas() {
    const quantidade = limitarQuantidade(90);

    for (let i = 0; i < quantidade; i++) {
        estrelas.push({
            x: aleatorio(0, largura),
            y: aleatorio(0, altura * 0.65),
            raio: aleatorio(0.4, 1.6),
            fase: aleatorio(0, Math.PI * 2),
            velocidadeFase: aleatorio(0.01, 0.04)
        });
    }
}

function criarChuva(quantidade, velMin, velMax) {
    for (let i = 0; i < quantidade; i++) {
        gotasChuva.push({
            x: aleatorio(0, largura),
            y: aleatorio(-altura, altura),
            comprimento: aleatorio(10, 22),
            velocidade: aleatorio(velMin, velMax),
            inclinacao: aleatorio(0.18, 0.28),
            opacidade: aleatorio(0.25, 0.6)
        });
    }
}

function criarGranizo(quantidade) {
    for (let i = 0; i < quantidade; i++) {
        pedrasGranizo.push({
            x: aleatorio(0, largura),
            y: aleatorio(-altura, altura),
            raio: aleatorio(1.5, 3.2),
            velocidade: aleatorio(5, 8),
            inclinacao: aleatorio(0.1, 0.2),
            rotacao: aleatorio(0, Math.PI * 2)
        });
    }
}

function criarNeve(quantidade) {
    for (let i = 0; i < quantidade; i++) {
        const profundidade = aleatorio(0.3, 1);

        flocosNeve.push({
            x: aleatorio(0, largura),
            y: aleatorio(-altura, altura),
            raio: 1 + profundidade * 2.6,
            velocidade: 0.4 + profundidade * 1.6,
            deriva: aleatorio(-0.6, 0.6),
            anguloDeriva: aleatorio(0, Math.PI * 2),
            opacidade: 0.35 + profundidade * 0.55
        });
    }
}

function criarVento(quantidade) {
    for (let i = 0; i < quantidade; i++) {
        particulasVento.push({
            x: aleatorio(0, largura),
            y: aleatorio(0, altura),
            velocidade: aleatorio(3, 7),
            tamanho: aleatorio(4, 9),
            rotacao: aleatorio(0, Math.PI * 2),
            velocidadeRotacao: aleatorio(-0.15, 0.15),
            ondulacao: aleatorio(0, Math.PI * 2)
        });
    }
}


/* =========================================================
   DESENHO: CÉU / ASTROS
   ========================================================= */

function desenharEstrelas(tempo) {
    for (const estrela of estrelas) {
        const brilho =
            0.5 + 0.5 * Math.sin(estrela.fase + tempo * estrela.velocidadeFase);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.25 + brilho * 0.55})`;
        ctx.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
        ctx.fill();
    }
}

/*
   Desenha a lua com a fase informada (0..1), usando a técnica
   clássica de canvas: um disco base + uma "sombra" combinando
   um arco de círculo com um arco de elipse. É uma aproximação
   visual, não um cálculo astronômico exato de sombra.
*/
function desenharLua(x, y, raio, fase) {
    ctx.save();

    // brilho externo suave
    const halo = ctx.createRadialGradient(x, y, raio * 0.6, x, y, raio * 2.6);
    halo.addColorStop(0, 'rgba(245,240,222,0.35)');
    halo.addColorStop(1, 'rgba(245,240,222,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, raio * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.clip();

    // disco totalmente iluminado como base
    ctx.fillStyle = '#f5efe0';
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);

    // sombra: parte escura da lua
    const larguraSombra = Math.cos(fase * Math.PI * 2) * raio;

    ctx.fillStyle = 'rgba(22,28,48,0.92)';
    ctx.beginPath();

    if (fase <= 0.5) {
        // de nova para cheia: sombra encolhe do lado esquerdo
        ctx.ellipse(x, y, Math.abs(larguraSombra), raio, 0, Math.PI * 0.5, Math.PI * 1.5, larguraSombra < 0);
        ctx.arc(x, y, raio, Math.PI * 1.5, Math.PI * 0.5, false);
    } else {
        // de cheia para nova: sombra cresce do lado direito
        ctx.ellipse(x, y, Math.abs(larguraSombra), raio, 0, Math.PI * 1.5, Math.PI * 0.5, larguraSombra >= 0);
        ctx.arc(x, y, raio, Math.PI * 0.5, Math.PI * 1.5, false);
    }

    ctx.fill();

    // crateras discretas
    ctx.fillStyle = 'rgba(200,195,175,0.35)';
    ctx.beginPath();
    ctx.arc(x - raio * 0.3, y - raio * 0.15, raio * 0.12, 0, Math.PI * 2);
    ctx.arc(x + raio * 0.2, y + raio * 0.3, raio * 0.08, 0, Math.PI * 2);
    ctx.arc(x + raio * 0.05, y - raio * 0.35, raio * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function desenharSol(x, y, raio, tempo) {
    ctx.save();

    const halo = ctx.createRadialGradient(x, y, raio * 0.5, x, y, raio * 3);
    halo.addColorStop(0, 'rgba(255,225,120,0.55)');
    halo.addColorStop(1, 'rgba(255,225,120,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, raio * 3, 0, Math.PI * 2);
    ctx.fill();

    // raios girando bem devagar
    ctx.translate(x, y);
    ctx.rotate(tempo * 0.0003);
    ctx.strokeStyle = 'rgba(255,235,150,0.35)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 10; i++) {
        const angulo = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angulo) * raio * 1.15, Math.sin(angulo) * raio * 1.15);
        ctx.lineTo(Math.cos(angulo) * raio * 1.5, Math.sin(angulo) * raio * 1.5);
        ctx.stroke();
    }

    ctx.rotate(-tempo * 0.0003);
    ctx.translate(-x, -y);

    ctx.beginPath();
    ctx.fillStyle = '#fff3c4';
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function desenharAstro(tempo) {
    const x = largura * 0.82;
    const y = altura * 0.18;
    const raio = Math.min(largura, altura) * 0.055;

    if (estadoAtual.ehNoite) {
        desenharEstrelas(tempo);

        if (typeof estadoAtual.faseDaLua === 'number') {
            desenharLua(x, y, raio, estadoAtual.faseDaLua);
        }
    } else if (estadoAtual.categoria === 'limpo' || estadoAtual.categoria === 'parcial') {
        desenharSol(x, y, raio, tempo);
    }
}


/*
   As nuvens ambientes (parcial, nublado, e o pano de fundo
   de chuva/neve/tempestade) já são desenhadas por theme.css
   através de gradientes na camada .day-background-layer.
   O canvas não redesenha nuvens para não duplicar o efeito —
   ele foca no que precisa de movimento físico real: gotas,
   flocos, granizo, raios, astros e vento.
*/


/* =========================================================
   DESENHO: CHUVA
   ========================================================= */

function desenharChuva() {
    ctx.strokeStyle = estadoAtual.ehNoite
        ? 'rgba(190,210,230,0.55)'
        : 'rgba(210,230,245,0.65)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';

    for (const gota of gotasChuva) {
        gota.y += gota.velocidade;
        gota.x += gota.velocidade * gota.inclinacao;

        ctx.globalAlpha = gota.opacidade;
        ctx.beginPath();
        ctx.moveTo(gota.x, gota.y);
        ctx.lineTo(
            gota.x - gota.comprimento * gota.inclinacao,
            gota.y - gota.comprimento
        );
        ctx.stroke();

        if (gota.y > altura) {
            if (Math.random() < 0.3) {
                spawnSplash(gota.x, altura - aleatorio(0, 6));
            }
            gota.y = aleatorio(-40, 0);
            gota.x = aleatorio(0, largura);
        }
    }

    ctx.globalAlpha = 1;
}

function spawnSplash(x, y) {
    const n = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < n; i++) {
        const angulo = Math.PI + Math.random() * Math.PI;
        const velocidade = 0.6 + Math.random() * 1.4;

        particulasSplash.push({
            x,
            y,
            vx: Math.cos(angulo) * velocidade,
            vy: Math.sin(angulo) * velocidade * 0.6 - 0.6,
            vida: 1,
            decaimento: 0.05 + Math.random() * 0.05,
            tamanho: 1 + Math.random() * 1.6
        });
    }
}

function desenharSplashes() {
    for (let i = particulasSplash.length - 1; i >= 0; i--) {
        const p = particulasSplash[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vida -= p.decaimento;

        if (p.vida <= 0) {
            particulasSplash.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(220,235,245,${Math.max(0, p.vida * 0.8)})`;
        ctx.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
        ctx.fill();
    }
}


/* =========================================================
   DESENHO: GRANIZO
   ========================================================= */

function desenharGranizo() {
    ctx.fillStyle = 'rgba(235,245,250,0.85)';
    ctx.strokeStyle = 'rgba(170,200,215,0.6)';
    ctx.lineWidth = 0.6;

    for (const pedra of pedrasGranizo) {
        pedra.y += pedra.velocidade;
        pedra.x += pedra.velocidade * pedra.inclinacao;
        pedra.rotacao += 0.1;

        ctx.beginPath();
        ctx.arc(pedra.x, pedra.y, pedra.raio, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (pedra.y > altura) {
            if (Math.random() < 0.5) {
                spawnSplash(pedra.x, altura - aleatorio(0, 4));
            }
            pedra.y = aleatorio(-40, 0);
            pedra.x = aleatorio(0, largura);
        }
    }
}


/* =========================================================
   DESENHO: NEVE
   ========================================================= */

function desenharNeve(tempo) {
    ctx.fillStyle = '#ffffff';

    for (const floco of flocosNeve) {
        floco.y += floco.velocidade;
        floco.x += Math.sin(tempo * 0.001 + floco.anguloDeriva) * 0.4 + floco.deriva * 0.05;

        ctx.globalAlpha = floco.opacidade;
        ctx.beginPath();
        ctx.arc(floco.x, floco.y, floco.raio, 0, Math.PI * 2);
        ctx.fill();

        if (floco.y - floco.raio > altura) {
            floco.y = -10;
            floco.x = aleatorio(0, largura);
        }

        if (floco.x < -10) floco.x = largura + 10;
        if (floco.x > largura + 10) floco.x = -10;
    }

    ctx.globalAlpha = 1;
}


/* =========================================================
   DESENHO: RAIOS (TEMPESTADE / GRANIZO)
   ========================================================= */

function desenharRelampago() {
    if (flashRaio > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flashRaio * 0.55})`;
        ctx.fillRect(0, 0, largura, altura);
        flashRaio -= 0.06;
    }
}

function talvezDispararRaio(tempo) {
    if (tempo < proximoRaioEm) {
        return;
    }

    flashRaio = 1;

    // desenha o galho do raio
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(200,220,255,0.9)';
    ctx.shadowBlur = 12;

    let x = aleatorio(largura * 0.2, largura * 0.8);
    let y = 0;

    ctx.beginPath();
    ctx.moveTo(x, y);

    while (y < altura * 0.7) {
        x += aleatorio(-30, 30);
        y += aleatorio(20, 45);
        ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();

    proximoRaioEm = tempo + aleatorio(2500, 7000);
}


/* =========================================================
   DESENHO: VENTO (FOLHAS / RAJADAS)
   ========================================================= */

function desenharVento(tempo) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;

    // rajadas em linha, como no card de referência
    for (let i = 0; i < 4; i++) {
        const y = (altura / 5) * (i + 1) + Math.sin(tempo * 0.0006 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(0, y);

        for (let x = 0; x <= largura; x += 40) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + tempo * 0.002 + i) * 10);
        }

        ctx.stroke();
    }

    // folhas / detritos
    ctx.fillStyle = 'rgba(190,150,90,0.7)';

    for (const folha of particulasVento) {
        folha.x += folha.velocidade;
        folha.ondulacao += 0.08;
        folha.rotacao += folha.velocidadeRotacao;
        const yOscilante = folha.y + Math.sin(folha.ondulacao) * 12;

        ctx.save();
        ctx.translate(folha.x, yOscilante);
        ctx.rotate(folha.rotacao);
        ctx.beginPath();
        ctx.ellipse(0, 0, folha.tamanho, folha.tamanho * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (folha.x - 20 > largura) {
            folha.x = -20;
            folha.y = aleatorio(0, altura);
        }
    }
}


/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

function quadroAnimado(tempo) {
    ctx.clearRect(0, 0, largura, altura);

    const { categoria } = estadoAtual;

    if (categoria === 'limpo' || categoria === 'parcial' || categoria === 'nublado') {
        desenharAstro(tempo);
    }

    if (categoria === 'parcial') {
        // Nuvens ambiente já são desenhadas via CSS (theme.css).
    }

    if (categoria === 'nublado') {
        // Nuvens ambiente já são desenhadas via CSS (theme.css).
    }

    if (
        categoria === 'chuva-leve' ||
        categoria === 'chuva-forte' ||
        categoria === 'tempestade' ||
        categoria === 'granizo'
    ) {
        desenharChuva();
        desenharSplashes();
    }

    if (categoria === 'granizo') {
        desenharGranizo();
    }

    if (categoria === 'tempestade' || categoria === 'granizo') {
        talvezDispararRaio(tempo);
        desenharRelampago();
    }

    if (categoria === 'neve') {
        desenharNeve(tempo);
    }

    if (
        typeof estadoAtual.windspeed === 'number' &&
        estadoAtual.windspeed >= WEATHER_CANVAS_LIMITE_VENTO
    ) {
        desenharVento(tempo);
    }

    quadroAnimacao = requestAnimationFrame(quadroAnimado);
}


/* =========================================================
   CONTROLE DE ATIVAÇÃO
   ========================================================= */

function pararAnimacao() {
    if (quadroAnimacao) {
        cancelAnimationFrame(quadroAnimacao);
        quadroAnimacao = null;
    }

    if (ctx) {
        ctx.clearRect(0, 0, largura, altura);
    }
}

function iniciarAnimacao() {
    if (quadroAnimacao) {
        return;
    }

    if (reducedMotion) {
        // desenha um único quadro estático e não anima mais
        quadroAnimado(0);
        pararAnimacao();
        quadroAnimado(0);
        return;
    }

    quadroAnimacao = requestAnimationFrame(quadroAnimado);
}


/* =========================================================
   RECEBER EVENTO DO BACKGROUND.JS
   ========================================================= */

function aoReceberCondicao(evento) {
    if (!canvas || !ctx) {
        return;
    }

    const detalhe = evento.detail || {};

    estadoAtual = {
        ativo: !!detalhe.ativo,
        categoria: detalhe.categoria || 'limpo',
        ehNoite: !!detalhe.ehNoite,
        faseDaLua:
            typeof detalhe.faseDaLua === 'number'
                ? detalhe.faseDaLua
                : null,
        windspeed:
            typeof detalhe.windspeed === 'number'
                ? detalhe.windspeed
                : null
    };

    if (!estadoAtual.ativo) {
        pararAnimacao();
        canvas.classList.add('hidden');
        return;
    }

    canvas.classList.remove('hidden');
    inicializarParticulas();
    iniciarAnimacao();
}


/* =========================================================
   INICIALIZAÇÃO DO MÓDULO
   ========================================================= */

function inicializarWeatherCanvas() {
    canvas = obterOuCriarCanvas();
    ctx = canvas.getContext('2d');

    reducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    redimensionarCanvas();

    window.addEventListener('resize', redimensionarCanvas);
    window.addEventListener('clima:condicao', aoReceberCondicao);
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarWeatherCanvas, { once: true });
    } else {
        inicializarWeatherCanvas();
    }
}


/* =========================================================
   API PÚBLICA / EXPORTAÇÃO
   ========================================================= */

const WeatherCanvasAPI = {
    inicializar: inicializarWeatherCanvas,
    redimensionar: redimensionarCanvas
};

if (typeof window !== 'undefined') {
    window.WeatherCanvasAPI = WeatherCanvasAPI;
}

export { inicializarWeatherCanvas, WeatherCanvasAPI };

console.log('weather-canvas.js carregado com sucesso.');
