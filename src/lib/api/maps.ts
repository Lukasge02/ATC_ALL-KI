import { API_CONFIG, hasApiKey } from '@/lib/config/api';

export interface RouteData {
  duration: number; // in minutes
  durationInTraffic?: number; // in minutes with current traffic
  distance: string;
  traffic: 'light' | 'moderate' | 'heavy';
  departureTime: string;
  arrivalTime: string;
  steps: RouteStep[];
  alternativeRoutes?: AlternativeRoute[];
  summary: string;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: number; // in minutes
  polyline?: string;
}

export interface AlternativeRoute {
  duration: number;
  distance: string;
  savings: number; // minutes saved compared to main route
  description: string;
  traffic: 'light' | 'moderate' | 'heavy';
}

export interface TrafficInfo {
  currentDelay: number; // in minutes
  severity: 'light' | 'moderate' | 'heavy';
  incidents: TrafficIncident[];
}

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'closure' | 'congestion';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  delay: number; // estimated delay in minutes
}

// Mock data for development
export const MOCK_ROUTE_DATA: RouteData = {
  duration: 25,
  durationInTraffic: 28,
  distance: '12.3 km',
  traffic: 'moderate',
  departureTime: '08:15',
  arrivalTime: '08:43',
  summary: 'Über A100 und Stadtautobahn',
  steps: [
    { instruction: 'Fahre 500m geradeaus auf Hauptstraße', distance: '500m', duration: 2 },
    { instruction: 'Rechts abbiegen auf A100', distance: '8.2km', duration: 15 },
    { instruction: 'Ausfahrt Potsdamer Platz', distance: '2.1km', duration: 5 },
    { instruction: 'Angekommen am Ziel', distance: '1.5km', duration: 3 }
  ],
  alternativeRoutes: [
    {
      duration: 22,
      distance: '14.1 km',
      savings: 3,
      description: 'Über Stadtring (weniger Verkehr)',
      traffic: 'light'
    },
    {
      duration: 32,
      distance: '10.8 km',
      savings: -4,
      description: 'Durch Innenstadt (kürzere Strecke)',
      traffic: 'heavy'
    }
  ]
};

// Determine traffic level based on duration difference
const calculateTrafficLevel = (normalDuration: number, trafficDuration: number): 'light' | 'moderate' | 'heavy' => {
  const increase = (trafficDuration - normalDuration) / normalDuration;
  
  if (increase <= 0.1) return 'light';
  if (increase <= 0.3) return 'moderate';
  return 'heavy';
};

// Generate realistic traffic incidents
const generateTrafficIncidents = (traffic: 'light' | 'moderate' | 'heavy'): TrafficIncident[] => {
  const incidents: TrafficIncident[] = [];
  
  if (traffic === 'moderate' || traffic === 'heavy') {
    incidents.push({
      type: 'congestion',
      description: 'Starker Verkehr auf A100',
      severity: traffic === 'heavy' ? 'major' : 'moderate',
      delay: traffic === 'heavy' ? 8 : 4
    });
  }
  
  if (traffic === 'heavy') {
    if (Math.random() > 0.5) {
      incidents.push({
        type: 'accident',
        description: 'Unfall auf Stadtautobahn - rechte Spur gesperrt',
        severity: 'moderate',
        delay: 5
      });
    }
    
    if (Math.random() > 0.7) {
      incidents.push({
        type: 'construction',
        description: 'Baustelle am Potsdamer Platz',
        severity: 'minor',
        delay: 2
      });
    }
  }
  
  return incidents;
};

// Calculate optimal departure time
const calculateOptimalDepartureTime = (targetArrival: string, baseDuration: number, traffic: 'light' | 'moderate' | 'heavy'): string => {
  const [hours, minutes] = targetArrival.split(':').map(Number);
  const arrivalTime = new Date();
  arrivalTime.setHours(hours, minutes, 0, 0);
  
  // Add traffic buffer
  const trafficBuffer = traffic === 'heavy' ? 10 : traffic === 'moderate' ? 5 : 0;
  const totalDuration = baseDuration + trafficBuffer;
  
  const departureTime = new Date(arrivalTime.getTime() - totalDuration * 60000);
  return departureTime.toTimeString().slice(0, 5);
};

