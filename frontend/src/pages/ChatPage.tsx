import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Send, ShoppingBag, MessageSquare, Paperclip, X } from "lucide-react";

interface Message {
    id: number;
    content: string;
    sender_id: number;
    file_url?: string | null;
    created_at: string;
}

interface Conversation {
    id: number;
    article_id: number;
    buyer_id: number;
    seller_id: number;
    created_at: string;
    messages: Message[];
}

interface ExternalArticle {
    id: number;
    title: string;
    price: number;
    shipping_cost: number;
    image_url: string | null;
    is_approved: boolean;
}

const getFirstImage = (url: string | null): string | null => {
    if (!url) return null;
    try {
        if (url.startsWith("[")) {
            const arr = JSON.parse(url);
            return arr.length > 0 ? arr[0] : null;
        }
    } catch {
        // fallback
    }
    return url;
};

export const ChatPage = () => {
    const { user } = useAuth();
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [articleData, setArticleData] = useState<
        Record<number, ExternalArticle>
    >({});
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadConversations = async () => {
        try {
            const res = await api.get<Conversation[]>("/chat/conversations");
            setConversations(res.data);

            // Fetch article data for these conversations to show titles/images
            const articlesMap: Record<number, ExternalArticle> = {
                ...articleData,
            };
            for (const conv of res.data) {
                if (!articlesMap[conv.article_id]) {
                    try {
                        const aRes = await api.get<ExternalArticle>(
                            `/articles/${conv.article_id}`,
                        );
                        articlesMap[conv.article_id] = aRes.data;
                    } catch {
                        // article might be sold or deleted
                    }
                }
            }
            setArticleData(articlesMap);

            if (routeId) {
                const target = res.data.find(
                    (c) => c.id.toString() === routeId,
                );
                if (target) {
                    setActiveConv(target);
                } else if (res.data.length > 0) {
                    navigate(`/chat/${res.data[0].id}`);
                }
            } else if (res.data.length > 0) {
                navigate(`/chat/${res.data[0].id}`);
            }
        } catch {
            console.error("Failed to load conversation");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeId]);

    useEffect(() => {
        // scroll to bottom on new messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConv?.messages]);

    useEffect(() => {
        if (!activeConv || !user) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        // Convert the REST API endpoints directly over to active WebSockets
        const baseUrl = api.defaults.baseURL || "https://celianhamon.fr/api/v1";
        const wsUrl = `${baseUrl.replace(/^(http)(s)?/i, "ws$2")}/chat/conversations/${activeConv.id}/ws?token=${token}`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                setActiveConv((prev) => {
                    if (!prev || prev.id !== activeConv.id) return prev;
                    // Detect duplicates from our own immediate POST returns
                    if (prev.messages.some((m) => m.id === data.id))
                        return prev;

                    const updated = {
                        ...prev,
                        messages: [...prev.messages, data],
                    };

                    // Recursively map global conversations tree UI block
                    setConversations((convi) =>
                        convi.map((c) => (c.id === updated.id ? updated : c)),
                    );

                    return updated;
                });
            } catch (err) {
                console.error("Socket error", err);
            }
        };

        return () => ws.close();
    }, [activeConv?.id, user]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !fileUrl) || !activeConv) return;

        try {
            const res = await api.post<Message>(
                `/chat/conversations/${activeConv.id}/messages`,
                {
                    content: newMessage,
                    file_url: fileUrl,
                },
            );
            const updated = {
                ...activeConv,
                messages: [...activeConv.messages, res.data],
            };
            setActiveConv(updated);
            setConversations(
                conversations.map((c) =>
                    c.id === activeConv.id ? updated : c,
                ),
            );
            setNewMessage("");
            setFileUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
            console.error("Failed to send message");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            setFileUrl(evt.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCheckout = async () => {
        if (!activeConv) return;
        setBuying(true);
        try {
            const res = await api.post(
                `/chat/conversations/${activeConv.id}/checkout`,
            );
            alert(
                `Payment success! Transaction ID: ${res.data.transaction_id}. The mocked stripe payment process has been simulated.`,
            );
            // reload to see system message
            loadConversations();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Checkout failed");
        } finally {
            setBuying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 pt-24 pb-12 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto page-enter">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messages
                </h2>

                {conversations.length === 0 ? (
                    <div className="text-muted-foreground text-sm text-center py-10 bg-muted/30 rounded-lg border border-dashed border-border/50">
                        No conversations yet
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[80vh] pr-2">
                        {conversations.map((conv) => {
                            const article = articleData[conv.article_id];
                            const isActive = activeConv?.id === conv.id;

                            return (
                                <Link
                                    key={conv.id}
                                    to={`/chat/${conv.id}`}
                                    className={`p-3 rounded-lg border transition-all ${isActive ? "bg-primary/10 border-primary shadow-sm" : "bg-card hover:bg-muted/50 border-border/50"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                                            {article &&
                                            getFirstImage(article.image_url) ? (
                                                <img
                                                    src={
                                                        getFirstImage(
                                                            article.image_url,
                                                        )!
                                                    }
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">
                                                    📸
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">
                                                {article
                                                    ? article.title
                                                    : `Article #${conv.article_id}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.messages.length > 0
                                                    ? conv.messages[
                                                          conv.messages.length -
                                                              1
                                                      ].content
                                                    : "Say hi!"}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col border rounded-xl bg-card shadow-sm overflow-hidden h-[80vh]">
                {activeConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">
                                    {articleData[activeConv.article_id]
                                        ?.title ||
                                        `Article #${activeConv.article_id}`}
                                </h3>
                                <div className="text-xs text-muted-foreground">
                                    {user?.id === activeConv.buyer_id
                                        ? "You are buying this item"
                                        : "You are selling this item"}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        to={`/article/${activeConv.article_id}`}
                                    >
                                        View Item
                                    </Link>
                                </Button>
                                {user?.id === activeConv.buyer_id && (
                                    <Button
                                        size="sm"
                                        onClick={handleCheckout}
                                        disabled={
                                            buying ||
                                            !articleData[activeConv.article_id]
                                        }
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        {buying ? "Processing..." : "Buy Now"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {activeConv.messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Start the conversation!</p>
                                </div>
                            ) : (
                                activeConv.messages.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    const isSystem =
                                        msg.content.includes(
                                            "AUTOMATED MESSAGE",
                                        );
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isSystem ? "justify-center my-4" : isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl p-3 ${
                                                    isSystem
                                                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs border border-yellow-500/20 w-full text-center font-medium"
                                                        : isMe
                                                          ? "bg-primary text-primary-foreground rounded-tr-sm shadow-sm"
                                                          : "bg-muted text-foreground rounded-tl-sm shadow-sm"
                                                }`}
                                            >
                                                {msg.file_url && (
                                                    <div className="mb-2">
                                                        {msg.file_url.startsWith(
                                                            "data:image/",
                                                        ) ? (
                                                            <img
                                                                src={
                                                                    msg.file_url
                                                                }
                                                                alt="Attachment"
                                                                className="max-w-full max-h-[300px] object-contain rounded-md"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={
                                                                    msg.file_url
                                                                }
                                                                download="attachment"
                                                                className="underline flex items-center gap-1 text-sm font-medium opacity-90 hover:opacity-100"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <Paperclip className="w-3 h-3" />
                                                                Download
                                                                Attachment
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.content && (
                                                    <p className="whitespace-pre-wrap text-sm">
                                                        {msg.content}
                                                    </p>
                                                )}
                                                {!isSystem && (
                                                    <p className="text-[10px] opacity-70 mt-1 text-right">
                                                        {new Date(
                                                            msg.created_at,
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Attachment Preview */}
                        {fileUrl && (
                            <div className="px-4 py-2 bg-muted/20 border-t flex items-center gap-3">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                                    {fileUrl.startsWith("data:image/") ? (
                                        <img
                                            src={fileUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Paperclip className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 text-sm text-muted-foreground truncate">
                                    {fileUrl.startsWith("data:image/")
                                        ? "Image attached"
                                        : "File attached"}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => {
                                        setFileUrl(null);
                                        if (fileInputRef.current)
                                            fileInputRef.current.value = "";
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Chat Input */}
                        <form
                            onSubmit={handleSend}
                            className="p-3 bg-muted/30 border-t flex gap-2 items-center"
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="w-5 h-5" />
                            </Button>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 shadow-sm"
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim() && !fileUrl}
                                className="shadow-sm shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-medium mb-2">
                            Your Messages
                        </h3>
                        <p>
                            Select a conversation from the sidebar to start
                            chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
