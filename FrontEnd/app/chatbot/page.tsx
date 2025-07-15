'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Mic,
  Image as ImageIcon,
  Paperclip,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  HeartPulse,
  Thermometer,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { chatMessageSchema } from '@/lib/validations';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mainChat } from '@/lib/axios';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  isTyping?: boolean;
  timestamp?: Date;
  attachments?: string[];
  feedback?: 'like' | 'dislike';
  category?: 'general' | 'diagnosis' | 'medication' | 'lifestyle';
  isExpanded?: boolean;
  isMedicalResponse?: boolean;
  displayedContent?: string;
  isError?: boolean;
}

const suggestedQuestions = {
  general: [
    'What are the symptoms of the flu?',
    'How can I improve my sleep quality?',
    'What should I do for a mild headache?',
    'How much water should I drink daily?',
  ],
  diagnosis: [
    'What could cause persistent chest pain?',
    'What are the early signs of diabetes?',
    'Could my dizziness be related to low blood pressure?',
    'What causes frequent migraines?',
  ],
  medication: [
    'Can I take ibuprofen and paracetamol together?',
    'What are the side effects of antibiotics?',
    'How should I store my medications?',
    'Is it safe to take medication after its expiry date?',
  ],
  lifestyle: [
    'What exercises are best for lower back pain?',
    'How can I reduce stress naturally?',
    'What diet changes can help lower cholesterol?',
    'How can I boost my immune system?',
  ],
};

const quickActions = [
  {
    icon: Pill,
    label: 'Medication Info',
    action: 'Tell me about my medication',
  },
  {
    icon: Stethoscope,
    label: 'Symptom Check',
    action: 'I have these symptoms',
  },
  {
    icon: HeartPulse,
    label: 'Vital Signs',
    action: 'Are my vital signs normal?',
    },
  { icon: Thermometer, label: 'Fever Advice', action: 'What to do for fever?' },
];

const formSchema = z.object({
  message: chatMessageSchema,
});

type FormData = z.infer<typeof formSchema>;

const TYPING_SPEED = 20;

