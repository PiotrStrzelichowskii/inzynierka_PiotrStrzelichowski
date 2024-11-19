const apiKey = 'c012a18c1fcb3eb5d6cc0f0a525e48f8';

document.addEventListener('DOMContentLoaded', function() {
    getCurrentLocation(); // Inicjalizacja lokalizacji po załadowaniu DOM
});

// Function to get the current location and city name
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    const city = data.name;
                    document.getElementById('city').value = city;
                    document.getElementById('cityName').textContent = city;
                    getWeather(); // Pobierz pogodę dla lokalizacji
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 7); // Ustal datę początkową na tydzień wstecz
                    getHistoricalWeather(city, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]); // Pobierz dane historyczne
                })
                .catch(error => console.error('Błąd podczas reverse geokodowania:', error));
        }, error => {
            console.error('Błąd geolokalizacji:', error);
            alert('Błąd geolokalizacji, ustawiam domyślne miasto na Kraków.');
            // Jeśli geolokalizacja się nie uda, użyj domyślnego miasta
            const defaultCity = 'Kraków';
            document.getElementById('city').value = defaultCity;
            document.getElementById('cityName').textContent = defaultCity;
            getWeather(); // Pobierz pogodę dla domyślnego miasta
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // Ustal datę początkową na tydzień wstecz
            getHistoricalWeather(defaultCity, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]); // Pobierz dane historyczne
        });
    } else {
        console.error('Geolokalizacja nie jest wspierana w tej przeglądarce.');
        alert('Geolokalizacja nie jest wspierana, ustawiam domyślne miasto na Kraków.');
        // Jeśli geolokalizacja nie jest wspierana, użyj domyślnego miasta
        const defaultCity = 'Kraków';
        document.getElementById('city').value = defaultCity;
        document.getElementById('cityName').textContent = defaultCity;
        getWeather(); // Pobierz pogodę dla domyślnego miasta
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7); // Ustal datę początkową na tydzień wstecz
        getHistoricalWeather(defaultCity, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]); // Pobierz dane historyczne
    }
}

// Funkcja do pobierania prognozy pogody
function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Proszę wprowadzić miasto');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            document.getElementById('cityName').textContent = city; // Uaktualnienie nazwy miasta
        })
        .catch(error => {
            console.error('Błąd podczas pobierania danych o bieżącej pogodzie:', error);
            alert('Błąd podczas pobierania danych o bieżącej pogodzie. Spróbuj ponownie.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
            displayRainForecastChart(data.list); // Wywołanie funkcji do wyświetlenia wykresu
        })
        .catch(error => {
            console.error('Błąd podczas pobierania prognozy godzinowej:', error);
            alert('Błąd podczas pobierania prognozy godzinowej. Spróbuj ponownie.');
        });
}


// Mapa tłumaczeń angielskiego opisu pogody na polski
const translations = {
    "clear sky": "czyste niebo",
    "few clouds": "małe zachmurzenie",
    "scattered clouds": "rozproszone chmury",
    "broken clouds": "zachmurzenie duże",
    "shower rain": "przelotny deszcz",
    "rain": "deszcz",
    "thunderstorm": "burza",
    "snow": "śnieg",
    "mist": "mgła"
};



function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
        let description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        // Sprawdź, czy opis ma polskie tłumaczenie, jeśli nie, użyj oryginału
        description = translations[description] || description;

        tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;
        weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description; 
        weatherIcon.style.display = 'block'; // Show icon
    }
}


// Function to display hourly forecast
function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = ''; // Clear previous content

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Ikona pogody">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}



// Funkcja do wyświetlania prognozy opadów na dzień
function displayRainForecastChart(forecastData) {
    const dailyRainfall = {};
    
    // Grupowanie opadów według dni
    forecastData.forEach(item => {
        const date = moment(item.dt * 1000).format('DD.MM.YYYY'); // Formatowanie daty do YYYY-MM-DD
        if (!dailyRainfall[date]) {
            dailyRainfall[date] = 0; // Inicjalizowanie, jeśli nie istnieje
        }
        // Dodanie opadów z danego dnia (jeśli są)
        dailyRainfall[date] += item.rain ? item.rain['3h'] : 0;
    });

    const labels = Object.keys(dailyRainfall); // Dni jako etykiety
    const data = Object.values(dailyRainfall); // Opady na każdy dzień

    // Sprawdź, czy rainForecastChart istnieje i zniszcz go, jeśli tak
    if (window.rainForecastChart instanceof Chart) {
        window.rainForecastChart.destroy();
    }

    // Tworzenie wykresu
    window.rainForecastChart = new Chart(document.getElementById('rainForecast').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels, // Etykiety dni
            datasets: [{
                label: 'Opady na dzień (mm)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Opady (mm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
        
    });
}











// Function to get historical weather data for the specified date range
function getHistoricalWeather(city, startDate, endDate) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const cityId = data.city.id;
            const startTimestamp = new Date(startDate).getTime() / 1000;
            const endTimestamp = new Date(endDate).getTime() / 1000;

            fetchHistoricalData(cityId, startTimestamp, endTimestamp);
        })
        .catch(error => console.error('Błąd podczas pobierania ID miasta:', error));
}

