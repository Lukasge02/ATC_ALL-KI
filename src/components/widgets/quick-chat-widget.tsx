import { useState } from "react";
import { BaseWidget } from "./base-widget";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { Widget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuickChatWidgetProps {
  widget: Widget;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function QuickChatWidget({ 
  widget, 
  onEdit, 
  onRemove,
  className 
}: QuickChatWidgetProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages] = useState([
    {
      id: 1,
      role: "user" as const,
      content: "Hilfe bei React Components?",
      timestamp: new Date()
    },
    {
      id: 2,
      role: "assistant" as const,
      content: "Gerne! Welche Art von React Component möchtest du erstellen?",
      timestamp: new Date()
    }
  ]);

  const activeProfile = widget.data?.activeProfile || "Developer Assistant";

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    setMessage("");
  };

  return (
    <BaseWidget
      widget={widget}
      onEdit={onEdit}
      onRemove={onRemove}
      className={className}
    >
      <div className="h-full flex flex-col">
        {/* Active Profile */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">DA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{activeProfile}</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Aktiv
          </Badge>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-2 mb-3 overflow-y-auto max-h-32">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-2 text-xs",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-2 rounded-lg",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 text-xs justify-start">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3 h-3" />
              </div>
              <div className="bg-muted p-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2 w-full">
          <Textarea
            placeholder="Frage stellen... (Enter senden, Shift+Enter neue Zeile)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="w-full resize-none text-xs"
            rows={1}
          />
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="gradient"
              className="text-xs px-3"
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
            >
              <Send className="h-3 w-3 mr-1" />
              Senden
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 mt-2">
          <Button variant="outline" size="sm" className="text-xs h-6 px-2">
            Code Review
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-6 px-2">
            Debug
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}