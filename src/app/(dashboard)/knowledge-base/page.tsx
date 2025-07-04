"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LanguageSelect } from "@/components/language-select";
import { useToast } from "@/hooks/use-toast";
import { explainConcept } from "@/ai/flows/act-as-instant-knowledge-base";
import { DashboardHeader } from "@/components/dashboard-header";
import dynamic from "next/dynamic";

const KnowledgeBaseResult = dynamic(
  () =>
    import("@/components/feature-results/knowledge-base-result").then(
      (mod) => mod.KnowledgeBaseResult
    ),
  { ssr: false }
);

const formSchema = z.object({
  question: z.string().min(5, {
    message: "Question must be at least 5 characters.",
  }),
  language: z.string(),
});

export default function KnowledgeBasePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with server-safe defaults
  const [generatedExplanation, setGeneratedExplanation] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      language: "English",
    },
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedExplanation("");
    try {
      const result = await explainConcept(values);
            setGeneratedExplanation(result.explanation);

      if (session?.user?.email) {
        await addDoc(collection(db, "history"), {
          userId: session.user.email,
          feature: "knowledge-base",
          request: values.question,
          language: values.language,
          content: result.explanation,
          createdAt: serverTimestamp(),
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
        title="Instant Knowledge Base"
        description="Get simple, accurate explanations for complex student questions."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student's Question</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g., "Why is the sky blue?"' {...field} />
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
                    {isLoading ? "Generating..." : "Get Explanation"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <KnowledgeBaseResult
            isLoading={isLoading}
            generatedExplanation={generatedExplanation}
          />
        </div>
      </main>
    </div>
  );
}