export default function ChatbotPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI medical assistant. How can I help you today?",
      timestamp: new Date(),
      category: 'general',
      isMedicalResponse: false,
      displayedContent: "Hello! I'm your AI medical assistant. How can I help you today?",
    },
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isHandlingMessage, setIsHandlingMessage] = useState(false);
  const hasInitialQueryBeenHandled = useRef(false);
  const [isResponsePending, setIsResponsePending] = useState(false); // New state for button disable

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (
      shouldScrollToBottom &&
      messagesEndRef.current &&
      chatContainerRef.current
    ) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, messages]);

  const typeMessage = async (messageId: number, content: string) => {
    let currentText = '';
    for (let i = 0; i <= content.length; i++) {
      currentText = content.slice(0, i);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, displayedContent: currentText }
            : msg
        )
      );
      await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
    }
  };

  const handleIncomingMessage = useCallback(async (content: string) => {
    console.log("handleIncomingMessage START - Content:", content, "Current messages:", messages);

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date(),
      isMedicalResponse: false,
      displayedContent: content,
    };
    setMessages((prev) => {
      console.log("setMessages USER - Previous messages:", prev, "New user message:", userMessage);
      return [...prev, userMessage];
    });
    setShowSuggestions(false);
    setIsTyping(true);
    setShouldScrollToBottom(true);
    setIsResponsePending(true); // Disable send button

    // Prepare chat history to send to backend.
    // Send only 'content' and 'type' to reduce payload size.
    const chatHistoryForBackend = messages.map(msg => ({
      type: msg.type,
      content: msg.content
    }));

    // HISTORY TRUNCATION - Keep only the last 5 turns (including user message)
    const historyToSend = chatHistoryForBackend.slice(Math.max(0, chatHistoryForBackend.length - 5));


    try {
      const response = await mainChat.post('/chat', {
        message: content,
        chat_history: historyToSend // Send truncated history
      });
      console.log("API Response:", response.data);
      let botMessageContent: string = response.data.message;
      let isMedicalResponse = response.data.is_medical;

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: botMessageContent,
        timestamp: new Date(),
        category: response.data.category || 'general',
        isMedicalResponse: isMedicalResponse,
        displayedContent: '',
      };

      setMessages((prev) => {
        console.log("setMessages BOT - Previous messages:", prev, "New bot message:", botMessage);
        return [...prev, botMessage];
      });
      await typeMessage(botMessage.id, botMessageContent);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = 'Failed to get response from AI. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Server Error: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      const errorBotMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date(),
        category: 'general',
        isMedicalResponse: false,
        displayedContent: errorMessage,
        isError: true,
      };
      setMessages((prev) => [...prev, errorBotMessage]);
      toast.error('Failed to get response from AI. See chat for details.');

    } finally {
      setIsTyping(false);
      setShouldScrollToBottom(true);
      setIsResponsePending(false); // Enable send button back
      console.log("handleIncomingMessage FINISH - Messages after processing:", messages);
    }
  }, [messages, messages]);

  useEffect(() => {
    const query = searchParams.get('query');
    console.log("useEffect triggered, query:", query, "isHandlingMessage:", isHandlingMessage, "hasInitialQueryBeenHandled:", hasInitialQueryBeenHandled.current, "Current messages in useEffect:", messages);
    if (query && !isHandlingMessage && !hasInitialQueryBeenHandled.current) {
      setIsHandlingMessage(true);
      hasInitialQueryBeenHandled.current = true;
      console.log("Handling initial query from URL:", query);
      handleIncomingMessage(query)
        .finally(() => {
          setIsHandlingMessage(false);
          console.log("Finished handling initial query");
        });
    }
  }, [searchParams, handleIncomingMessage, isHandlingMessage, messages]);

  const onSubmit = async (data: FormData) => {
    if (!data.message.trim()) return;
    handleIncomingMessage(data.message);
    form.reset();
  };

  const handleSuggestedQuestion = (question: string) => {
    form.setValue('message', question);
    onSubmit({ message: question });
  };

  const handleQuickAction = (action: string) => {
    form.setValue('message', action);
    onSubmit({ message: action });
  };

  const handleFeedback = (messageId: number, feedback: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
    );
    toast.success(
      `Thank you for your ${feedback === 'like' ? 'positive' : 'negative'} feedback!`
    );
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const handleShareMessage = (content: string) => {
    toast.success('Sharing functionality would be implemented here');
  };

  const toggleMessageExpansion = (messageId: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg
      )
    );
  };

  const handleVoiceInput = () => {
    toast.info('Voice input functionality would be implemented here');
  };

  const handleImageUpload = () => {
    toast.info('Image upload functionality would be implemented here');
  };

  const handleAttachmentUpload = () => {
    toast.info('Attachment upload functionality would be implemented here');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm your AI medical assistant. How can I help you today?",
        timestamp: new Date(),
        category: 'general',
        isMedicalResponse: false,
        displayedContent: "Hello! I'm your AI medical assistant. How can I help you today?",
      },
    ]);
    setShowSuggestions(true);
    setShouldScrollToBottom(true);
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container flex flex-col h-[calc(100vh-4rem)] max-w-6xl py-2 sm:py-4 animate-fade-up">
      <div className="mb-2 sm:mb-4 text-center">
        <h1 className="text-xl sm:text-3xl font-bold">AI Medical Assistant</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
          Get instant answers to your medical queries from our advanced AI
        </p>
      </div>

      <div className="relative flex flex-1 flex-col rounded-2xl border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar"
          >
            <div className="space-y-2 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`flex max-w-[90%] sm:max-w-[80%] items-start space-x-2 rounded-lg px-2 sm:px-4 py-2 ${
                      message.type === 'user'
                        ? 'gradient-bg text-white'
                        : message.isError ? 'bg-destructive/10 border border-destructive text-destructive' : 'glass-card'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="mt-1 h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-full bg-primary/10 p-1 flex items-center justify-center">
                        {message.isError ? (
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        ) : (
                          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 space-y-1 sm:space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {message.isTyping ? (
                            <div className="flex space-x-1">
                              <span className="animate-bounce">•</span>
                              <span
                                className="animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                              >
                                •
                              </span>
                              <span
                                className="animate-bounce"
                                style={{ animationDelay: '0.4s' }}
                              >
                                •
                              </span>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'text-xs sm:text-sm',
                                message.isExpanded ? '' : 'line-clamp-10',
                                message.isError ? 'text-destructive' : ''
                              )}
                            >
                              {message.displayedContent}
                            </div>
                          )}
                        </div>
                        {message.content && String(message.content).length > 300 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground p-0"
                            onClick={() => toggleMessageExpansion(message.id)}
                          >
                            {message.isExpanded ? (
                              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-[10px] sm:text-xs">
                          {formatTimestamp(message.timestamp)}
                        </span>

                        {message.type === 'bot' && !message.isError && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => handleFeedback(message.id, 'like')}
                            >
                              <ThumbsUp
                                className={cn(
                                  'h-3 w-3',
                                  message.feedback === 'like'
                                    ? 'fill-primary text-primary'
                                    : ''
                                )}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                handleFeedback(message.id, 'dislike')
                              }
                            >
                              <ThumbsDown
                                className={cn(
                                  'h-3 w-3',
                                  message.feedback === 'dislike'
                                    ? 'fill-destructive text-destructive'
                                    : ''
                                )}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopyMessage(String(message.content))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                handleShareMessage(String(message.content))
                              }
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex max-w-[90%] sm:max-w-[80%] items-start space-x-2 rounded-lg px-2 sm:px-4 py-2 glass-card">
                    <div className="mt-1 h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-full bg-primary/10 p-1 flex items-center justify-center">
                      <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="flex space-x-1">
                      <span className="animate-bounce">•</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      >
                        •
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      >
                        •
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showSuggestions && messages.length < 3 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Suggested Questions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions[
                    activeCategory as keyof typeof suggestedQuestions
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-1.5 sm:py-2 px-2 sm:px-3 text-left text-[10px] sm:text-sm"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Sparkles className="mr-1 sm:mr-2 h-3 w-3 text-primary shrink-0" />
                      <span className="line-clamp-2">{question}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 pt-2">
                  {['general', 'diagnosis', 'medication', 'lifestyle'].map(
                    (category) => (
                      <Button
                        key={category}
                        variant={
                          activeCategory === category ? 'default' : 'outline'
                        }
                        size="sm"
                        className="text-[10px] sm:text-xs capitalize h-6 sm:h-7 px-2 sm:px-2.5"
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {showSuggestions && messages.length < 3 && (
              <div className="mt-4 mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="flex-col h-auto py-2 sm:py-3 gap-1 sm:gap-2"
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span className="text-[10px] sm:text-xs line-clamp-1">
                          {action.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {messages.length > 4 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-20 right-2 sm:right-4 rounded-full opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => setShouldScrollToBottom(true)}
            >
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="text-[10px] sm:text-xs">Scroll to bottom</span>
            </Button>
          )}
          <div className="border-t p-2 sm:p-4">
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleImageUpload}
                    >
                      <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleAttachmentUpload}
                    >
                      <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    <div className="flex-1" />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleClearChat}>
                          <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Clear chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShowSuggestions(!showSuggestions)}
                        >
                          {showSuggestions ? (
                            <>
                              <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Hide suggestions
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Show suggestions
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShouldScrollToBottom(true)}
                        >
                          <ChevronDown className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Scroll to bottom
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Type your medical question..."
                              className="rounded-full bg-muted/50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                      onClick={(e) => {
                        e.preventDefault();
                        if (form.getValues().message.trim()) {
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      disabled={isResponsePending} // Disable button when response is pending
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </Form>

            <p className="mt-2 text-center text-[10px] sm:text-xs text-muted-foreground">
              AI responses are for informational purposes only and not a
              substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}