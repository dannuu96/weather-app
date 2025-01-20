const apiKey = "22c7b1ebfc72916dd3a17b037195b20d"; // Your valid API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const geoApiUrl = "https://api.openweathermap.org/data/2.5/find"; // Geocoding API for city suggestions

// Elements
const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const weatherIconElement = document.getElementById("weather-icon");
const recentSearchesElement = document.getElementById("search-list");
const suggestionsElement = document.getElementById("suggestions"); // Suggestion container

// Event listener for the search button
searchButton.addEventListener("click", async () => {
  const location = locationInput.value;
  if (location) {
    await fetchWeather(location);
    saveRecentSearch(location);
  }
});

// Listen to the input event on the location input field for auto-complete
locationInput.addEventListener("input", async () => {
  const query = locationInput.value;
  if (query.length > 1) {
    await fetchSuggestions(query); // Fetch suggestions when user types more than 2 characters
  } else {
    suggestionsElement.style.display = "none"; // Hide suggestions if input is short
  }
});

// Fetch city suggestions based on input query
async function fetchSuggestions(query) {
  const url = `${geoApiUrl}?q=${query}&appid=${apiKey}&cnt=5`; // Fetch max 5 suggestions
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Show suggestions only if we have results
    if (data.list && data.list.length > 0) {
      suggestionsElement.innerHTML = ""; // Clear previous suggestions
      data.list.forEach((city) => {
        const div = document.createElement("div");
        div.textContent = city.name + ", " + city.sys.country;
        div.addEventListener("click", () => {
          locationInput.value = div.textContent;
          fetchWeather(city.name); // Fetch weather for the selected city
          suggestionsElement.style.display = "none"; // Hide suggestions after selection
        });
        suggestionsElement.appendChild(div);
      });
      suggestionsElement.style.display = "block"; // Show suggestions
    } else {
      suggestionsElement.style.display = "none"; // Hide if no results
    }
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
    suggestionsElement.style.display = "none"; // Hide suggestions if error occurs
  }
}

// Fetch weather data based on city name
async function fetchWeather(location) {
  const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`; // Add units=metric for Celsius
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or invalid API request");
    const data = await response.json();
    updateUI(data);
    setBackground(data.weather[0].main);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please check the city name.");
  }
}

// Update the weather information on the page
function updateUI(data) {
  locationElement.textContent = data.name;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
  descriptionElement.textContent = data.weather[0].description;
  weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
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

// Display recent searches on page load
document.addEventListener("DOMContentLoaded", () => {
  displayRecentSearches();
});
