"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  XCircle,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { JobStatus } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";
import api from "@/lib/axios-config";

interface RecentJobsProps {
  onSelectJob: (jobId: string) => void;
}

export function RecentJobs({ onSelectJob }: RecentJobsProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/enrichment/jobs");

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch jobs");
      }

      // Set jobs from the API response
      setJobs(response.data.jobs);
    } catch (error: any) {
      console.error("Error fetching recent jobs:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch recent jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    onSelectJob(jobId);
  };

  const handleDownload = async (jobId: string) => {
    try {
      const response = await api.get(`/api/enrichment/${jobId}/download`);

      if (response.data.success && response.data.csvUrl) {
        window.open(response.data.csvUrl, "_blank");
      } else {
        throw new Error("Download URL not available");
      }
    } catch (error: any) {
      console.error("Error downloading results:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to download results",
      });
    }
  };

  const handleRefresh = () => {
    fetchRecentJobs();
  };

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Running
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700/30 bg-white dark:bg-[#141414]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Recent Jobs
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              View and manage your recent enrichment jobs
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="hover:bg-gray-50 dark:hover:bg-[#181818] dark:border-gray-600/40"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : jobs.length === 0 ? (
          <Alert>
            <AlertTitle>No jobs found</AlertTitle>
            <AlertDescription>
              You haven't created any enrichment jobs yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#181818] transition-colors duration-200 bg-white dark:bg-[#141414]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.name}
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {job.id}
                    </p>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(job.created_at))} ago
                      </span>
                      <span>{job.total_profiles} profiles</span>
                      <span>{job.selected_nodes?.length || 0} nodes</span>
                    </div>

                    {job.status === "running" &&
                      job.processed_profiles !== undefined &&
                      job.total_profiles && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">Progress</span>
                            <span className="font-semibold">
                              {Math.round(
                                (job.processed_profiles / job.total_profiles) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (job.processed_profiles /
                                    job.total_profiles) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                    {job.status === "failed" && job.error_message && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <span className="font-medium">Error:</span>{" "}
                          {job.error_message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJob(job.id)}
                      className="hover:bg-gray-50 dark:hover:bg-[#181818] dark:border-gray-600/40"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {job.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(job.id)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800/30 dark:hover:bg-purple-950/20"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
