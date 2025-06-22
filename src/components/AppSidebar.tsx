
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Shield, Rocket, Gift, Bot, GitBranch, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    value: "dashboard",
    description: "Overview and metrics"
  },
  {
    title: "Fraud Detection",
    icon: Shield,
    value: "fraud",
    description: "AI-powered security"
  },
  {
    title: "Smart Routing",
    icon: Rocket,
    value: "routing",
    description: "Payment optimization"
  },
  {
    title: "Rewards",
    icon: Gift,
    value: "rewards",
    description: "Token incentives"
  },
  {
    title: "AI Assistant",
    icon: Bot,
    value: "ai",
    description: "Chat support"
  },
  {
    title: "Transaction Flow",
    icon: GitBranch,
    value: "flow",
    description: "Visual workflow"
  }
];

export const AppSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <Sidebar className="bg-amazon-secondary border-r border-amazon-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amazon-orange rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-amazon-primary" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold text-amazon-orange">
              SmartPay
            </h1>
            <p className="text-xs text-amazon-gray">Orchestrator</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-amazon-gray">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    className={`w-full text-amazon-white hover:bg-amazon-surface transition-colors duration-200 ${
                      activeTab === item.value 
                        ? 'bg-amazon-surface border-r-2 border-amazon-orange text-amazon-white' 
                        : ''
                    }`}
                    tooltip={item.description}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-amazon-gray group-data-[collapsible=icon]:hidden">
          Enterprise Edition
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
