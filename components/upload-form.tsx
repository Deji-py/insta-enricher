"use client";

import type React from "react";

import { useState } from "react";
import {
  CloudUpload,
  Loader2,
  Server,
  Clock,
  Gauge,
  Target,
  Zap,
  Rocket,
  Cpu,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/axios-config";

interface UploadFormProps {
  onJobCreated: (jobId: string) => void;
  onError: (error: string) => void;
}

const nodeConfigs = [
  {
    nodes: 1,
    title: "Starter",
    subtitle: "Perfect for small batches",
    icon: Clock,
    iconColor: "text-blue-600 dark:text-blue-400",
    speed: "50 profiles/min",
    description: "Ideal for testing or small datasets",
  },
  {
    nodes: 2,
    title: "Basic",
    subtitle: "Good for medium datasets",
    icon: Gauge,
    iconColor: "text-green-600 dark:text-green-400",
    speed: "100 profiles/min",
    description: "Balanced speed and efficiency",
  },
  {
    nodes: 3,
    title: "Standard",
    subtitle: "Most popular choice",
    icon: Target,
    iconColor: "text-purple-600 dark:text-purple-400",
    speed: "150 profiles/min",
    description: "Recommended for most users",
    popular: true,
  },
  {
    nodes: 4,
    title: "Pro",
    subtitle: "High performance",
    icon: Zap,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    speed: "200 profiles/min",
    description: "Fast processing for large datasets",
  },
  {
    nodes: 5,
    title: "Turbo",
    subtitle: "Maximum speed",
    icon: Rocket,
    iconColor: "text-orange-600 dark:text-orange-400",
    speed: "250 profiles/min",
    description: "Ultimate performance",
  },
  {
    nodes: 6,
    title: "Enterprise",
    subtitle: "Heavy workloads",
    icon: Cpu,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    speed: "300 profiles/min",
    description: "For enterprise-scale processing",
  },
  {
    nodes: 8,
    title: "Ultra",
    subtitle: "Extreme performance",
    icon: Activity,
    iconColor: "text-pink-600 dark:text-pink-400",
    speed: "400 profiles/min",
    description: "Maximum parallel processing",
  },
  {
    nodes: 10,
    title: "Beast Mode",
    subtitle: "Unleash the power",
    icon: Server,
    iconColor: "text-red-600 dark:text-red-400",
    speed: "500 profiles/min",
    description: "Ultimate processing power",
  },
];

export function UploadForm({ onJobCreated, onError }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [numberOfNodes, setNumberOfNodes] = useState(3);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setFileError("Please upload a CSV file");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError("File size exceeds 10MB limit");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileError("Please select a CSV file");
      return;
    }

    if (!name.trim()) {
      setFormError("Please enter a job name");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("numberOfNodes", numberOfNodes.toString());

    try {
      const response = await api.post("/api/enrichment/start", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.data.jobId) {
        onJobCreated(response.data.data.jobId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to start enrichment process";
      onError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700/30 bg-white dark:bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">
            Upload Instagram Profiles
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Upload a CSV file containing Instagram usernames to enrich with
            additional data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label
              htmlFor="csvFile"
              className="text-base font-medium text-gray-900 dark:text-white"
            >
              CSV File
            </Label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600/40 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-[#181818] transition-colors duration-200"
              onClick={() => document.getElementById("csvFile")?.click()}
            >
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <CloudUpload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                CSV file up to 10MB
              </p>
            </div>
            {fileError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fileError}
              </p>
            )}
          </div>

          {/* Job Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-base font-medium text-gray-900 dark:text-white"
              >
                Job Name
              </Label>
              <Input
                id="name"
                placeholder="Enter a name for this job"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUploading}
                className="border-gray-300 dark:border-gray-600/40 focus:border-purple-500 dark:focus:border-purple-400 dark:bg-[#181818]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base font-medium text-gray-900 dark:text-white"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email for notifications"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUploading}
                className="border-gray-300 dark:border-gray-600/40 focus:border-purple-500 dark:focus:border-purple-400 dark:bg-[#181818]"
              />
            </div>
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Node Selection Cards */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700/30 bg-white dark:bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">
            Choose Processing Power
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Select the number of nodes to process your Instagram profiles
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nodeConfigs.map((config) => {
              const IconComponent = config.icon;
              const isSelected = numberOfNodes === config.nodes;

              return (
                <div
                  key={config.nodes}
                  className="relative cursor-pointer transition-colors duration-200"
                  onClick={() => setNumberOfNodes(config.nodes)}
                >
                  <Card
                    className={`h-full transition-all duration-200 shiny-border ${
                      isSelected
                        ? "border-purple-500 dark:border-purple-400/50 bg-purple-50 dark:bg-purple-950/20 shadow-md"
                        : "border-gray-200 dark:border-gray-600/30 hover:border-gray-300 dark:hover:border-gray-500/40 hover:shadow-sm bg-white dark:bg-[#181818]"
                    }`}
                  >
                    {config.popular && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                        POPULAR
                      </div>
                    )}

                    <CardContent className="p-4 text-center">
                      <div className="mb-3">
                        <div
                          className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                            isSelected
                              ? "bg-white dark:bg-[#222222] shadow-sm border border-gray-200 dark:border-gray-600/30"
                              : "bg-gray-100 dark:bg-[#222222] border border-gray-200 dark:border-gray-600/30"
                          }`}
                        >
                          <IconComponent
                            className={`h-6 w-6 ${config.iconColor}`}
                          />
                        </div>
                      </div>

                      <h3
                        className={`font-semibold text-lg ${
                          isSelected
                            ? "text-purple-900 dark:text-purple-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {config.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isSelected
                            ? "text-purple-700 dark:text-purple-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {config.subtitle}
                      </p>

                      <div className="mt-3 space-y-1">
                        <div
                          className={`text-2xl font-bold ${
                            isSelected
                              ? "text-purple-900 dark:text-purple-100"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {config.nodes}
                        </div>
                        <div
                          className={`text-xs ${
                            isSelected
                              ? "text-purple-700 dark:text-purple-300"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {config.nodes === 1 ? "Node" : "Nodes"}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600/30">
                        <div
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-purple-900 dark:text-purple-100"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {config.speed}
                        </div>
                        <div
                          className={`text-xs ${
                            isSelected
                              ? "text-purple-700 dark:text-purple-300"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {config.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
            <div className="flex items-start">
              <Server className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">
                  Selected Configuration
                </p>
                <p className="text-purple-800 dark:text-purple-200 mt-1">
                  <span className="font-semibold">{numberOfNodes}</span>{" "}
                  {numberOfNodes === 1 ? "node" : "nodes"} processing up to{" "}
                  <span className="font-semibold">{numberOfNodes * 50}</span>{" "}
                  profiles per minute
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Estimated processing time will be calculated based on your CSV
                  file size
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading & Processing...
              </>
            ) : (
              <>Start Enrichment</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
