"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <p className="text-muted-foreground">{planOverview}</p>
        </div>

        {planObjectives.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Learning Objectives</h3>
            <ul className="list-disc list-inside space-y-1">
              {planObjectives.map((obj: string, i: number) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {planMaterials.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Materials</h3>
            <ul className="list-disc list-inside space-y-1">
              {planMaterials.map((mat: string, i: number) => (
                <li key={i}>{mat}</li>
              ))}
            </ul>
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
                        <h4 className="font-semibold">Learning Objectives:</h4>
                        <ul className="list-disc list-inside">
                          {dayPlan.learningObjectives.map(
                            (obj: string, i: number) => (
                              <li key={i}>{obj}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {dayPlan.learningObjective && (
                      <div>
                        <h4 className="font-semibold">Learning Objective:</h4>
                        <p>{dayPlan.learningObjective}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">Activities:</h4>
                      <ul className="list-disc list-inside">
                        {dayPlan.activities.map((act: string, i: number) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                    {dayPlan.materials && dayPlan.materials.length > 0 && (
                      <div>
                        <h4 className="font-semibold">Materials:</h4>
                        <ul className="list-disc list-inside">
                          {dayPlan.materials.map((mat: string, i: number) => (
                            <li key={i}>{mat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dayPlan.assessment && (
                      <div>
                        <h4 className="font-semibold">Assessment:</h4>
                        <p>{dayPlan.assessment}</p>
                      </div>
                    )}
                    {dayPlan.differentiation && (
                      <div>
                        <h4 className="font-semibold">Differentiation:</h4>
                        <p>
                          <strong>Support:</strong>{" "}
                          {dayPlan.differentiation.support}
                        </p>
                        <p>
                          <strong>Challenge:</strong>{" "}
                          {dayPlan.differentiation.challenge}
                        </p>
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
                <ul className="list-disc list-inside">
                  {plan.assessment.formative.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {plan.assessment.summative && (
              <div className="mt-2">
                <h4 className="font-semibold">Summative:</h4>
                <p>{plan.assessment.summative}</p>
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
