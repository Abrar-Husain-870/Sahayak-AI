"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

// Define the structure of a single worksheet for type safety.
interface Worksheet {
  gradeLevel: string;
  worksheetContent: string;
}

// Update props to accept a single JSON string from the backend.
interface DifferentiatedMaterialsResultProps {
  isLoading: boolean;
  generatedMaterials?: string;
}

export function DifferentiatedMaterialsResult({
  isLoading,
  generatedMaterials,
}: DifferentiatedMaterialsResultProps) {
  let worksheets: Worksheet[] = [];
  let isJson = true;

  // Safely parse the incoming JSON string.
  if (generatedMaterials) {
    try {
      const parsed = JSON.parse(generatedMaterials);
      // The backend returns an object with a `differentiatedMaterials` key holding the array.
      if (parsed.differentiatedMaterials && Array.isArray(parsed.differentiatedMaterials)) {
        worksheets = parsed.differentiatedMaterials;
      } else if (Array.isArray(parsed)) {
        // Add a fallback for cases where the root element is an array.
        worksheets = parsed;
      } else {
        isJson = false;
      }
    } catch (error) {
      isJson = false;
    }
  }

  // If the content is not valid JSON, render it as raw markdown.
  if (!isJson && generatedMaterials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
          <CardDescription>
            The AI-generated content could not be parsed and is displayed below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            <ReactMarkdown>{generatedMaterials}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        ) : worksheets.length > 0 ? (
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {worksheets.map((worksheet, index) => (
                <div key={index}>
                  <h3 className="font-bold text-lg mb-2">
                    Grade {worksheet.gradeLevel}
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
