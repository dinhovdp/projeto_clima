/**
 * Testes de background.js
 *
 * Cobrem principalmente as funções puras (categoria climática e
 * cálculo da fase da lua) e, com um stub leve de `document`/
 * `window`, o comportamento de aplicar/remover classes de clima
 * no <body> — sem precisar da dependência extra do jsdom.
 */

function criarClassListMock(inicial = new Set()) {
    const classes = new Set(inicial);

    return {
        add: (...novas) => novas.forEach((c) => classes.add(c)),
        remove: (...antigas) => antigas.forEach((c) => classes.delete(c)),
        contains: (c) => classes.has(c),
        toggle: (c, forcar) => {
            const deveTer = forcar !== undefined ? forcar : !classes.has(c);
            if (deveTer) classes.add(c);
            else classes.delete(c);
            return deveTer;
        },
        _classes: classes
    };
}

function instalarDomStub() {
    const body = {
        classList: criarClassListMock(),
        dataset: {}
    };

    global.document = {
        body,
        readyState: 'complete',
        addEventListener: jest.fn(),
        getElementById: jest.fn(() => null)
    };

    global.window = {
        dispatchEvent: jest.fn(),
        addEventListener: jest.fn(),
        matchMedia: jest.fn(() => ({ matches: false }))
    };

    return body;
}

beforeEach(() => {
    instalarDomStub();
    jest.resetModules();
});