// Function to fetch historical data for the selected date range
function fetchHistoricalData(cityId, startTimestamp, endTimestamp) {
    let currentStart = startTimestamp;
    let historicalData = [];

    const fetchNextPeriod = () => {
        const currentEnd = Math.min(currentStart + (7 * 24 * 60 * 60), endTimestamp); // Fetch data in 7-day chunks

        const url = `https://history.openweathermap.org/data/2.5/history/city?id=${cityId}&type=hour&start=${currentStart}&end=${currentEnd}&appid=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                historicalData = historicalData.concat(data.list);
                console.log(`Pobrano dane dla okresu: ${new Date(currentStart * 1000)} - ${new Date(currentEnd * 1000)}`);

                if (currentEnd < endTimestamp) {
                    currentStart = currentEnd;
                    fetchNextPeriod();
                } else {
                    processHistoricalData(historicalData);
                }
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych historycznych:', error);
            });
    };

    fetchNextPeriod();
}


function processHistoricalData(historicalData) {
    const rainData = {};
    historicalData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const rain = item.rain ? item.rain['1h'] : 0;

        if (!rainData[date]) {
            rainData[date] = 0;
        }
        rainData[date] += rain; // Sum up rain for the same day
    });

    storedRainData = rainData; // Przechowywanie danych opadów

    displayRainChart(rainData); // Wyświetlenie wykresu
    // Usunięcie wywołań obliczania średniej i sumy
}


// Function to display rain data on a chart
function displayRainChart(rainData) {
    const ctx = document.getElementById('rainChart').getContext('2d');
    const labels = Object.keys(rainData);
    const data = Object.values(rainData);

    // Oblicz sumę i średnią opadów
    const sumaOpadow = data.reduce((sum, rain) => sum + rain, 0);
    const sredniaOpadow = sumaOpadow / data.length;

    // Sprawdź, czy rainChart istnieje i zniszcz go, jeśli tak
    if (window.rainChart instanceof Chart) {
        window.rainChart.destroy();
    }

    // Tworzymy nowy wykres
    window.rainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Opady (mm)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Opady (mm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
    });

    // Odświeżanie okienka statystyk z nowymi wartościami
    let statsBox = document.querySelector('.stats-box');
    if (!statsBox) {
        // Jeśli statsBox jeszcze nie istnieje, tworzymy je
        statsBox = document.createElement('div');
        statsBox.classList.add('stats-box');
        statsBox.addEventListener('click', toggleStatsBox);
        const chartContainer = document.getElementById('rainChart').parentNode;
        chartContainer.style.position = 'relative'; // Pozycjonowanie kontenera
        chartContainer.appendChild(statsBox);
    }

    // Aktualizacja treści okienka statystyk i automatyczne jego zwinięcie
    statsBox.innerHTML = `
        <h3>Statystyki ▼</h3>
        <p>Suma opadów: ${sumaOpadow.toFixed(2)} mm</p>
        <p>Średnia opadów: ${sredniaOpadow.toFixed(2)} mm</p>
    `;
    statsBox.classList.remove('open'); // Zwinięcie okienka po aktualizacji
}







// Funkcja do rozwijania i zwijania okienka statystyk
function toggleStatsBox() {
    this.classList.toggle('open');
}




document.getElementById('getRainHistory').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!city || !startDate || !endDate) {
        alert('Proszę podać miasto, datę początkową i datę końcową.');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('Data początkowa musi być przed datą końcową.');
        return;
    }

    console.log(`Pobieranie danych dla miasta: ${city}, od ${startDate} do ${endDate}`);
    getHistoricalWeather(city, startDate, endDate); // Pobierz dane historyczne
});










////////////Obsługa dwóch wykresów

document.getElementById('compareCitiesButton').addEventListener('click', function () {
    const cityInputsContainer = document.getElementById('cityInputsContainer');
    const chartsContainer = document.querySelector('.charts-container');
    const rainChart = document.getElementById('rainChart');
    const rainhistorycontainer = document.getElementById('rainhistorycontainer');
    const compareCitiesButton = document.getElementById('compareCitiesButton');
    const getRainHistory = document.getElementById('getRainHistory')
    const city = document.getElementById('city').value;

    if (compareCitiesButton.textContent === "Porównaj dwa miasta") {
        console.log("Włączanie trybu porównania dwóch miast...");
        compareCitiesButton.textContent = "Wróć";
        document.getElementById('cityName').textContent = 'miastach:';
    } else {
        console.log("Wyłączanie trybu porównania dwóch miast...");
        compareCitiesButton.textContent = "Porównaj dwa miasta";
        document.getElementById('cityName').textContent = city;
    }
    

    // Sprawdź, czy pola tekstowe są widoczne
    if (cityInputsContainer.style.display === 'flex') {
        // Jeśli są widoczne, ukryj je
        cityInputsContainer.style.display = 'none';
        getRainHistory.style.display = 'flex';
        dowloadxlsx1.style.display = 'flex';
        dowloadxlsx2.style.display = 'none';

    } else {
        // Jeśli są ukryte, pokaż je
        cityInputsContainer.style.display = 'flex';
        getRainHistory.style.display = 'none';
        dowloadxlsx2.style.display = 'flex';
        dowloadxlsx1.style.display = 'none';
    }

    // Sprawdź aktualny stan widoczności sekcji wykresów i przełącz
    if (chartsContainer.style.display === 'flex') {
        // Ukryj wykresy i pokaż główny wykres
        chartsContainer.style.display = 'none';
        rainChart.style.display = 'block'; // Pokaż główny wykres
        rainhistorycontainer.style.height = 'auto'; // Przywróć domyślną wysokość
    } else {
        // Pokaż wykresy i ukryj główny wykres
        chartsContainer.style.display = 'flex'; // Pokaż kontener wykresów
        rainChart.style.display = 'none'; // Ukryj główny wykres
        rainhistorycontainer.style.height = 'auto'; // Ustaw wysokość na pełny ekran

        // Utwórz dwa puste wykresy
        createEmptyChart('rainChart1', 'Miasto 1 - Ilość opadów');
        createEmptyChart('rainChart2', 'Miasto 2 - Ilość opadów');
    }
});

// Funkcja do tworzenia pustego wykresu
function createEmptyChart(canvasId, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Puste etykiety
            datasets: [
                {
                    label: label,
                    data: [], // Puste dane
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Ilość opadów',
                    },
                },
            },
        },
    });
}






//WYSWIETL


let data1 = null;
let data2 = null;

// Przechowuj dane historyczne w zmiennych globalnych
function getHistoricalWeatherTwoCities(city1, city2, startDate, endDate) {
    Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city1}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => ({ city: city1, id: data.city.id })),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city2}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => ({ city: city2, id: data.city.id })),
    ])
        .then(results => {
            const [cityData1, cityData2] = results;
            const startTimestamp = new Date(startDate).getTime() / 1000;
            const endTimestamp = new Date(endDate).getTime() / 1000;

            return Promise.all([
                fetchHistoricalDataForCity(cityData1.id, startTimestamp, endTimestamp, cityData1.city),
                fetchHistoricalDataForCity(cityData2.id, startTimestamp, endTimestamp, cityData2.city),
            ]);
        })
        .then(([dataFetched1, dataFetched2]) => {
            // Przechowuj dane w zmiennych globalnych
            data1 = dataFetched1;
            data2 = dataFetched2;

            // Wyświetl wykresy
            displayTwoRainCharts(dataFetched1, dataFetched2);
        })
        .catch(error => {
            console.error('Błąd podczas pobierania danych historycznych:', error);
            alert('Wystąpił błąd podczas pobierania danych. Spróbuj ponownie.');
        });
}


function fetchHistoricalDataForCity(cityId, startTimestamp, endTimestamp, cityName) {
    let currentStart = startTimestamp;
    let historicalData = [];

    const fetchNextPeriod = () => {
        const currentEnd = Math.min(currentStart + (7 * 24 * 60 * 60), endTimestamp); // Fetch data in 7-day chunks

        const url = `https://history.openweathermap.org/data/2.5/history/city?id=${cityId}&type=hour&start=${currentStart}&end=${currentEnd}&appid=${apiKey}`;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                historicalData = historicalData.concat(data.list);
                console.log(`Pobrano dane dla miasta ${cityName}, okres: ${new Date(currentStart * 1000)} - ${new Date(currentEnd * 1000)}`);

                if (currentEnd < endTimestamp) {
                    currentStart = currentEnd;
                    return fetchNextPeriod();
                } else {
                    return { cityName, data: historicalData };
                }
            });
    };

    return fetchNextPeriod();
}

