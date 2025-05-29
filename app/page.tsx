"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CloudDownload,
  CloudUpload,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { JobStatusCard } from "@/components/job-status-card";
import { UploadForm } from "@/components/upload-form";
import { RecentJobs } from "@/components/recent-jobs";
import { ThemeToggle } from "@/components/theme-toggle";
import api from "@/lib/axios-config";

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [jobId, setJobId] = useState<string | null>(null);

  const handleJobCreated = (newJobId: string) => {
    setJobId(newJobId);
    setActiveTab("status");
    toast({
      title: "Job Created Successfully",
      description: `Your job ID is ${newJobId}. You can track its progress in the Status tab.`,
    });
  };

  const handleJobError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error Creating Job",
      description: error,
    });
  };

  const handleDownload = async () => {
    try {
      const response = await api.get("/api/enrichment/download-all");

      const link = document.createElement("a");
      link.href = response.data.downloadUrl;
      link.setAttribute("download", "instagram-data.csv");

      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101010]">
      <header className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Instagram Enrichment
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-node scraping dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700/50"
              >
                <CloudDownload className="h-4 w-4 mr-2" />
                Download All CSV
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700/50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100 dark:bg-[#181818] p-1 rounded-lg border-0 dark:border-gray-700/30">
              <TabsTrigger
                value="upload"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#222222] dark:data-[state=active]:text-purple-400 transition-all"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="status"
                disabled={!jobId}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#222222] dark:data-[state=active]:text-purple-400 transition-all"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Status
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#222222] dark:data-[state=active]:text-purple-400 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="space-y-6">
            <UploadForm
              onJobCreated={handleJobCreated}
              onError={handleJobError}
            />
          </TabsContent>

          <TabsContent value="status">
            {jobId && <JobStatusCard jobId={jobId} />}
          </TabsContent>

          <TabsContent value="history">
            <RecentJobs onSelectJob={setJobId} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-gray-800/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Instagram Enrichment Dashboard &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Powered by multi-node scraping technology
          </p>
        </div>
      </footer>
    </div>
  );
}
