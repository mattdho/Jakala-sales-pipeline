export interface ClientLeader {
  id: number;
  name: string;
  email: string;
  groups: string[];
  avatar: string;
}

export interface Deal {
  id: number;
  name: string;
  value: number;
  stage: string;
  probability: number;
  clientLeaderId: number;
  industryGroup: string;
  createdDate: string;
  lastActivity: string;
  expectedCloseDate: string;
  notes: string;
  customFields: {
    priority?: string;
    source?: string;
    competitor?: string;
  };
}

export interface DashboardData {
  clientLeaders: ClientLeader[];
  deals: Deal[];
}

export interface ChartData {
  funnelData: Array<{ name: string; value: number; fill: string }>;
  revenueByGroup: Array<{ name: string; revenue: number }>;
  monthlyData: Array<{ month: string; deals: number; revenue: number }>;
}

export interface Metrics {
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
  pipelineValue: number;
  dealCount: number;
}

export interface DateRange {
  start: string;
  end: string;
}