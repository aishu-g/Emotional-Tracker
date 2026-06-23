import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import {
  organizationGoals as defaultOrgGoals,
  smartGoals as defaultSmartGoals,
  actionItems as defaultActionItems,
  challenges as defaultChallenges,
  solutions as defaultSolutions,
  activities as defaultActivities,
  type OrgGoal,
  type SmartGoal,
  type ActionItem,
  type Challenge,
  type Solution,
  type Activity
} from "@/lib/mock-data";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  timezone: string;
  company_id: string | null;
}

export interface Report {
  title: string;
  description: string;
  updated: string;
}

interface WorkspaceContextProps {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  members: UserProfile[];
  orgGoals: OrgGoal[];
  smartGoals: SmartGoal[];
  actionItems: ActionItem[];
  challenges: Challenge[];
  solutions: Solution[];
  activities: Activity[];
  reports: Report[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  orgGoalStatuses: string[];
  updateOrgGoalStatuses: (statuses: string[]) => void;
  departments: string[];
  updateDepartments: (depts: string[]) => void;
  addOrgGoal: (goal: Omit<OrgGoal, "id" | "goal" | "progress" | "status" | "smartGoalCount"> & { goal?: string; progress?: number; status?: string; smartGoalCount?: number }) => Promise<OrgGoal | null>;
  updateOrgGoal: (id: string, updates: Partial<OrgGoal>) => Promise<void>;
  deleteOrgGoal: (id: string) => Promise<void>;
  deleteSmartGoal: (id: string) => Promise<void>;
  deleteActionItem: (id: string) => Promise<void>;
  addSmartGoal: (goal: Omit<SmartGoal, "id" | "progress" | "status" | "comments">) => Promise<SmartGoal | null>;
  addCommentToSmartGoal: (smartGoalId: string, text: string) => Promise<void>;
  addActionItem: (item: Omit<ActionItem, "id" | "progress" | "status">) => Promise<ActionItem | null>;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  addChallenge: (challenge: Omit<Challenge, "id" | "status" | "createdAt">) => Promise<Challenge | null>;
  addSolution: (solution: Omit<Solution, "id" | "date" | "status">) => Promise<Solution | null>;
  addReport: (report: Report) => void;
  updateProfile: (profile: Omit<UserProfile, "id" | "company_id" | "email">) => Promise<void>;
  addActivity: (type: Activity["type"], message: string, actor: string) => void;
  resetStore: () => void;
  createCompany: (name: string) => Promise<void>;
  joinCompany: (companyId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

const defaultReports: Report[] = [
  { title: "Quarterly board pack", description: "Executive summary across goals, risks and outcomes.", updated: "2 days ago" },
  { title: "Department scorecards", description: "Performance breakdown by department and owner.", updated: "1 week ago" },
  { title: "Goal velocity report", description: "How fast we close goals vs plan.", updated: "Today" },
  { title: "Risk register", description: "All open and high-severity challenges in one view.", updated: "3 days ago" },
];

export const WorkspaceStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultStatuses = ["Not Started", "In Progress", "At Risk", "Completed"];
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<UserProfile[]>([]);

  // Workspace entity states
  const [orgGoals, setOrgGoals] = useState<OrgGoal[]>([]);
  const [smartGoals, setSmartGoals] = useState<SmartGoal[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  
  // Non-database persistent UI states (stored locally)
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [reports, setReports] = useState<Report[]>(defaultReports);
  const [timeframe, setTimeframe] = useState<string>("2026-2027");
  const [orgGoalStatuses, setOrgGoalStatuses] = useState<string[]>(defaultStatuses);
  const [departments, setDepartments] = useState<string[]>(["Revenue", "Customer Success", "Product", "Security", "People", "Partnerships"]);

  // Hydrate local-storage persistent state on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStatuses = localStorage.getItem("orgGoalStatuses");
      if (savedStatuses) {
        try {
          setOrgGoalStatuses(JSON.parse(savedStatuses));
        } catch (e) {
          console.error("Failed to parse orgGoalStatuses:", e);
        }
      }
      const savedDepts = localStorage.getItem("departments");
      if (savedDepts) {
        try {
          setDepartments(JSON.parse(savedDepts));
        } catch (e) {
          console.error("Failed to parse departments:", e);
        }
      }
    }
  }, []);

