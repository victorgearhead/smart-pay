
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Ban
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { SkeletonCard } from './SkeletonCard';

const FraudDetection = () => {
  const [metrics, setMetrics] = useState({
    totalBlocked: 0,
    riskScore: 0,
    accuracy: 0,
    falsePositives: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        totalBlocked: 234,
        riskScore: 23.4,
        accuracy: 94.2,
        falsePositives: 8
      });
      setIsLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalBlocked: prev.totalBlocked + Math.floor(Math.random() * 2),
        riskScore: 20 + Math.random() * 10,
        accuracy: 92 + Math.random() * 4,
        falsePositives: prev.falsePositives + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const recentBlocks = [
    { id: 'TX_B001', reason: 'Velocity anomaly', risk: 'high', amount: '$5,600', time: '2 mins ago' },
    { id: 'TX_B002', reason: 'Device fingerprint', risk: 'high', amount: '$890', time: '5 mins ago' },
    { id: 'TX_B003', reason: 'Geo-location mismatch', risk: 'medium', amount: '$1,200', time: '8 mins ago' },
    { id: 'TX_B004', reason: 'Card testing pattern', risk: 'high', amount: '$320', time: '12 mins ago' },
    { id: 'TX_B005', reason: 'Suspicious merchant', risk: 'medium', amount: '$2,450', time: '15 mins ago' }
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
      {/* Fraud Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Threats Blocked"
          value={metrics.totalBlocked}
          change="AI Protected"
          icon={Shield}
          gradient="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700"
        />
        <MetricCard
          title="Risk Score"
          value={metrics.riskScore}
          change="Current"
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          decimals={1}
        />
        <MetricCard
          title="Model Accuracy"
          value={metrics.accuracy}
          change="+0.8%"
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          suffix="%"
          decimals={1}
          progress={metrics.accuracy}
        />
        <MetricCard
          title="False Positives"
          value={metrics.falsePositives}
          change="This Hour"
          icon={Eye}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
        />
      </div>

      {/* Recent Fraud Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ban className="w-5 h-5 text-red-600" />
              <span>Recent Blocks</span>
            </CardTitle>
            <CardDescription>Transactions blocked by AI fraud detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlocks.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{block.id}</div>
                    <Badge 
                      variant="destructive"
                      className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    >
                      blocked
                    </Badge>
                    <Badge variant="outline" className={
                      block.risk === 'high' ? 'border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' :
                      'border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
                    }>
                      {block.risk} risk
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{block.amount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{block.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>ML Model Performance</CardTitle>
            <CardDescription>XGBoost fraud detection metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Precision', value: 94.2, color: 'text-green-600' },
                { name: 'Recall', value: 91.8, color: 'text-blue-600' },
                { name: 'F1-Score', value: 93.0, color: 'text-purple-600' },
                { name: 'AUC-ROC', value: 96.5, color: 'text-orange-600' }
              ].map((metric) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <span className="text-sm">{metric.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${metric.color}`}>
                      {metric.value}%
                    </span>
                    <Progress value={metric.value} className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alert */}
      <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700 dark:text-red-300">
          High-risk transaction pattern detected. Consider reviewing payment gateway configurations.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FraudDetection;
