import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Flame,
  Battery,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  FileSpreadsheet,
  FileDown,
  CalendarDays,
  Smile,
  Check,
  User,
  ListTodo,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { KpiCard } from "@/components/kpi-card";
import { AreaTrendChart, LineSeriesChart, BarSeriesChart } from "@/components/charts";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ==========================================
// 1. DATA MODELS & CONSTANTS
// ==========================================

export interface CategoryRating {
  rating: number; // 1 to 10
  notes: string;
  emotion: string;
}

export interface EmotionalDailyLog {
  id: string; // YYYY-MM-DD
  date: string;
  directorName: string;
  predominantEmotion: string;
  prepareTime: boolean;
  shareEmotions: boolean;
  rightDiscussionPoint: boolean;
  alignPurpose: boolean;
  firstOrderPriority: string;
  specificAsk: string;
  ratings: Record<string, CategoryRating>; // categoryId -> rating
}

export interface TrackerCategory {
  id: string;
  name: string;
  section: "health" | "family" | "business" | "personal";
}

export const SECTIONS = {
  health: { label: "Health - physical and mental", color: "bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 border-red-100 dark:border-red-900/30" },
  family: { label: "Family & Friends (eg: relationship)", color: "bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 border-blue-100 dark:border-blue-900/30" },
  business: { label: "Business / Career", color: "bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border-amber-100 dark:border-amber-900/30" },
  personal: { label: "Personal", color: "bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 border-purple-100 dark:border-purple-900/30" }
};

export const CATEGORIES: TrackerCategory[] = [
  // Health
  { id: "exercises", name: "Routine Exercises", section: "health" },
  { id: "food", name: "Food Habits", section: "health" },
  { id: "energy", name: "Energy level throughout the day", section: "health" },
  { id: "sleep", name: "Sleep time", section: "health" },
  { id: "peace", name: "Peace of mind", section: "health" },
  // Family
  { id: "time", name: "Time Spent", section: "family" },
  { id: "regrets", name: "Regrets", section: "family" },
  { id: "conflicts", name: "Conflicts", section: "family" },
  { id: "memories", name: "Memories", section: "family" },
  { id: "empathy", name: "Empathy", section: "family" },
  // Business
  { id: "growth", name: "Growth", section: "business" },
  { id: "opportunities", name: "Opportunities", section: "business" },
  { id: "challenges", name: "Challenges", section: "business" },
  { id: "culture", name: "Building Culture", section: "business" },
  { id: "implementation", name: "Implementation", section: "business" },
  // Personal
  { id: "invest", name: "IIM - Invest in Myself", section: "personal" },
  { id: "finance", name: "Finance", section: "personal" },
  { id: "spiritual", name: "Spiritual Purists", section: "personal" },
  { id: "hobby", name: "Fun & Hobby", section: "personal" },
  { id: "behavioral", name: "Behavioral changes", section: "personal" }
];

