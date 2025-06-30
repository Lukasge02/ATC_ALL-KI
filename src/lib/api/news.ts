import { API_CONFIG, hasApiKey } from '@/lib/config/api';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  category: string;
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  imageUrl?: string;
  url?: string;
}

// Mock data für Entwicklung ohne API Key
export const MOCK_NEWS_DATA: NewsArticle[] = [
  {
    id: '1',
    title: 'Neue KI-Durchbrüche revolutionieren die Technologiebranche',
    description: 'Forscher haben bedeutende Fortschritte in der künstlichen Intelligenz erzielt, die verschiedene Branchen transformieren könnten.',
    source: 'Tech Daily',
    publishedAt: '2 Stunden',
    category: 'Technologie',
    aiSummary: 'KI-Modelle zeigen beeindruckende Fähigkeiten in Reasoning und Kreativität.',
    sentiment: 'positive',
    url: '#'
  },
  {
    id: '2',
    title: 'Nachhaltige Energie: Deutschland erreicht neuen Rekord',
    description: 'Erneuerbare Energien decken erstmals über 50% des Strombedarfs für einen ganzen Monat.',
    source: 'Energie News',
    publishedAt: '4 Stunden',
    category: 'Umwelt',
    aiSummary: 'Windkraft und Solar führen den Weg zu klimaneutraler Zukunft.',
    sentiment: 'positive',
    url: '#'
  },
  {
    id: '3',
    title: 'Startup-Szene Berlin: Neue Investitionsrunde angekündigt',
    description: 'Mehrere Berliner Startups erhalten Millionen-Investments für innovative Lösungen.',
    source: 'Startup Magazin',
    publishedAt: '6 Stunden',
    category: 'Business',
    aiSummary: 'Fokus auf GreenTech und HealthTech Startups.',
    sentiment: 'neutral',
    url: '#'
  },
  {
    id: '4',
    title: 'Bildungsreform: Digitalisierung an Schulen schreitet voran',
    description: 'Neue Initiative bringt moderne Technologie in deutsche Klassenzimmer.',
    source: 'Bildung Heute',
    publishedAt: '8 Stunden',
    category: 'Bildung',
    aiSummary: 'Tablets und KI-Tools unterstützen personalisiertes Lernen.',
    sentiment: 'positive',
    url: '#'
  }
];

// Map NewsAPI categories to German
const categoryMap: Record<string, string> = {
  'business': 'Business',
  'entertainment': 'Unterhaltung',
  'general': 'Allgemein',
  'health': 'Gesundheit',
  'science': 'Wissenschaft',
  'sports': 'Sport',
  'technology': 'Technologie'
};

// Calculate time ago in German
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `vor ${diffInMinutes} Minuten`;
  } else if (diffInHours < 24) {
    return `vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `vor ${diffInDays} Tag${diffInDays > 1 ? 'en' : ''}`;
  }
}

// Simple sentiment analysis (später durch echte KI ersetzen)
function analyzeSentiment(title: string, description: string): 'positive' | 'neutral' | 'negative' {
  const text = `${title} ${description}`.toLowerCase();
  
  const positiveWords = ['erfolg', 'wachstum', 'innovation', 'durchbruch', 'rekord', 'verbesserung', 'gewinn'];
  const negativeWords = ['krise', 'verlust', 'problem', 'gefahr', 'rückgang', 'warnung', 'kritik'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Generate AI summary (später durch echte KI ersetzen)
function generateAISummary(article: any): string {
  const summaries = [
    'Wichtige Entwicklungen zeichnen sich ab.',
    'Experten sehen große Potenziale.',
    'Die Auswirkungen werden weitreichend sein.',
    'Ein bedeutender Schritt in die richtige Richtung.',
    'Weitere Entwicklungen bleiben abzuwarten.'
  ];
  
  // Simple hash to get consistent summary for same article
  const hash = article.title.length % summaries.length;
  return summaries[hash];
}

export async function fetchNewsData(category: string = 'general', country: string = 'de'): Promise<NewsArticle[]> {
  // Always use mock data for development to avoid API issues
  return MOCK_NEWS_DATA;

  // Original API code (commented out for development)
  /*
  // Check if API key is available
  if (!hasApiKey('news', 'newsApi')) {
    return MOCK_NEWS_DATA;
  }

  try {
    const config = API_CONFIG.news.newsApi;
    const endpoint = category === 'all' ? 'topHeadlines' : 'topHeadlines';
    
    const params = new URLSearchParams({
      apiKey: config.apiKey,
      country: country,
      pageSize: config.defaultParams.pageSize.toString()
    });
    
    if (category !== 'all') {
      params.append('category', category);
    }
    
    const url = `${config.baseUrl}${config.endpoints[endpoint]}?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('News API returned error status');
    }
    
    // Transform API data to our format
    const articles: NewsArticle[] = data.articles.map((article: any, index: number) => {
      const sentiment = analyzeSentiment(article.title, article.description || '');
      
      return {
        id: `article-${Date.now()}-${index}`,
        title: article.title,
        description: article.description || 'Keine Beschreibung verfügbar',
        source: article.source.name,
        publishedAt: getTimeAgo(article.publishedAt),
        category: categoryMap[category] || 'Allgemein',
        aiSummary: generateAISummary(article),
        sentiment: sentiment,
        imageUrl: article.urlToImage,
        url: article.url
      };
    });
    
    return articles;
    
  } catch (error) {
    // Fallback to mock data on error
    return MOCK_NEWS_DATA;
  }
  */
}

// Fetch news from The Guardian API (alternative)
export async function fetchGuardianNews(section: string = 'world'): Promise<NewsArticle[]> {
  if (!hasApiKey('news', 'guardian')) {
    return [];
  }

  try {
    const config = API_CONFIG.news.guardian;
    
    const params = new URLSearchParams({
      'api-key': config.apiKey,
      'page-size': '10',
      'show-fields': 'headline,trailText,thumbnail'
    });
    
    if (section !== 'all') {
      params.append('section', section);
    }
    
    const url = `${config.baseUrl}${config.endpoints.search}?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Guardian API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response.status !== 'ok') {
      throw new Error('Guardian API returned error status');
    }
    
    // Transform Guardian data to our format
    const articles: NewsArticle[] = data.response.results.map((article: any, index: number) => ({
      id: `guardian-${Date.now()}-${index}`,
      title: article.webTitle,
      description: article.fields?.trailText || 'Keine Beschreibung verfügbar',
      source: 'The Guardian',
      publishedAt: getTimeAgo(article.webPublicationDate),
      category: article.sectionName || 'Allgemein',
      aiSummary: generateAISummary(article),
      sentiment: 'neutral',
      imageUrl: article.fields?.thumbnail,
      url: article.webUrl
    }));
    
    return articles;
    
  } catch (error) {
    return [];
  }
}