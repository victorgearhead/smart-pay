
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Settings,
  Users,
  Search,
} from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import Dashboard from '@/components/Dashboard';
import FraudDetection from '@/components/FraudDetection';
import PaymentRouting from '@/components/PaymentRouting';
import RewardsTracker from '@/components/RewardsTracker';
import AIAssistant from '@/components/AIAssistant';
import TransactionFlow from '@/components/TransactionFlow';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fraud':
        return <FraudDetection />;
      case 'routing':
        return <PaymentRouting />;
      case 'rewards':
        return <RewardsTracker />;
      case 'ai':
        return <AIAssistant />;
      case 'flow':
        return <TransactionFlow />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-amazon-primary">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-amazon-secondary border-b border-amazon-border sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-amazon-white hover:bg-amazon-orange/20 border-amazon-border" />
                <Badge className="bg-amazon-orange text-amazon-primary border-amazon-orange font-medium">
                  Enterprise
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-amazon-gray" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-9 w-64 amazon-input"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative bg-amazon-surface border-amazon-border text-amazon-white hover:bg-amazon-orange/20"
                >
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amazon-orange text-amazon-primary text-xs rounded-full flex items-center justify-center font-medium">
                      {notifications}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-amazon-surface border-amazon-border text-amazon-white hover:bg-amazon-orange/20"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <ThemeToggle />
                <div className="w-8 h-8 bg-amazon-orange rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-amazon-primary" />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 bg-amazon-primary min-h-screen">
            <div className="animate-fade-in">
              {renderActiveComponent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
