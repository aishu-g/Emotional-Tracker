import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KanbanColumn<T> {
  key: string;
  title: string;
  accent?: string;
  items: T[];
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => ReactNode;
}

export function KanbanBoard<T extends { id: string }>({ columns, renderCard }: KanbanBoardProps<T>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <div key={col.key} className="flex min-h-[400px] flex-col rounded-xl border bg-muted/30">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", col.accent ?? "bg-muted-foreground")} />
              <h4 className="text-sm font-semibold">{col.title}</h4>
            </div>
            <span className="rounded-md bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>
          <div className="flex-1 space-y-2.5 p-3">
            {col.items.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">No items</p>
            ) : (
              col.items.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3 shadow-sm transition hover:shadow">
                  {renderCard(item)}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
