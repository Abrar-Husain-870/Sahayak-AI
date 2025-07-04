"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonPlannerResultProps {
  isLoading: boolean;
  generatedPlan: string;
}

export function LessonPlannerResult({
  isLoading,
  generatedPlan,
}: LessonPlannerResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Weekly Lesson Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : generatedPlan ? (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap h-[500px] overflow-auto">
            {generatedPlan}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Your generated lesson plan will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
