"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Eye, AlertCircle, MapPin, Settings } from "lucide-react";
import { WidgetContainer } from "../shared/WidgetContainer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fetchWeatherData, type WeatherData } from "@/lib/api/weather";
import { hasApiKey } from "@/lib/config/api";

interface WeatherWidgetProps {
  onRemove: () => void;
  onUpdateConfig: (config: any) => void;
  size: string;
  config?: {
    location?: string;
    units?: 'celsius' | 'fahrenheit';
  };
}

const weatherIcons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow
};

export function WeatherWidget({ onRemove, onUpdateConfig, size, config }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inputLocation, setInputLocation] = useState(config?.location || 'Berlin');
  const hasApi = hasApiKey('weather', 'openWeatherMap');

  useEffect(() => {
    loadWeather();
  }, [config?.location]);

  const loadWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(config?.location || 'Berlin');
      setWeatherData(data);
    } catch (err) {
      setError('Fehler beim Laden der Wetterdaten');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWeather = () => {
    loadWeather();
  };

  const saveLocation = () => {
    const newConfig = { ...config, location: inputLocation };
    onUpdateConfig(newConfig);
    setShowSettings(false);
    loadWeather();
  };

  const WeatherIcon = weatherData ? weatherIcons[weatherData.current.icon] : Cloud;
  const isCompact = size === '2x1';

  return (
    <>
      <WidgetContainer
        title="Wetter"
        icon={<Cloud className="h-4 w-4" />}
        onRemove={onRemove}
        onRefresh={refreshWeather}
        onSettings={() => setShowSettings(true)}
        isLoading={isLoading}
      >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : weatherData ? (
        <div className="h-full flex flex-col">
          {/* Current Weather */}
          <div className={cn("mb-4", isCompact && "mb-2")}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{weatherData.location}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{weatherData.current.temp}°</span>
                  <span className="text-sm text-muted-foreground">
                    {weatherData.current.condition}
                  </span>
                </div>
              </div>
              <WeatherIcon className="h-12 w-12 text-primary" />
            </div>

            {!isCompact && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-muted-foreground" />
                  <span>{weatherData.current.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-muted-foreground" />
                  <span>{weatherData.current.wind} km/h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span>{weatherData.current.visibility} km</span>
                </div>
              </div>
            )}
          </div>

          {/* Forecast */}
          {!isCompact && (
            <>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">5-Tage Vorhersage</p>
                <div className="grid grid-cols-5 gap-1">
                  {weatherData.forecast.map((day) => {
                    const DayIcon = weatherIcons[day.icon];
                    return (
                      <div key={day.day} className="text-center">
                        <p className="text-xs text-muted-foreground">{day.day}</p>
                        <DayIcon className="h-6 w-6 mx-auto my-1 text-muted-foreground" />
                        <p className="text-xs font-medium">{day.high}°</p>
                        <p className="text-xs text-muted-foreground">{day.low}°</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Suggestion */}
              {weatherData.aiSuggestion && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">KI</Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {weatherData.aiSuggestion}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* API Key Warning */}
          {!hasApi && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">Mock-Daten</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                    Füge deinen OpenWeatherMap API Key in .env.local hinzu für echte Daten
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshWeather} className="mt-2">
            Erneut versuchen
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">Wetterdaten nicht verfügbar</p>
        </div>
      )}
    </WidgetContainer>

    {/* Settings Dialog */}
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Wetter-Einstellungen</DialogTitle>
          <DialogDescription>
            Wähle deine Stadt für personalisierte Wettervorhersagen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stadt</label>
            <div className="flex gap-2">
              <Input
                placeholder="z.B. Berlin, München, Hamburg..."
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveLocation()}
              />
              <Button onClick={saveLocation} disabled={!inputLocation.trim()}>
                Speichern
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Du kannst Stadt, Land oder Koordinaten eingeben
            </p>
          </div>

          {/* Popular Cities */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Beliebte Städte</label>
            <div className="flex flex-wrap gap-2">
              {['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setInputLocation(city);
                    const newConfig = { ...config, location: city };
                    onUpdateConfig(newConfig);
                    setShowSettings(false);
                  }}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}