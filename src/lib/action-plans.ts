export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  priority: Priority;
  dueDate: string;
  status: "Todo" | "Doing" | "Blocked" | "Done";
  progress: number;
  smartGoalId: string;
  comment?: string;
}

export const actionItems: ActionItem[] = [
  { id: "ai-1", task: "Refresh ICP definition with revops", assignedTo: "Sarah Chen", priority: "High", dueDate: "2026-06-25", status: "Doing", progress: 60, smartGoalId: "sg-1", comment: "Workshop scheduled with revops team." },
  { id: "ai-2", task: "Launch ABM pilot for top 50 accounts", assignedTo: "Lena Park", priority: "Urgent", dueDate: "2026-07-10", status: "Doing", progress: 40, smartGoalId: "sg-1", comment: "Vendor selection in progress." },
  { id: "ai-3", task: "Build onboarding scorecard dashboard", assignedTo: "Marcus Hill", priority: "High", dueDate: "2026-07-15", status: "Todo", progress: 0, smartGoalId: "sg-2" },
  { id: "ai-4", task: "Provision Frankfurt region", assignedTo: "Daniel Ortiz", priority: "Urgent", dueDate: "2026-07-20", status: "Blocked", progress: 25, smartGoalId: "sg-3", comment: "Blocked on vendor SLA." },
  { id: "ai-5", task: "Vendor SOC 2 evidence walkthrough", assignedTo: "Daniel Ortiz", priority: "Medium", dueDate: "2026-06-28", status: "Doing", progress: 80, smartGoalId: "sg-4" },
  { id: "ai-6", task: "Sign senior staff engineer offer", assignedTo: "Amelia Brooks", priority: "Low", dueDate: "2026-06-05", status: "Done", progress: 100, smartGoalId: "sg-5" },
  { id: "ai-7", task: "Recruit 100 Copilot design partners", assignedTo: "Priya Anand", priority: "High", dueDate: "2026-07-25", status: "Doing", progress: 55, smartGoalId: "sg-7" },
  { id: "ai-8", task: "Partner enablement kit v1", assignedTo: "Tomás Rivera", priority: "Medium", dueDate: "2026-08-12", status: "Todo", progress: 10, smartGoalId: "sg-8" },
  { id: "ai-9", task: "Quarterly NPS survey draft", assignedTo: "Jordan Lee", priority: "Low", dueDate: "2026-08-20", status: "Todo", progress: 0, smartGoalId: "sg-9" },
  { id: "ai-10", task: "QA French localization pass", assignedTo: "Priya Anand", priority: "Medium", dueDate: "2026-09-15", status: "Doing", progress: 70, smartGoalId: "sg-10" },
  { id: "ai-11", task: "Design Copilot analytics prompts", assignedTo: "Priya Anand", priority: "High", dueDate: "2026-08-05", status: "Doing", progress: 65, smartGoalId: "sg-11" },
  { id: "ai-12", task: "Define churn intervention playbook", assignedTo: "Marcus Hill", priority: "High", dueDate: "2026-09-01", status: "Todo", progress: 15, smartGoalId: "sg-12" },
];
