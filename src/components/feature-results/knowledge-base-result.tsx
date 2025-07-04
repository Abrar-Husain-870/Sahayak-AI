"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KnowledgeBaseResultProps {
  isLoading: boolean;
  generatedExplanation: string;
}

export function KnowledgeBaseResult({
  isLoading,
  generatedExplanation,
}: KnowledgeBaseResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Explanation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : generatedExplanation ? (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {generatedExplanation}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Your generated explanation will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
