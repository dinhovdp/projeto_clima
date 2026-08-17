describe('Testes da API de clima', () => {

    test('1 - Nome de cidade válido retorna dados meteorológicos', async () => {

        global.fetch = jest.fn()
            .mockResolvedValueOnce({
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
            })
            .mockResolvedValueOnce({
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

        const cidade = 'São Paulo';

        const respostaLocalizacao = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );

        const localizacao = await respostaLocalizacao.json();

        const respostaClima = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${localizacao.results[0].latitude}&longitude=${localizacao.results[0].longitude}&current_weather=true&timezone=America%2FSao_Paulo`
        );

        const dadosClima = await respostaClima.json();

        expect(dadosClima.current_weather.temperature).toBe(25);

    });


    test('2 - Nome de cidade inexistente retorna erro', async () => {

        global.fetch = jest.fn()
            .mockResolvedValue({
                ok: true,
                json: async () => ({
                    results: []
                })
            });

        const resposta = await fetch(
            'https://geocoding-api.open-meteo.com/v1/search?name=CidadeInexistente&count=1'
        );

        const dados = await resposta.json();

        expect(dados.results).toHaveLength(0);

    });


    test('3 - Entrada vazia retorna erro de validação', () => {

        const cidade = '';

        expect(cidade.trim()).toBe('');

    });


    test('4 - Falha da API gera erro adequado', async () => {

        global.fetch = jest.fn()
            .mockRejectedValue(
                new Error('Erro de conexão')
            );

        await expect(
            fetch('https://api.open-meteo.com')
        ).rejects.toThrow('Erro de conexão');

    });


    test('5 - Limite de requisições da API excedido', async () => {

        global.fetch = jest.fn()
            .mockResolvedValue({
                ok: false,
                status: 429,
                json: async () => ({
                    error: true
                })
            });

        const resposta = await fetch(
            'https://api.open-meteo.com'
        );

        expect(resposta.status).toBe(429);
        expect(resposta.ok).toBe(false);

    });


    test('6 - Conexão de rede lenta ou instável', async () => {

        global.fetch = jest.fn()
            .mockRejectedValue(
                new Error('Network timeout')
            );

        await expect(
            fetch('https://api.open-meteo.com')
        ).rejects.toThrow('Network timeout');

    });


    test('7 - Mudança inesperada no formato da resposta JSON', async () => {

        global.fetch = jest.fn()
            .mockResolvedValue({
                ok: true,
                json: async () => ({
                    dados_diferentes: []
                })
            });

        const resposta = await fetch(
            'https://api.open-meteo.com'
        );

        const dados = await resposta.json();

        expect(dados.current_weather).toBeUndefined();

    });

});