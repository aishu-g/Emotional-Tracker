import { type GoalStatus } from "./org-goals";

export interface SmartGoalComment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface SmartGoal {
  id: string;
  title: string;
  owner: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: GoalStatus;
  orgGoalId: string;
  comments: SmartGoalComment[];
}

const C = (id: string, author: string, date: string, text: string): SmartGoalComment => ({ id, author, date, text });

export const smartGoals: SmartGoal[] = [
  { id: "sg-1", title: "Increase outbound pipeline by 25% in Q2", owner: "Sarah Chen", startDate: "2026-04-01", dueDate: "2026-06-30", progress: 72, status: "In Progress", orgGoalId: "og-1", comments: [C("c1", "Sarah Chen", "2026-05-12", "ABM pilot delivering early signal — extending to top 100."), C("c2", "Lena Park", "2026-05-28", "Need revops support for ICP refresh.")] },
  { id: "sg-2", title: "Reduce time-to-first-value to under 5 days", owner: "Marcus Hill", startDate: "2026-03-15", dueDate: "2026-08-31", progress: 60, status: "In Progress", orgGoalId: "og-2", comments: [C("c3", "Marcus Hill", "2026-05-20", "Onboarding scorecard mid-build.")] },
  { id: "sg-3", title: "Complete EMEA data residency rollout", owner: "Priya Anand", startDate: "2026-03-01", dueDate: "2026-09-15", progress: 30, status: "At Risk", orgGoalId: "og-3", comments: [C("c4", "Priya Anand", "2026-06-02", "Frankfurt vendor SLA pushing dates.")] },
  { id: "sg-4", title: "Pass SOC 2 surveillance audit", owner: "Daniel Ortiz", startDate: "2025-10-01", dueDate: "2026-07-01", progress: 92, status: "In Progress", orgGoalId: "og-4", comments: [C("c5", "Daniel Ortiz", "2026-06-10", "Final evidence walkthroughs scheduled.")] },
  { id: "sg-5", title: "Close 40 senior engineer offers", owner: "Amelia Brooks", startDate: "2026-01-01", dueDate: "2026-06-01", progress: 100, status: "Completed", orgGoalId: "og-5", comments: [C("c6", "Amelia Brooks", "2026-06-01", "Goal landed two weeks early.")] },
  { id: "sg-6", title: "Roll out customer health scoring v2", owner: "Marcus Hill", startDate: "2026-06-01", dueDate: "2026-08-15", progress: 0, status: "Not Started", orgGoalId: "og-2", comments: [] },
  { id: "sg-7", title: "Launch Copilot beta to 100 design partners", owner: "Priya Anand", startDate: "2026-04-15", dueDate: "2026-07-31", progress: 55, status: "In Progress", orgGoalId: "og-7", comments: [C("c7", "Priya Anand", "2026-06-09", "62 partners onboarded; pipeline healthy.")] },
  { id: "sg-8", title: "Sign 10 net-new ISV partners", owner: "Tomás Rivera", startDate: "2026-02-01", dueDate: "2026-10-01", progress: 40, status: "At Risk", orgGoalId: "og-8", comments: [C("c8", "Tomás Rivera", "2026-06-04", "Tiering proposal needed to close deals.")] },
  { id: "sg-9", title: "Standardize NPS survey cadence", owner: "Jordan Lee", startDate: "2026-07-01", dueDate: "2026-09-01", progress: 0, status: "Not Started", orgGoalId: "og-6", comments: [] },
  { id: "sg-10", title: "Localize product to French and German", owner: "Priya Anand", startDate: "2026-05-01", dueDate: "2026-10-30", progress: 65, status: "In Progress", orgGoalId: "og-3", comments: [] },
  { id: "sg-11", title: "Ship Copilot for Analytics", owner: "Priya Anand", startDate: "2026-04-01", dueDate: "2026-09-30", progress: 80, status: "In Progress", orgGoalId: "og-7", comments: [C("c9", "Priya Anand", "2026-06-12", "Beta release on track for July.")] },
  { id: "sg-12", title: "Achieve <4% gross churn for 2 quarters", owner: "Marcus Hill", startDate: "2026-04-01", dueDate: "2026-12-31", progress: 50, status: "In Progress", orgGoalId: "og-2", comments: [] },
];