export const EMOTIONS = [
  { name: "Happiness", emoji: "😊", color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 ring-emerald-400" },
  { name: "Confidence", emoji: "😎", color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 ring-blue-400" },
  { name: "Comfortable", emoji: "😌", color: "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300 ring-teal-400" },
  { name: "Excitement", emoji: "🤩", color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-300 ring-yellow-400" },
  { name: "Satisfactory", emoji: "🙂", color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 ring-green-400" },
  { name: "Guilt", emoji: "😔", color: "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900 text-gray-700 dark:text-gray-300 ring-gray-400" },
  { name: "Tough", emoji: "😣", color: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 ring-indigo-400" },
  { name: "Sadness", emoji: "😢", color: "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300 ring-sky-400" },
  { name: "Frustration", emoji: "😫", color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300 ring-orange-400" },
  { name: "Fear", emoji: "😨", color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 ring-purple-400" },
  { name: "Anger", emoji: "😡", color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 ring-red-400" },
  { name: "Bad", emoji: "😕", color: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 ring-rose-400" },
  { name: "Insecurity", emoji: "😰", color: "bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 text-zinc-700 dark:text-zinc-300 ring-zinc-400" },
  { name: "Disgust", emoji: "🤢", color: "bg-lime-50 dark:bg-lime-950/20 border-lime-200 dark:border-lime-900 text-lime-700 dark:text-lime-300 ring-lime-400" },
  { name: "Confusion", emoji: "🤔", color: "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-300 ring-pink-400" }
];

export const getEmotionDetails = (name: string) => {
  return EMOTIONS.find(e => e.name.toLowerCase() === name.toLowerCase()) || { emoji: "😐", color: "bg-muted border-muted text-muted-foreground ring-muted" };
};

const QUESTIONS = [
  { id: "prepareTime", label: "Did I give enough time to think over and prepare this update?" },
  { id: "shareEmotions", label: "Will I be able to share my emotions openly during this presentation?" },
  { id: "rightDiscussionPoint", label: "Have I identified the right discussion point for presentation?" },
  { id: "alignPurpose", label: "Will this presentation take me towards my purpose / life goal?" }
];

// ==========================================
// 2. SEED DATA REPRESENTING EXCEL VALUES
// ==========================================

const SEED_LOGS: EmotionalDailyLog[] = [
  {
    id: "2024-04-12",
    date: "2024-04-12",
    directorName: "Aishwarya G",
    predominantEmotion: "Happiness",
    prepareTime: true,
    shareEmotions: true,
    rightDiscussionPoint: true,
    alignPurpose: true,
    firstOrderPriority: "Establish baseline mood indicators",
    specificAsk: "Online platform in our own website",
    ratings: {
      exercises: { rating: 3, notes: "very Lazy", emotion: "Guilt" },
      food: { rating: 4, notes: "Because of festivals", emotion: "Guilt" },
      energy: { rating: 5, notes: "Ok, But need to improve", emotion: "Sadness" },
      sleep: { rating: 6, notes: "Consistent sleep schedule", emotion: "Comfortable" },
      peace: { rating: 8, notes: "Very good-- gradually improving", emotion: "Happiness" },
      
      time: { rating: 9, notes: "Spent quality time with my Family", emotion: "Happiness" },
      regrets: { rating: 7, notes: "Felt unhappy because of few irritations among relatives", emotion: "Sadness" },
      conflicts: { rating: 3, notes: "I had a fight with my son last week as his marks were very low and he refuses to understand the seriousness", emotion: "Anger" },
      memories: { rating: 10, notes: "My daughter has passed her NEET exam", emotion: "Happiness" },
      empathy: { rating: 9, notes: "My family understands and supports me", emotion: "Happiness" },
      
      growth: { rating: 4, notes: "Reg. Growth I am the Bottle Neck", emotion: "Sadness" },
      opportunities: { rating: 7, notes: "Identified new market segment", emotion: "Confidence" },
      challenges: { rating: 6, notes: "Resource constraints are impacting speed", emotion: "Frustration" },
      culture: { rating: 8, notes: "Building culture & Implementations moving in right Direction", emotion: "Happiness" },
      implementation: { rating: 8, notes: "Building culture & Implementations moving in right Direction", emotion: "Happiness" },
      
      invest: { rating: 5, notes: "lack of some rituals is not good shine for personal development", emotion: "Sadness" },
      finance: { rating: 8, notes: "Very comfortable in spending | Lacking in Budget till date", emotion: "Comfortable" },
      spiritual: { rating: 6, notes: "Trying to meditate daily", emotion: "Satisfactory" },
      hobby: { rating: 9, notes: "Lot enjoyed | songs | plantations", emotion: "Happiness" },
      behavioral: { rating: 8, notes: "Able to notice in short span - started to change some reactions | able to notice listening mode | Intentionally not got Anger because of awareness arises within", emotion: "Happiness" },
    }
  },
  {
    id: "2024-04-13",
    date: "2024-04-13",
    directorName: "Aishwarya G",
    predominantEmotion: "Confidence",
    prepareTime: true,
    shareEmotions: true,
    rightDiscussionPoint: false,
    alignPurpose: true,
    firstOrderPriority: "Improve work-life boundary settings",
    specificAsk: "Sync feedback with other partners",
    ratings: {
      exercises: { rating: 6, notes: "Morning walk done", emotion: "Comfortable" },
      food: { rating: 7, notes: "Clean eating day", emotion: "Happiness" },
      energy: { rating: 8, notes: "Felt very high energy today", emotion: "Confidence" },
      sleep: { rating: 7, notes: "Slept 7 hours", emotion: "Comfortable" },
      peace: { rating: 7, notes: "Quiet, calm evening", emotion: "Comfortable" },
      
      time: { rating: 8, notes: "Dinner with relatives", emotion: "Happiness" },
      regrets: { rating: 9, notes: "No major regrets", emotion: "Happiness" },
      conflicts: { rating: 9, notes: "No major conflicts", emotion: "Happiness" },
      memories: { rating: 8, notes: "Took a walk in the park", emotion: "Happiness" },
      empathy: { rating: 8, notes: "Had helpful talks with teammates", emotion: "Satisfactory" },
      
      growth: { rating: 8, notes: "Good progress on design systems", emotion: "Confidence" },
      opportunities: { rating: 8, notes: "Partner program discussion went well", emotion: "Confidence" },
      challenges: { rating: 7, notes: "Resolving technical debt", emotion: "Tough" },
      culture: { rating: 7, notes: "Team alignment session was productive", emotion: "Happiness" },
      implementation: { rating: 9, notes: "Successfully shipped auth module", emotion: "Confidence" },
      
      invest: { rating: 8, notes: "Read 10 pages of my book", emotion: "Happiness" },
      finance: { rating: 7, notes: "Reviewing investments", emotion: "Satisfactory" },
      spiritual: { rating: 7, notes: "Brief meditation in morning", emotion: "Satisfactory" },
      hobby: { rating: 8, notes: "Played guitar", emotion: "Happiness" },
      behavioral: { rating: 9, notes: "Maintained calmness during reviews", emotion: "Confidence" },
    }
  },
  {
    id: "2024-04-14",
    date: "2024-04-14",
    directorName: "Aishwarya G",
    predominantEmotion: "Comfortable",
    prepareTime: true,
    shareEmotions: false,
    rightDiscussionPoint: true,
    alignPurpose: true,
    firstOrderPriority: "Prioritize health rituals",
    specificAsk: "Setup weekly check-in platform",
    ratings: {
      exercises: { rating: 8, notes: "Full gym session completed", emotion: "Happiness" },
      food: { rating: 8, notes: "Clean eating, tracking macros", emotion: "Happiness" },
      energy: { rating: 7, notes: "Strong energy in morning, faded slightly", emotion: "Comfortable" },
      sleep: { rating: 8, notes: "Best sleep this week", emotion: "Comfortable" },
      peace: { rating: 9, notes: "Very peaceful day off", emotion: "Happiness" },
      
      time: { rating: 9, notes: "Full day with kids and family", emotion: "Happiness" },
      regrets: { rating: 10, notes: "Zero regrets", emotion: "Happiness" },
      conflicts: { rating: 8, notes: "No conflicts raised", emotion: "Comfortable" },
      memories: { rating: 9, notes: "Made a nice family scrapbook page", emotion: "Happiness" },
      empathy: { rating: 9, notes: "Listening intently to partner needs", emotion: "Happiness" },
      
      growth: { rating: 6, notes: "Read industry benchmarks", emotion: "Comfortable" },
      opportunities: { rating: 7, notes: "Outlined new client proposal", emotion: "Confidence" },
      challenges: { rating: 8, notes: "Managed challenges gracefully", emotion: "Comfortable" },
      culture: { rating: 7, notes: "Sent thank you cards to team", emotion: "Happiness" },
      implementation: { rating: 6, notes: "Reviewed next week sprint plan", emotion: "Comfortable" },
      
      invest: { rating: 9, notes: "Completed learning course module", emotion: "Confidence" },
      finance: { rating: 8, notes: "Completed monthly budget review", emotion: "Satisfactory" },
      spiritual: { rating: 8, notes: "Meditation and breathing routines", emotion: "Comfortable" },
      hobby: { rating: 9, notes: "Tended to home garden", emotion: "Happiness" },
      behavioral: { rating: 8, notes: "Recognizing stress triggers earlier", emotion: "Confidence" },
    }
  }
];

export const Route = createFileRoute("/emotional-tracking")({
  head: () => ({
    meta: [
      { title: "Emotional Tracking — PB39" },
      { name: "description", content: "Interactive daily emotional metrics, tracker sheets, and organizational mood insights." },
    ],
  }),
  component: EmotionalTrackingPage,
});

function EmotionalTrackingPage() {
  const { profile } = useWorkspaceStore();
  const [logs, setLogs] = useState<EmotionalDailyLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>("matrix");
  
  // Form editing states
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formEmotion, setFormEmotion] = useState<string>("Happiness");
  const [formPriority, setFormPriority] = useState<string>("");
  const [formAsk, setFormAsk] = useState<string>("");
  
  // Checklist questions
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    prepareTime: true,
    shareEmotions: true,
    rightDiscussionPoint: true,
    alignPurpose: true
  });
  
  // Ratings maps
  const [ratings, setRatings] = useState<Record<string, { rating: number; notes: string; emotion: string }>>({});

  // 1. Load data from local storage or set seeds on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("emotionalTrackerLogs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLogs(parsed);
        } catch (e) {
          console.error("Failed to parse logs from localStorage:", e);
          setLogs(SEED_LOGS);
        }
      } else {
        setLogs(SEED_LOGS);
        localStorage.setItem("emotionalTrackerLogs", JSON.stringify(SEED_LOGS));
      }
    }
  }, []);

  // Pre-fill profile name when loaded
  useEffect(() => {
    if (profile?.name && !formName) {
      setFormName(profile.name);
    }
  }, [profile]);

  // Sort logs by date ascending for the spreadsheet matrix view
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  // Reset ratings to defaults
  const initializeFormRatings = (existingLog?: EmotionalDailyLog) => {
    const freshRatings: Record<string, { rating: number; notes: string; emotion: string }> = {};
    CATEGORIES.forEach(cat => {
      if (existingLog && existingLog.ratings[cat.id]) {
        freshRatings[cat.id] = { ...existingLog.ratings[cat.id] };
      } else {
        freshRatings[cat.id] = { rating: 5, notes: "", emotion: "Comfortable" };
      }
    });
    setRatings(freshRatings);
  };

  // Switch to new log entry form
  const handleNewEntry = () => {
    const today = new Date().toISOString().split("T")[0];
    setEditLogId(null);
    setFormDate(today);
    setFormName(profile?.name || "Aishwarya G");
    setFormEmotion("Happiness");
    setFormPriority("");
    setFormAsk("");
    setChecklist({
      prepareTime: true,
      shareEmotions: true,
      rightDiscussionPoint: true,
      alignPurpose: true
    });
    initializeFormRatings();
    setActiveTab("entry");
  };

  // Load a log into the editor form
  const handleEditEntry = (log: EmotionalDailyLog) => {
    setEditLogId(log.id);
    setFormDate(log.date);
    setFormName(log.directorName);
    setFormEmotion(log.predominantEmotion);
    setFormPriority(log.firstOrderPriority);
    setFormAsk(log.specificAsk);
    setChecklist({
      prepareTime: log.prepareTime,
      shareEmotions: log.shareEmotions,
      rightDiscussionPoint: log.rightDiscussionPoint,
      alignPurpose: log.alignPurpose
    });
    initializeFormRatings(log);
    setActiveTab("entry");
    toast.info(`Loaded log for ${log.date} into edit form`);
  };

  // Delete a log entry
  const handleDeleteEntry = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Are you sure you want to delete this daily tracking entry?")) {
      const updated = logs.filter(l => l.id !== id);
      setLogs(updated);
      localStorage.setItem("emotionalTrackerLogs", JSON.stringify(updated));
      toast.success("Entry deleted successfully!");
    }
  };

  // Reset demo seed data
  const handleResetToSeeds = () => {
    if (confirm("This will restore the default tracker entries and delete your customizations. Proceed?")) {
      setLogs(SEED_LOGS);
      localStorage.setItem("emotionalTrackerLogs", JSON.stringify(SEED_LOGS));
      toast.success("Default emotional tracking data restored!");
    }
  };

  // Save log entry (insert or update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formName) {
      toast.error("Please enter Name and Select Date.");
      return;
    }

    const logPayload: EmotionalDailyLog = {
      id: formDate, // Key by date
      date: formDate,
      directorName: formName,
      predominantEmotion: formEmotion,
      prepareTime: checklist.prepareTime,
      shareEmotions: checklist.shareEmotions,
      rightDiscussionPoint: checklist.rightDiscussionPoint,
      alignPurpose: checklist.alignPurpose,
      firstOrderPriority: formPriority,
      specificAsk: formAsk,
      ratings: ratings
    };

    const existsIndex = logs.findIndex(l => l.id === formDate);
    let updatedLogs = [...logs];
    
    if (existsIndex >= 0) {
      // Overwrite/Update
      updatedLogs[existsIndex] = logPayload;
      toast.success(`Updated tracker entry for ${formDate}!`);
    } else {
      // Create new
      updatedLogs.push(logPayload);
      toast.success(`Saved new tracker entry for ${formDate}!`);
    }

    setLogs(updatedLogs);
    localStorage.setItem("emotionalTrackerLogs", JSON.stringify(updatedLogs));
    
    // Reset edit ID and navigate back to Matrix
    setEditLogId(null);
    setActiveTab("matrix");
  };

  // ==========================================
  // 3. STATISTICAL CALCULATIONS
  // ==========================================

  // Calculate day-specific scores & section averages
  const calculateDaySectionAverage = (log: EmotionalDailyLog, section: string) => {
    const catIds = CATEGORIES.filter(c => c.section === section).map(c => c.id);
    const scores = catIds.map(id => log.ratings[id]?.rating).filter(r => r !== undefined);
    if (scores.length === 0) return 0;
    return Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2));
  };

  const calculateDayOverallAverage = (log: EmotionalDailyLog) => {
    const scores = CATEGORIES.map(c => log.ratings[c.id]?.rating).filter(r => r !== undefined);
    if (scores.length === 0) return 0;
    return Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2));
  };

  // Calculate average for a single category across all active logs
  const calculateCategoryTimelineAverage = (catId: string) => {
    if (logs.length === 0) return 0;
    const scores = logs.map(l => l.ratings[catId]?.rating).filter(r => r !== undefined);
    if (scores.length === 0) return 0;
    return Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2));
  };

  // Calculate average of section averages across all logs
  const calculateSectionOverallAverage = (section: string) => {
    if (logs.length === 0) return 0;
    const sectionAverages = logs.map(l => calculateDaySectionAverage(l, section));
    return Number((sectionAverages.reduce((sum, s) => sum + s, 0) / sectionAverages.length).toFixed(2));
  };

  // Calculate absolute average across all logs and categories
  const overallAbsoluteAverage = useMemo(() => {
    if (logs.length === 0) return 0;
    const dailyAverages = logs.map(l => calculateDayOverallAverage(l));
    return Number((dailyAverages.reduce((sum, s) => sum + s, 0) / dailyAverages.length).toFixed(2));
  }, [logs]);

  // Frequencies of predominant emotions
  const emotionFrequencies = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(l => {
      counts[l.predominantEmotion] = (counts[l.predominantEmotion] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      emoji: getEmotionDetails(name).emoji
    })).sort((a, b) => b.count - a.count);
  }, [logs]);

  // Checklist percentages
  const checklistAverages = useMemo(() => {
    if (logs.length === 0) return { prepareTime: 0, shareEmotions: 0, rightDiscussionPoint: 0, alignPurpose: 0 };
    const sums = { prepareTime: 0, shareEmotions: 0, rightDiscussionPoint: 0, alignPurpose: 0 };
    logs.forEach(l => {
      if (l.prepareTime) sums.prepareTime++;
      if (l.shareEmotions) sums.shareEmotions++;
      if (l.rightDiscussionPoint) sums.rightDiscussionPoint++;
      if (l.alignPurpose) sums.alignPurpose++;
    });
    return {
      prepareTime: Math.round((sums.prepareTime / logs.length) * 100),
      shareEmotions: Math.round((sums.shareEmotions / logs.length) * 100),
      rightDiscussionPoint: Math.round((sums.rightDiscussionPoint / logs.length) * 100),
      alignPurpose: Math.round((sums.alignPurpose / logs.length) * 100)
    };
  }, [logs]);

  // Formatted data for trend charts
  const chartTrendData = useMemo(() => {
    return sortedLogs.map(l => {
      const d = new Date(l.date);
      const label = `${d.toLocaleDateString("en-US", { weekday: "short" })} ${d.getDate()}-${d.getMonth() + 1}`;
      return {
        date: label,
        health: calculateDaySectionAverage(l, "health"),
        family: calculateDaySectionAverage(l, "family"),
        business: calculateDaySectionAverage(l, "business"),
        personal: calculateDaySectionAverage(l, "personal"),
        overall: calculateDayOverallAverage(l)
      };
    });
  }, [sortedLogs]);

  // Cell coloring helper based on rating scale 1 to 10
  const getRatingCellColor = (rating: number | undefined) => {
    if (rating === undefined) return "bg-muted/30 text-muted-foreground";
    if (rating >= 8) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold";
    if (rating >= 5) return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-medium";
    return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold";
  };

  // ==========================================
  // 4. EXPORT UTILITIES (EXCEL & PDF)
  // ==========================================

  const handleExcelExport = () => {
    if (sortedLogs.length === 0) {
      toast.error("No entries available to export.");
      return;
    }

    try {
      const headers = ["Section", "Category Name", "Total AVG"];
      sortedLogs.forEach(l => {
        headers.push(l.date);
      });

      const rows: any[] = [];

      // Helper to generate a category row
      const addCategoryRowsForSection = (sectionKey: "health" | "family" | "business" | "personal") => {
        const catList = CATEGORIES.filter(c => c.section === sectionKey);
        
        catList.forEach(cat => {
          const row: any = {
            "Section": SECTIONS[sectionKey].label,
            "Category Name": cat.name,
            "Total AVG": calculateCategoryTimelineAverage(cat.id)
          };
          sortedLogs.forEach(l => {
            row[l.date] = l.ratings[cat.id]?.rating ?? "—";
          });
          rows.push(row);
        });

        // Add section average row
        const secAvgRow: any = {
          "Section": SECTIONS[sectionKey].label,
          "Category Name": "OVERALL SCORE & EMOTIONS (SEC AVG)",
          "Total AVG": calculateSectionOverallAverage(sectionKey)
        };
        sortedLogs.forEach(l => {
          secAvgRow[l.date] = calculateDaySectionAverage(l, sectionKey);
        });
        rows.push(secAvgRow);
      };

      addCategoryRowsForSection("health");
      addCategoryRowsForSection("family");
      addCategoryRowsForSection("business");
      addCategoryRowsForSection("personal");

      // Add overall average row
      const finalRow: any = {
        "Section": "Summary",
        "Category Name": "DAY'S SCORE AND EMOTIONS (TOTAL AVG)",
        "Total AVG": overallAbsoluteAverage
      };
      sortedLogs.forEach(l => {
        finalRow[l.date] = calculateDayOverallAverage(l);
      });
      rows.push(finalRow);

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily sheet");
      
      XLSX.writeFile(workbook, `Emotional_Tracking_Sheet_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel sheet exported successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel file.");
    }
  };

  const handlePdfExport = () => {
    if (sortedLogs.length === 0) {
      toast.error("No entries available to export.");
      return;
    }

    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(33, 43, 54);
      doc.text("TiE Chennai PB Emotional Tracker Summary", 14, 15);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110, 120, 130);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}  |  Direct Name: ${sortedLogs[0].directorName}`, 14, 21);

      // Construct columns
      const headers = ["Section", "Category Name", "Total AVG", ...sortedLogs.map(l => l.date.substring(5))];
      
      const tableRows: any[] = [];
      const sections: ("health" | "family" | "business" | "personal")[] = ["health", "family", "business", "personal"];
      
      sections.forEach(secKey => {
        const catList = CATEGORIES.filter(c => c.section === secKey);
        
        catList.forEach(cat => {
          const row = [
            SECTIONS[secKey].label,
            cat.name,
            calculateCategoryTimelineAverage(cat.id),
            ...sortedLogs.map(l => l.ratings[cat.id]?.rating ?? "—")
          ];
          tableRows.push(row);
        });

        // Section average row
        const secAvg = [
          SECTIONS[secKey].label,
          "OVERALL SCORE (SEC AVG)",
          calculateSectionOverallAverage(secKey),
          ...sortedLogs.map(l => calculateDaySectionAverage(l, secKey))
        ];
        tableRows.push(secAvg);
      });

      // Total average row
      const finalRow = [
        "SUMMARY",
        "DAY'S TOTAL SCORE (OVERALL)",
        overallAbsoluteAverage,
        ...sortedLogs.map(l => calculateDayOverallAverage(l))
      ];
      tableRows.push(finalRow);

      (doc as any).autoTable({
        startY: 26,
        head: [headers],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 45 },
          2: { cellWidth: 20, fontStyle: "bold" }
        },
        didParseCell: function(data: any) {
          // Highlight average rows
          const isSecAvg = data.row.raw && data.row.raw[1] === "OVERALL SCORE (SEC AVG)";
          const isFinal = data.row.raw && data.row.raw[1] === "DAY'S TOTAL SCORE (OVERALL)";
          if (isSecAvg) {
            data.cell.styles.fillColor = [254, 252, 232]; // Yellow highlight
            data.cell.styles.fontStyle = "bold";
          }
          if (isFinal) {
            data.cell.styles.fillColor = [243, 244, 246]; // Gray highlight
            data.cell.styles.fontStyle = "bold";
          }
        }
      });

      doc.save(`Emotional_Tracker_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF document.");
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Emotional Tracking"
        description="Visual insights into your personal & professional emotional baseline, checklists, and daily matrix values."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelExport}
              className="cursor-pointer gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePdfExport}
              className="cursor-pointer gap-1.5"
            >
              <FileDown className="h-4 w-4 text-rose-600" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToSeeds}
              className="cursor-pointer gap-1.5"
              title="Reset data to original spreadsheet mock template"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Template</span>
            </Button>
            <Button
              size="sm"
              onClick={handleNewEntry}
              className="cursor-pointer gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Log Today</span>
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[480px] grid-cols-3">
          <TabsTrigger value="matrix" className="cursor-pointer">Daily Sheet (Matrix)</TabsTrigger>
          <TabsTrigger value="dashboard" className="cursor-pointer">Dashboard & Trends</TabsTrigger>
          <TabsTrigger value="entry" className="cursor-pointer">Log Entry Form</TabsTrigger>
        </TabsList>

        {/* ==========================================
            TAB 1: DAILY SHEET (MATRIX)
            ========================================== */}
        <TabsContent value="matrix" className="space-y-6 mt-4">
          <SectionCard 
            title="Daily Sheet Tracker" 
            description="Replicates the Excel spreadsheet structure. Columns represent dates; rows represent categories. Click a date header to edit that entry."
          >
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Smile className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-lg font-medium">No tracker logs logged</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Start logging your daily numbers and emotions using the Entry form!
                </p>
                <Button onClick={handleNewEntry} className="mt-4 cursor-pointer">
                  Create First Entry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-card max-w-full">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="min-w-[180px] font-semibold border-r sticky left-0 bg-background shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        Categories (Scale 1-10)
                      </TableHead>
                      <TableHead className="min-w-[90px] text-center font-bold border-r text-foreground">
                        AVG Score
                      </TableHead>
                      {sortedLogs.map(log => {
                        const d = new Date(log.date);
                        const labelDay = d.toLocaleDateString("en-US", { weekday: "short" });
                        const labelDate = `${d.getDate()}-${d.getMonth() + 1}`;
                        return (
                          <TableHead 
                            key={log.id} 
                            onClick={() => handleEditEntry(log)}
                            className="min-w-[95px] text-center cursor-pointer hover:bg-muted transition font-medium border-r relative group"
                            title="Click to edit this day's log entry"
                          >
                            <div className="text-[11px] text-muted-foreground uppercase">{labelDay}</div>
                            <div className="text-sm font-bold text-foreground">{labelDate}</div>
                            <div className="text-[10px] text-primary hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center font-semibold">
                              [Edit]
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    
                    {/* Render Category Rows by Section */}
                    {(["health", "family", "business", "personal"] as const).map(sectionKey => {
                      const sectionCatList = CATEGORIES.filter(c => c.section === sectionKey);
                      return (
                        <React.Fragment key={sectionKey}>
                          {/* Header Separator Row */}
                          <TableRow className="bg-muted/20 font-bold hover:bg-muted/20">
                            <TableCell colSpan={sortedLogs.length + 2} className="py-2 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-t">
                              {SECTIONS[sectionKey].label}
                            </TableCell>
                          </TableRow>

                          {/* Categories inside this section */}
                          {sectionCatList.map(cat => {
                            const timelineAvg = calculateCategoryTimelineAverage(cat.id);
                            return (
                              <TableRow key={cat.id} className="hover:bg-muted/25">
                                <TableCell className="text-xs pl-6 border-r font-medium text-foreground/80 sticky left-0 bg-background shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                  {cat.name}
                                </TableCell>
                                <TableCell className="text-xs text-center border-r font-bold text-muted-foreground bg-muted/10">
                                  {timelineAvg}
                                </TableCell>
                                {sortedLogs.map(log => {
                                  const cellData = log.ratings[cat.id];
                                  const emotionObj = getEmotionDetails(cellData?.emotion || "");
                                  return (
                                    <TableCell 
                                      key={log.id} 
                                      className={`text-xs text-center border-r p-2.5 transition ${getRatingCellColor(cellData?.rating)}`}
                                      title={cellData?.notes ? `${cat.name} notes: "${cellData.notes}"` : undefined}
                                    >
                                      <div className="flex flex-col items-center justify-center leading-none">
                                        <span className="font-bold text-[13px]">{cellData?.rating ?? "—"}</span>
                                        {cellData?.emotion && (
                                          <span className="text-[11px] mt-0.5" title={cellData.emotion}>
                                            {emotionObj.emoji}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}

                          {/* Section summary Overall average row */}
                          <TableRow className="bg-yellow-50/50 dark:bg-yellow-950/10 font-semibold hover:bg-yellow-50/60">
                            <TableCell className="text-xs border-r pl-4 font-bold text-amber-900 dark:text-amber-300 uppercase sticky left-0 bg-yellow-50/50 dark:bg-yellow-950/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                              Over all score & Emotions
                            </TableCell>
                            <TableCell className="text-xs text-center border-r font-extrabold text-amber-800 dark:text-amber-400 bg-amber-100/30">
                              {calculateSectionOverallAverage(sectionKey)}
                            </TableCell>
                            {sortedLogs.map(log => {
                              const secAvg = calculateDaySectionAverage(log, sectionKey);
                              return (
                                <TableCell key={log.id} className="text-xs text-center font-extrabold border-r text-amber-800 dark:text-amber-400 p-2.5 bg-yellow-50/30">
                                  {secAvg}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}

                    {/* Bottom Space/Divider */}
                    <TableRow className="h-4 bg-muted/5 hover:bg-transparent"><TableCell colSpan={sortedLogs.length + 2} className="border-y-0"></TableCell></TableRow>

                    {/* Overall Daily averages row */}
                    <TableRow className="bg-primary/5 hover:bg-primary/10 border-t border-b-2 font-bold text-foreground">
                      <TableCell className="text-sm pl-4 border-r font-extrabold uppercase sticky left-0 bg-card shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        Day's score and Emotions (Overall)
                      </TableCell>
                      <TableCell className="text-sm text-center border-r font-black bg-primary/10 text-primary">
                        {overallAbsoluteAverage}
                      </TableCell>
                      {sortedLogs.map(log => {
                        const dayOverall = calculateDayOverallAverage(log);
                        const predominantEmotionDetails = getEmotionDetails(log.predominantEmotion);
                        return (
                          <TableCell key={log.id} className="text-sm text-center border-r font-black p-2.5 bg-primary/5 text-primary">
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span>{dayOverall}</span>
                              <span className="text-[13px] mt-0.5" title={`Predominant emotion: ${log.predominantEmotion}`}>
                                {predominantEmotionDetails.emoji}
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>

          {/* Matrix Bottom Category Summary */}
          {logs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <SectionCard title="Category score percentages" description="Replicates the summary table from Screenshot 4. Displays averages as a percentage of 10.">
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold">Section</TableHead>
                        <TableHead className="text-center font-semibold">Total AVG</TableHead>
                        {sortedLogs.map(log => (
                          <TableHead key={log.id} className="text-center font-semibold">{log.date.substring(5)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(["health", "family", "business", "personal"] as const).map(secKey => {
                        const secLabel = secKey === "health" ? "Health" 
                          : secKey === "family" ? "Friends & Family"
                          : secKey === "business" ? "Business & Career"
                          : "Personal";
                        const timelineSecAvg = calculateSectionOverallAverage(secKey);
                        return (
                          <TableRow key={secKey}>
                            <TableCell className="font-medium text-xs">{secLabel}</TableCell>
                            <TableCell className="text-center font-bold text-xs text-muted-foreground">{Math.round(timelineSecAvg * 10)}%</TableCell>
                            {sortedLogs.map(log => {
                              const dayAvg = calculateDaySectionAverage(log, secKey);
                              return (
                                <TableCell key={log.id} className="text-center text-xs">{Math.round(dayAvg * 10)}%</TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-yellow-50/50 dark:bg-yellow-950/10 font-bold">
                        <TableCell className="text-xs uppercase text-amber-900 dark:text-amber-300">Overall Average</TableCell>
                        <TableCell className="text-center text-xs text-amber-800 dark:text-amber-400 font-extrabold">{Math.round(overallAbsoluteAverage * 10)}%</TableCell>
                        {sortedLogs.map(log => {
                          const dayOverall = calculateDayOverallAverage(log);
                          return (
                            <TableCell key={log.id} className="text-center text-xs text-amber-800 dark:text-amber-400 font-extrabold">{Math.round(dayOverall * 10)}%</TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>

              {/* Day details side card */}
              <SectionCard title="Direct priority & specific asks list" description="Key notes logged across days.">
                <div className="space-y-4 max-h-[315px] overflow-y-auto pr-1">
                  {sortedLogs.map(log => (
                    <div key={log.id} className="p-3 border rounded-xl bg-card/50 hover:bg-card transition text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {log.date}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            {getEmotionDetails(log.predominantEmotion).emoji} {log.predominantEmotion}
                          </span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 cursor-pointer" onClick={() => handleEditEntry(log)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-600 hover:text-rose-700 cursor-pointer" onClick={(e) => handleDeleteEntry(log.id, e)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">First Order Priority:</span>
                        <span className="font-normal text-foreground">{log.firstOrderPriority || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">Specific Ask:</span>
                        <span className="font-normal text-foreground">{log.specificAsk || "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </TabsContent>

        {/* ==========================================
            TAB 2: DASHBOARD & TRENDS
            ========================================== */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl border">
              <Smile className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <h3 className="text-lg font-medium">No tracker logs logged</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Log some entries to visualize emotional signals and category trend averages.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs Row */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
                <KpiCard label="Overall tracker score" value={`${(overallAbsoluteAverage * 10).toFixed(0)}%`} icon={Heart} subtitle={`Avg of ${logs.length} logged days`} />
                <KpiCard label="Health category AVG" value={`${(calculateSectionOverallAverage("health") * 10).toFixed(0)}%`} icon={Battery} subtitle="Physical & mental health" />
                <KpiCard label="Business category AVG" value={`${(calculateSectionOverallAverage("business") * 10).toFixed(0)}%`} icon={TrendingUp} subtitle="Growth & opportunities" />
                <KpiCard label="Personal category AVG" value={`${(calculateSectionOverallAverage("personal") * 10).toFixed(0)}%`} icon={Sparkles} subtitle="Hobbies & behavior" />
                <KpiCard label="Friends & Family AVG" value={`${(calculateSectionOverallAverage("family") * 10).toFixed(0)}%`} icon={User} subtitle="Relationships & Empathy" className="col-span-2 md:col-span-1" />
              </div>

              {/* Primary Trend Chart */}
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <SectionCard title="Category emotional timeline trends" description="Average score (out of 10) tracking across logged days">
                    <LineSeriesChart
                      data={chartTrendData}
                      xKey="date"
                      height={320}
                      series={[
                        { key: "health", label: "Health", color: "var(--color-chart-1)" },
                        { key: "family", label: "Friends & Family", color: "var(--color-chart-2)" },
                        { key: "business", label: "Business / Career", color: "var(--color-chart-3)" },
                        { key: "personal", label: "Personal", color: "var(--color-chart-4)" },
                        { key: "overall", label: "Overall Average", color: "var(--color-chart-5)" }
                      ]}
                    />
                  </SectionCard>
                </div>

                {/* Predominant Emotions Distribution */}
                <div>
                  <SectionCard title="Predominant emotions count" description="Frequencies of your primary emotion choices">
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                      {emotionFrequencies.map((item, index) => {
                        const maxCount = Math.max(...emotionFrequencies.map(e => e.count));
                        const pct = Math.round((item.count / logs.length) * 100);
                        return (
                          <div key={item.name} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1.5">
                                <span className="text-base">{item.emoji}</span>
                                {item.name}
                              </span>
                              <span className="text-muted-foreground font-medium">
                                {item.count} {item.count === 1 ? "day" : "days"} ({pct}%)
                              </span>
                            </div>
                            <Progress value={(item.count / maxCount) * 100} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* Sub-Charts Row */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Checklist correlation stats */}
                <SectionCard title="Preparation checklist yes indicators" description="Percentage of yes answers across all logged tracker updates.">
                  <div className="space-y-4.5 pt-2">
                    {[
                      { key: "prepareTime", label: "Gave enough time to think & prepare", pct: checklistAverages.prepareTime },
                      { key: "shareEmotions", label: "Able to share emotions openly", pct: checklistAverages.shareEmotions },
                      { key: "rightDiscussionPoint", label: "Identified right discussion points", pct: checklistAverages.rightDiscussionPoint },
                      { key: "alignPurpose", label: "Aligns with purpose / life goal", pct: checklistAverages.alignPurpose }
                    ].map(chk => (
                      <div key={chk.key} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{chk.label}</span>
                          <span className="font-bold text-primary">{chk.pct}% Yes</span>
                        </div>
                        <Progress value={chk.pct} className="h-2 bg-muted/40" />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Section performance breakdown */}
                <SectionCard title="Section metrics overview" description="Average score vs target score (10.0)">
                  <BarSeriesChart
                    data={[
                      { name: "Health", Score: calculateSectionOverallAverage("health") },
                      { name: "Family & Friends", Score: calculateSectionOverallAverage("family") },
                      { name: "Business", Score: calculateSectionOverallAverage("business") },
                      { name: "Personal", Score: calculateSectionOverallAverage("personal") },
                      { name: "Overall Average", Score: overallAbsoluteAverage }
                    ]}
                    xKey="name"
                    series={[{ key: "Score", label: "Current Average", color: "var(--color-chart-1)" }]}
                  />
                </SectionCard>
              </div>
            </>
          )}
        </TabsContent>

        {/* ==========================================
            TAB 3: LOG ENTRY FORM
            ========================================== */}
        <TabsContent value="entry" className="mt-4">
          <SectionCard 
            title={editLogId ? `Edit tracker entry: ${formDate}` : "Create daily tracker entry"} 
            description="Log your daily category scores, emotions, and presentation checklist answers."
          >
            <form onSubmit={handleSaveForm} className="space-y-6">
              
              {/* Form Metadata */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="director-name">Director Name *</Label>
                  <Input 
                    id="director-name" 
                    placeholder="Enter Director Name"
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="log-date">Presentation / Logging Date *</Label>
                  <Input 
                    id="log-date" 
                    type="date" 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)} 
                    required 
                    disabled={editLogId !== null} // Lock date in edit mode
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="predominant-emotion">Predominant Emotion *</Label>
                  <Select value={formEmotion} onValueChange={setFormEmotion}>
                    <SelectTrigger id="predominant-emotion" className="cursor-pointer">
                      <SelectValue placeholder="Select dominant mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map(emo => (
                        <SelectItem key={emo.name} value={emo.name} className="cursor-pointer">
                          <span className="mr-2 text-base">{emo.emoji}</span>
                          {emo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Predominant Emotion Selector Cards */}
              <div className="space-y-2">
                <Label>Or select Predominant Emotion directly:</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
                  {EMOTIONS.map(emo => {
                    const isSelected = formEmotion === emo.name;
                    return (
                      <button
                        type="button"
                        key={emo.name}
                        onClick={() => setFormEmotion(emo.name)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                          isSelected 
                            ? `${emo.color} font-bold ring-2 scale-105 shadow-sm`
                            : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xl mb-1">{emo.emoji}</span>
                        <span className="text-[10px] leading-tight truncate w-full">{emo.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Yes/No Presentation Checklist */}
              <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4" />
                  Presentation update preparation checklist
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {QUESTIONS.map(q => {
                    const isChecked = checklist[q.id];
                    return (
                      <div 
                        key={q.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          isChecked 
                            ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30" 
                            : "bg-card border-border"
                        }`}
                      >
                        <Label htmlFor={`chk-${q.id}`} className="text-xs font-normal pr-4 cursor-pointer text-foreground/95">
                          {q.label}
                        </Label>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[11px] font-bold ${isChecked ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {isChecked ? "Yes" : "No"}
                          </span>
                          <Switch 
                            id={`chk-${q.id}`} 
                            checked={isChecked} 
                            onCheckedChange={val => setChecklist(prev => ({ ...prev, [q.id]: val }))}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Fields: Priority & Ask */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="first-priority">First Order Priority (Presentation Notes)</Label>
                  <Input 
                    id="first-priority" 
                    placeholder="Describe your first order priority..."
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specific-ask">Specific Ask (What do you need support with?)</Label>
                  <Input 
                    id="specific-ask" 
                    placeholder="Describe specific asks for directors..."
                    value={formAsk}
                    onChange={e => setFormAsk(e.target.value)}
                  />
                </div>
              </div>

              {/* 20 Categories Rating Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Score Categories (Scale 1 to 10)
                </h4>
                
                <Accordion type="single" collapsible defaultValue="health" className="w-full space-y-3">
                  {(["health", "family", "business", "personal"] as const).map(secKey => {
                    const sectionCatList = CATEGORIES.filter(c => c.section === secKey);
                    return (
                      <AccordionItem 
                        key={secKey} 
                        value={secKey} 
                        className={`rounded-xl border px-4 overflow-hidden ${SECTIONS[secKey].color}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-3.5">
                          <span className="font-bold text-sm tracking-tight">{SECTIONS[secKey].label}</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-3">
                          {sectionCatList.map(cat => {
                            const catValue = ratings[cat.id] || { rating: 5, notes: "", emotion: "Comfortable" };
                            
                            const updateCatRating = (val: number) => {
                              setRatings(prev => ({
                                ...prev,
                                [cat.id]: { ...catValue, rating: val }
                              }));
                            };

                            const updateCatNotes = (val: string) => {
                              setRatings(prev => ({
                                ...prev,
                                [cat.id]: { ...catValue, notes: val }
                              }));
                            };

                            const updateCatEmotion = (val: string) => {
                              setRatings(prev => ({
                                ...prev,
                                [cat.id]: { ...catValue, emotion: val }
                              }));
                            };

                            const cellEmoji = getEmotionDetails(catValue.emotion).emoji;

                            return (
                              <div key={cat.id} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <Label className="text-sm font-semibold text-foreground/90">{cat.name}</Label>
                                  
                                  {/* Right side emotion select */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg" title={catValue.emotion}>{cellEmoji}</span>
                                    <Select value={catValue.emotion} onValueChange={updateCatEmotion}>
                                      <SelectTrigger className="w-[145px] h-8 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Emotion" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {EMOTIONS.map(emo => (
                                          <SelectItem key={emo.name} value={emo.name} className="cursor-pointer text-xs">
                                            <span className="mr-1.5 text-xs">{emo.emoji}</span>
                                            {emo.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                  {/* Slider Rating */}
                                  <div className="space-y-2 md:col-span-1">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                      <span className="text-muted-foreground">Rating:</span>
                                      <span className="text-primary text-sm font-bold bg-primary/10 px-2 py-0.5 rounded-md">{catValue.rating}/10</span>
                                    </div>
                                    <Slider 
                                      value={[catValue.rating]} 
                                      onValueChange={vals => updateCatRating(vals[0])} 
                                      min={1} 
                                      max={10} 
                                      step={1} 
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                                      <span>1 (Neg)</span>
                                      <span>5</span>
                                      <span>10 (Pos)</span>
                                    </div>
                                  </div>

                                  {/* Notes text area */}
                                  <div className="space-y-1.5 md:col-span-2">
                                    <Input
                                      placeholder="Opportunities / aspirations / issues..."
                                      value={catValue.notes}
                                      onChange={e => updateCatNotes(e.target.value)}
                                      className="text-xs h-9"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditLogId(null);
                    setActiveTab("matrix");
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer font-medium bg-primary">
                  {editLogId ? "Update Tracker Entry" : "Save Tracker Entry"}
                </Button>
              </div>

            </form>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
