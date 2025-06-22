
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  ChevronUp, 
  Users, 
  Database,
  Gift,
  TrendingUp,
  Coins,
  Award
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { SkeletonCard } from './SkeletonCard';

const RewardsTracker = () => {
  const [metrics, setMetrics] = useState({
    totalRewards: 0,
    activeUsers: 0,
    avgReward: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        totalRewards: 12450,
        activeUsers: 8234,
        avgReward: 42.5,
        conversionRate: 15.8
      });
      setIsLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalRewards: prev.totalRewards + Math.floor(Math.random() * 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        avgReward: 40 + Math.random() * 10,
        conversionRate: 14 + Math.random() * 4
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const rewardActivities = [
    { user: 'user_12345', amount: 50, transaction: 'TX_001', timestamp: '2 mins ago' },
    { user: 'user_67890', amount: 25, transaction: 'TX_002', timestamp: '5 mins ago' },
    { user: 'user_24680', amount: 100, transaction: 'TX_003', timestamp: '8 mins ago' },
    { user: 'user_13579', amount: 35, transaction: 'TX_004', timestamp: '12 mins ago' },
    { user: 'user_97531', amount: 75, transaction: 'TX_005', timestamp: '15 mins ago' }
  ];

  const rewardTiers = [
    { name: 'Bronze', minSpend: 0, rewardRate: 1, users: 5234, color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' },
    { name: 'Silver', minSpend: 1000, rewardRate: 2, users: 2156, color: 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700' },
    { name: 'Gold', minSpend: 5000, rewardRate: 3, users: 689, color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' },
    { name: 'Platinum', minSpend: 10000, rewardRate: 5, users: 155, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' }
  ];

  const handleMintRewards = () => {
    console.log('Minting SPL tokens via Anchor smart contract...');
  };

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
      {/* Rewards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Rewards Distributed"
          value={metrics.totalRewards}
          change="SPL Tokens"
          icon={Gift}
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700"
        />
        <MetricCard
          title="Active Reward Users"
          value={metrics.activeUsers}
          change="+5.2%"
          icon={Users}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
        />
        <MetricCard
          title="Avg. Reward per Transaction"
          value={metrics.avgReward}
          change="Tokens"
          icon={Star}
          gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
          decimals={1}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          change="+2.1%"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700"
          suffix="%"
          decimals={1}
          progress={metrics.conversionRate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reward Activities */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-purple-600" />
              <span>Recent Reward Activities</span>
            </CardTitle>
            <CardDescription>Latest SPL token distributions on Solana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewardActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{activity.user}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{activity.transaction}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">+{activity.amount} SPL</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleMintRewards}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Mint New Rewards
            </Button>
          </CardContent>
        </Card>

        {/* Reward Tiers */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Reward Tier System</span>
            </CardTitle>
            <CardDescription>User segmentation and reward rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewardTiers.map((tier) => (
                <div key={tier.name} className={`p-4 rounded-lg ${tier.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{tier.name}</h4>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800">
                      {tier.rewardRate}x Rate
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Min Spend:</span>
                      <span className="ml-2 font-medium">${tier.minSpend.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Users:</span>
                      <span className="ml-2 font-medium">{tier.users.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Distribution</span>
                      <span>{((tier.users / metrics.activeUsers) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(tier.users / metrics.activeUsers) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solana Blockchain Integration */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Solana Integration Status</span>
          </CardTitle>
          <CardDescription>Anchor smart contracts and SPL token management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Smart Contract</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Program ID:</span>
                  <span className="font-mono text-xs">9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Network:</span>
                  <span>Devnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span>v1.2.0</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">SPL Token</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mint Address:</span>
                  <span className="font-mono text-xs">EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Supply:</span>
                  <span>1,000,000 SPL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Decimals:</span>
                  <span>6</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Transaction Stats</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Mints:</span>
                  <span>1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Fee:</span>
                  <span>0.0001 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                  <span>99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsTracker;
