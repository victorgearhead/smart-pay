
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Rocket, 
  Gift,
  Search,
  Filter
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { SkeletonCard, SkeletonTable } from './SkeletonCard';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalTransactions: 0,
    fraudPrevented: 0,
    successRate: 0,
    rewardsDistributed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [highlightedTx, setHighlightedTx] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics({
        totalTransactions: 15847,
        fraudPrevented: 234,
        successRate: 98.7,
        rewardsDistributed: 12450
      });
      setIsLoading(false);
    }, 1500);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 5),
        fraudPrevented: prev.fraudPrevented + Math.floor(Math.random() * 2),
        successRate: 97 + Math.random() * 2,
        rewardsDistributed: prev.rewardsDistributed + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const recentTransactions = [
    { id: 'TX001', amount: '$2,450', status: 'success', risk: 'low', gateway: 'Stripe' },
    { id: 'TX002', amount: '$890', status: 'blocked', risk: 'high', gateway: 'N/A' },
    { id: 'TX003', amount: '$1,200', status: 'success', risk: '    ', gateway: 'Solana' },
    { id: 'TX004', amount: '$5,600', status: 'success', risk: 'low', gateway: 'AmazonPay' },
    { id: 'TX005', amount: '$320', status: 'pending', risk: 'low', gateway: 'Stripe' }
  ];

  const filteredTransactions = recentTransactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.amount.includes(searchTerm) ||
                         tx.gateway.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || tx.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Simulate new transaction highlight
  useEffect(() => {
    if (metrics.totalTransactions > 15847) {
      setHighlightedTx('TX001');
      setTimeout(() => setHighlightedTx(null), 2000);
    }
  }, [metrics.totalTransactions]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    gradient, 
    suffix = '', 
    decimals = 0,
    progress 
  }: any) => (
    <Card className={`${gradient} bg-amazon-secondary border-amazon-border amazon-card-hover cursor-pointer group rounded-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center space-x-2 text-amazon-blue">
          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <AnimatedCounter 
            value={value} 
            className="text-3xl font-bold text-amazon-white"
            suffix={suffix}
            decimals={decimals}
          />
          <div className="flex items-center text-amazon-orange">
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        {progress !== undefined && (
          <Progress 
            value={progress} 
            className="mt-2 h-2 bg-amazon-surface" 
            style={{
              backgroundColor: '#1f2a37'
            }}
          />
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-amazon-secondary border-amazon-border">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amazon-blue" />
                <span className="text-amazon-white">Recent Transactions</span>
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonTable />
            </CardContent>
          </Card>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Key Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Transactions"
          value={metrics.totalTransactions}
          change="+12%"
          icon={Shield}
        />
        <MetricCard
          title="Fraud Prevented"
          value={metrics.fraudPrevented}
          change="AI Protected"
          icon={Shield}
        />
        <MetricCard
          title="Success Rate"
          value={metrics.successRate}
          change="+0.3%"
          icon={Rocket}
          suffix="%"
          decimals={1}
          progress={metrics.successRate}
        />
        <MetricCard
          title="Rewards Distributed"
          value={metrics.rewardsDistributed}
          change="SPL Tokens"
          icon={Gift}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-amazon-secondary border-amazon-border amazon-card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amazon-blue" />
                <span className="text-amazon-blue">Recent Transactions</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-amazon-gray" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-32 h-8 text-sm amazon-input"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-24 h-8 text-sm bg-amazon-surface border-amazon-border text-amazon-white">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amazon-secondary border-amazon-border">
                    <SelectItem value="all" className="text-amazon-white hover:bg-amazon-surface">All</SelectItem>
                    <SelectItem value="low" className="text-amazon-white hover:bg-amazon-surface">Low</SelectItem>
                    <SelectItem value="medium" className="text-amazon-white hover:bg-amazon-surface">Medium</SelectItem>
                    <SelectItem value="high" className="text-amazon-white hover:bg-amazon-surface">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription className="text-amazon-gray">Latest payment activities in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 hover:bg-amazon-surface cursor-pointer ${
                    highlightedTx === tx.id 
                      ? 'bg-amazon-orange/10 border border-amazon-orange' 
                      : 'bg-amazon-surface'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-amazon-white">{tx.id}</div>
                    <Badge 
                      className={
                        tx.status === 'success' ? 'bg-amazon-success text-white' : 
                        tx.status === 'blocked' ? 'bg-amazon-error text-white' : 
                        'bg-amazon-warning text-amazon-primary'
                      }
                    >
                      {tx.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={
                        tx.risk === 'low' ? 'border-amazon-success-light text-amazon-success-light' :
                        tx.risk === 'medium' ? 'border-amazon-warning text-amazon-warning' :
                        'border-amazon-error text-amazon-error'
                      }
                    >
                      {tx.risk} risk
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-amazon-white">{tx.amount}</span>
                    <span className="text-sm text-amazon-gray">{tx.gateway}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amazon-secondary border-amazon-border amazon-card-hover">
          <CardHeader>
            <CardTitle className="text-amazon-blue">System Health</CardTitle>
            <CardDescription className="text-amazon-gray">AI models and infrastructure status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Fraud Detection ML', status: 'Online' },
                { name: 'Routing Optimization', status: 'Online' },
                { name: 'Solana Network', status: 'Connected' },
                { name: 'AWS Infrastructure', status: 'Healthy' },
                { name: 'AI Assistant (RAG)', status: 'Indexing' }
              ].map((service, index) => (
                <div key={service.name} className="flex items-center justify-between hover:bg-amazon-surface p-2 rounded transition-colors">
                  <span className="text-sm text-amazon-white">{service.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'Online' || service.status === 'Connected' || service.status === 'Healthy' 
                        ? 'bg-amazon-success' 
                        : 'bg-amazon-warning'
                    }`}></div>
                    <span className={`text-sm ${
                      service.status === 'Online' || service.status === 'Connected' || service.status === 'Healthy' 
                        ? 'text-amazon-success' 
                        : 'text-amazon-warning'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
