export type SolutionStatus = "Proposed" | "In Review" | "Implemented" | "Archived";

export interface Solution {
  id: string;
  title: string;
  description: string;
  relatedChallengeId: string;
  director: string;
  date: string;
  impact: number;
  status: SolutionStatus;
  owner: string;
}

export const solutions: Solution[] = [
  { id: "so-1", title: "Multi-touch ABM playbook with intent data", description: "Pair 6sense intent signals with a 9-touch outbound sequence.", relatedChallengeId: "ch-1", director: "Sarah Chen", date: "2026-05-22", impact: 8, status: "In Review", owner: "Sarah Chen" },
  { id: "so-1b", title: "Regional SDR pods with native speakers", description: "Stand up DACH and Nordics SDR pods to localize messaging in-house.", relatedChallengeId: "ch-1", director: "Tomás Rivera", date: "2026-05-25", impact: 7, status: "Proposed", owner: "Tomás Rivera" },
  { id: "so-2", title: "Switch to redundant CDN provider for EU", description: "Add Fastly as failover for Cloudflare in Frankfurt.", relatedChallengeId: "ch-2", director: "Daniel Ortiz", date: "2026-06-03", impact: 9, status: "Proposed", owner: "Daniel Ortiz" },
  { id: "so-2b", title: "Negotiate dedicated SLA with current vendor", description: "Escalate to vendor exec sponsor for a Frankfurt-specific SLA addendum.", relatedChallengeId: "ch-2", director: "Sarah Chen", date: "2026-06-05", impact: 6, status: "In Review", owner: "Sarah Chen" },
  { id: "so-3", title: "Tune SMB health model thresholds", description: "Recalibrate signal weights for accounts under 50 seats.", relatedChallengeId: "ch-3", director: "Marcus Hill", date: "2026-05-30", impact: 6, status: "Implemented", owner: "Marcus Hill" },
  { id: "so-4", title: "Cache common Copilot prompts at edge", description: "Pre-warm a top-50 prompt cache at edge to halve p95 latency.", relatedChallengeId: "ch-4", director: "Priya Anand", date: "2026-06-11", impact: 7, status: "In Review", owner: "Priya Anand" },
  { id: "so-4b", title: "Switch to smaller distilled model for read-paths", description: "Use a distilled model for high-volume read operations.", relatedChallengeId: "ch-4", director: "Amelia Brooks", date: "2026-06-13", impact: 8, status: "Proposed", owner: "Amelia Brooks" },
  { id: "so-5", title: "Introduce Bronze/Silver/Gold partner tiers", description: "Tier benefits by influenced ARR with quarterly reviews.", relatedChallengeId: "ch-5", director: "Tomás Rivera", date: "2026-06-13", impact: 7, status: "Proposed", owner: "Tomás Rivera" },
  { id: "so-6", title: "Adopt change advisory board template", description: "Standard CAB template with mandatory evidence checklist.", relatedChallengeId: "ch-6", director: "Daniel Ortiz", date: "2026-04-25", impact: 8, status: "Implemented", owner: "Daniel Ortiz" },
  { id: "so-7", title: "Engage native German linguistic QA vendor", description: "Contract Lionbridge for a full DE linguistic QA pass.", relatedChallengeId: "ch-7", director: "Priya Anand", date: "2026-05-05", impact: 5, status: "Implemented", owner: "Priya Anand" },
  { id: "so-8", title: "Route detractor follow-ups via CSM queue", description: "Auto-route detractor NPS responses to CSM queue with 48h SLA.", relatedChallengeId: "ch-8", director: "Jordan Lee", date: "2026-06-09", impact: 6, status: "Proposed", owner: "Jordan Lee" },
  { id: "so-8b", title: "Executive sponsor program for detractors", description: "Top-20 detractor accounts get an exec sponsor call.", relatedChallengeId: "ch-8", director: "Marcus Hill", date: "2026-06-10", impact: 7, status: "In Review", owner: "Marcus Hill" },
];
