export type GoalStatus = string;

export interface OrgGoal {
  id: string;
  name: string;
  goal: string;
  owner: string;
  ownerId?: string;
  department: string;
  progress: number;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  description: string;
  smartGoalCount: number;
}

export const organizationGoals: OrgGoal[] = [
  { id: "og-1", name: "Achieve 25% ARR growth across all regions", goal: "Achieve 25% ARR growth across all regions", owner: "Sarah Chen", department: "Revenue", progress: 68, status: "In Progress", startDate: "2026-01-01", endDate: "2026-12-31", description: "Drive predictable annual recurring revenue expansion through cross-region GTM alignment.", smartGoalCount: 1 },
  { id: "og-2", name: "Reduce customer churn to under 4%", goal: "Reduce customer churn to under 4%", owner: "Marcus Hill", department: "Customer Success", progress: 82, status: "In Progress", startDate: "2026-01-15", endDate: "2026-09-30", description: "Improve retention through proactive health scoring and intervention.", smartGoalCount: 3 },
  { id: "og-3", name: "Launch Enterprise Tier in EMEA", goal: "Launch Enterprise Tier in EMEA", owner: "Priya Anand", department: "Product", progress: 41, status: "At Risk", startDate: "2026-03-01", endDate: "2026-11-30", description: "GA the enterprise SKU across all EMEA regions including localization.", smartGoalCount: 2 },
  { id: "og-4", name: "Reach SOC 2 Type II certification", goal: "Reach SOC 2 Type II certification", owner: "Daniel Ortiz", department: "Security", progress: 95, status: "In Progress", startDate: "2025-10-01", endDate: "2026-07-15", description: "Complete observation period and final audit for Type II report.", smartGoalCount: 1 },
  { id: "og-5", name: "Hire 40 engineers across teams", goal: "Hire 40 engineers across teams", owner: "Amelia Brooks", department: "People", progress: 100, status: "Completed", startDate: "2026-01-01", endDate: "2026-06-01", description: "Scale engineering org per FY26 plan.", smartGoalCount: 1 },
  { id: "og-6", name: "Improve NPS from 38 to 55", goal: "Improve NPS from 38 to 55", owner: "Jordan Lee", department: "Customer Success", progress: 22, status: "Not Started", startDate: "2026-04-01", endDate: "2026-12-31", description: "Run quarterly NPS programs with closed-loop follow-ups.", smartGoalCount: 1 },
  { id: "og-7", name: "Ship AI Copilot across product suite", goal: "Ship AI Copilot across product suite", owner: "Priya Anand", department: "Product", progress: 57, status: "In Progress", startDate: "2026-02-01", endDate: "2026-10-31", description: "Embed generative AI features across all surfaces.", smartGoalCount: 2 },
  { id: "og-8", name: "Expand partner ecosystem to 50+ integrations", goal: "Expand partner ecosystem to 50+ integrations", owner: "Tomás Rivera", department: "Partnerships", progress: 35, status: "At Risk", startDate: "2026-01-01", endDate: "2026-12-31", description: "Grow ISV ecosystem and partner marketplace.", smartGoalCount: 1 },
];
