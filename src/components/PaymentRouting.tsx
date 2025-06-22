
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  TrendingUp, 
  Zap, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { SkeletonCard } from './SkeletonCard';

const PaymentRouting = () => {
  const [metrics, setMetrics] = useState({
    optimizationRate: 0,
    costSaved: 0,
    successRate: 0,
    avgLatency: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        optimizationRate: 87.3,
        costSaved: 15420,
        successRate: 98.7,
        avgLatency: 340
      });
      setIsLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        optimizationRate: 85 + Math.random() * 5,
        costSaved: prev.costSaved + Math.floor(Math.random() * 50),
        successRate: 97 + Math.random() * 2,
        avgLatency: 300 + Math.random() * 100
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const routingDecisions = [
    { tx: 'TX_R001', amount: '$2,450', from: 'Default', to: 'Stripe', reason: 'Lower fees', savings: '$12.25' },
    { tx: 'TX_R002', amount: '$890', from: 'Stripe', to: 'Solana', reason: 'Crypto-friendly', savings: '$8.01' },
    { tx: 'TX_R003', amount: '$5,600', from: 'Default', to: 'AmazonPay', reason: 'High success rate', savings: '$28.00' },
    { tx: 'TX_R004', amount: '$1,200', from: 'PayPal', to: 'Stripe', reason: 'Better routing', savings: '$6.00' },
    { tx: 'TX_R005', amount: '$320', from: 'Default', to: 'Solana', reason: 'Fast settlement', savings: '$2.88' }
  ];

  const gateways = [
    { name: 'Stripe', successRate: 97.8, volume: 45, fees: '2.9%' },
    { name: 'Solana', successRate: 99.1, volume: 25, fees: '0.1%' },
    { name: 'AmazonPay', successRate: 96.2, volume: 20, fees: '3.4%' },
    { name: 'PayPal', successRate: 95.5, volume: 10, fees: '3.9%' }
  ];

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
    <Card className={`${gradient} border-opacity-20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <AnimatedCounter 
            value={value} 
            className="text-3xl font-bold text-slate-900 dark:text-slate-100"
            suffix={suffix}
            decimals={decimals}
          />
          <div className="flex items-center text-green-600 dark:text-green-400">
            <span className="text-sm">{change}</span>
          </div>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2 h-2" />
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
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Routing Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Optimization Rate"
          value={metrics.optimizationRate}
          change="+2.1%"
          icon={Rocket}
          gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          suffix="%"
          decimals={1}
          progress={metrics.optimizationRate}
        />
        <MetricCard
          title="Cost Saved"
          value={metrics.costSaved}
          change="This Month"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          prefix="$"
        />
        <MetricCard
          title="Success Rate"
          value={metrics.successRate}
          change="+0.3%"
          icon={Target}
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700"
          suffix="%"
          decimals={1}
          progress={metrics.successRate}
        />
        <MetricCard
          title="Avg Latency"
          value={metrics.avgLatency}
          change="Fast"
          icon={Zap}
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          suffix="ms"
        />
      </div>

      {/* Routing Decisions & Gateway Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-green-600" />
              <span>Smart Routing Decisions</span>
            </CardTitle>
            <CardDescription>AI-optimized payment gateway selection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routingDecisions.map((decision) => (
                <div key={decision.tx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{decision.tx}</span>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        optimized
                      </Badge>
                    </div>
                    <span className="font-semibold">{decision.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>{decision.from}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-green-600 dark:text-green-400">{decision.to}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{decision.reason}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{decision.savings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Gateway Performance</CardTitle>
            <CardDescription>Real-time success rates and volume distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gateways.map((gateway) => (
                <div key={gateway.name} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{gateway.name}</h4>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {gateway.successRate}% success
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                      <span className="ml-2 font-medium">{gateway.volume}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                      <span className="ml-2 font-medium">{gateway.fees}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={gateway.volume} className="h-2" />
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

export default PaymentRouting;
