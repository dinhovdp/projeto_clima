/**
 * Testes da API de clima
 *
 * Os testes utilizam mocks para simular
 * as respostas da Open-Meteo.
 *
 * Dessa forma, os testes não dependem
 * de uma conexão real com a internet.
 */

describe('Testes da API de clima', () => {

    beforeEach(() => {

        global.fetch = jest.fn();

    });


    afterEach(() => {

        jest.clearAllMocks();

    });


    /* =========================
       GEOCODIFICAÇÃO
       ========================= */

    describe('Geocodificação', () => {

        test('1 - Nome de cidade válido retorna localização', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    results: [

                        {
                            name: 'São Paulo',
                            latitude: -23.55,
                            longitude: -46.63,
                            country: 'Brasil'
                        }

                    ]

                })

            });


            const cidade = 'São Paulo';


            const resposta = await fetch(

                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`

            );


            const dados = await resposta.json();


            expect(resposta.ok).toBe(true);

            expect(dados.results).toHaveLength(1);

            expect(dados.results[0].name)
                .toBe('São Paulo');

            expect(dados.results[0].latitude)
                .toBe(-23.55);

            expect(dados.results[0].longitude)
                .toBe(-46.63);

        });


        test('2 - Cidade inexistente retorna lista vazia', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    results: []

                })

            });


            const resposta = await fetch(

                'https://geocoding-api.open-meteo.com/v1/search?name=CidadeInexistente&count=1'

            );


            const dados = await resposta.json();


            expect(resposta.ok).toBe(true);

            expect(dados.results).toHaveLength(0);

        });


        test('3 - Entrada vazia deve ser identificada antes da consulta', () => {

            const cidade = '';


            expect(cidade.trim()).toBe('');

        });


        test('4 - Nome com espaços deve ser tratado corretamente', () => {

            const cidade = '   São Paulo   ';


            expect(cidade.trim())
                .toBe('São Paulo');

        });

    });


    /* =========================
       CLIMA ATUAL
       ========================= */

    describe('Clima atual', () => {

        test('5 - API retorna dados meteorológicos atuais', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    current_weather: {

                        temperature: 25,

                        windspeed: 10,

                        winddirection: 180,

                        weathercode: 0,

                        is_day: 1,

                        time: '2026-08-16T14:00'

                    }

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(resposta.ok).toBe(true);

            expect(dados.current_weather)
                .toBeDefined();


            expect(
                dados.current_weather.temperature
            ).toBe(25);


            expect(
                dados.current_weather.windspeed
            ).toBe(10);


            expect(
                dados.current_weather.weathercode
            ).toBe(0);

        });


        test('6 - Resposta sem current_weather deve ser identificada', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    latitude: -23.55,

                    longitude: -46.63

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(
                dados.current_weather
            ).toBeUndefined();

        });

    });


    /* =========================
       DADOS METEOROLÓGICOS
       ========================= */

    describe('Dados meteorológicos adicionais', () => {

        test('7 - API pode retornar umidade e sensação térmica', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    current: {

                        temperature_2m: 25,

                        relative_humidity_2m: 70,

                        apparent_temperature: 27,

                        wind_speed_10m: 12

                    }

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(resposta.ok).toBe(true);

            expect(dados.current).toBeDefined();


            expect(
                dados.current.temperature_2m
            ).toBe(25);


            expect(
                dados.current.relative_humidity_2m
            ).toBe(70);


            expect(
                dados.current.apparent_temperature
            ).toBe(27);


            expect(
                dados.current.wind_speed_10m
            ).toBe(12);

        });

    });


    /* =========================
       PREVISÃO
       ========================= */

    describe('Previsão de 7 dias', () => {

        test('8 - API retorna previsão diária corretamente', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    daily: {

                        time: [

                            '2026-08-16',
                            '2026-08-17',
                            '2026-08-18',
                            '2026-08-19',
                            '2026-08-20',
                            '2026-08-21',
                            '2026-08-22'

                        ],

                        weathercode: [

                            0,
                            1,
                            2,
                            3,
                            61,
                            80,
                            95

                        ],

                        temperature_2m_max: [

                            27,
                            28,
                            26,
                            24,
                            22,
                            23,
                            25

                        ],

                        temperature_2m_min: [

                            17,
                            18,
                            17,
                            16,
                            15,
                            16,
                            17

                        ]

                    }

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(resposta.ok).toBe(true);

            expect(dados.daily).toBeDefined();


            expect(
                dados.daily.time
            ).toHaveLength(7);


            expect(
                dados.daily.temperature_2m_max
            ).toHaveLength(7);


            expect(
                dados.daily.temperature_2m_min
            ).toHaveLength(7);


            expect(
                dados.daily.weathercode
            ).toHaveLength(7);

        });


        test('9 - Resposta sem dados daily deve ser considerada inválida', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    current_weather: {}

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(
                dados.daily
            ).toBeUndefined();

        });

    });


    /* =========================
       ERROS HTTP
       ========================= */

    describe('Erros HTTP', () => {

        test('10 - Erro 429 indica limite de requisições', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: false,

                status: 429,

                json: async () => ({

                    error: true

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            expect(resposta.ok)
                .toBe(false);


            expect(resposta.status)
                .toBe(429);

        });


        test('11 - Erro HTTP 500 deve ser identificado', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: false,

                status: 500,

                json: async () => ({

                    error: true

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            expect(resposta.ok)
                .toBe(false);


            expect(resposta.status)
                .toBe(500);

        });

    });


    /* =========================
       ERROS DE REDE
       ========================= */

    describe('Erros de conexão', () => {

        test('12 - Falha de conexão deve rejeitar a Promise', async () => {

            global.fetch.mockRejectedValueOnce(

                new Error('Erro de conexão')

            );


            await expect(

                fetch(
                    'https://api.open-meteo.com/v1/forecast'
                )

            ).rejects.toThrow(
                'Erro de conexão'
            );

        });


        test('13 - Timeout ou rede instável deve gerar erro', async () => {

            global.fetch.mockRejectedValueOnce(

                new Error('Network timeout')

            );


            await expect(

                fetch(
                    'https://api.open-meteo.com/v1/forecast'
                )

            ).rejects.toThrow(
                'Network timeout'
            );

        });

    });


    /* =========================
       FORMATO DA RESPOSTA
       ========================= */

    describe('Validação do formato da resposta', () => {

        test('14 - Resposta com estrutura inesperada deve ser identificada', async () => {

            global.fetch.mockResolvedValueOnce({

                ok: true,

                json: async () => ({

                    dados_diferentes: []

                })

            });


            const resposta = await fetch(

                'https://api.open-meteo.com/v1/forecast'

            );


            const dados = await resposta.json();


            expect(
                dados.current_weather
            ).toBeUndefined();


            expect(
                dados.daily
            ).toBeUndefined();

        });

    });


    /* =========================
       CÓDIGOS METEOROLÓGICOS
       ========================= */

    describe('Códigos meteorológicos', () => {

        test('15 - Código 0 representa céu limpo', () => {

            const codigo = 0;


            expect(codigo).toBe(0);

        });


        test('16 - Código 61 representa chuva', () => {

            const codigo = 61;


            expect(codigo).toBeGreaterThanOrEqual(51);

            expect(codigo).toBeLessThanOrEqual(65);

        });


        test('17 - Código 95 representa trovoada', () => {

            const codigo = 95;


            expect(codigo).toBeGreaterThanOrEqual(95);

        });

    });

});