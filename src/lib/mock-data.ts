// Re-export modular datasets and types
export * from "./org-goals";
export * from "./smart-goals";
export * from "./action-plans";
export * from "./challenges";
export * from "./solutions";

import { organizationGoals } from "./org-goals";
import { smartGoals } from "./smart-goals";
import { actionItems } from "./action-plans";
import { challenges } from "./challenges";
import { solutions } from "./solutions";

export interface Activity {
  id: string;
  type: "goal_update" | "new_challenge" | "completed_action" | "solution_added";
  message: string;
  actor: string;
  at: string;
}

export const activities: Activity[] = [
  { id: "ac-1", type: "goal_update", message: "Updated progress on 'Reduce customer churn' to 82%", actor: "Marcus Hill", at: "2h ago" },
  { id: "ac-2", type: "new_challenge", message: "Raised new challenge: Copilot latency above 1.5s p95", actor: "Priya Anand", at: "5h ago" },
  { id: "ac-3", type: "completed_action", message: "Completed action item: Sign senior staff engineer offer", actor: "Amelia Brooks", at: "Yesterday" },
  { id: "ac-4", type: "solution_added", message: "Proposed solution: Switch to redundant CDN provider for EU", actor: "Daniel Ortiz", at: "Yesterday" },
  { id: "ac-5", type: "goal_update", message: "Marked 'Launch Enterprise Tier in EMEA' at risk", actor: "Priya Anand", at: "2d ago" },
  { id: "ac-6", type: "completed_action", message: "Completed action: Vendor SOC 2 evidence walkthrough", actor: "Daniel Ortiz", at: "2d ago" },
  { id: "ac-7", type: "new_challenge", message: "Raised new challenge: NPS detractor follow-up lacks owner", actor: "Jordan Lee", at: "3d ago" },
  { id: "ac-8", type: "goal_update", message: "Updated progress on 'Ship AI Copilot' to 57%", actor: "Priya Anand", at: "4d ago" },
];

export const departmentProgress = [
  { department: "Revenue", progress: 68 },
  { department: "Customer Success", progress: 64 },
  { department: "Product", progress: 51 },
  { department: "Security", progress: 95 },
  { department: "People", progress: 100 },
  { department: "Partnerships", progress: 35 },
];

export const monthlyTrend = [
  { month: "Jan", achieved: 12, target: 20 },
  { month: "Feb", achieved: 18, target: 22 },
  { month: "Mar", achieved: 24, target: 25 },
  { month: "Apr", achieved: 22, target: 28 },
  { month: "May", achieved: 30, target: 30 },
  { month: "Jun", achieved: 34, target: 32 },
  { month: "Jul", achieved: 38, target: 35 },
  { month: "Aug", achieved: 42, target: 38 },
];

export const challengeVsSolution = [
  { month: "Jan", challenges: 8, solutions: 5 },
  { month: "Feb", challenges: 11, solutions: 7 },
  { month: "Mar", challenges: 9, solutions: 10 },
  { month: "Apr", challenges: 14, solutions: 11 },
  { month: "May", challenges: 12, solutions: 13 },
  { month: "Jun", challenges: 10, solutions: 12 },
];

export const goalStatusOverview = [
  { name: "Completed", count: 18 },
  { name: "In Progress", count: 34 },
  { name: "At Risk", count: 9 },
  { name: "Not Started", count: 6 },
];

export const emotionalTrends = [
  { week: "W1", emotional: 62, motivation: 70, energy: 65, focus: 60, confidence: 68 },
  { week: "W2", emotional: 65, motivation: 72, energy: 60, focus: 64, confidence: 70 },
  { week: "W3", emotional: 70, motivation: 75, energy: 68, focus: 70, confidence: 72 },
  { week: "W4", emotional: 68, motivation: 73, energy: 71, focus: 68, confidence: 74 },
  { week: "W5", emotional: 74, motivation: 78, energy: 72, focus: 73, confidence: 76 },
  { week: "W6", emotional: 78, motivation: 80, energy: 75, focus: 76, confidence: 79 },
  { week: "W7", emotional: 76, motivation: 82, energy: 78, focus: 78, confidence: 80 },
  { week: "W8", emotional: 81, motivation: 84, energy: 80, focus: 81, confidence: 83 },
  { week: "W9", emotional: 84, motivation: 86, energy: 82, focus: 83, confidence: 85 },
  { week: "W10", emotional: 82, motivation: 85, energy: 81, focus: 82, confidence: 84 },
  { week: "W11", emotional: 86, motivation: 88, energy: 84, focus: 85, confidence: 87 },
  { week: "W12", emotional: 88, motivation: 90, energy: 86, focus: 87, confidence: 89 },
];

export const kpis = {
  totalOrgGoals: organizationGoals.length,
  totalSmartGoals: smartGoals.length,
  openActionItems: actionItems.filter(a => a.status !== "Done").length,
  challengesRaised: challenges.length,
  solutionsImplemented: solutions.filter(s => s.status === "Implemented").length,
  goalCompletion: Math.round(
    organizationGoals.reduce((s, g) => s + g.progress, 0) / organizationGoals.length
  ),
};
