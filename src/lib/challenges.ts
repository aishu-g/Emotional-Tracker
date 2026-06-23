export type Severity = "Low" | "Medium" | "High" | "Critical";
export type ChallengeStatus = "Open" | "Investigating" | "Resolved";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  relatedGoalId: string;
  actionItemId: string;
  severity: Severity;
  owner: string;
  raisedBy: string;
  status: ChallengeStatus;
  createdAt: string;
}

export const challenges: Challenge[] = [
  { id: "ch-1", title: "Outbound conversion below target in EMEA", description: "Reply rates are 38% under benchmark in DACH and Nordics; messaging needs localization.", relatedGoalId: "og-1", actionItemId: "ai-2", severity: "High", owner: "Sarah Chen", raisedBy: "Sarah Chen", status: "Investigating", createdAt: "2026-05-20" },
  { id: "ch-2", title: "Frankfurt region launch blocked by vendor SLA", description: "Primary CDN provider cannot guarantee 99.95% in Frankfurt before Q4.", relatedGoalId: "og-3", actionItemId: "ai-4", severity: "Critical", owner: "Daniel Ortiz", raisedBy: "Daniel Ortiz", status: "Open", createdAt: "2026-06-02" },
  { id: "ch-3", title: "Health score signals noisy for SMB tier", description: "False-positive at-risk alerts overwhelming CSM queue.", relatedGoalId: "og-2", actionItemId: "ai-3", severity: "Medium", owner: "Marcus Hill", raisedBy: "Marcus Hill", status: "Investigating", createdAt: "2026-05-28" },
  { id: "ch-4", title: "Copilot latency above 1.5s p95", description: "End-to-end inference latency degrading user trust in the beta.", relatedGoalId: "og-7", actionItemId: "ai-7", severity: "High", owner: "Priya Anand", raisedBy: "Priya Anand", status: "Open", createdAt: "2026-06-10" },
  { id: "ch-5", title: "Partner program lacks tiering", description: "No clear Bronze/Silver/Gold structure; partners disengaging.", relatedGoalId: "og-8", actionItemId: "ai-8", severity: "Medium", owner: "Tomás Rivera", raisedBy: "Tomás Rivera", status: "Open", createdAt: "2026-06-12" },
  { id: "ch-6", title: "Audit evidence gap in change management", description: "Change advisory board meeting notes incomplete for Q1.", relatedGoalId: "og-4", actionItemId: "ai-5", severity: "High", owner: "Daniel Ortiz", raisedBy: "Daniel Ortiz", status: "Resolved", createdAt: "2026-04-18" },
  { id: "ch-7", title: "German translation quality issues", description: "Native reviewers flagged 120+ inconsistencies in product copy.", relatedGoalId: "og-3", actionItemId: "ai-10", severity: "Low", owner: "Priya Anand", raisedBy: "Priya Anand", status: "Resolved", createdAt: "2026-05-01" },
  { id: "ch-8", title: "NPS detractor follow-up lacks owner", description: "No accountable role assigned to close the loop on detractor feedback.", relatedGoalId: "og-6", actionItemId: "ai-9", severity: "Medium", owner: "Jordan Lee", raisedBy: "Jordan Lee", status: "Open", createdAt: "2026-06-08" },
];