  // 1. Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setOrgGoals([]);
        setSmartGoals([]);
        setActionItems([]);
        setChallenges([]);
        setSolutions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch User Profile
  const fetchProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      // Self-heal: If profile doesn't exist (e.g. registered before DB schema trigger was set up)
      if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userName = user.user_metadata?.name || user.email?.split("@")[0] || "New User";
          const userRole = user.user_metadata?.role || "Member";
          
          const { data: newProfile, error: insertErr } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              name: userName,
              email: user.email!,
              role: userRole,
              timezone: "America/Los_Angeles",
              company_id: null
            })
            .select()
            .single();
          
          if (insertErr) throw insertErr;
          data = newProfile;
        }
      }

      // Automatically assign a shared company (skipping Organization Setup screen)
      if (data) {
        // Find the oldest company in the database
        const { data: companies } = await supabase
          .from("companies")
          .select("id")
          .order("created_at", { ascending: true })
          .limit(1);

        let companyId = companies && companies.length > 0 ? companies[0].id : null;

        // If no company exists yet, create a default "Shared Workspace"
        if (!companyId) {
          const { data: newComp, error: createCompErr } = await supabase
            .from("companies")
            .insert({ name: "Shared Workspace" })
            .select()
            .single();

          if (createCompErr) throw createCompErr;
          companyId = newComp.id;

          // Seed it with default mock goals/tasks
          await seedCompanyData(companyId, userId);
        }

        // Link the user to the oldest company if not already linked
        if (data.company_id !== companyId) {
          const { error: linkErr } = await supabase
            .from("profiles")
            .update({ company_id: companyId })
            .eq("id", userId);

          if (linkErr) throw linkErr;
          data.company_id = companyId;
        }
      }

      // Resolve display name if default "New User"
      if (data && (!data.name || data.name === "New User") && data.email) {
        data.name = data.email.split("@")[0];
      }

      setProfile(data);

      if (data && data.company_id) {
        await fetchWorkspaceData(data.company_id);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch all company goals, items, and plans
  const fetchWorkspaceData = async (companyId: string) => {
    try {
      // Fetch all profiles in company once to resolve names
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email, role, timezone, company_id")
        .eq("company_id", companyId);

      const profileMap = new Map<string, string>();
      if (profilesData) {
        const resolvedMembers = profilesData.map((p) => {
          const resolvedName = (!p.name || p.name === "New User") && p.email ? p.email.split("@")[0] : (p.name || "New User");
          profileMap.set(p.id, resolvedName);
          return {
            id: p.id,
            name: resolvedName,
            role: p.role || "Member",
            email: p.email,
            timezone: p.timezone || "America/Los_Angeles",
            company_id: p.company_id
          };
        });
        setMembers(resolvedMembers);
      }

      // Organization goals
      const { data: orgData } = await supabase
        .from("organization_goals")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (orgData) {
        const mapped = orgData.map((g) => ({
          id: g.id,
          name: g.name,
          goal: g.goal,
          department: g.department,
          owner: g.owner_id ? (profileMap.get(g.owner_id) || "Unknown Owner") : "Unassigned",
          ownerId: g.owner_id,
          progress: g.progress,
          status: g.status,
          startDate: g.start_date,
          endDate: g.end_date,
          description: g.description,
          smartGoalCount: 0 // Calculated dynamically
        }));
        setOrgGoals(mapped);
      }

      // SMART goals
      const { data: smartData } = await supabase
        .from("smart_goals")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (smartData) {
        const mapped = smartData.map((s) => ({
          id: s.id,
          title: s.title,
          owner: s.owner_id ? (profileMap.get(s.owner_id) || "Unknown Owner") : "Unassigned",
          progress: s.progress,
          status: s.status,
          startDate: s.start_date,
          dueDate: s.due_date,
          orgGoalId: s.org_goal_id,
          comments: [] // Local or dynamic comments
        }));
        setSmartGoals(mapped);
      }

      // Action items
      const { data: actionData } = await supabase
        .from("action_items")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (actionData) {
        const mapped = actionData.map((a) => ({
          id: a.id,
          task: a.task,
          assignedTo: a.assigned_to ? (profileMap.get(a.assigned_to) || "Unknown Assignee") : "Unassigned",
          priority: a.priority as any,
          progress: a.progress,
          status: a.status as any,
          dueDate: a.due_date,
          smartGoalId: a.smart_goal_id
        }));
        setActionItems(mapped);
      }

      // Challenges
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (challengeData) {
        const mapped = challengeData.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || "",
          relatedGoalId: c.related_goal_id,
          actionItemId: c.action_item_id || "",
          severity: c.severity as any,
          owner: c.owner_id ? (profileMap.get(c.owner_id) || "Unknown") : "Unassigned",
          raisedBy: c.raised_by_id ? (profileMap.get(c.raised_by_id) || "Unknown") : "Unknown",
          status: c.status as any,
          createdAt: c.created_at
        }));
        setChallenges(mapped);
      }

      // Solutions
      const { data: solutionData } = await supabase
        .from("solutions")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (solutionData) {
        const mapped = solutionData.map((sol) => ({
          id: sol.id,
          title: sol.title,
          description: sol.description || "",
          relatedChallengeId: sol.related_challenge_id,
          director: sol.director_id ? (profileMap.get(sol.director_id) || "Unknown") : "Unassigned",
          date: sol.created_at,
          impact: sol.impact,
          status: sol.status as any,
          owner: sol.owner_id ? (profileMap.get(sol.owner_id) || "Unknown") : "Unassigned"
        }));
        setSolutions(mapped);
      }

    } catch (err) {
      console.error("Error loading workspace data from Supabase:", err);
    }
  };

  // 4. Create a Company (and Seed Default Data)
  const createCompany = async (name: string) => {
    if (!session) return;
    try {
      // Create company row
      const { data: company, error: companyErr } = await supabase
        .from("companies")
        .insert({ name })
        .select()
        .single();

      if (companyErr) throw companyErr;

      // Update user profile with company id
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ company_id: company.id })
        .eq("id", session.user.id);

      if (profileErr) throw profileErr;

      // Seed initial dummy goals for them to work with
      await seedCompanyData(company.id, session.user.id);

      // Re-fetch profile
      await fetchProfile(session.user.id);
    } catch (err) {
      console.error("Failed to create company:", err);
      throw err;
    }
  };

  // Helper: Seed Default Mock Data for new companies
  const seedCompanyData = async (companyId: string, userId: string) => {
    const ogIdMap: Record<string, string> = {};
    for (const og of defaultOrgGoals) {
      const { data } = await supabase
        .from("organization_goals")
        .insert({
          company_id: companyId,
          name: og.name,
          goal: og.goal,
          department: og.department,
          owner_id: userId,
          progress: og.progress,
          status: og.status,
          start_date: og.startDate,
          end_date: og.endDate,
          description: og.description,
        })
        .select("id")
        .single();
      if (data) ogIdMap[og.id] = data.id;
    }

    const sgIdMap: Record<string, string> = {};
    for (const sg of defaultSmartGoals) {
      const orgGoalId = ogIdMap[sg.orgGoalId];
      if (!orgGoalId) continue;
      const { data } = await supabase
        .from("smart_goals")
        .insert({
          company_id: companyId,
          org_goal_id: orgGoalId,
          title: sg.title,
          owner_id: userId,
          progress: sg.progress,
          status: sg.status,
          start_date: sg.startDate,
          due_date: sg.dueDate,
        })
        .select("id")
        .single();
      if (data) sgIdMap[sg.id] = data.id;
    }

    const aiIdMap: Record<string, string> = {};
    for (const ai of defaultActionItems) {
      const smartGoalId = sgIdMap[ai.smartGoalId];
      if (!smartGoalId) continue;
      const { data } = await supabase
        .from("action_items")
        .insert({
          company_id: companyId,
          smart_goal_id: smartGoalId,
          task: ai.task,
          assigned_to: userId,
          priority: ai.priority,
          progress: ai.progress,
          status: ai.status,
          due_date: ai.dueDate,
        })
        .select("id")
        .single();
      if (data) aiIdMap[ai.id] = data.id;
    }

    for (const ch of defaultChallenges) {
      const relatedGoalId = ogIdMap[ch.relatedGoalId];
      if (!relatedGoalId) continue;
      const actionItemId = aiIdMap[ch.actionItemId] || null;
      await supabase.from("challenges").insert({
        company_id: companyId,
        related_goal_id: relatedGoalId,
        action_item_id: actionItemId,
        title: ch.title,
        description: ch.description,
        severity: ch.severity,
        owner_id: userId,
        raised_by_id: userId,
        status: ch.status,
        created_at: ch.createdAt,
      });
    }
  };

  // 5. Join a Company via UUID
  const joinCompany = async (companyId: string) => {
    if (!session) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ company_id: companyId })
        .eq("id", session.user.id);

      if (error) throw error;
      await fetchProfile(session.user.id);
    } catch (err) {
      console.error("Failed to join company:", err);
      throw err;
    }
  };

  // ==========================================
  // MUTATIONS (CRUD)
  // ==========================================

  const addOrgGoal = async (goal: Omit<OrgGoal, "id" | "goal" | "progress" | "status" | "smartGoalCount"> & { goal?: string; progress?: number; status?: string; smartGoalCount?: number }) => {
    if (!profile || !profile.company_id) return null;
    const nameVal = goal.goal || (goal as any).name || "";
    try {
      const { data, error } = await supabase
        .from("organization_goals")
        .insert({
          company_id: profile.company_id,
          name: nameVal,
          goal: nameVal,
          department: goal.department,
          owner_id: profile.id,
          progress: goal.progress || 0,
          status: goal.status || "Not Started",
          start_date: goal.startDate,
          end_date: goal.endDate,
          description: goal.description,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: OrgGoal = {
        id: data.id,
        name: nameVal,
        goal: nameVal,
        owner: profile.name,
        department: goal.department,
        progress: goal.progress || 0,
        status: goal.status || "Not Started",
        startDate: goal.startDate,
        endDate: goal.endDate,
        description: goal.description,
        smartGoalCount: 0
      };

      setOrgGoals((prev) => [newGoal, ...prev]);
      addActivity("goal_update", `Created organization goal: "${newGoal.name}"`, profile.name);
      return newGoal;
    } catch (err) {
      console.error("Failed to add org goal:", err);
      return null;
    }
  };

  const updateOrgGoal = async (id: string, updates: Partial<OrgGoal>) => {
    if (!profile) return;
    try {
      const mappedUpdates: any = {};
      if (updates.name !== undefined) {
        mappedUpdates.name = updates.name;
        mappedUpdates.goal = updates.name;
      }
      if (updates.progress !== undefined) mappedUpdates.progress = updates.progress;
      if (updates.status !== undefined) mappedUpdates.status = updates.status;
      if (updates.description !== undefined) mappedUpdates.description = updates.description;
      if (updates.startDate !== undefined) mappedUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) mappedUpdates.end_date = updates.endDate;

      const { error } = await supabase
        .from("organization_goals")
        .update(mappedUpdates)
        .eq("id", id);

      if (error) throw error;

      setOrgGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      
      const target = orgGoals.find((g) => g.id === id);
      if (target) {
        if (updates.name) addActivity("goal_update", `Updated organization goal name to: "${updates.name}"`, profile.name);
        else if (updates.status) addActivity("goal_update", `Updated goal "${target.name}" status to ${updates.status}`, profile.name);
      }
    } catch (err) {
      console.error("Failed to update org goal:", err);
    }
  };

  const deleteOrgGoal = async (id: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("organization_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOrgGoals((prev) => prev.filter((g) => g.id !== id));
      // Delete child cascade states locally
      setSmartGoals((prev) => prev.filter((sg) => sg.orgGoalId !== id));
      const childSmartGoalIds = new Set(smartGoals.filter((sg) => sg.orgGoalId === id).map((sg) => sg.id));
      setActionItems((prev) => prev.filter((ai) => !childSmartGoalIds.has(ai.smartGoalId)));
      setChallenges((prev) => prev.filter((ch) => ch.relatedGoalId !== id));

      addActivity("goal_update", `Deleted organization goal`, profile.name);
    } catch (err) {
      console.error("Failed to delete org goal:", err);
    }
  };

  const addSmartGoal = async (goal: Omit<SmartGoal, "id" | "progress" | "status" | "comments">) => {
    if (!profile || !profile.company_id) return null;
    try {
      const { data, error } = await supabase
        .from("smart_goals")
        .insert({
          company_id: profile.company_id,
          org_goal_id: goal.orgGoalId,
          title: goal.title,
          owner_id: profile.id,
          progress: 0,
          status: "Not Started",
          start_date: goal.startDate,
          due_date: goal.dueDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: SmartGoal = {
        id: data.id,
        title: goal.title,
        owner: profile.name,
        progress: 0,
        status: "Not Started",
        startDate: goal.startDate,
        dueDate: goal.dueDate,
        orgGoalId: goal.orgGoalId,
        comments: [],
      };

      setSmartGoals((prev) => [newGoal, ...prev]);
      addActivity("goal_update", `Created SMART goal: "${newGoal.title}"`, profile.name);
      return newGoal;
    } catch (err) {
      console.error("Failed to add SMART goal:", err);
      return null;
    }
  };

  const deleteSmartGoal = async (id: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("smart_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSmartGoals((prev) => prev.filter((sg) => sg.id !== id));
      setActionItems((prev) => prev.filter((ai) => ai.smartGoalId !== id));

      addActivity("goal_update", `Deleted SMART goal`, profile.name);
    } catch (err) {
      console.error("Failed to delete SMART goal:", err);
    }
  };

  const addActionItem = async (item: Omit<ActionItem, "id" | "progress" | "status">) => {
    if (!profile || !profile.company_id) return null;
    try {
      const { data, error } = await supabase
        .from("action_items")
        .insert({
          company_id: profile.company_id,
          smart_goal_id: item.smartGoalId,
          task: item.task,
          assigned_to: profile.id,
          priority: item.priority,
          progress: 0,
          status: "Todo",
          due_date: item.dueDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: ActionItem = {
        id: data.id,
        task: item.task,
        assignedTo: profile.name,
        priority: item.priority,
        progress: 0,
        status: "Todo",
        dueDate: item.dueDate,
        smartGoalId: item.smartGoalId,
      };

      setActionItems((prev) => [newItem, ...prev]);
      addActivity("completed_action", `Created action item: "${newItem.task}"`, profile.name);
      return newItem;
    } catch (err) {
      console.error("Failed to add action item:", err);
      return null;
    }
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>) => {
    if (!profile) return;
    try {
      const mappedUpdates: any = {};
      if (updates.task !== undefined) mappedUpdates.task = updates.task;
      if (updates.status !== undefined) mappedUpdates.status = updates.status;
      if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
      if (updates.progress !== undefined) mappedUpdates.progress = updates.progress;
      if (updates.dueDate !== undefined) mappedUpdates.due_date = updates.dueDate;

      const { error } = await supabase
        .from("action_items")
        .update(mappedUpdates)
        .eq("id", id);

      if (error) throw error;

      setActionItems((prev) =>
        prev.map((ai) => (ai.id === id ? { ...ai, ...updates } : ai))
      );

      const target = actionItems.find((ai) => ai.id === id);
      if (target && updates.status) {
        addActivity("completed_action", `Updated task "${target.task}" status to ${updates.status}`, profile.name);
      }
    } catch (err) {
      console.error("Failed to update action item:", err);
    }
  };

  const deleteActionItem = async (id: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("action_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setActionItems((prev) => prev.filter((ai) => ai.id !== id));
      addActivity("completed_action", `Deleted action item`, profile.name);
    } catch (err) {
      console.error("Failed to delete action item:", err);
    }
  };

  const addChallenge = async (challenge: Omit<Challenge, "id" | "status" | "createdAt">) => {
    if (!profile || !profile.company_id) return null;
    try {
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          company_id: profile.company_id,
          related_goal_id: challenge.relatedGoalId,
          action_item_id: challenge.actionItemId || null,
          title: challenge.title,
          description: challenge.description,
          severity: challenge.severity,
          owner_id: profile.id,
          raised_by_id: profile.id,
          status: "Open",
        })
        .select()
        .single();

      if (error) throw error;

      const newChallenge: Challenge = {
        id: data.id,
        title: challenge.title,
        description: challenge.description,
        relatedGoalId: challenge.relatedGoalId,
        actionItemId: challenge.actionItemId || "",
        severity: challenge.severity,
        owner: profile.name,
        raisedBy: profile.name,
        status: "Open",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setChallenges((prev) => [newChallenge, ...prev]);
      addActivity("new_challenge", `Raised challenge: "${newChallenge.title}"`, profile.name);
      return newChallenge;
    } catch (err) {
      console.error("Failed to add challenge:", err);
      return null;
    }
  };

  const addSolution = async (solution: Omit<Solution, "id" | "date" | "status">) => {
    if (!profile || !profile.company_id) return null;
    try {
      const { data, error } = await supabase
        .from("solutions")
        .insert({
          company_id: profile.company_id,
          related_challenge_id: solution.relatedChallengeId,
          title: solution.title,
          description: solution.description,
          director_id: profile.id,
          impact: solution.impact,
          status: "Proposed",
          owner_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newSolution: Solution = {
        id: data.id,
        title: solution.title,
        description: solution.description,
        relatedChallengeId: solution.relatedChallengeId,
        director: profile.name,
        date: new Date().toISOString().split("T")[0],
        impact: solution.impact,
        status: "Proposed",
        owner: profile.name,
      };

      setSolutions((prev) => [newSolution, ...prev]);
      addActivity("solution_added", `Proposed solution: "${newSolution.title}"`, profile.name);
      return newSolution;
    } catch (err) {
      console.error("Failed to add solution:", err);
      return null;
    }
  };

  // Local-only states actions
  const addCommentToSmartGoal = async (smartGoalId: string, text: string) => {
    if (!profile) return;
    setSmartGoals((prev) =>
      prev.map((sg) => {
        if (sg.id === smartGoalId) {
          return {
            ...sg,
            comments: [
              ...sg.comments,
              {
                id: `c-${Date.now()}`,
                author: profile.name,
                date: new Date().toISOString().split("T")[0],
                text,
              },
            ],
          };
        }
        return sg;
      })
    );
  };

  const updateProfile = async (updates: Omit<UserProfile, "id" | "company_id" | "email">) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updates.name,
          role: updates.role,
          timezone: updates.timezone,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const addReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
  };

  const addActivity = (type: Activity["type"], message: string, actor: string) => {
    const newActivity: Activity = {
      id: `ac-${Date.now()}`,
      type,
      message,
      actor,
      at: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const resetStore = () => {
    // If they want to reload company database values, re-fetch.
    if (profile && profile.company_id) {
      fetchWorkspaceData(profile.company_id);
    }
  };

  const updateOrgGoalStatuses = (statuses: string[]) => {
    setOrgGoalStatuses(statuses);
    if (typeof window !== "undefined") {
      localStorage.setItem("orgGoalStatuses", JSON.stringify(statuses));
    }
  };

  const updateDepartments = (depts: string[]) => {
    setDepartments(depts);
    if (typeof window !== "undefined") {
      localStorage.setItem("departments", JSON.stringify(depts));
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        session,
        profile,
        loading,
        members,
        orgGoals,
        smartGoals,
        actionItems,
        challenges,
        solutions,
        activities,
        reports,
        timeframe,
        setTimeframe,
        orgGoalStatuses,
        updateOrgGoalStatuses,
        departments,
        updateDepartments,
        addOrgGoal,
        updateOrgGoal,
        deleteOrgGoal,
        deleteSmartGoal,
        deleteActionItem,
        addSmartGoal,
        addCommentToSmartGoal,
        addActionItem,
        updateActionItem,
        addChallenge,
        addSolution,
        addReport,
        updateProfile,
        addActivity,
        resetStore,
        createCompany,
        joinCompany,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceStore = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceStore must be used within a WorkspaceStoreProvider");
  }
  return context;
};