function processRainData(historicalData) {
    const rainData = {}; // Obiekt do przechowywania danych o opadach na poszczególne dni

    historicalData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const rain = item.rain ? item.rain['1h'] : 0;

        if (!rainData[date]) {
            rainData[date] = 0;
        }
        rainData[date] += rain;
    });

    return rainData;
}


let rainChart1Instance = null;
let rainChart2Instance = null;

function resetCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const parent = canvas.parentNode;

    // Usuń istniejące płótno
    parent.removeChild(canvas);

    // Utwórz nowe płótno o tym samym identyfikatorze
    const newCanvas = document.createElement('canvas');
    newCanvas.id = canvasId;
    parent.appendChild(newCanvas);
}

function destroyChart(chartInstance, canvasId) {
    if (chartInstance && typeof chartInstance.destroy === 'function') {
        console.log("Zniszczenie istniejącego wykresu.");
        chartInstance.destroy();
    } else {
        console.warn("Nie można zniszczyć wykresu: brak poprawnej instancji.");
    }

    // Zresetuj płótno
    resetCanvas(canvasId);
}

function createChartForCity(canvasId, rainData, cityName) {
    const labels = Object.keys(rainData);
    const data = Object.values(rainData);

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`Nie znaleziono elementu canvas o ID: ${canvasId}`);
        return null;
    }

    console.log(`Tworzenie nowego wykresu dla miasta: ${cityName}`);
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Opady w ' + cityName,
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Opady (mm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
        
    });
}

