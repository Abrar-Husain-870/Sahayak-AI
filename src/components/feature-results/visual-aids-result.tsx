"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

interface VisualAidsResultProps {
  isLoading: boolean;
  generatedImage: string | null;
}

export function VisualAidsResult({
  isLoading,
  generatedImage,
}: VisualAidsResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Visual Aid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : generatedImage ? (
            <Image
              src={generatedImage}
              alt="Generated Visual Aid"
              width={512}
              height={512}
              className="object-contain h-full w-full"
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <ImageIcon className="mx-auto h-12 w-12" />
              <p className="mt-4">
                Your generated visual aid will appear here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
