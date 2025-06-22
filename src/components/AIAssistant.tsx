
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Search, 
  Database, 
  CheckCircle,
  Brain,
  Zap,
  Activity,
  Globe
} from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your SmartPay AI assistant. I can help you analyze payment trends, investigate fraud patterns, optimize routing strategies, and answer questions about your payment ecosystem. What would you like to explore?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQueries = [
    'Show me fraud trends for the last 30 days',
    'Which payment gateway has the best success rate?',
    'Analyze unusual transaction patterns',
    'Optimize routing for high-value transactions',
    'Show reward distribution analytics'
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate RAG pipeline with OpenSearch + LLM
    setTimeout(() => {
      const responses = {
        'fraud': 'Based on the analysis of recent transactions, I found that fraud attempts have decreased by 15% compared to last month. The XGBoost model identified 234 potential fraud cases with 94.2% accuracy. Most blocked transactions originated from new device fingerprints and showed velocity anomalies.',
        'gateway': 'Currently, Solana shows the highest success rate at 99.1% with the lowest fees at 0.1%. However, for traditional payment methods, Stripe leads with 97.8% success rate. For your transaction volume, I recommend a hybrid approach: use Solana for crypto-friendly users and Stripe for others.',
        'patterns': 'I detected several interesting patterns: 1) Transaction volumes spike 40% during weekends, 2) Cross-border payments show 12% higher fraud risk, 3) Mobile transactions have 3% better success rates than desktop. These insights are from analyzing 50K+ recent transactions.',
        'routing': 'For high-value transactions ($5K+), I recommend this optimization strategy: Use AmazonPay for amounts $5K-$10K (96.2% success, lower scrutiny), Stripe for $10K-$25K (excellent fraud protection), and split larger amounts across multiple gateways to reduce risk.',
        'reward': 'Reward analytics show: Bronze tier users (63% of base) generate 45% of transaction volume. Platinum users have 5x higher lifetime value. I suggest increasing Gold tier reward rate from 3x to 4x to encourage tier progression. SPL token distribution has 99.8% success rate on Solana.'
      };

      const keywords = input.toLowerCase();
      let response = 'I understand you\'re asking about payment analytics. Based on my analysis of your transaction data, user patterns, and system performance, I can provide detailed insights. Could you be more specific about what aspect you\'d like me to analyze?';

      for (const [key, value] of Object.entries(responses)) {
        if (keywords.includes(key)) {
          response = value;
          break;
        }
      }

      const assistantMessage = {
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 2000);
  };

  const handleQuickQuery = (query) => {
    setInput(query);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* AI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 border-opacity-20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>AI Model Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">Online</span>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 border-opacity-20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Knowledge Base</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">47K</span>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <span className="text-sm">Documents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 border-opacity-20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Response Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">340ms</span>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <span className="text-sm">Avg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700 border-opacity-20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Accuracy Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">92.4%</span>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <span className="text-sm">High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 dark: bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>AI Payment Assistant</span>
              </CardTitle>
              <CardDescription>RAG-powered insights from your payment ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4 pr-4">
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-2 block">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          <span className="text-sm">Analyzing data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about payments, fraud, routing, or rewards..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                  className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Queries & System Status */}
        <div className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Quick Queries</CardTitle>
              <CardDescription>Common payment analytics questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQueries.map((query, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 text-sm bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => handleQuickQuery(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>RAG System Status</span>
              </CardTitle>
              <CardDescription>Knowledge base and AI model health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">OpenSearch Index</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vector Embeddings</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Updated</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">LLM Endpoint</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Ready</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Knowledge Base</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">Syncing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
