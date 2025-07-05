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
import { createWeeklyLessonPlan } from "@/ai/flows/create-weekly-lesson-plans";
import { DashboardHeader } from "@/components/dashboard-header";
import dynamic from "next/dynamic";

const LessonPlannerResult = dynamic(
  () =>
    import("@/components/feature-results/lesson-planner-result").then(
      (mod) => mod.LessonPlannerResult
    ),
  { ssr: false }
);

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),
  gradeLevel: z.string().min(1, {
    message: "Grade level is required.",
  }),
  language: z.string(),
});

export default function LessonPlannerPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [runId, setRunId] = useState(0);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: "",
      language: "English",
    },
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedPlan("");
    setRunId(id => id + 1);
    try {
      const result = await createWeeklyLessonPlan(values);
            setGeneratedPlan(result.lessonPlan);

      if (session?.user?.email) {
        await addDoc(collection(db, "history"), {
          userId: session.user.email,
          feature: "lesson-planner",
          request: `Topic: ${values.topic}, Grade Level: ${values.gradeLevel}`,
          language: values.language,
          content: result.lessonPlan,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the lesson plan.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Lesson Planner"
        description="Create AI-powered weekly lesson plans to structure activities."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g., "The Solar System"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g., "4"' {...field} />
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
                    {isLoading ? "Generating..." : "Generate Lesson Plan"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <LessonPlannerResult
            key={runId}
            isLoading={isLoading}
            generatedPlan={generatedPlan}
          />
        </div>
      </main>
    </div>
  );
}
