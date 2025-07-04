"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelect } from "@/components/language-select";
import { useToast } from "@/hooks/use-toast";
import { generateHyperLocalContent } from "@/ai/flows/generate-hyper-local-content";
import { DashboardHeader } from "@/components/dashboard-header";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContentGenerationResult = dynamic(
  () =>
    import("@/components/feature-results/content-generation-result").then(
      (mod) => mod.ContentGenerationResult
    ),
  { ssr: false }
);

const formSchema = z.object({
  request: z.string().min(10, {
    message: "Request must be at least 10 characters.",
  }),
  language: z.string(),
});

export default function ContentGenerationPage() {
    const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with server-safe defaults
  const [generatedContent, setGeneratedContent] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: "",
      language: "English",
    },
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent("");
    try {
            const result = await generateHyperLocalContent(values);
      setGeneratedContent(result.content);

      if (session?.user?.email) {
        await addDoc(collection(db, "history"), {
          userId: session.user.email,
          request: values.request,
          language: values.language,
          content: result.content,
          createdAt: serverTimestamp(),
          feature: "content-generation",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  }



  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Content Generation"
        description="Create simple, culturally relevant content in a local language."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="request"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Request</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., "Create a story in Marathi about farmers to explain different soil types"'
                            className="min-h-[150px] bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <LanguageSelect
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "Generate Content"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <ContentGenerationResult
            isLoading={isLoading}
            generatedContent={generatedContent}
          />
        </div>
      </main>
    </div>
  );
}
