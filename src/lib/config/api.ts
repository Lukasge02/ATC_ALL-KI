// Zentrale API-Konfiguration
// Alle API-Endpunkte und Keys werden hier verwaltet

export const API_CONFIG = {
  // Weather API Configuration
  weather: {
    openWeatherMap: {
      apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
      endpoints: {
        current: '/weather',
        forecast: '/forecast',
        geocoding: '/geo/1.0/direct'
      },
      defaultParams: {
        units: 'metric',
        lang: 'de'
      }
    }
  },

  // News API Configuration
  news: {
    newsApi: {
      apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_NEWS_API_URL || 'https://newsapi.org/v2',
      endpoints: {
        topHeadlines: '/top-headlines',
        everything: '/everything',
        sources: '/sources'
      },
      defaultParams: {
        country: 'de',
        pageSize: 10
      }
    },
    guardian: {
      apiKey: process.env.NEXT_PUBLIC_GUARDIAN_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_GUARDIAN_API_URL || 'https://content.guardianapis.com',
      endpoints: {
        search: '/search',
        sections: '/sections'
      }
    }
  },

  // Stocks API Configuration
  stocks: {
    alphaVantage: {
      apiKey: process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_URL || 'https://www.alphavantage.co/query',
      endpoints: {
        quote: 'GLOBAL_QUOTE',
        search: 'SYMBOL_SEARCH',
        daily: 'TIME_SERIES_DAILY'
      }
    }
  },

  // Google APIs
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },

  // Google Maps specific APIs
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    baseUrl: 'https://maps.googleapis.com/maps/api',
    endpoints: {
      directions: '/directions/json',
      geocoding: '/geocode/json',
      distanceMatrix: '/distancematrix/json',
      places: '/place/textsearch/json'
    }
  },

  // Spotify API
  spotify: {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/spotify/callback` : '',
    scopes: [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state'
    ]
  },

  // GitHub API
  github: {
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com',
    endpoints: {
      user: '/user',
      repos: '/user/repos',
      stats: '/repos/{owner}/{repo}/stats'
    }
  }
};

// Helper functions für API-Zugriff
export const hasApiKey = (service: keyof typeof API_CONFIG, provider?: string): boolean => {
  if (provider) {
    const serviceConfig = API_CONFIG[service] as any;
    return !!(serviceConfig[provider]?.apiKey);
  }
  
  const config = API_CONFIG[service] as any;
  return !!(config.apiKey || config.token || (Object.values(config)[0] as any)?.apiKey);
};

export const getApiUrl = (service: keyof typeof API_CONFIG, provider: string, endpoint: string): string => {
  const serviceConfig = API_CONFIG[service] as any;
  const providerConfig = serviceConfig[provider];
  
  if (!providerConfig) {
    throw new Error(`Provider ${provider} not found for service ${service}`);
  }
  
  const baseUrl = providerConfig.baseUrl;
  const endpointPath = providerConfig.endpoints[endpoint];
  
  if (!endpointPath) {
    throw new Error(`Endpoint ${endpoint} not found for provider ${provider}`);
  }
  
  return `${baseUrl}${endpointPath}`;
};

// API Status Check
export const checkApiStatus = async (): Promise<Record<string, boolean>> => {
  const status: Record<string, boolean> = {};
  
  // Check Weather API
  status.weather = hasApiKey('weather', 'openWeatherMap');
  
  // Check News API
  status.news = hasApiKey('news', 'newsApi') || hasApiKey('news', 'guardian');
  
  // Check other APIs
  status.stocks = hasApiKey('stocks', 'alphaVantage');
  status.google = !!API_CONFIG.google.apiKey;
  status.maps = !!API_CONFIG.maps.apiKey;
  status.spotify = !!API_CONFIG.spotify.clientId;
  status.github = !!API_CONFIG.github.token;
  
  return status;
};