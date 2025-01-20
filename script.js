// Your valid API key
const apiKey = "22c7b1ebfc72916dd3a17b037195b20d";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

// Elements
const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const weatherIconElement = document.getElementById("weather-icon");
const recentSearchesElement = document.getElementById("search-list");

// On page load, fetch weather automatically based on user location
document.addEventListener("DOMContentLoaded", () => {
  fetchWeatherByGeolocation();
  displayRecentSearches();
});

// Event listener for the search button
searchButton.addEventListener("click", async () => {
  const location = locationInput.value;
  if (location) {
    await fetchWeather(location);
    saveRecentSearch(location);
  }
});

// Fetch weather data based on city name
async function fetchWeather(location) {
  const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`; // Add units=metric for Celsius
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or invalid API request");
    const data = await response.json();
    // Update the UI
    updateUI(data);
    setBackground(data.weather[0].main);
    sayWeather(data); // Announce weather details
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please check the city name.");
  }
}

// Automatically fetch weather based on user's geolocation
function fetchWeatherByGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        try {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error("Failed to fetch weather by location");
          const data = await response.json();
          updateUI(data);
          setBackground(data.weather[0].main);
          sayWeather(data); // Announce weather details
        } catch (error) {
          console.error("Error fetching weather by geolocation:", error);
          alert("Could not fetch weather by location.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to fetch location. Please search manually.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Update the weather information on the page
function updateUI(data) {
  locationElement.textContent = data.name;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
  descriptionElement.textContent = data.weather[0].description;
  weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

  // Add animation effect
  document.body.classList.add("animate");
  setTimeout(() => {
    document.body.classList.remove("animate");
  }, 1000);
}

// Set background color based on weather condition
function setBackground(weatherCondition) {
  document.body.classList.remove("sunny", "rainy", "cloudy", "snowy");

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      document.body.classList.add("sunny");
      break;
    case "rain":
      document.body.classList.add("rainy");
      break;
    case "clouds":
      document.body.classList.add("cloudy");
      break;
    case "snow":
      document.body.classList.add("snowy");
      break;
    default:
      document.body.classList.add("cloudy");
      break;
  }
}

// Save recent searches to localStorage
function saveRecentSearch(city) {
  let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (!recentSearches.includes(city)) {
    recentSearches.push(city);
    if (recentSearches.length > 5) {
      recentSearches.shift(); // Remove the oldest search
    }
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    displayRecentSearches();
  }
}

// Display recent searches
function displayRecentSearches() {
  const recentSearches =
    JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentSearchesElement.innerHTML = "";

  recentSearches.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", async () => {
      await fetchWeather(city);
    });
    recentSearchesElement.appendChild(li);
  });
}

// Announce weather details using Web Speech API
function sayWeather(data) {
  const message = `The weather in ${data.name} is ${
    data.weather[0].description
  } with a temperature of ${Math.round(data.main.temp)} degrees Celsius.`;
  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}
