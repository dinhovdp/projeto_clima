const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;

    try {
        // 1. Busca latitude e longitude da cidade
        const geoRes = await fetch(`https://open-meteo.com/search?name=${encodeURIComponent(city)}&count=1&language=pt`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('Cidade não encontrada.');
            return;
        }

        const { name, latitude, longitude, country } = geoData.results[0];

        // 2. Busca o clima atual usando as coordenadas
        const weatherRes = await fetch(`https://open-meteo.com{latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        // 3. Exibe os dados na tela
        cityNameEl.textContent = `${name}, ${country || ''}`;
        tempEl.textContent = `Temperatura: ${weatherData.current_weather.temperature} °C`;
        resultDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Não foi possível carregar os dados do clima.');
    }
});
