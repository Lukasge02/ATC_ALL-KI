"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Settings,
  Brain,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  fetchICalEvents, 
  generateAIInsights, 
  validateICalUrl,
  type CalendarEvent, 
  type AIInsight
} from "@/lib/api/ical";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendarSetup, setShowCalendarSetup] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');
  const [tempIcalUrl, setTempIcalUrl] = useState('');
  const [showIcalUrl, setShowIcalUrl] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Check if iCal URL exists
    const savedIcalUrl = localStorage.getItem('calendar-ical-url');
    if (savedIcalUrl) {
      setIcalUrl(savedIcalUrl);
      setIsConnected(true);
      loadCalendarData(savedIcalUrl);
    }
  }, []);

  const loadCalendarData = async (urlToUse?: string) => {
    const currentUrl = urlToUse || icalUrl;
    if (!currentUrl) return;

    setIsLoading(true);
    setValidationError(null);
    
    try {
      // Fetch events from iCal URL
      const calendarEvents = await fetchICalEvents(currentUrl);
      setEvents(calendarEvents);
      
      // Generate AI insights
      const insights = generateAIInsights(calendarEvents);
      setAiInsights(insights);
      
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Fehler beim Laden der Kalenderdaten.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveIcalUrl = async () => {
    if (!tempIcalUrl.trim()) return;
    
    setIsLoading(true);
    setValidationError(null);
    
    try {
      // Validate iCal URL first
      const isValid = await validateICalUrl(tempIcalUrl);
      
      if (isValid) {
        localStorage.setItem('calendar-ical-url', tempIcalUrl);
        setIcalUrl(tempIcalUrl);
        setIsConnected(true);
        setShowCalendarSetup(false);
        await loadCalendarData(tempIcalUrl);
      } else {
        setValidationError('Ungültige iCal URL. Bitte überprüfe den Link.');
      }
    } catch (error) {
      setValidationError('Fehler bei der URL Validierung. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectCalendar = () => {
    localStorage.removeItem('calendar-ical-url');
    setIcalUrl('');
    setIsConnected(false);
    setEvents([]);
    setAiInsights([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'tentative': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'overview': return <CalendarIcon className="h-4 w-4" />;
      case 'preparation': return <Clock className="h-4 w-4" />;
      case 'suggestion': return <Brain className="h-4 w-4" />;
      case 'conflict': return <AlertCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Kalender</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Kalender verbunden
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadCalendarData()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCalendarSetup(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowCalendarSetup(true)} variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Kalender verbinden
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          {isConnected 
            ? 'Deine Termine mit KI-gestützten Insights und Empfehlungen'
            : 'Verbinde deinen Kalender über iCal/CalDAV URL für personalisierte Terminverwaltung'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Heute - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${getEventStatusColor(event.status)}`} />
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.isAllDay ? 'Ganztägig' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees.length} Teilnehmer
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isConnected ? 'Keine Termine für heute' : 'Verbinde deinen Kalender um Termine zu sehen'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                KI-Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights.length > 0 ? (
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${getInsightColor(insight.priority)}`}
                    >
                      <div className="flex items-start gap-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.message}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.priority}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    KI-Insights werden generiert sobald Termine verfügbar sind
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Setup Dialog */}
      <Dialog open={showCalendarSetup} onOpenChange={setShowCalendarSetup}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kalender verbinden</DialogTitle>
            <DialogDescription>
              {isConnected 
                ? 'Verwalte deine Kalender-Verbindung'
                : 'Verbinde deinen Kalender über iCal/CalDAV URL'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Kalender erfolgreich verbunden</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">iCal URL</label>
                  <div className="flex gap-2">
                    <Input
                      type={showIcalUrl ? 'text' : 'password'}
                      value={icalUrl}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowIcalUrl(!showIcalUrl)}
                    >
                      {showIcalUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  onClick={disconnectCalendar}
                  className="w-full"
                >
                  Verbindung trennen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* iCal Setup Instructions */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">iCal/CalDAV URL finden</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          So findest du deine Kalender-URL:
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">Google Calendar:</h5>
                          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-3">
                            <li>Öffne Google Calendar</li>
                            <li>Klicke auf die 3 Punkte neben deinem Kalender</li>
                            <li>Wähle "Einstellungen und Freigabe"</li>
                            <li>Scrolle zu "Kalender-Adresse" → Kopiere die "iCal-Format" URL</li>
                          </ol>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">Outlook:</h5>
                          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-3">
                            <li>Öffne Outlook.com</li>
                            <li>Klicke auf "Kalender freigeben"</li>
                            <li>Wähle "ICS-Link abrufen"</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">iCal/CalDAV URL</label>
                  <Textarea
                    placeholder="https://calendar.google.com/calendar/ical/... oder webcal://..."
                    value={tempIcalUrl}
                    onChange={(e) => setTempIcalUrl(e.target.value)}
                    className="min-h-[80px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Füge die iCal-URL deines Kalenders ein (Google, Outlook, Apple Calendar, etc.)
                  </p>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800 dark:text-red-200">{validationError}</span>
                  </div>
                )}

                <Button 
                  onClick={saveIcalUrl} 
                  disabled={!tempIcalUrl.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Lade Kalender...
                    </>
                  ) : (
                    'Kalender verbinden'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}