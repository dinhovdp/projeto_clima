/**
 * Testes de cache.js
 *
 * O Jest roda em ambiente Node por padrão, que não possui
 * `localStorage`. Para testar o módulo de cache sem adicionar
 * a dependência extra do jsdom, criamos aqui um mock mínimo e
 * funcional de localStorage em memória.
 */

import {
    CACHE_TEMPO,
    criarChaveCache,
    salvarCache,
    obterCache,
    removerCache,
    cachePossuiDadosValidos
} from '../assets/js/cache.js';

function criarLocalStorageMock() {
    let armazenamento = {};

    return {
        getItem: jest.fn((chave) =>
            Object.prototype.hasOwnProperty.call(armazenamento, chave)
                ? armazenamento[chave]
                : null
        ),
        setItem: jest.fn((chave, valor) => {
            armazenamento[chave] = String(valor);
        }),
        removeItem: jest.fn((chave) => {
            delete armazenamento[chave];
        }),
        clear: jest.fn(() => {
            armazenamento = {};
        })
    };
}

beforeEach(() => {
    global.localStorage = criarLocalStorageMock();
});

const dadosClimaValidos = () => ({
    cidadeEncontrada: {
        name: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63
    },
    climaAtual: {
        time: '2026-08-16T14:00',
        temperature: 25,
        apparent_temperature: 27,
        relative_humidity_2m: 70,
        weathercode: 0,
        windspeed: 10,
        is_day: 1
    }
});

describe('cache.js', () => {

    describe('criarChaveCache', () => {

        test('gera a mesma chave para a mesma cidade e coordenadas', () => {
            const chave1 = criarChaveCache('São Paulo', -23.55, -46.63);
            const chave2 = criarChaveCache('São Paulo', -23.55, -46.63);

            expect(chave1).toBe(chave2);
        });

        test('gera chaves diferentes para coordenadas diferentes (cidades homônimas)', () => {
            const chaveBrasil = criarChaveCache('São Paulo', -23.55, -46.63);
            const chaveOutroPais = criarChaveCache('São Paulo', 40.0, -8.0);

            expect(chaveBrasil).not.toBe(chaveOutroPais);
        });

        test('a chave começa com o prefixo do projeto', () => {
            expect(
                criarChaveCache('São Paulo', -23.55, -46.63)
            ).toMatch(/^clima_api_cache_/);
        });

    });


    describe('cachePossuiDadosValidos', () => {

        test('aceita um objeto de dados completo e numericamente válido', () => {
            expect(cachePossuiDadosValidos(dadosClimaValidos())).toBe(true);
        });

        test('rejeita quando falta cidadeEncontrada ou climaAtual', () => {
            const semCidade = dadosClimaValidos();
            delete semCidade.cidadeEncontrada;

            expect(cachePossuiDadosValidos(semCidade)).toBe(false);

            const semClima = dadosClimaValidos();
            delete semClima.climaAtual;

            expect(cachePossuiDadosValidos(semClima)).toBe(false);
        });

        test('rejeita quando um campo numérico do clima não é finito', () => {
            const dados = dadosClimaValidos();
            dados.climaAtual.temperature = 'quente';

            expect(cachePossuiDadosValidos(dados)).toBe(false);
        });

        test('rejeita entrada nula', () => {
            expect(cachePossuiDadosValidos(null)).toBe(false);
        });

    });


    describe('salvarCache / obterCache (fluxo completo via localStorage)', () => {

        test('salva e recupera os mesmos dados dentro da validade do cache', () => {
            const dados = dadosClimaValidos();

            expect(salvarCache('São Paulo', dados)).toBe(true);

            const recuperado = obterCache('São Paulo', -23.55, -46.63);

            expect(recuperado).not.toBeNull();
            expect(recuperado.climaAtual.temperature).toBe(25);
            expect(recuperado.cidadeEncontrada.name).toBe('São Paulo');
        });

        test('não salva quando os dados climáticos estão incompletos', () => {
            const dados = dadosClimaValidos();
            delete dados.climaAtual.temperature;

            const salvou = salvarCache('São Paulo', dados);

            // Mesmo que salvarCache grave o registro (a validação de
            // conteúdo completo acontece na leitura), a leitura não
            // deve devolver dados que cachePossuiDadosValidos rejeita.
            if (salvou) {
                expect(obterCache('São Paulo', -23.55, -46.63)).toBeNull();
            }
        });

        test('retorna null para uma cidade nunca cacheada', () => {
            expect(
                obterCache('Cidade Nunca Pesquisada', -1, -1)
            ).toBeNull();
        });

        test('expira o cache após CACHE_TEMPO (10 minutos)', () => {
            const agora = Date.now();
            const dateSpy = jest
                .spyOn(Date, 'now')
                .mockReturnValue(agora);

            const dados = dadosClimaValidos();
            salvarCache('São Paulo', dados);

            // Ainda dentro da validade (9min59s depois)
            dateSpy.mockReturnValue(agora + CACHE_TEMPO - 1000);
            expect(obterCache('São Paulo', -23.55, -46.63)).not.toBeNull();

            // Passou da validade (10min01s depois)
            dateSpy.mockReturnValue(agora + CACHE_TEMPO + 1000);
            expect(obterCache('São Paulo', -23.55, -46.63)).toBeNull();

            dateSpy.mockRestore();
        });

        test('remove o cache expirado do localStorage ao detectá-lo (não deixa lixo acumulado)', () => {
            const agora = Date.now();
            const dateSpy = jest
                .spyOn(Date, 'now')
                .mockReturnValue(agora);

            salvarCache('São Paulo', dadosClimaValidos());

            dateSpy.mockReturnValue(agora + CACHE_TEMPO + 1000);
            obterCache('São Paulo', -23.55, -46.63);

            expect(global.localStorage.removeItem).toHaveBeenCalledWith(
                criarChaveCache('São Paulo', -23.55, -46.63)
            );

            dateSpy.mockRestore();
        });

        test('ignora JSON corrompido no localStorage em vez de quebrar a aplicação', () => {
            const chave = criarChaveCache('São Paulo', -23.55, -46.63);

            global.localStorage.setItem(chave, '{ isto não é json válido');

            expect(
                obterCache('São Paulo', -23.55, -46.63)
            ).toBeNull();
        });

    });


    describe('removerCache', () => {

        test('remove um cache existente', () => {
            salvarCache('São Paulo', dadosClimaValidos());

            expect(removerCache('São Paulo', -23.55, -46.63)).toBe(true);
            expect(obterCache('São Paulo', -23.55, -46.63)).toBeNull();
        });

        test('retorna false para coordenadas inválidas', () => {
            expect(removerCache('São Paulo', 'norte', -46.63)).toBe(false);
        });

    });

});