function displayTwoRainCharts(data1, data2) {
    const rainData1 = processRainData(data1.data);
    const rainData2 = processRainData(data2.data);

    // Usuń istniejące wykresy i zresetuj płótna
    destroyChart(rainChart1Instance, 'rainChart1');
    destroyChart(rainChart2Instance, 'rainChart2');

    // Tworzenie nowych wykresów
    rainChart1Instance = createChartForCity('rainChart1', rainData1, data1.cityName);
    rainChart2Instance = createChartForCity('rainChart2', rainData2, data2.cityName);

    // Upewnienie się, że kontener na wykresy jest widoczny
    document.querySelector('.charts-container').style.display = 'flex';
}





// Obsługa kliknięcia przycisku "Porównaj dwa miasta"
document.getElementById('getRainHistoryTwo').addEventListener('click', function () {
    const city1 = document.getElementById('cityInput1').value;
    const city2 = document.getElementById('cityInput2').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!city1 || !city2 || !startDate || !endDate) {
        alert('Proszę podać oba miasta, datę początkową i datę końcową.');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('Data początkowa musi być przed datą końcową.');
        return;
    }

    console.log(`Pobieranie danych dla miast: ${city1} i ${city2}, od ${startDate} do ${endDate}`);

    getHistoricalWeatherTwoCities(city1, city2, startDate, endDate);
});





function downloadRainData() {
    const data = Object.keys(storedRainData).map(date => ({
        Data: date,
        Opady: storedRainData[date]
    }));
    const city = document.getElementById('city').value;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dane Opadów");

    // Tworzenie dynamicznej nazwy pliku
    const fileName = `dane_opadow_${city}.xlsx`;

    // Eksport pliku Excel z dynamiczną nazwą
    XLSX.writeFile(workbook, fileName);
}



// Funkcja do pobierania danych dla dwóch miast
function downloadRainDataTwoCities(rainData1, rainData2, city1, city2) {
    console.log("Funkcja downloadRainDataTwoCities wywołana.");

    if (!rainData1 || !rainData2) {
        console.error("Dane do pobrania są nieprawidłowe.");
        alert("Brakuje danych dla jednego lub obu miast.");
        return;
    }

    const data = [];
    const allDates = new Set([...Object.keys(rainData1), ...Object.keys(rainData2)]);

    allDates.forEach(date => {
        data.push({
            Data: date,
            [`Opady ${city1}`]: rainData1[date] || 0,
            [`Opady ${city2}`]: rainData2[date] || 0,
        });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dane Opadów");
    XLSX.writeFile(workbook, `dane_opadow_${city1}_${city2}.xlsx`);
}

document.getElementById('dowloadxlsx2').addEventListener('click', function () {
    // Sprawdź, czy dane zostały pobrane
    if (!data1 || !data2) {
        alert('Dane nie zostały jeszcze pobrane. Spróbuj ponownie później.');
        return;
    }

    // Przetwarzaj dane na format odpowiedni do zapisu
    const rainData1 = processRainData(data1.data);
    const rainData2 = processRainData(data2.data);

    // Zapisz dane do pliku Excel
    downloadRainDataTwoCities(rainData1, rainData2, data1.cityName, data2.cityName);
});
