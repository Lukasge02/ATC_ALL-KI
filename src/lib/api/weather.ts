import { API_CONFIG, hasApiKey, getApiUrl } from '@/lib/config/api';

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    icon: 'sun' | 'cloud' | 'rain' | 'snow';
    humidity: number;
    wind: number;
    visibility: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    icon: 'sun' | 'cloud' | 'rain' | 'snow';
  }>;
  aiSuggestion?: string;
}

// Mock data für Entwicklung ohne API Key
export const MOCK_WEATHER_DATA: WeatherData = {
  location: "Berlin, DE",
  current: {
    temp: 18,
    condition: "Teilweise bewölkt",
    icon: 'cloud',
    humidity: 65,
    wind: 12,
    visibility: 10
  },
  forecast: [
    { day: "Mo", high: 20, low: 14, icon: 'sun' },
    { day: "Di", high: 18, low: 12, icon: 'cloud' },
    { day: "Mi", high: 16, low: 11, icon: 'rain' },
    { day: "Do", high: 19, low: 13, icon: 'cloud' },
    { day: "Fr", high: 21, low: 15, icon: 'sun' }
  ],
  aiSuggestion: "Heute wird es mild mit gelegentlichen Wolken. Perfekt für einen Spaziergang am Nachmittag! 🚶‍♂️"
};

// Map OpenWeatherMap icons to our simple icons
const mapWeatherIcon = (iconCode: string): 'sun' | 'cloud' | 'rain' | 'snow' => {
  if (iconCode.includes('01')) return 'sun';
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return 'cloud';
  if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) return 'rain';
  if (iconCode.includes('13')) return 'snow';
  return 'cloud';
};

// Map condition codes to German descriptions
const getConditionDescription = (id: number): string => {
  if (id >= 200 && id < 300) return 'Gewitter';
  if (id >= 300 && id < 400) return 'Nieselregen';
  if (id >= 500 && id < 600) return 'Regen';
  if (id >= 600 && id < 700) return 'Schnee';
  if (id >= 700 && id < 800) return 'Nebel';
  if (id === 800) return 'Klar';
  if (id > 800) return 'Bewölkt';
  return 'Unbekannt';
};

export async function fetchWeatherData(location: string = 'Berlin'): Promise<WeatherData> {
  // Check if API key is available
  if (!hasApiKey('weather', 'openWeatherMap')) {
    return MOCK_WEATHER_DATA;
  }

  try {
    const config = API_CONFIG.weather.openWeatherMap;
    
    // Fetch current weather
    const currentUrl = `${config.baseUrl}${config.endpoints.current}?q=${location}&appid=${config.apiKey}&units=${config.defaultParams.units}&lang=${config.defaultParams.lang}`;
    const currentResponse = await fetch(currentUrl);
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // Fetch forecast
    const forecastUrl = `${config.baseUrl}${config.endpoints.forecast}?q=${location}&appid=${config.apiKey}&units=${config.defaultParams.units}&lang=${config.defaultParams.lang}&cnt=5`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Transform API data to our format
    const weatherData: WeatherData = {
      location: `${currentData.name}, ${currentData.sys.country}`,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: getConditionDescription(currentData.weather[0].id),
        icon: mapWeatherIcon(currentData.weather[0].icon),
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
        visibility: Math.round(currentData.visibility / 1000) // m to km
      },
      forecast: forecastData.list.map((item: any, index: number) => {
        const date = new Date(item.dt * 1000);
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        
        return {
          day: days[date.getDay()],
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          icon: mapWeatherIcon(item.weather[0].icon)
        };
      })
    };
    
    // Generate AI suggestion based on weather
    weatherData.aiSuggestion = generateWeatherSuggestion(weatherData);
    
    return weatherData;
    
  } catch (error) {
    // Fallback to mock data on error
    return MOCK_WEATHER_DATA;
  }
}

function generateWeatherSuggestion(weather: WeatherData): string {
  const { temp, condition, wind } = weather.current;
  
  // Simple rule-based suggestions (später durch echte KI ersetzen)
  if (condition.includes('Regen')) {
    return "Regenwetter heute! Vergiss deinen Regenschirm nicht. ☔ Perfekt für gemütliche Indoor-Aktivitäten.";
  }
  
  if (temp > 25) {
    return "Heißer Tag! Denk an Sonnenschutz und ausreichend Wasser. 🌞 Ideal für Aktivitäten am Wasser.";
  }
  
  if (temp < 10) {
    return "Zieh dich warm an! Eine extra Schicht schadet heute nicht. 🧥 Heißer Tee oder Kaffee wärmt von innen.";
  }
  
  if (wind > 20) {
    return "Heute ist es windig! Sichere lose Gegenstände im Freien. 💨 Nicht der beste Tag für Regenschirme.";
  }
  
  if (condition === 'Klar' && temp >= 15 && temp <= 25) {
    return "Perfektes Wetter heute! Ideal für Outdoor-Aktivitäten. 🌤️ Nutze den schönen Tag für einen Spaziergang.";
  }
  
  return "Angenehmes Wetter heute. Ein guter Tag für deine geplanten Aktivitäten! 😊";
}