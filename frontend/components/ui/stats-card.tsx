import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  max?: number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success";
}

export function StatsCard({
  title,
  value,
  max,
  icon: Icon,
  description,
  variant = "default",
}: StatsCardProps) {
  const percentage = max ? (Number(value) / max) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${variant === "success" ? "text-green-500" : ""}`} />
          {title}
        </CardDescription>
        <CardTitle className="text-3xl sm:text-4xl">
          {value}
          {max && (
            <span className="text-lg text-muted-foreground sm:text-xl">/{max}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {max && (
          <>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  variant === "success" ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
