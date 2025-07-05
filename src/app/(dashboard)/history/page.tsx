"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { DashboardHeader } from "@/components/dashboard-header";
import ReactMarkdown from "react-markdown";
import { HistoryLessonPlanViewer } from "@/components/history/history-lesson-plan-viewer";
import { HistoryDifferentiatedMaterialsViewer } from "@/components/history/history-differentiated-materials-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: string;
  request: string;
  language: string;
  content: string;
  createdAt: any;
  feature: string;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      const q = query(
        collection(db, "history"),
        where("userId", "==", session.user.email),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as HistoryItem);
        });
        setHistory(items);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [session]);

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete history item.");
      }
      toast({ title: "Success", description: "History item deleted." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not delete history item.",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch(`/api/history`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear history.");
      }
      toast({ title: "Success", description: "History cleared." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not clear history.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="History"
        description="Review your previously generated content."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={history.length === 0}>
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  your history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {isLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No history found. Try generating some content first.</p>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <Card key={item.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {item.feature.replace(/-/g, " ")}
                  </CardTitle>
                  <CardDescription>
                    {item.createdAt
                      ? formatDistanceToNow(item.createdAt.toDate())
                      : ""}{" "}
                    ago in {item.language}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">Your request:</p>
                  <p className="text-muted-foreground mb-4">{item.request}</p>
                  <p className="font-semibold mb-2">Generated content:</p>
                  {item.feature === 'lesson-planner' ? (
                    <HistoryLessonPlanViewer content={item.content} />
                  ) : item.feature === 'differentiated-materials' ? (
                    <HistoryDifferentiatedMaterialsViewer content={item.content} />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                      <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
