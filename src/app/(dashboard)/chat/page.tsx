"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Settings, 
  MoreHorizontal,
  MessageSquare,
  Trash2,
  Download,
  RefreshCw,
  Plus,
  Edit3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  profileId?: string;
}

interface ChatConversation {
  id: string;
  title: string;
  profileId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profile');
  const conversationId = searchParams.get('conversation');
  const { toast } = useToastContext();
  const { profiles, isAuthenticated } = useAuthStore();
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the current profile
  const currentProfile = profiles.find(p => p.id === profileId);

  // Authentication and profile validation
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!profileId || !currentProfile) {
      toast.error('Profil nicht gefunden', 'Das angegebene Profil existiert nicht.');
      router.push('/profiles');
      return;
    }

    loadConversations();
  }, [isAuthenticated, profileId, currentProfile, router]);

  // Load specific conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setMessages(conversation.messages);
      }
    } else if (conversations.length > 0 && !conversationId) {
      // Load most recent conversation
      const mostRecent = conversations[0];
      setCurrentConversation(mostRecent);
      setMessages(mostRecent.messages);
      router.replace(`/chat?profile=${profileId}&conversation=${mostRecent.id}`);
    }
  }, [conversationId, conversations, profileId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = () => {
    // Load from localStorage (in production: API call)
    const stored = localStorage.getItem(`conversations-${profileId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const conversationsWithDates = parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
      setConversations(conversationsWithDates.sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    }
  };

  const saveConversations = (newConversations: ChatConversation[]) => {
    localStorage.setItem(`conversations-${profileId}`, JSON.stringify(newConversations));
    setConversations(newConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const createNewConversation = () => {
    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      title: "Neuer Chat",
      profileId: profileId!,
      messages: [{
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hallo! Ich bin ${currentProfile?.name}. Wie kann ich dir heute helfen?`,
        timestamp: new Date(),
        profileId: profileId!
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 1
    };

    const updatedConversations = [newConversation, ...conversations];
    saveConversations(updatedConversations);
    setCurrentConversation(newConversation);
    setMessages(newConversation.messages);
    router.push(`/chat?profile=${profileId}&conversation=${newConversation.id}`);
  };

  const deleteConversation = (convId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== convId);
    saveConversations(updatedConversations);
    
    if (currentConversation?.id === convId) {
      if (updatedConversations.length > 0) {
        const nextConv = updatedConversations[0];
        setCurrentConversation(nextConv);
        setMessages(nextConv.messages);
        router.push(`/chat?profile=${profileId}&conversation=${nextConv.id}`);
      } else {
        createNewConversation();
      }
    }
  };

  const renameConversation = (convId: string, newTitle: string) => {
    const updatedConversations = conversations.map(c => 
      c.id === convId ? { ...c, title: newTitle, updatedAt: new Date() } : c
    );
    saveConversations(updatedConversations);
    
    if (currentConversation?.id === convId) {
      setCurrentConversation({ ...currentConversation, title: newTitle });
    }
    setEditingConversationId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentConversation) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      profileId: profileId!
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          profileId: profileId,
          sessionId: currentConversation.id,
          profile: currentProfile,
          messageHistory: newMessages.slice(-10)
        })
      });

      if (!response.ok) throw new Error('Chat API error');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        profileId: profileId!
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Update conversation
      const updatedConversation = {
        ...currentConversation,
        messages: finalMessages,
        updatedAt: new Date(),
        messageCount: finalMessages.length,
        title: currentConversation.title === "Neuer Chat" ? 
          userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? "..." : "") :
          currentConversation.title
      };

      const updatedConversations = conversations.map(c => 
        c.id === currentConversation.id ? updatedConversation : c
      );
      saveConversations(updatedConversations);
      setCurrentConversation(updatedConversation);

    } catch (error) {
      toast.error('Fehler', 'Nachricht konnte nicht gesendet werden.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProfile) return null;

  // If no conversations exist, create the first one
  if (conversations.length === 0 && !isLoading) {
    createNewConversation();
    return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-200 border-r bg-muted/30 flex flex-col overflow-hidden`}>
        {showSidebar && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-lg">
                    {currentProfile.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{currentProfile.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentProfile.category}</p>
                </div>
              </div>
              
              <Button onClick={createNewConversation} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Neuer Chat
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-auto p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    currentConversation?.id === conversation.id ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setCurrentConversation(conversation);
                    setMessages(conversation.messages);
                    router.push(`/chat?profile=${profileId}&conversation=${conversation.id}`);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    
                    {editingConversationId === conversation.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => renameConversation(conversation.id, editTitle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameConversation(conversation.id, editTitle);
                          }
                        }}
                        className="h-6 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm flex-1 truncate">{conversation.title}</span>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConversationId(conversation.id);
                            setEditTitle(conversation.title);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Umbenennen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {conversation.messageCount} Nachrichten
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{currentConversation?.title || "Chat"}</h1>
            <p className="text-sm text-muted-foreground">
              Mit {currentProfile.name} • {messages.length} Nachrichten
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={() => router.push('/profiles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-sm">
                      {currentProfile.avatar}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">
                  {currentProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">tippt...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nachricht eingeben... (Enter zum Senden)"
              disabled={isLoading}
              className="flex-1 min-h-[80px] max-h-[200px] resize-none"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              variant="gradient"
              size="icon"
              className="self-end h-[80px] w-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}