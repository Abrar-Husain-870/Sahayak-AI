"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { designVisualAid } from "@/ai/flows/design-visual-aids";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export default function VisualAidsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const result = await designVisualAid(values);
      setGeneratedImage(result.media);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the visual aid.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Visual Aid Generation"
        description="Generate simple line drawings or charts from a description."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visual Aid Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., "A simple black and white line drawing of the water cycle, with labels for evaporation, condensation, and precipitation."'
                            className="min-h-[150px] bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "Generate Visual Aid"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
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
        </div>
      </main>
    </div>
  );
}
