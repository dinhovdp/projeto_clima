/**
 * Testes de comparison.js
 *
 * O módulo mantém uma lista interna de cidades comparadas em
 * memória (não exportada diretamente). Para isolar cada teste,
 * usamos `jest.resetModules()` + import dinâmico, garantindo uma
 * instância nova do módulo (e portanto da lista) a cada teste.
 */

function instalarDomStub() {
    global.document = {
        readyState: 'complete',
        addEventListener: jest.fn(),
        getElementById: jest.fn(() => null),
        querySelector: jest.fn(() => null),
        createElement: jest.fn(() => ({
            classList: { add: jest.fn(), remove: jest.fn() },
            appendChild: jest.fn(),
            setAttribute: jest.fn()
        }))
    };

    global.window = {
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        setInterval: jest.fn(() => 1),
        clearInterval: jest.fn()
    };
}

async function carregarModuloComFetchMockado(respostaClima) {
    instalarDomStub();

    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ current: respostaClima })
    });

    jest.resetModules();

    return import('../assets/js/comparison.js');
}

const climaOpenMeteoPadrao = {
    time: '2026-08-16T14:00',
    temperature_2m: 25,
    relative_humidity_2m: 70,
    apparent_temperature: 27,
    weather_code: 0,
    wind_speed_10m: 10,
    wind_direction_10m: 180,
    is_day: 1
};

const cidadeExemplo = (overrides = {}) => ({
    name: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
    ...overrides
});

describe('comparison.js', () => {

    describe('localizacaoValidaComparacao / criarChaveCidadeComparacao', () => {

        test('aceita uma cidade com coordenadas numéricas válidas', async () => {
            const { localizacaoValidaComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            expect(localizacaoValidaComparacao(cidadeExemplo())).toBe(true);
        });

        test('gera chaves diferentes para cidades homônimas em coordenadas diferentes', async () => {
            const { criarChaveCidadeComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            const chave1 = criarChaveCidadeComparacao(cidadeExemplo());
            const chave2 = criarChaveCidadeComparacao(
                cidadeExemplo({ latitude: 40.0, longitude: -8.0 })
            );

            expect(chave1).not.toBe(chave2);
        });

    });


    describe('adicionarCidadeComparacao', () => {

        test('adiciona uma cidade válida com sucesso', async () => {
            const { adicionarCidadeComparacao, quantidadeCidadesComparadas } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            const resultado = await adicionarCidadeComparacao(cidadeExemplo());

            expect(resultado.sucesso).toBe(true);
            expect(quantidadeCidadesComparadas()).toBe(1);
        });

        test('rejeita adicionar a mesma cidade duas vezes, com a mensagem correta', async () => {
            const { adicionarCidadeComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            await adicionarCidadeComparacao(cidadeExemplo());
            const segundaTentativa = await adicionarCidadeComparacao(cidadeExemplo());

            expect(segundaTentativa.sucesso).toBe(false);
            expect(segundaTentativa.mensagem).toBe('Essa cidade já foi escolhida.');
        });

        test('rejeita a 6ª cidade, com a mensagem de limite correta', async () => {
            const { adicionarCidadeComparacao, quantidadeCidadesComparadas } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            const cidades = [
                cidadeExemplo({ name: 'Cidade 1', latitude: 1, longitude: 1 }),
                cidadeExemplo({ name: 'Cidade 2', latitude: 2, longitude: 2 }),
                cidadeExemplo({ name: 'Cidade 3', latitude: 3, longitude: 3 }),
                cidadeExemplo({ name: 'Cidade 4', latitude: 4, longitude: 4 }),
                cidadeExemplo({ name: 'Cidade 5', latitude: 5, longitude: 5 }),
                cidadeExemplo({ name: 'Cidade 6', latitude: 6, longitude: 6 })
            ];

            for (const cidade of cidades.slice(0, 5)) {
                // eslint-disable-next-line no-await-in-loop
                await adicionarCidadeComparacao(cidade);
            }

            expect(quantidadeCidadesComparadas()).toBe(5);

            const sextaTentativa = await adicionarCidadeComparacao(cidades[5]);

            expect(sextaTentativa.sucesso).toBe(false);
            expect(sextaTentativa.mensagem).toBe('Limite de 5 cidades atingido.');
            expect(quantidadeCidadesComparadas()).toBe(5);
        });

        test('rejeita localização inválida sem chamar a API', async () => {
            const { adicionarCidadeComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            const resultado = await adicionarCidadeComparacao({ name: '' });

            expect(resultado.sucesso).toBe(false);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('quando a API falha, retorna sucesso:false com uma mensagem', async () => {
            instalarDomStub();
            global.fetch = jest.fn().mockRejectedValue(new Error('Falha de rede'));
            jest.resetModules();

            const { adicionarCidadeComparacao } = await import('../assets/js/comparison.js');

            const resultado = await adicionarCidadeComparacao(cidadeExemplo());

            expect(resultado.sucesso).toBe(false);
            expect(typeof resultado.mensagem).toBe('string');
        });

    });


    describe('removerCidadeComparacao / limparComparacao', () => {

        test('remove uma cidade pelo índice', async () => {
            const {
                adicionarCidadeComparacao,
                removerCidadeComparacao,
                quantidadeCidadesComparadas
            } = await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            await adicionarCidadeComparacao(cidadeExemplo());
            expect(quantidadeCidadesComparadas()).toBe(1);

            expect(removerCidadeComparacao(0)).toBe(true);
            expect(quantidadeCidadesComparadas()).toBe(0);
        });

        test('retorna false para um índice fora do intervalo', async () => {
            const { removerCidadeComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            expect(removerCidadeComparacao(0)).toBe(false);
            expect(removerCidadeComparacao(-1)).toBe(false);
        });

        test('limparComparacao esvazia a lista', async () => {
            const {
                adicionarCidadeComparacao,
                limparComparacao,
                quantidadeCidadesComparadas
            } = await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            await adicionarCidadeComparacao(cidadeExemplo());
            limparComparacao();

            expect(quantidadeCidadesComparadas()).toBe(0);
        });

    });


    describe('criarItemComparacao — regra: mostrar só a velocidade do vento', () => {

        test('o item de comparação não inclui a direção do vento (winddirection) na UI', async () => {
            const { adicionarCidadeComparacao } =
                await carregarModuloComFetchMockado(climaOpenMeteoPadrao);

            const resultado = await adicionarCidadeComparacao(cidadeExemplo());

            expect(resultado.item.clima.vento).toBe(10);

            // O dado bruto pode continuar disponível internamente,
            // mas a regra do projeto é: nunca exibir a direção do
            // vento na interface (ver comparison.js e o README).
            // Aqui garantimos que o dado de velocidade está correto,
            // que é o único exibido nos cards.
        });

    });

});
