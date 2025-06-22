
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fraudTestRecords, gatewayMetrics, routingTestCases, chatTestQueries } from '@/data/testData';
import { Copy, Play, Database } from 'lucide-react';

const TestDataLoader = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (data: any, label: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const simulateTest = (testType: string, data: any) => {
    console.log(`Simulating ${testType} test:`, data);
    // In a real implementation, this would call the actual API endpoints
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Test Data & Examples</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fraud" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
              <TabsTrigger value="routing">Payment Routing</TabsTrigger>
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
              <TabsTrigger value="api">API Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="fraud" className="space-y-4">
              <h3 className="font-semibold">Fraud Detection Test Records</h3>
              <p className="text-sm text-gray-600 mb-4">
                Realistic transaction data with engineered risk patterns for testing ML models.
              </p>
              <div className="space-y-3">
                {fraudTestRecords.map((record, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{record.transactionId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={record.expectedRisk === 'high' ? 'destructive' : 
                                   record.expectedRisk === 'medium' ? 'secondary' : 'outline'}
                            className={record.expectedRisk === 'low' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {record.expectedRisk} risk
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(record, record.transactionId)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copiedItem === record.transactionId ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-gray-600">Amount:</span> ${record.amount}</div>
                        <div><span className="text-gray-600">Location:</span> {record.location}</div>
                        <div><span className="text-gray-600">Declines:</span> {record.previousDeclines}</div>
                        <div><span className="text-gray-600">Velocity:</span> {record.velocityLastHour}/hr</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="routing" className="space-y-4">
              <h3 className="font-semibold">Payment Routing Test Cases</h3>
              <p className="text-sm text-gray-600 mb-4">
                Context scenarios for testing the contextual bandit routing algorithm.
              </p>
              <div className="space-y-3">
                {routingTestCases.map((testCase, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Test Case {idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{testCase.expectedGateway}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(testCase, `routing-${idx}`)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copiedItem === `routing-${idx}` ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-gray-600">Amount:</span> ${testCase.amount}</div>
                        <div><span className="text-gray-600">Risk:</span> {testCase.riskScore}%</div>
                        <div><span className="text-gray-600">Type:</span> {testCase.merchantType}</div>
                        <div><span className="text-gray-600">Region:</span> {testCase.region}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Gateway Performance Metrics</h4>
                  <div className="space-y-2">
                    {gatewayMetrics.map((gateway, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{gateway.name}</span>
                        <div className="flex space-x-4">
                          <span>Success: {gateway.successRate}%</span>
                          <span>Cost: {gateway.cost}%</span>
                          <span>Latency: {gateway.latency}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <h3 className="font-semibold">RAG Chat Test Queries</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sample queries to test the AI assistant's knowledge retrieval and response generation.
              </p>
              <div className="space-y-3">
                {chatTestQueries.map((query, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Query {idx + 1}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(query, `chat-${idx}`)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedItem === `chat-${idx}` ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm mb-2">"{query.query}"</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600">Expected topics:</span>
                        {query.expectedTopics.map((topic, topicIdx) => (
                          <Badge key={topicIdx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <h3 className="font-semibold">API Endpoint Examples</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sample API calls and expected responses for each service endpoint.
              </p>
              
              <div className="space-y-4">
                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">POST /fraud</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-2">
                      {`curl -X POST https://api.smartpay.com/fraud \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '${JSON.stringify({
    userId: "user_456",
    cardId: "card_def", 
    amount: 1200.00,
    merchantCategory: "electronics",
    location: "Los Angeles, USA",
    deviceInfo: "Mobile Safari"
  }, null, 2)}'`}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Expected Response:</span>
                      <code className="block bg-green-50 p-2 rounded mt-1">
                        {`{"riskScore": 87.3, "recommendation": "REVIEW"}`}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">POST /route</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-2">
                      {`curl -X POST https://api.smartpay.com/route \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '${JSON.stringify({
    amount: 1200.00,
    currency: "USD",
    riskScore: 87.3,
    merchantType: "electronics", 
    region: "North America"
  }, null, 2)}'`}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Expected Response:</span>
                      <code className="block bg-blue-50 p-2 rounded mt-1">
                        {`{"recommended": {"name": "AmazonPay", "score": 92.1}}`}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">POST /chat</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-2">
                      {`curl -X POST https://api.smartpay.com/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '${JSON.stringify({
    message: "Why did tx1002 fail?",
    sessionId: "session_123"
  }, null, 2)}'`}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Expected Response:</span>
                      <code className="block bg-purple-50 p-2 rounded mt-1">
                        {`{"answer": "Transaction tx1002 was flagged due to high risk score...", "confidence": 85}`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataLoader;
