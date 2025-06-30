"use client";

import { useState, useEffect } from "react";
import { Newspaper, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { WidgetContainer } from "../shared/WidgetContainer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchNewsData, type NewsArticle } from "@/lib/api/news";
import { hasApiKey } from "@/lib/config/api";

interface NewsWidgetProps {
  onRemove: () => void;
  onUpdateConfig: (config: any) => void;
  size: string;
  config?: {
    category?: string;
    country?: string;
  };
}

const CATEGORIES = [
  { value: 'all', label: 'Alle' },
  { value: 'tech', label: 'Technologie' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Wissenschaft' },
  { value: 'health', label: 'Gesundheit' }
];

export function NewsWidget({ onRemove, onUpdateConfig, size, config }: NewsWidgetProps) {
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(config?.category || 'general');
  const hasApi = hasApiKey('news', 'newsApi');

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const category = selectedCategory === 'all' ? 'general' : selectedCategory;
      const data = await fetchNewsData(category, config?.country || 'de');
      setNewsData(data);
    } catch (err) {
      setError('Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNews = () => {
    loadNews();
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const isCompact = size === '2x2';
  const articlesToShow = isCompact ? 2 : 4;

  return (
    <WidgetContainer
      title="News"
      icon={<Newspaper className="h-4 w-4" />}
      onRemove={onRemove}
      onRefresh={refreshNews}
      isLoading={isLoading}
    >
      {error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshNews} className="mt-2">
            Erneut versuchen
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Category Filter */}
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setSelectedCategory(cat.value);
                  onUpdateConfig({ ...config, category: cat.value });
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* News Articles */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <>
                {[...Array(articlesToShow)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </>
            ) : newsData.length > 0 ? (
              newsData.slice(0, articlesToShow).map((article) => (
                <article 
                  key={article.id} 
                  className="border-b last:border-0 pb-3 last:pb-0"
                >
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium line-clamp-2 flex-1">
                        {article.title}
                      </h3>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.source}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.publishedAt}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    {!isCompact && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    {/* AI Summary */}
                    {article.aiSummary && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-muted/50 rounded">
                        <Badge variant="secondary" className="text-xs">KI</Badge>
                        <p className={cn(
                          "text-xs leading-relaxed",
                          getSentimentColor(article.sentiment)
                        )}>
                          {article.aiSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Keine Nachrichten verfügbar</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isCompact && newsData.length > articlesToShow && (
            <div className="mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Alle {newsData.length} Artikel anzeigen
              </Button>
            </div>
          )}

          {/* API Key Warning */}
          {!hasApi && newsData.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">Mock-Daten</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                    Füge deinen NewsAPI Key in .env.local hinzu für echte Nachrichten
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetContainer>
  );
}