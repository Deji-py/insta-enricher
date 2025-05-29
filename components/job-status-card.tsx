"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  XCircle,
  Server,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { JobStatus, NodeProgress } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";
import api from "@/lib/axios-config";

interface JobStatusCardProps {
  jobId: string;
}

export function JobStatusCard({ jobId }: JobStatusCardProps) {
  const { toast } = useToast();
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchJobStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/enrichment/${jobId}/status`);

      if (response.data.success) {
        setJobStatus(response.data.data);

        if (response.data.data.status === "completed") {
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
          fetchDownloadUrl();
        }
      } else {
        throw new Error(response.data.error || "Failed to fetch job status");
      }
    } catch (error: any) {
      console.error("Error fetching job status:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch job status"
      );

      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadUrl = async () => {
    try {
      const response = await api.get(`/api/enrichment/${jobId}/download`);

      if (response.data.success && response.data.csvUrl) {
        setDownloadUrl(response.data.csvUrl);
      }
    } catch (error: any) {
      console.error("Error fetching download URL:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get download URL. Please try again later.",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleRefresh = () => {
    fetchJobStatus();
  };

  useEffect(() => {
    fetchJobStatus();

    const interval = setInterval(() => {
      if (jobStatus?.status === "running") {
        fetchJobStatus();
      }
    }, 5000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, jobStatus?.status]);

  const getOverallProgress = (): number => {
    if (!jobStatus) return 0;

    if (jobStatus.status === "completed") return 100;

    if (jobStatus.processed_profiles && jobStatus.total_profiles) {
      return Math.min(
        Math.round(
          (jobStatus.processed_profiles / jobStatus.total_profiles) * 100
        ),
        99
      );
    }

    return 0;
  };

  const getStatusIcon = () => {
    if (!jobStatus) return <Loader2 className="h-4 w-4 animate-spin" />;

    switch (jobStatus.status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700/30 bg-white dark:bg-[#141414]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Job Status
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Job ID: <span className="font-mono text-sm">{jobId}</span>
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

      <CardContent className="space-y-6">
        {loading && !jobStatus ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : jobStatus ? (
          <>
            {/* Status Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      jobStatus.status === "completed"
                        ? "default"
                        : jobStatus.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                    className={`px-3 py-1 ${
                      jobStatus.status === "running"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                        : jobStatus.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        : ""
                    }`}
                  >
                    <span className="flex items-center">
                      {getStatusIcon()}
                      <span className="ml-2 capitalize">
                        {jobStatus.status}
                      </span>
                    </span>
                  </Badge>

                  {jobStatus.name && (
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {jobStatus.name}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {jobStatus.processed_profiles || 0} /{" "}
                    {jobStatus.total_profiles || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    profiles processed
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Overall Progress
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getOverallProgress()}%
                  </span>
                </div>
                <Progress value={getOverallProgress()} className="h-2" />
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 dark:bg-[#181818] rounded-lg p-4 border border-gray-200 dark:border-gray-600/30">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Started
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {jobStatus.created_at
                        ? formatDistanceToNow(new Date(jobStatus.created_at)) +
                          " ago"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#181818] rounded-lg p-4 border border-gray-200 dark:border-gray-600/30">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Nodes
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {jobStatus.selected_nodes?.length || 0} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#181818] rounded-lg p-4 border border-gray-200 dark:border-gray-600/30">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Speed
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {(jobStatus.selected_nodes?.length || 0) * 50}/min
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#181818] rounded-lg p-4 border border-gray-200 dark:border-gray-600/30">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      ETA
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {jobStatus.estimated_completion
                        ? formatDistanceToNow(
                            new Date(jobStatus.estimated_completion)
                          )
                        : "Calculating..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Node Progress */}
            {jobStatus.nodeProgress && jobStatus.nodeProgress.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Node Progress
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {jobStatus.nodeProgress.map((node: NodeProgress) => (
                    <div
                      key={node.nodeId}
                      className="bg-gray-50 dark:bg-[#181818] rounded-lg p-4 border border-gray-200 dark:border-gray-600/30"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Node {node.nodeId}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {Math.round(node.progress)}%
                        </span>
                      </div>
                      <Progress value={node.progress} className="h-2 mb-2" />
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {node.completed} / {node.total} profiles
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success/Failure Stats */}
            {jobStatus.successful_profiles !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Successful
                      </p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {jobStatus.successful_profiles || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Failed
                      </p>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {jobStatus.failed_profiles || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert>
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              Could not retrieve job status information.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        {jobStatus?.status === "completed" ? (
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
            onClick={handleDownload}
            disabled={!downloadUrl}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full hover:bg-gray-50 dark:hover:bg-[#181818] dark:border-gray-600/40"
            size="lg"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
