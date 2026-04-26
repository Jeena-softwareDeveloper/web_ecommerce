import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaHeadset } from 'react-icons/fa';
import { BsRobot } from 'react-icons/bs';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from "sonner";

const AICustomerSupport = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: Lang, 1: Category, 2: Chat
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isFirstQuery, setIsFirstQuery] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [loadingText, setLoadingText] = useState("Connecting to Jeenora Support Network...");

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [languageSearch, setLanguageSearch] = useState("");
    const [agentName, setAgentName] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Assign a random support agent name on mount
        const agentNames = ["Aditi", "Rahul", "Priya", "Karthik", "Sneha", "Arjun", "Kavya", "Vikram", "Pooja", "Siddharth"];
        const randomName = agentNames[Math.floor(Math.random() * agentNames.length)];
        setAgentName(randomName);

        // Fetch supported Indian languages
        apiClient.get('/wear/home/customer/ai/languages')
            .then(res => setLanguages(res.data.languages || []))
            .catch(err => console.error("Could not fetch languages", err));
    }, []);

    const startChatSession = (lang, cat) => {
        // Triggers after both selections are made
        setMessages([
            { role: 'assistant', text: `Hi! I am ${agentName}, your Support Executive. I see you need help regarding ${cat}. How can I assist you today?`, type: 'text' }
        ]);
        setStep(2);
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        // Add user message
        const newMsg = { role: 'user', text: text, type: 'text' };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsTyping(true);

        try {
            // Include frontend context invisibly if it's the first AI message
            let textToAI = text;
            if (isFirstQuery) {
                textToAI = `[SYSTEM BACKGROUND: User previously selected Language: ${selectedLanguage}, Issue Type: ${selectedCategory}]. User says: ` + text;
                setIsFirstQuery(false);
            }

            // Build context array
            const chatHistory = messages.filter(m => m.type === 'text').map(m => ({
                role: m.role,
                content: m.text
            })).slice(-8); // Keep last 8 messages

            const { data } = await apiClient.post('/wear/home/customer/ai/support', {
                message: textToAI,
                chatHistory: chatHistory,
                agentName: agentName
            });

            // Add Assistant Response Text
            setMessages(prev => [...prev, { role: 'assistant', text: data.replyText, type: 'text' }]);

        } catch (error) {
            console.error('Chat error:', error);
            if(error.response?.status === 401) {
                toast.error("Please login to use Customer Support");
                navigate('/login');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, our support lines are currently busy. Please email support@jeenora.com or try again.', type: 'text' }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleLanguageSelect = (lang) => {
        setSelectedLanguage(lang);
        setStep(1); // Move to category selection screen
    };

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        setStep(1.5);
        setIsConnecting(true);

        setTimeout(() => setLoadingText("Finding an available executive..."), 2000);
        setTimeout(() => setLoadingText(`Routing you to ${agentName}...`), 4000);

        setTimeout(() => {
            setIsConnecting(false);
            startChatSession(selectedLanguage, cat);
        }, 6500); // 6.5s delay to simulate real human network
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="h-screen max-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <AiOutlineArrowLeft size={24} className="text-gray-700" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2.5 rounded-full">
                        <FaHeadset size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-800 leading-tight">Customer Support</h1>
                        <p className="text-[11px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* FULL SCREEN WIZARDS OR CHAT CONTAINER */}
            
            {step === 0 && (
                <div className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center items-center h-full">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-red-100 border border-red-50 w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <FaHeadset size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2 tracking-tight">Select your Language</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">To connect you with {agentName}, please choose your preferred language to communicate in.</p>
                        
                        <div className="bg-gray-50 rounded-xl p-2 mb-4 border border-gray-100 flex items-center">
                            <input 
                                type="text" 
                                value={languageSearch} 
                                onChange={e => setLanguageSearch(e.target.value)} 
                                placeholder="Search e.g., 'Tamil'..." 
                                className="w-full bg-transparent border-none text-sm font-bold px-3 py-2 outline-none text-gray-700"
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                            {languages.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).map(lang => (
                                <button 
                                    key={lang} 
                                    onClick={() => handleLanguageSelect(lang)} 
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 w-full text-center px-4 py-4 rounded-xl text-[14px] font-black transition-all transform hover:scale-[1.02] shadow-sm flex justify-center items-center"
                                >
                                    {lang}
                                </button>
                            ))}
                            {languages.length > 0 && languages.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).length === 0 && (
                                <p className="text-gray-400 text-sm py-4">No results found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center items-center h-full">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100 border border-indigo-50 w-full text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                            <BsRobot size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2 tracking-tight">What is your issue about?</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Select the category that best matches your problem.</p>
                        
                        <div className="flex flex-col gap-3">
                            {['Order Delay', 'Refund or Return', 'Payment Failed', 'Product Quality', 'Other'].map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => handleCategorySelect(cat)} 
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 w-full text-center px-4 py-4 rounded-xl text-[14px] font-black transition-all transform hover:scale-[1.02] shadow-sm"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 1.5 && (
                <div className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center items-center h-full">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-50 w-full text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-red-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaHeadset size={24} className="text-red-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">Please wait...</h2>
                        <p className="text-sm text-gray-500 font-medium animate-pulse">{loadingText}</p>
                    </div>
                </div>
            )}

            {/* Chat Container (Only visible when step === 2) */}
            {step === 2 && (
                <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5 pb-4 mt-2">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'flex flex-row gap-2'}`}>
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center shrink-0 border border-white mt-1 shadow-sm">
                                            <FaHeadset size={14} className="text-gray-600" />
                                        </div>
                                    )}

                                    <div className={`p-4 text-[13px] md:text-sm font-medium leading-relaxed
                                        ${message.role === 'user' 
                                            ? 'bg-red-500 text-white rounded-2xl rounded-tr-none shadow-md shadow-red-200 ml-auto' 
                                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm'}`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex w-full justify-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center shrink-0 mt-1">
                                    <FaHeadset size={14} className="text-gray-600" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center h-10 w-16 px-4">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mt-auto w-full mb-14 md:mb-0">
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3 outline-none text-gray-700"
                            />
                            
                            <button 
                                onClick={() => handleSend()}
                                disabled={!inputText.trim() && !isTyping}
                                className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:bg-gray-300 shrink-0 shadow-md"
                            >
                                <FaPaperPlane size={16} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default AICustomerSupport;