describe('background.js', () => {

    describe('obterCategoriaClimaBackground', () => {

        test('classifica céu limpo e parcialmente nublado', async () => {
            const { obterCategoriaClimaBackground } = await import('../assets/js/background.js');

            expect(obterCategoriaClimaBackground(0)).toBe('limpo');
            expect(obterCategoriaClimaBackground(1)).toBe('limpo');
            expect(obterCategoriaClimaBackground(2)).toBe('parcial');
        });

        test('classifica nublado/neblina', async () => {
            const { obterCategoriaClimaBackground } = await import('../assets/js/background.js');

            expect(obterCategoriaClimaBackground(3)).toBe('nublado');
            expect(obterCategoriaClimaBackground(45)).toBe('nublado');
            expect(obterCategoriaClimaBackground(48)).toBe('nublado');
        });

        test('distingue chuva leve de chuva forte', async () => {
            const { obterCategoriaClimaBackground } = await import('../assets/js/background.js');

            expect(obterCategoriaClimaBackground(51)).toBe('chuva-leve');
            expect(obterCategoriaClimaBackground(61)).toBe('chuva-leve');
            expect(obterCategoriaClimaBackground(80)).toBe('chuva-leve');

            expect(obterCategoriaClimaBackground(63)).toBe('chuva-forte');
            expect(obterCategoriaClimaBackground(65)).toBe('chuva-forte');
            expect(obterCategoriaClimaBackground(82)).toBe('chuva-forte');
        });

        test('classifica neve', async () => {
            const { obterCategoriaClimaBackground } = await import('../assets/js/background.js');

            expect(obterCategoriaClimaBackground(71)).toBe('neve');
            expect(obterCategoriaClimaBackground(75)).toBe('neve');
            expect(obterCategoriaClimaBackground(85)).toBe('neve');
        });

        test('distingue tempestade simples de tempestade com granizo', async () => {
            const { obterCategoriaClimaBackground } = await import('../assets/js/background.js');

            expect(obterCategoriaClimaBackground(95)).toBe('tempestade');
            expect(obterCategoriaClimaBackground(96)).toBe('granizo');
            expect(obterCategoriaClimaBackground(99)).toBe('granizo');
        });

    });


    describe('calcularFaseDaLuaBackground / nomeFaseDaLuaBackground', () => {

        test('a fase da lua está sempre entre 0 e 1', async () => {
            const { calcularFaseDaLuaBackground } = await import('../assets/js/background.js');

            for (let dias = 0; dias < 400; dias += 17) {
                const data = new Date(Date.UTC(2026, 0, 1 + dias));
                const fase = calcularFaseDaLuaBackground(data);

                expect(fase).toBeGreaterThanOrEqual(0);
                expect(fase).toBeLessThan(1);
            }
        });

        test('a lua de referência (06/01/2000 18:14 UTC) tem fase próxima de 0 (nova)', async () => {
            const { calcularFaseDaLuaBackground } = await import('../assets/js/background.js');

            const luaNovaConhecida = new Date(Date.UTC(2000, 0, 6, 18, 14));
            const fase = calcularFaseDaLuaBackground(luaNovaConhecida);

            expect(fase).toBeCloseTo(0, 2);
        });

        test('meio ciclo sinódico depois da lua nova, a fase está próxima de 0.5 (cheia)', async () => {
            const { calcularFaseDaLuaBackground } = await import('../assets/js/background.js');

            const CICLO_SINODICO_DIAS = 29.53058867;
            const luaNovaConhecida = Date.UTC(2000, 0, 6, 18, 14);

            const meioCiclo = new Date(
                luaNovaConhecida + (CICLO_SINODICO_DIAS / 2) * 86400000
            );

            expect(
                calcularFaseDaLuaBackground(meioCiclo)
            ).toBeCloseTo(0.5, 1);
        });

        test('nomeFaseDaLuaBackground nomeia corretamente as fases-chave', async () => {
            const { nomeFaseDaLuaBackground } = await import('../assets/js/background.js');

            expect(nomeFaseDaLuaBackground(0)).toBe('Lua nova');
            expect(nomeFaseDaLuaBackground(0.5)).toBe('Lua cheia');
            expect(nomeFaseDaLuaBackground(0.25)).toBe('Quarto crescente');
            expect(nomeFaseDaLuaBackground(0.75)).toBe('Quarto minguante');
        });

    });


    describe('definirFaseDoDiaBackground', () => {

        test.each([
            ['2026-08-16T08:00', 'manha'],
            ['2026-08-16T14:00', 'tarde'],
            ['2026-08-16T20:00', 'noite'],
            ['2026-08-16T02:00', 'madrugada']
        ])('%s é classificado como %s', async (dataHora, esperado) => {
            const { definirFaseDoDiaBackground } = await import('../assets/js/background.js');

            expect(definirFaseDoDiaBackground(dataHora)).toBe(esperado);
            expect(document.body.classList.contains(esperado)).toBe(true);
        });

        test('remove a fase do dia anterior ao aplicar uma nova', async () => {
            const { definirFaseDoDiaBackground } = await import('../assets/js/background.js');

            definirFaseDoDiaBackground('2026-08-16T08:00');
            expect(document.body.classList.contains('manha')).toBe(true);

            definirFaseDoDiaBackground('2026-08-16T20:00');
            expect(document.body.classList.contains('manha')).toBe(false);
            expect(document.body.classList.contains('noite')).toBe(true);
        });

    });


    describe('definirClimaFundoBackground (integração com o <body>)', () => {

        test('aplica a classe clima-* correspondente no modo claro', async () => {
            const { definirClimaFundoBackground } = await import('../assets/js/background.js');

            definirClimaFundoBackground(0);

            expect(document.body.classList.contains('clima-limpo')).toBe(true);
        });

        test('NÃO aplica nenhuma classe clima-* no modo escuro', async () => {
            const { definirClimaFundoBackground } = await import('../assets/js/background.js');

            document.body.classList.add('dark-mode');

            definirClimaFundoBackground(95);

            expect(document.body.classList.contains('clima-tempestade')).toBe(false);
            expect(document.body.classList.contains('clima-granizo')).toBe(false);
        });

        test('dispara o evento clima:condicao com ativo:false no modo escuro', async () => {
            const { definirClimaFundoBackground } = await import('../assets/js/background.js');

            document.body.classList.add('dark-mode');

            definirClimaFundoBackground(61);

            expect(window.dispatchEvent).toHaveBeenCalled();

            const evento = window.dispatchEvent.mock.calls[0][0];

            expect(evento.detail.ativo).toBe(false);
        });

        test('dispara o evento clima:condicao com a categoria correta no modo claro', async () => {
            const { definirClimaFundoBackground } = await import('../assets/js/background.js');

            definirClimaFundoBackground(96);

            const evento = window.dispatchEvent.mock.calls[0][0];

            expect(evento.detail.ativo).toBe(true);
            expect(evento.detail.categoria).toBe('granizo');
        });

    });

});
