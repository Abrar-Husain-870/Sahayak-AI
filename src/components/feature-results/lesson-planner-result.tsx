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
    } catch (e) {
      if (e instanceof SyntaxError && (e.message.includes('Bad control character') || e.message.includes('Unterminated string'))) {
        console.warn("Attempting to fix malformed JSON from AI.");
        try {
          // This regex replaces unescaped control characters with a space.
          // It's a targeted fix for a common AI generation issue.
          const sanitized = generatedPlan.replace(/[\u0000-\u001F]/g, ' ');
          plan = JSON.parse(sanitized);
        } catch (finalError) {
          console.error("Failed to parse sanitized JSON:", finalError);
          plan = null;
        }
      } else {
        console.error("Failed to parse lesson plan JSON:", e);
        plan = null;
      }
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
        <div>
          <p className="text-destructive mb-2">Could not display the lesson plan as structured data.</p>
          <p className="text-muted-foreground mb-4">This can happen if the AI response is not perfectly formatted. Below is the raw text from the AI:</p>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap h-[400px] overflow-auto border bg-muted p-4 rounded-md">
            <ReactMarkdown>{generatedPlan.replace(/```json/g, '').replace(/```/g, '').trim()}</ReactMarkdown>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 h-[500px] overflow-auto pr-4 text-left">
        {/* Main Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{plan?.title || plan?.week || 'Weekly Plan'}</h2>
          <div className="flex items-center space-x-2">
            {plan?.gradeLevel && <Badge>{plan.gradeLevel}</Badge>}
            {plan?.subject && <Badge variant="secondary">{plan.subject}</Badge>}
          </div>
          {(plan?.weekOverview || plan?.overallLearningObjective) && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ReactMarkdown>{plan.weekOverview || plan.overallLearningObjective}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Weekly Objectives */}
        {Array.isArray(plan?.weekObjectives) && plan.weekObjectives.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Learning Objectives</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                {plan.weekObjectives?.map((obj, i) => obj && <li key={i}><ReactMarkdown>{obj}</ReactMarkdown></li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Weekly Materials */}
        {Array.isArray(plan?.materials) && plan.materials.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Materials</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                {plan.materials?.map((mat, i) => mat && <li key={i}><ReactMarkdown>{mat}</ReactMarkdown></li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Daily Plan Accordion */}
        {Array.isArray(plan?.dailyPlan) && plan.dailyPlan.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Daily Plan</h3>
            <Accordion type="single" collapsible className="w-full">
              {plan.dailyPlan?.map((dayPlan, index) => dayPlan && (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{dayPlan?.day}</span>
                      <span className="text-muted-foreground font-normal">{dayPlan?.topic}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-2">
                      {/* Daily Learning Objectives */}
                      {Array.isArray(dayPlan?.learningObjectives) && dayPlan.learningObjectives.length > 0 && (
                        <div>
                          <p className="font-semibold">Learning Objectives:</p>
                          <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                            <ul>{dayPlan.learningObjectives?.map((obj, i) => obj && <li key={i}><ReactMarkdown>{obj}</ReactMarkdown></li>)}</ul>
                          </div>
                        </div>
                      )}
                      {/* Single Daily Learning Objective */}
                      {dayPlan?.learningObjective && (
                        <div>
                          <h4 className="font-semibold">Learning Objective:</h4>
                          <div className="prose prose-sm max-w-none text-muted-foreground"><ReactMarkdown>{dayPlan.learningObjective}</ReactMarkdown></div>
                        </div>
                      )}
                      {/* Daily Activities */}
                      {Array.isArray(dayPlan?.activities) && dayPlan.activities.length > 0 && (
                        <div>
                          <p className="font-semibold">Activities:</p>
                          <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                            <ul>{dayPlan.activities?.map((act, i) => act && <li key={i}><ReactMarkdown>{act}</ReactMarkdown></li>)}</ul>
                          </div>
                        </div>
                      )}
                      {/* Daily Materials */}
                      {Array.isArray(dayPlan?.materials) && dayPlan.materials.length > 0 && (
                        <div>
                          <p className="font-semibold">Materials:</p>
                          <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                            <ul>{dayPlan.materials?.map((mat, i) => mat && <li key={i}><ReactMarkdown>{mat}</ReactMarkdown></li>)}</ul>
                          </div>
                        </div>
                      )}
                      {/* Daily Assessment */}
                      {dayPlan?.assessment && (
                        <div>
                          <p className="font-semibold">Assessment:</p>
                          <div className="prose prose-sm max-w-none text-muted-foreground mt-1">
                            {Array.isArray(dayPlan.assessment)
                              ? (<ul>{dayPlan.assessment?.map((item, i) => item && <li key={i}><ReactMarkdown>{item}</ReactMarkdown></li>)}</ul>)
                              : (<ReactMarkdown>{dayPlan.assessment}</ReactMarkdown>)
                            }
                          </div>
                        </div>
                      )}
                      {/* Daily Differentiation */}
                      {dayPlan?.differentiation && (
                        <div>
                          <h4 className="font-semibold">Differentiation:</h4>
                          <div className="prose prose-sm max-w-none text-muted-foreground">
                            {dayPlan.differentiation?.support && <p><strong>Support:</strong> <ReactMarkdown components={{ p: 'span' }}>{dayPlan.differentiation.support}</ReactMarkdown></p>}
                            {dayPlan.differentiation?.challenge && <p><strong>Challenge:</strong> <ReactMarkdown components={{ p: 'span' }}>{dayPlan.differentiation.challenge}</ReactMarkdown></p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Weekly Assessment */}
        {plan?.assessment && (
          <div>
            <h3 className="font-semibold mb-2">Weekly Assessment</h3>
            {/* Formative */}
            {Array.isArray(plan.assessment?.formative) && plan.assessment.formative.length > 0 && (
              <div>
                <h4 className="font-semibold">Formative:</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <ul>{plan.assessment.formative?.map((obj, i) => obj && <li key={i}><ReactMarkdown>{obj}</ReactMarkdown></li>)}</ul>
                </div>
              </div>
            )}
            {/* Summative */}
            {plan.assessment?.summative && (
              <div className="mt-2">
                <h4 className="font-semibold">Summative:</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {Array.isArray(plan.assessment.summative)
                    ? (<ul>{plan.assessment.summative?.map((item, i) => item && <li key={i}><ReactMarkdown>{item}</ReactMarkdown></li>)}</ul>)
                    : (<ReactMarkdown>{plan.assessment.summative}</ReactMarkdown>)
                  }
                </div>
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
