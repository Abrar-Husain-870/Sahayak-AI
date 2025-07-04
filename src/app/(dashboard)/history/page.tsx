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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

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

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="History"
        description="Review your previously generated content."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {isLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No history found. Try generating some content first.</p>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {item.feature.replace(/-/g, ' ')}
                  </CardTitle>
                  <CardDescription>
                    {item.createdAt ? formatDistanceToNow(item.createdAt.toDate()) : ''} ago in {item.language}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">Your request:</p>
                  <p className="text-muted-foreground mb-4">{item.request}</p>
                  <p className="font-semibold mb-2">Generated content:</p>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    {item.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
