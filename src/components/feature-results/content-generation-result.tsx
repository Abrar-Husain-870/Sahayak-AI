"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

interface ContentGenerationResultProps {
  isLoading: boolean;
  generatedContent: string;
}

export function ContentGenerationResult({
  isLoading,
  generatedContent,
}: ContentGenerationResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : generatedContent ? (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Your generated content will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
