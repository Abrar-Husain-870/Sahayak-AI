"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Upload } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LanguageSelect } from "@/components/language-select";
import { useToast } from "@/hooks/use-toast";
import { createDifferentiatedMaterials } from "@/ai/flows/create-differentiated-materials";
import { DashboardHeader } from "@/components/dashboard-header";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DifferentiatedMaterialsResult = dynamic(
  () =>
    import(
      "@/components/feature-results/differentiated-materials-result"
    ).then((mod) => mod.DifferentiatedMaterialsResult),
  { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> }
);

const formSchema = z.object({
  textbookPageImage: z.any().refine((file) => file instanceof File, "Image is required."),
  gradeLevels: z.string().min(1, "At least one grade level is required."),
  language: z.string(),
});

export default function DifferentiatedMaterialsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedMaterials, setGeneratedMaterials] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevels: "1, 2, 3",
      language: "English",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("textbookPageImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedMaterials(undefined);
    try {
      const imageBase64 = await toBase64(values.textbookPageImage);
      const result = await createDifferentiatedMaterials({
        ...values,
        textbookPageImage: imageBase64,
      });
      
      setGeneratedMaterials(result.differentiatedMaterials);

      if (session?.user?.email) {
        await addDoc(collection(db, "history"), {
          userId: session.user.email,
          feature: "differentiated-materials",
          request: `Grade Levels: ${values.gradeLevels}`,
          language: values.language,
          content: result.differentiatedMaterials, // Store the clean JSON string
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the worksheets.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Differentiated Materials"
        description="Upload a textbook page to create worksheets for different grade levels."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="textbookPageImage"
                    render={() => (
                      <FormItem>
                        <FormLabel>Textbook Page Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary">
                              {preview ? (
                                <Image src={preview} alt="Preview" width={256} height={256} className="object-contain h-full w-full p-2" />
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                                </div>
                              )}
                              <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Levels</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1, 2, 3" {...field} />
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
                        <LanguageSelect value={field.value} onValueChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "Generate Worksheets"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <DifferentiatedMaterialsResult
            isLoading={isLoading}
            generatedMaterials={generatedMaterials}
          />
        </div>
      </main>
    </div>
  );
}