export async function fetchRouteData(
  origin: string = 'Berlin Friedrichshain',
  destination: string = 'Berlin Mitte',
  arrivalTime: string = '09:00'
): Promise<RouteData> {
  // Check if Google Maps API key is available
  if (!hasApiKey('maps')) {
    return {
      ...MOCK_ROUTE_DATA,
      departureTime: calculateOptimalDepartureTime(arrivalTime, MOCK_ROUTE_DATA.duration, MOCK_ROUTE_DATA.traffic)
    };
  }

  try {
    const config = API_CONFIG.maps;
    
    // Build directions API URL
    const directionsUrl = new URL(`${config.baseUrl}${config.endpoints.directions}`);
    directionsUrl.searchParams.append('origin', origin);
    directionsUrl.searchParams.append('destination', destination);
    directionsUrl.searchParams.append('departure_time', 'now');
    directionsUrl.searchParams.append('traffic_model', 'best_guess');
    directionsUrl.searchParams.append('alternatives', 'true');
    directionsUrl.searchParams.append('language', 'de');
    directionsUrl.searchParams.append('key', config.apiKey);

    const response = await fetch(directionsUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API status: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Extract main route data
    const normalDuration = Math.round(leg.duration.value / 60);
    const trafficDuration = leg.duration_in_traffic ? Math.round(leg.duration_in_traffic.value / 60) : normalDuration;
    const trafficLevel = calculateTrafficLevel(normalDuration, trafficDuration);
    
    // Process route steps
    const steps: RouteStep[] = leg.steps.map((step: any) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
      distance: step.distance.text,
      duration: Math.round(step.duration.value / 60),
      polyline: step.polyline?.points
    }));

    // Process alternative routes
    const alternativeRoutes: AlternativeRoute[] = data.routes.slice(1, 3).map((altRoute: any) => {
      const altLeg = altRoute.legs[0];
      const altDuration = Math.round(altLeg.duration.value / 60);
      const altTrafficDuration = altLeg.duration_in_traffic ? Math.round(altLeg.duration_in_traffic.value / 60) : altDuration;
      const altTrafficLevel = calculateTrafficLevel(altDuration, altTrafficDuration);
      
      return {
        duration: altTrafficDuration,
        distance: altLeg.distance.text,
        savings: trafficDuration - altTrafficDuration,
        description: altRoute.summary || 'Alternative Route',
        traffic: altTrafficLevel
      };
    });

    // Calculate optimal departure time
    const optimalDeparture = calculateOptimalDepartureTime(arrivalTime, trafficDuration, trafficLevel);
    
    // Calculate arrival time
    const [depHours, depMinutes] = optimalDeparture.split(':').map(Number);
    const arrivalDate = new Date();
    arrivalDate.setHours(depHours, depMinutes + trafficDuration, 0, 0);
    const arrivalTimeStr = arrivalDate.toTimeString().slice(0, 5);

    const routeData: RouteData = {
      duration: normalDuration,
      durationInTraffic: trafficDuration,
      distance: leg.distance.text,
      traffic: trafficLevel,
      departureTime: optimalDeparture,
      arrivalTime: arrivalTimeStr,
      summary: route.summary || 'Empfohlene Route',
      steps,
      alternativeRoutes: alternativeRoutes.length > 0 ? alternativeRoutes : undefined
    };

    return routeData;
    
  } catch (error) {
    // Fallback to mock data on error
    return {
      ...MOCK_ROUTE_DATA,
      departureTime: calculateOptimalDepartureTime(arrivalTime, MOCK_ROUTE_DATA.duration, MOCK_ROUTE_DATA.traffic)
    };
  }
}

export async function fetchTrafficInfo(origin: string, destination: string): Promise<TrafficInfo> {
  try {
    const routeData = await fetchRouteData(origin, destination);
    const delay = (routeData.durationInTraffic || routeData.duration) - routeData.duration;
    
    return {
      currentDelay: delay,
      severity: routeData.traffic,
      incidents: generateTrafficIncidents(routeData.traffic)
    };
  } catch (error) {
    return {
      currentDelay: 3,
      severity: 'moderate',
      incidents: generateTrafficIncidents('moderate')
    };
  }
}

// Get estimated travel time for specific departure time
export async function getEstimatedTravelTime(
  origin: string,
  destination: string,
  departureTime: Date
): Promise<{ duration: number; durationInTraffic: number; traffic: 'light' | 'moderate' | 'heavy' }> {
  if (!hasApiKey('maps')) {
    return {
      duration: 25,
      durationInTraffic: 28,
      traffic: 'moderate'
    };
  }

  try {
    const config = API_CONFIG.maps;
    const departureTimestamp = Math.floor(departureTime.getTime() / 1000);
    
    const url = new URL(`${config.baseUrl}${config.endpoints.directions}`);
    url.searchParams.append('origin', origin);
    url.searchParams.append('destination', destination);
    url.searchParams.append('departure_time', departureTimestamp.toString());
    url.searchParams.append('traffic_model', 'best_guess');
    url.searchParams.append('key', config.apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status === 'OK' && data.routes.length > 0) {
      const leg = data.routes[0].legs[0];
      const normalDuration = Math.round(leg.duration.value / 60);
      const trafficDuration = leg.duration_in_traffic ? Math.round(leg.duration_in_traffic.value / 60) : normalDuration;
      
      return {
        duration: normalDuration,
        durationInTraffic: trafficDuration,
        traffic: calculateTrafficLevel(normalDuration, trafficDuration)
      };
    }
    
    throw new Error('No routes found');
    
  } catch (error) {
    return {
      duration: 25,
      durationInTraffic: 28,
      traffic: 'moderate'
    };
  }
}