
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  CreditCard,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { SkeletonCard } from './SkeletonCard';

const TransactionFlow = () => {
  const [metrics, setMetrics] = useState({
    avgProcessingTime: 0,
    successRate: 0,
    throughput: 0,
    stepsCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        avgProcessingTime: 2.3,
        successRate: 98.7,
        throughput: 1247,
        stepsCompleted: 95.2
      });
      setIsLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        avgProcessingTime: 2 + Math.random() * 1,
        successRate: 97 + Math.random() * 2,
        throughput: prev.throughput + Math.floor(Math.random() * 10),
        stepsCompleted: 90 + Math.random() * 10
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const flowSteps = [
    { id: 1, name: 'Payment Initiation', icon: CreditCard, status: 'completed', time: '0.1s' },
    { id: 2, name: 'Fraud Detection', icon: Shield, status: 'completed', time: '0.3s' },
    { id: 3, name: 'Smart Routing', icon: Target, status: 'completed', time: '0.2s' },
    { id: 4, name: 'Gateway Processing', icon: Zap, status: 'processing', time: '1.2s' },
    { id: 5, name: 'Reward Distribution', icon: CheckCircle, status: 'pending', time: '-' }
  ];

  const recentFlows = [
    { id: 'TXF_001', amount: '$2,450', status: 'completed', steps: 5, time: '2.1s' },
    { id: 'TXF_002', amount: '$890', status: 'processing', steps: 3, time: '1.8s' },
    { id: 'TXF_003', amount: '$5,600', status: 'completed', steps: 5, time: '3.2s' },
    { id: 'TXF_004', amount: '$1,200', status: 'failed', steps: 2, time: '0.5s' },
    { id: 'TXF_005', amount: '$320', status: 'completed', steps: 5, time: '1.9s' }
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
      {/* Flow Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Processing Time"
          value={metrics.avgProcessingTime}
          change="Fast"
          icon={Clock}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          suffix="s"
          decimals={1}
        />
        <MetricCard
          title="Success Rate"
          value={metrics.successRate}
          change="+0.3%"
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          suffix="%"
          decimals={1}
          progress={metrics.successRate}
        />
        <MetricCard
          title="Hourly Throughput"
          value={metrics.throughput}
          change="Transactions"
          icon={Zap}
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700"
        />
        <MetricCard
          title="Steps Completed"
          value={metrics.stepsCompleted}
          change="Efficiency"
          icon={Target}
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          suffix="%"
          decimals={1}
          progress={metrics.stepsCompleted}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Flow Steps */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <span>Transaction Flow Pipeline</span>
            </CardTitle>
            <CardDescription>Real-time payment processing stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flowSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ?
                      'bg-green-100 dark:bg-green-900/20 text-green-600' :
                    step.status === 'processing' ?
                      'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            step.status === 'completed' ? 'default' :
                            step.status === 'processing' ? 'secondary' :
                            'outline'
                          }
                          className={
                            step.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                            step.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                            ''
                          }
                        >
                          {step.status}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{step.time}</span>
                      </div>
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className="absolute left-5 mt-10 w-px h-4 bg-slate-200 dark:bg-slate-600"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transaction Flows */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Recent Transaction Flows</CardTitle>
            <CardDescription>Latest payment processing results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFlows.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{flow.id}</div>
                    <Badge 
                      variant={
                        flow.status === 'completed' ? 'default' :
                        flow.status === 'processing' ? 'secondary' :
                        'destructive'
                      }
                      className={
                        flow.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                        flow.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }
                    >
                      {flow.status}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {flow.steps}/5 steps
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{flow.amount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{flow.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Analytics */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Flow Performance Analytics</CardTitle>
          <CardDescription>Detailed breakdown of processing stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stage: 'Fraud Detection', avgTime: '0.3s', successRate: '99.2%', color: 'text-red-600' },
              { stage: 'Smart Routing', avgTime: '0.2s', successRate: '98.9%', color: 'text-green-600' },
              { stage: 'Gateway Processing', avgTime: '1.2s', successRate: '97.8%', color: 'text-blue-600' },
              { stage: 'Reward Distribution', avgTime: '0.5s', successRate: '99.8%', color: 'text-purple-600' }
            ].map((stage) => (
              <div key={stage.stage} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{stage.stage}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                    <span className={`font-medium ${stage.color}`}>{stage.avgTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                    <span className={`font-medium ${stage.color}`}>{stage.successRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionFlow;
