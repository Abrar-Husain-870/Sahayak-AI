"use client";

import ReactMarkdown from 'react-markdown';

interface Worksheet {
  gradeLevel: string;
  worksheetContent: string;
}

interface HistoryDifferentiatedMaterialsViewerProps {
  content: string;
}

export function HistoryDifferentiatedMaterialsViewer({ content }: HistoryDifferentiatedMaterialsViewerProps) {
  let materials: Worksheet[] = [];
  let isJson = true;

  try {
    // First, try parsing the content as-is, which is the new, clean format.
    const parsed = JSON.parse(content);
    if (parsed.differentiatedMaterials && Array.isArray(parsed.differentiatedMaterials)) {
      materials = parsed.differentiatedMaterials;
    } else if (Array.isArray(parsed)) {
      // Handle cases where the root is just the array (older format).
      materials = parsed;
    } else {
      isJson = false;
    }
  } catch (error) {
    // If parsing fails, it's likely not JSON or is malformed.
    isJson = false;
  }

  // If the content is not valid JSON, render it as raw markdown.
  if (!isJson) {
    return (
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {materials.map((worksheet, index) => (
        <div key={index}>
          <h3 className="font-bold text-lg mb-2">Grade {worksheet.gradeLevel}</h3>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            <ReactMarkdown>{worksheet.worksheetContent}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
