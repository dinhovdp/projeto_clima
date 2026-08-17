const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const resultDiv = document.getElementById('weather-result');

const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('weather-description');
const windEl = document.getElementById('wind');
const updatedAtEl = document.getElementById('updated-at');

function mostrarCarregando(mostrar) {
    loadingEl.classList.toggle('hidden', !mostrar);
}

function mostrarErro(mensagem) {
    errorEl.textContent = mensagem;
    errorEl.classList.remove('hidden');
}

function limparMensagens() {
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
    resultDiv.classList.add('hidden');
}

function formatarDataHora(dataHora) {
    const data = new Date(dataHora);

    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obterDescricaoClima(codigo) {
    const descricoes = {
        0: 'Céu limpo',
        1: 'Principalmente limpo',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Neblina',
        48: 'Neblina com geada',
        51: 'Garoa fraca',
        53: 'Garoa moderada',
        55: 'Garoa intensa',
        61: 'Chuva fraca',
        63: 'Chuva moderada',
        65: 'Chuva intensa',
        71: 'Neve fraca',
        73: 'Neve moderada',
        75: 'Neve intensa',
        80: 'Pancadas de chuva fracas',
        81: 'Pancadas de chuva moderadas',
        82: 'Pancadas de chuva intensas',
        95: 'Trovoada',
        96: 'Trovoada com granizo',
        99: 'Trovoada forte com granizo'
    };

    return descricoes[codigo] || 'Condição climática desconhecida';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cidade = cityInput.value.trim();

    if (!cidade) {
        mostrarErro('Digite o nome de uma cidade.');
        return;
    }

    limparMensagens();
    mostrarCarregando(true);

    try {
        // 1. Busca a cidade para obter latitude e longitude
        const respostaLocalizacao = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );

        if (!respostaLocalizacao.ok) {
            throw new Error('Erro ao consultar a localização.');
        }

        const localizacao = await respostaLocalizacao.json();

        if (!localizacao.results || localizacao.results.length === 0) {
            mostrarErro('Cidade não encontrada.');
            return;
        }

        const cidadeEncontrada = localizacao.results[0];

        const latitude = cidadeEncontrada.latitude;
        const longitude = cidadeEncontrada.longitude;

        // 2. Busca os dados meteorológicos
        const respostaClima = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );

        if (!respostaClima.ok) {
            throw new Error('Erro ao consultar o clima.');
        }

        const dadosClima = await respostaClima.json();

        const climaAtual = dadosClima.current_weather;

        // 3. Exibe os dados no Frontend
        cityNameEl.textContent = `${cidadeEncontrada.name}${cidadeEncontrada.country ? ', ' + cidadeEncontrada.country : ''}`;

        tempEl.textContent = `${climaAtual.temperature} °C`;

        descEl.textContent = obterDescricaoClima(
            climaAtual.weathercode
        );

        windEl.textContent =
            `Vento: ${climaAtual.windspeed} km/h ` +
            `(direção ${climaAtual.winddirection}°)`;

        updatedAtEl.textContent =
            `Atualizado em: ${formatarDataHora(climaAtual.time)}`;

        resultDiv.classList.remove('hidden');

    } catch (erro) {
        console.error('Erro ao buscar dados:', erro);

        mostrarErro(
            'Não foi possível carregar os dados do clima. Verifique sua conexão.'
        );

    } finally {
        mostrarCarregando(false);
    }
});