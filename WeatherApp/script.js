const API_KEY = "168771779c71f3d64106d8a88376808a";

// Tab Switching 
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".userInfoContainer");
const grantAccessContainer = document.querySelector(".grantLocationContainer");
const loadingContainer = document.querySelector('.loadingContainer');
const notFound = document.querySelector('.errorContainer');

const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

let currentTab = userTab;
currentTab.classList.add("bg-white/50", "rounded"); // like .currentTab
getFromSessionStorage();

function switchTab(newTab) {
    notFound.classList.add("hidden");

    if (currentTab !== newTab) {
        currentTab.classList.remove("bg-white/50", "rounded");
        currentTab = newTab;
        currentTab.classList.add("bg-white/50", "rounded");

        if (searchForm.classList.contains("hidden")) {
            searchForm.classList.remove("hidden");
            userInfoContainer.classList.add("hidden");
            grantAccessContainer.classList.add("hidden");
        } else {
            searchForm.classList.add("hidden");
            userInfoContainer.classList.add("hidden");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => switchTab(userTab));
searchTab.addEventListener('click', () => switchTab(searchTab));

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("userCoordinates");

    if (!localCoordinates) {
        grantAccessContainer.classList.remove("hidden");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

async function fetchWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantAccessContainer.classList.add("hidden");
    loadingContainer.classList.remove("hidden");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (!data.sys) throw data;

        loadingContainer.classList.add("hidden");
        userInfoContainer.classList.remove("hidden");
        renderWeatherInfo(data);
    } catch (err) {
        loadingContainer.classList.add("hidden");
        notFound.classList.remove("hidden");
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';

        errorBtn.onclick = () => fetchWeatherInfo(coordinates);
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector('[data-cityName]');
    const countryFlag = document.querySelector('[data-countryFlag]');
    const description = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');

    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessButton = document.querySelector('[data-grantAccess]');

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        grantAccessButton.style.display = 'none';
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', getLocation);

// Search for weather
const searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;

    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingContainer.classList.remove("hidden");
    userInfoContainer.classList.add("hidden");
    grantAccessContainer.classList.add("hidden");
    notFound.classList.add("hidden");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (!data.sys) throw data;

        loadingContainer.classList.add("hidden");
        userInfoContainer.classList.remove("hidden");
        renderWeatherInfo(data);
    } catch (err) {
        loadingContainer.classList.add("hidden");
        userInfoContainer.classList.add("hidden");
        notFound.classList.remove("hidden");
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}
