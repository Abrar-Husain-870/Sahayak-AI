"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import type { CreateDifferentiatedMaterialsOutput } from "@/ai/flows/create-differentiated-materials";

interface DifferentiatedMaterialsResultProps {
  isLoading: boolean;
  generatedWorksheets: CreateDifferentiatedMaterialsOutput["worksheets"];
}

export function DifferentiatedMaterialsResult({
  isLoading,
  generatedWorksheets,
}: DifferentiatedMaterialsResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Worksheets</CardTitle>
        <CardDescription>
          Worksheets tailored for different grade levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : generatedWorksheets.length > 0 ? (
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {generatedWorksheets.map((worksheet, index) => (
                <div key={index}>
                  <h3 className="font-bold text-lg mb-2">
                    {worksheet.gradeLevel}
                  </h3>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    <ReactMarkdown>{worksheet.worksheetContent}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground">
            Your generated worksheets will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
