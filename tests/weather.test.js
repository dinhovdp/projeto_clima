/**
 * Testes de weather.js
 */

import {
    numeroValidoWeather,
    codigoMeteorologicoValidoWeather,
    validarCoordenadasWeather,
    validarDadosClimaWeather,
    obterDescricaoClima,
    obterIconeClima,
    obterCategoriaClima,
    buscarClimaAtual
} from '../assets/js/weather.js';

describe('weather.js', () => {

    describe('numeroValidoWeather', () => {

        test('aceita números finitos', () => {
            expect(numeroValidoWeather(25)).toBe(true);
            expect(numeroValidoWeather(-10.5)).toBe(true);
            expect(numeroValidoWeather(0)).toBe(true);
        });

        test('rejeita NaN, Infinity e não-números', () => {
            expect(numeroValidoWeather(NaN)).toBe(false);
            expect(numeroValidoWeather(Infinity)).toBe(false);
            expect(numeroValidoWeather('25')).toBe(false);
            expect(numeroValidoWeather(null)).toBe(false);
            expect(numeroValidoWeather(undefined)).toBe(false);
        });

    });


    describe('codigoMeteorologicoValidoWeather', () => {

        test.each([0, 1, 2, 3, 45, 61, 63, 65, 71, 80, 95, 96, 99])(
            'aceita código WMO válido: %i',
            (codigo) => {
                expect(codigoMeteorologicoValidoWeather(codigo)).toBe(true);
            }
        );

        test.each([4, 10, 50, 100, -1, 1.5])(
            'rejeita código WMO inexistente ou não inteiro: %s',
            (codigo) => {
                expect(codigoMeteorologicoValidoWeather(codigo)).toBe(false);
            }
        );

    });


    describe('validarCoordenadasWeather', () => {

        test('não lança erro para coordenadas válidas', () => {
            expect(() =>
                validarCoordenadasWeather(-23.55, -46.63)
            ).not.toThrow();
        });

        test('lança erro para latitude fora do intervalo [-90, 90]', () => {
            expect(() =>
                validarCoordenadasWeather(91, 0)
            ).toThrow();

            expect(() =>
                validarCoordenadasWeather(-91, 0)
            ).toThrow();
        });

        test('lança erro para longitude fora do intervalo [-180, 180]', () => {
            expect(() =>
                validarCoordenadasWeather(0, 181)
            ).toThrow();

            expect(() =>
                validarCoordenadasWeather(0, -181)
            ).toThrow();
        });

        test('lança erro para coordenadas não numéricas', () => {
            expect(() =>
                validarCoordenadasWeather('norte', -46.63)
            ).toThrow();
        });

    });


    describe('validarDadosClimaWeather', () => {

        const climaValido = {
            time: '2026-08-16T14:00',
            temperature_2m: 25,
            apparent_temperature: 27,
            relative_humidity_2m: 70,
            weather_code: 0,
            wind_speed_10m: 10,
            is_day: 1
        };

        test('aceita objeto de clima com todos os campos numéricos válidos', () => {
            expect(() =>
                validarDadosClimaWeather(climaValido)
            ).not.toThrow();
        });

        test('rejeita ausência total de dados', () => {
            expect(() => validarDadosClimaWeather(null)).toThrow();
            expect(() => validarDadosClimaWeather(undefined)).toThrow();
        });

        test('rejeita temperatura não numérica', () => {
            expect(() =>
                validarDadosClimaWeather({
                    ...climaValido,
                    temperature_2m: 'quente'
                })
            ).toThrow();
        });

        test('rejeita horário ausente ou vazio', () => {
            expect(() =>
                validarDadosClimaWeather({ ...climaValido, time: '' })
            ).toThrow();
        });

    });


    describe('obterDescricaoClima', () => {

        test('traduz códigos conhecidos corretamente', () => {
            expect(obterDescricaoClima(0)).toBe('Céu limpo');
            expect(obterDescricaoClima(61)).toBe('Chuva fraca');
            expect(obterDescricaoClima(95)).toBe('Trovoada');
            expect(obterDescricaoClima(96)).toBe('Trovoada com granizo');
        });

    });


    describe('obterIconeClima', () => {

        test('retorna ícone de sol durante o dia e lua à noite (céu limpo)', () => {
            expect(obterIconeClima(0, 1)).toBe('☀️');
            expect(obterIconeClima(0, 0)).toBe('🌙');
        });

    });


    describe('obterCategoriaClima', () => {

        test('classifica céu limpo', () => {
            expect(obterCategoriaClima(0)).toBe('limpo');
            expect(obterCategoriaClima(1)).toBe('limpo');
        });

        test('classifica parcialmente nublado', () => {
            expect(obterCategoriaClima(2)).toBe('parcial');
        });

        test('classifica nublado/neblina', () => {
            expect(obterCategoriaClima(3)).toBe('nublado');
            expect(obterCategoriaClima(45)).toBe('nublado');
        });

        test('classifica chuva (garoa, chuva e pancadas)', () => {
            expect(obterCategoriaClima(51)).toBe('chuva');
            expect(obterCategoriaClima(61)).toBe('chuva');
            expect(obterCategoriaClima(65)).toBe('chuva');
            expect(obterCategoriaClima(80)).toBe('chuva');
        });

        test('classifica trovoada (95, 96 e 99)', () => {
            expect(obterCategoriaClima(95)).toBe('tempestade');
            expect(obterCategoriaClima(96)).toBe('tempestade');
            expect(obterCategoriaClima(99)).toBe('tempestade');
        });

    });


    describe('buscarClimaAtual (com fetch mockado)', () => {

        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('retorna os dados climáticos mapeados corretamente a partir da resposta da Open-Meteo', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    current: {
                        time: '2026-08-16T14:00',
                        temperature_2m: 25,
                        relative_humidity_2m: 70,
                        apparent_temperature: 27,
                        weather_code: 0,
                        wind_speed_10m: 10,
                        wind_direction_10m: 180,
                        is_day: 1
                    }
                })
            });

            const clima = await buscarClimaAtual(-23.55, -46.63);

            expect(clima.temperature).toBe(25);
            expect(clima.apparent_temperature).toBe(27);
            expect(clima.relative_humidity_2m).toBe(70);
            expect(clima.weathercode).toBe(0);
            expect(clima.windspeed).toBe(10);
            expect(clima.is_day).toBe(1);
        });

        test('lança erro quando response.ok é false', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({})
            });

            await expect(
                buscarClimaAtual(-23.55, -46.63)
            ).rejects.toThrow();
        });

        test('lança erro quando a resposta não possui "current"', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ latitude: -23.55, longitude: -46.63 })
            });

            await expect(
                buscarClimaAtual(-23.55, -46.63)
            ).rejects.toThrow();
        });

        test('lança erro para coordenadas inválidas sem sequer chamar a API', async () => {
            await expect(
                buscarClimaAtual(999, -46.63)
            ).rejects.toThrow();

            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('propaga falha de conexão de rede como uma mensagem amigável', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Erro de conexão'));

            await expect(
                buscarClimaAtual(-23.55, -46.63)
            ).rejects.toThrow();
        });

    });

});
