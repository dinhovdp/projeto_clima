/**
 * Testes de forecast.js
 */

import {
    validarCoordenadasForecast,
    validarDadosForecast,
    normalizarPrevisao,
    formatarDataForecast,
    obterNomeDiaForecast,
    buscarPrevisao
} from '../assets/js/forecast.js';

describe('forecast.js', () => {

    describe('validarCoordenadasForecast', () => {

        test('aceita coordenadas dentro dos limites', () => {
            expect(validarCoordenadasForecast(-23.55, -46.63)).toBe(true);
        });

        test('rejeita coordenadas fora do intervalo', () => {
            expect(validarCoordenadasForecast(91, 0)).toBe(false);
            expect(validarCoordenadasForecast(0, -181)).toBe(false);
        });

        test('rejeita coordenadas não numéricas', () => {
            expect(validarCoordenadasForecast('norte', 0)).toBe(false);
        });

    });


    describe('formatarDataForecast', () => {

        test('formata "AAAA-MM-DD" como "DD/MM"', () => {
            expect(formatarDataForecast('2026-08-16')).toBe('16/08');
            expect(formatarDataForecast('2026-01-05')).toBe('05/01');
        });

        test('retorna um placeholder para entradas inválidas', () => {
            expect(formatarDataForecast('data-invalida')).toBe('--/--');
            expect(formatarDataForecast(null)).toBe('--/--');
            expect(formatarDataForecast(undefined)).toBe('--/--');
        });

    });


    describe('obterNomeDiaForecast', () => {

        test('retorna o nome do dia da semana correto', () => {
            // 16/08/2026 cai num domingo.
            expect(obterNomeDiaForecast('2026-08-16')).toBe('Domingo');

            // 17/08/2026 cai numa segunda-feira.
            expect(obterNomeDiaForecast('2026-08-17')).toBe('Segunda-feira');
        });

        test('retorna um placeholder para entradas inválidas', () => {
            expect(obterNomeDiaForecast('data-invalida')).toBe('--');
            expect(obterNomeDiaForecast(null)).toBe('--');
        });

    });


    describe('validarDadosForecast', () => {

        const previsaoValida = {
            daily: {
                time: ['2026-08-16', '2026-08-17'],
                weather_code: [0, 61],
                temperature_2m_max: [27, 24],
                temperature_2m_min: [17, 16]
            }
        };

        test('aceita uma resposta com todos os campos obrigatórios', () => {
            expect(validarDadosForecast(previsaoValida)).toBe(true);
        });

        test('rejeita quando falta o campo "daily"', () => {
            expect(validarDadosForecast({})).toBe(false);
        });

        test('rejeita quando falta um campo obrigatório dentro de "daily"', () => {
            const semTemperaturaMinima = {
                daily: {
                    time: ['2026-08-16'],
                    weather_code: [0],
                    temperature_2m_max: [27]
                }
            };

            expect(validarDadosForecast(semTemperaturaMinima)).toBe(false);
        });

    });


    describe('normalizarPrevisao', () => {

        test('gera 7 dias a partir de uma resposta válida de 7 dias', () => {
            const respostaDeSeteDias = {
                daily: {
                    time: [
                        '2026-08-16', '2026-08-17', '2026-08-18',
                        '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'
                    ],
                    weather_code: [0, 1, 2, 3, 61, 80, 95],
                    temperature_2m_max: [27, 28, 26, 24, 22, 23, 25],
                    temperature_2m_min: [17, 18, 17, 16, 15, 16, 17]
                }
            };

            const previsao = normalizarPrevisao(respostaDeSeteDias);

            expect(previsao.dias).toHaveLength(7);
            expect(previsao.dias[0].data).toBe('2026-08-16');
        });

        test('lança erro para dados incompletos ou inválidos', () => {
            expect(() => normalizarPrevisao({})).toThrow();
            expect(() => normalizarPrevisao(null)).toThrow();
        });

    });


    describe('buscarPrevisao (com fetch mockado)', () => {

        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('retorna a previsão normalizada de 7 dias a partir da resposta da API', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    daily: {
                        time: [
                            '2026-08-16', '2026-08-17', '2026-08-18',
                            '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'
                        ],
                        weather_code: [0, 1, 2, 3, 61, 80, 95],
                        temperature_2m_max: [27, 28, 26, 24, 22, 23, 25],
                        temperature_2m_min: [17, 18, 17, 16, 15, 16, 17]
                    }
                })
            });

            const previsao = await buscarPrevisao(-23.55, -46.63);

            expect(previsao.dias).toHaveLength(7);
        });

        test('lança erro quando a resposta HTTP não é ok', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                json: async () => ({})
            });

            await expect(
                buscarPrevisao(-23.55, -46.63)
            ).rejects.toThrow();
        });

    });

});
