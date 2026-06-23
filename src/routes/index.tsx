import { createFileRoute } from "@tanstack/react-router";
import { Target, CheckCircle2, ListTodo, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { ActivityFeed } from "@/components/activity-feed";
import { AreaTrendChart, BarSeriesChart, LineSeriesChart } from "@/components/charts";
import {
  monthlyTrend,
  challengeVsSolution,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// PDF & Excel export imports
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — PB39" },
      { name: "description", content: "Real-time visibility into organizational goals, action items, challenges and solutions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    orgGoals,
    smartGoals,
    actionItems,
    challenges,
    solutions,
    activities,
    timeframe,
    setTimeframe,
    departments,
  } = useWorkspaceStore();

  // Dynamic calculations
  const totalOrgGoals = orgGoals.length;
  const totalSmartGoals = smartGoals.length;
  const openActionItems = actionItems.filter((a) => a.status !== "Done").length;
  const challengesRaised = challenges.filter((c) => c.status !== "Resolved").length;
  const solutionsImplemented = solutions.filter((s) => s.status === "Implemented").length;
  const goalCompletion = orgGoals.length
    ? Math.round(orgGoals.reduce((s, g) => s + g.progress, 0) / orgGoals.length)
    : 0;

  const goalStatusOverview = [
    { name: "Completed", count: orgGoals.filter((g) => g.status === "Completed").length },
    { name: "In Progress", count: orgGoals.filter((g) => g.status === "In Progress").length },
    { name: "At Risk", count: orgGoals.filter((g) => g.status === "At Risk").length },
    { name: "Not Started", count: orgGoals.filter((g) => g.status === "Not Started").length },
  ];

  const departmentProgress = departments.map((dept) => {
    const deptGoals = orgGoals.filter((g) => g.department === dept);
    const progress = deptGoals.length
      ? Math.round(deptGoals.reduce((s, g) => s + g.progress, 0) / deptGoals.length)
      : 0;
    return { department: dept, progress };
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const filename = `PB39_Executive_Report_${timeframe.replace(/\s+/g, "_")}`;

    if (format === "csv") {
      try {
        const headers = ["Type", "Name/Title", "Owner", "Progress", "Status", "Start Date", "End/Due Date"];
        const rows = [
          ...orgGoals.map((g) => [
            "Organization Goal",
            g.name,
            g.owner,
            `${g.progress}%`,
            g.status,
            g.startDate,
            g.endDate,
          ]),
          ...smartGoals.map((s) => [
            "SMART Goal",
            s.title,
            s.owner,
            `${s.progress}%`,
            s.status,
            s.startDate,
            s.dueDate,
          ]),
          ...actionItems.map((a) => [
            "Action Item",
            a.task,
            a.assignedTo,
            `${a.progress}%`,
            a.status,
            "-",
            a.dueDate,
          ]),
        ];

        const csvContent =
          "data:text/csv;charset=utf-8," +
          [headers.join(","), ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Executive report exported successfully!");
      } catch (err) {
        toast.error("Failed to export CSV report.");
      }
    } else if (format === "excel") {
      try {
        const headers = ["Type", "Name/Title", "Owner", "Progress", "Status", "Start Date", "End/Due Date"];
        const rows = [
          ...orgGoals.map((g) => [
            "Organization Goal",
            g.name,
            g.owner,
            `${g.progress}%`,
            g.status,
            g.startDate,
            g.endDate,
          ]),
          ...smartGoals.map((s) => [
            "SMART Goal",
            s.title,
            s.owner,
            `${s.progress}%`,
            s.status,
            s.startDate,
            s.dueDate,
          ]),
          ...actionItems.map((a) => [
            "Action Item",
            a.task,
            a.assignedTo,
            `${a.progress}%`,
            a.status,
            "-",
            a.dueDate,
          ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Goals Summary");

        // Auto adjust column widths
        const maxLens = headers.map((h, idx) => Math.max(h.length, ...rows.map((row) => String(row[idx] || "").length)));
        worksheet["!cols"] = maxLens.map((len) => ({ wch: len + 3 }));

        XLSX.writeFile(workbook, `${filename}.xlsx`);
        toast.success("Excel report exported successfully!");
      } catch (err) {
        toast.error("Failed to export Excel report.");
      }
    } else if (format === "pdf") {
      try {
        const doc = new jsPDF();

        // PDF Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("PB39 Personal Board Hub", 14, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Executive Summary Report — ${timeframe}`, 14, 27);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 32);

        // Summary KPI Metrics Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("SUMMARY METRICS", 14, 42);

        const kpiData = [
          ["Organization Goals", String(totalOrgGoals), "Goal Completion", `${goalCompletion}%`],
          ["SMART Goals", String(totalSmartGoals), "Open Action Items", String(openActionItems)],
          ["Challenges Raised", String(challengesRaised), "Solutions Implemented", String(solutionsImplemented)],
        ];

        autoTable(doc, {
          startY: 46,
          head: [["Metric", "Value", "Metric", "Value"]],
          body: kpiData,
          theme: "striped",
          headStyles: { fillColor: [79, 70, 229] }, // Indigo primary header
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        });

        // Organization Goals Details table
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ORGANIZATION GOALS & PROGRESS", 14, (doc as any).lastAutoTable.finalY + 12);

        const tableHeaders = ["Goal Name", "Department", "Owner", "Progress", "Status"];
        const tableRows = orgGoals.map((g) => [
          g.name,
          g.department,
          g.owner,
          `${g.progress}%`,
          g.status,
        ]);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 16,
          head: [tableHeaders],
          body: tableRows,
          theme: "grid",
          headStyles: { fillColor: [15, 23, 42] }, // Slate-900
          styles: { fontSize: 8.5 },
          columnStyles: {
            0: { cellWidth: 80 },
          },
          margin: { left: 14, right: 14 },
        });

        doc.save(`${filename}.pdf`);
        toast.success("PDF report exported successfully!");
      } catch (err) {
        toast.error("Failed to export PDF report.");
      }
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Executive Dashboard"
        description="Real-time visibility into goals, execution and risks across your organization."
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  {timeframe}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setTimeframe("This quarter"); toast.info("Filter applied: This quarter"); }} className="cursor-pointer">This quarter</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTimeframe("This year"); toast.info("Filter applied: This year"); }} className="cursor-pointer">This year</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTimeframe("Last 12 months"); toast.info("Filter applied: Last 12 months"); }} className="cursor-pointer">Last 12 months</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown Menu for Export formats */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="cursor-pointer">Export report</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer">
                  Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                  Export as PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Organization Goals" value={totalOrgGoals} delta={8} hint="vs last quarter" icon={Target} />
        <KpiCard label="SMART Goals" value={totalSmartGoals} delta={12} hint="active" icon={CheckCircle2} />
        <KpiCard label="Action Items Open" value={openActionItems} delta={-4} hint="in flight" icon={ListTodo} />
        <KpiCard label="Challenges Raised" value={challengesRaised} delta={3} hint="open blockers" icon={AlertTriangle} />
        <KpiCard label="Solutions Implemented" value={solutionsImplemented} delta={20} hint="QTD" icon={Lightbulb} />
        <KpiCard label="Goal Completion" value={`${goalCompletion}%`} delta={6} hint="org-wide" icon={TrendingUp} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Goal Progress Overview" description="Distribution by status across the organization" className="xl:col-span-2">
          <BarSeriesChart
            data={goalStatusOverview}
            xKey="name"
            series={[{ key: "count", label: "Goals", color: "var(--color-chart-1)" }]}
          />
        </SectionCard>
        <SectionCard title="Recent Activity" description="Latest updates from your teams">
          <ActivityFeed items={activities.slice(0, 6)} />
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Department Goal Progress" description="Average completion by department">
          <BarSeriesChart
            data={departmentProgress}
            xKey="department"
            layout="vertical"
            height={280}
            series={[{ key: "progress", label: "Progress %", color: "var(--color-chart-1)" }]}
          />
        </SectionCard>
        <SectionCard title="Monthly Goal Achievement" description="Achieved vs target across the year">
          <AreaTrendChart
            data={monthlyTrend}
            xKey="month"
            series={[
              { key: "achieved", label: "Achieved", color: "var(--color-chart-1)" },
              { key: "target", label: "Target", color: "var(--color-chart-2)" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Challenges vs Solutions" description="Are we solving issues faster than they appear?">
        <LineSeriesChart
          data={challengeVsSolution}
          xKey="month"
          height={280}
          series={[
            { key: "challenges", label: "Challenges raised", color: "var(--color-chart-5)" },
            { key: "solutions", label: "Solutions added", color: "var(--color-chart-3)" },
          ]}
        />
      </SectionCard>
    </div>
  );
}
