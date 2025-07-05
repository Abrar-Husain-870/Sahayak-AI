"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, BookOpen, Target, Wrench, ClipboardCheck, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface LessonPlannerResultProps {
  isLoading: boolean;
  generatedPlan: string;
}

export function LessonPlannerResult({
  isLoading,
  generatedPlan,
}: LessonPlannerResultProps) {
  let plan: any = null;
  if (generatedPlan) {
    try {
      plan = JSON.parse(generatedPlan);
    } catch (error) {
      console.error("Failed to parse lesson plan JSON:", error);
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (!generatedPlan) {
      return (
        <p className="text-muted-foreground">
          Your generated lesson plan will appear here.
        </p>
      );
    }

    if (!plan) {
      return (
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap h-[500px] overflow-auto">
          {generatedPlan}
        </div>
      );
    }

    const planTitle = plan.title || plan.week;
    const planOverview = plan.weekOverview || plan.overallLearningObjective;
    const planObjectives = plan.weekObjectives || [];
    const planMaterials = plan.materials || [];

    return (
      <div className="space-y-6 h-[500px] overflow-auto pr-4 text-left">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{planTitle}</h2>
          <div className="flex items-center space-x-2">
            <Badge>{plan.gradeLevel}</Badge>
            <Badge variant="secondary">{plan.subject}</Badge>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <ReactMarkdown>{planOverview}</ReactMarkdown>
          </div>
        </div>

        {planObjectives.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Learning Objectives</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                {planObjectives.map((obj: string, i: number) => (
                  <li key={i}><ReactMarkdown>{obj}</ReactMarkdown></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {planMaterials.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Materials</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ul>
                {planMaterials.map((material: string, index: number) => (
                  <li key={index}>
                    <ReactMarkdown>{material}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Daily Plan</h3>
          <Accordion type="single" collapsible className="w-full">
            {plan.dailyPlan.map((dayPlan: any, index: number) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span>{dayPlan.day}</span>
                    <span className="text-muted-foreground font-normal">
                      {dayPlan.topic}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-2">
                    {dayPlan.learningObjectives && (
                      <div>
                        <p className="font-semibold">Learning Objectives:</p>
                        <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                          <ul>
                            {dayPlan.learningObjectives.map((obj: string, i: number) => (
                              <li key={i}>
                                <ReactMarkdown>{obj}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {dayPlan.learningObjective && (
                      <div>
                        <h4 className="font-semibold">Learning Objective:</h4>
                        <div className="prose prose-sm max-w-none text-muted-foreground"><ReactMarkdown>{dayPlan.learningObjective}</ReactMarkdown></div>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">Activities:</p>
                      <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                        <ul>
                          {dayPlan.activities.map((act: string, i: number) => (
                            <li key={i}>
                              <ReactMarkdown>{act}</ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {dayPlan.materials && dayPlan.materials.length > 0 && (
                      <div>
                        <p className="font-semibold">Materials:</p>
                        <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                          <ul>
                            {dayPlan.materials.map((mat: string, i: number) => (
                              <li key={i}>
                                <ReactMarkdown>{mat}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {dayPlan.assessment && (
                      <div>
                        <p className="font-semibold">Assessment:</p>
                        <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                          <ReactMarkdown>{dayPlan.assessment}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {dayPlan.differentiation && (
                      <div>
                        <h4 className="font-semibold">Differentiation:</h4>
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                          <p><strong>Support:</strong> <ReactMarkdown components={{ p: 'span' }}>{dayPlan.differentiation.support}</ReactMarkdown></p>
                          <p><strong>Challenge:</strong> <ReactMarkdown components={{ p: 'span' }}>{dayPlan.differentiation.challenge}</ReactMarkdown></p>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {plan.assessment && (
          <div>
            <h3 className="font-semibold mb-2">Weekly Assessment</h3>
            {plan.assessment.formative && (
              <div>
                <h4 className="font-semibold">Formative:</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <ul>
                    {plan.assessment.formative.map((objective: string, index: number) => (
                      <li key={index}>
                        <ReactMarkdown>{objective}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {plan.assessment.summative && (
              <div className="mt-2">
                <h4 className="font-semibold">Summative:</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground"><ReactMarkdown>{plan.assessment.summative}</ReactMarkdown></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Weekly Lesson Plan</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
