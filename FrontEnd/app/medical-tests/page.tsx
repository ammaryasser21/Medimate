"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { mainAPI } from '@/lib/axios'
import Link from 'next/link';
import { SaveButton } from "@/components/save-button";
import { useHistory } from "@/hooks/use-history";

interface TestResult {
  name: string
  value: number
  unit: string
  normalRange: {
    min: number
    max: number
  }
  critical: boolean
  trend?: string
  percentile?: number
  lastUpdated?: string
  category?: string
  interpretation?: string;
}

export default function MedicalTestsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const { saveMedicalTest } = useHistory();

  useEffect(() => {
    if (results) {
      const categories = new Set<string>();
      results.forEach(result => {
        if (result.category && result.category.toLowerCase() !== 'extended') { // Exclude 'extended' category
          categories.add(result.category);
        }
      });
      setUniqueCategories(Array.from(categories));
    } else {
      setUniqueCategories([]);
    }
  }, [results]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setError(null)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      processFile(droppedFile)
    } else {
      setError("Please upload an image file. Only image files are supported for now.");
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload an image file. Only image files are supported for now.");
        return
      }
      processFile(selectedFile)
    }
  }

  const processFile = (file: File) => {
    setFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    setError(null)
    setLoading(true)
    setProcessingStage("Analyzing test results...");

    try {
      if (!file) {
        setError("No file selected.");
        setLoading(false);
        setProcessingStage(null);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      setProcessingStage("Waiting for analysis results from server...");

      const response = await mainAPI.post("/extract-medical-tests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API Response:", response.data);

      if (response.status === 200) {
        if (Array.isArray(response.data.medical_tests)) {
          if (response.data.medical_tests.length === 0) { // Check if medical_tests array is empty
            setError("No medical tests detected in the report. Please upload a valid medical test report.");
            setResults(null); // Clear any previous results
            setProcessingStage("Analysis failed: No medical tests detected.");
            setTimeout(() => setProcessingStage(null), 3000);
          } else {
            setResults(response.data.medical_tests);
            setProcessingStage("Analysis complete.");
            setTimeout(() => setProcessingStage(null), 2000);
          }
        } else if (response.data.medical_tests && typeof response.data.medical_tests === 'object' && response.data.medical_tests.error) {
          // Handle specific server-side JSON parsing error
          const serverError = response.data.medical_tests.error;
          setError(`Server Error: ${serverError}. Please check the uploaded file or try again.`); // More user-friendly server error
          console.error("Server JSON Parsing Error:", serverError);
          setProcessingStage("Analysis failed due to server error.");
          setTimeout(() => setProcessingStage(null), 5000);
        }
        else {
          console.error("API response 'medical_tests' is not an array or error object:", response.data);
          setError("Analysis failed: Unexpected data format from server. Please check the server response.");
          setProcessingStage("Analysis failed.");
          setTimeout(() => setProcessingStage(null), 3000);
        }
      } else {
        const errorDetail = response.data?.error || "Unknown error from server";
        setError(`Analysis failed: Server responded with status ${response.status}. Detail: ${errorDetail}`);
        console.error("API Error:", response.status, response.data);
        setProcessingStage("Analysis failed.");
        setTimeout(() => setProcessingStage(null), 3000);
      }
    } catch (err: any) {
      let errorMessage = "Failed to analyze the test results. Please try again.";
      if (err.response?.data?.error) {
        errorMessage = `Analysis failed: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `Analysis failed: Network error - ${err.message}`;
      }
      setError(errorMessage);
      console.error("API Request Error:", err);
      setProcessingStage("Analysis error.");
      setTimeout(() => setProcessingStage(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setResults(null)
    setExpandedTest(null)
    setError(null)
    setProcessingStage(null)
    setActiveTab("all"); // Reset active tab to 'all' when clearing
  }

  const handleCancel = () => {
    if (loading) {
      setLoading(false)
      setProcessingStage(null)
    }
    handleClear()
  }

  const toggleTestExpansion = (testName: string) => {
    setExpandedTest(expandedTest === testName ? null : testName)
  }

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min) return "text-blue-500"
    if (value > max) return "text-red-500"
    return "text-green-500"
  }

  const getStatusIcon = (value: number, min: number, max: number) => {
    if (value < min) return <TrendingDown className="h-4 w-4 text-blue-500" />
    if (value > max) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (value: number, min: number, max: number) => {
    if (value < min) return "Below Range"
    if (value > max) return "Above Range"
    return "Normal"
  }

  const getPercentageInRange = (value: number, min: number, max: number) => {
    const range = max - min
    if (value < min) {
      return 0
    } else if (value > max) {
      return 100
    } else {
      return ((value - min) / range) * 100
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const filteredResults = results
    ? activeTab === "all"
      ? results
      : activeTab === "critical"
        ? results.filter((result) => result.critical)
        : results.filter((result) => result.category?.toLowerCase() === activeTab.toLowerCase())
    : null;

  useEffect(() => {
    console.log("Results state updated:", results);
    console.log("Filtered Results:", filteredResults);
    console.log("Unique Categories:", uniqueCategories);
  }, [results, filteredResults, activeTab, uniqueCategories]);

  const handleSaveMedicalTest = async () => {
    if (!results || !file) return false;
    
    const fileName = file.name || `medical_test_${new Date().toISOString()}`;
    
    return await saveMedicalTest({
      fileName,
      results: {
        tests: results
      }
    });
  };

  const handleSaveIndividualTest = async (test: TestResult) => {
    if (!file) return false;
    
    const fileName = `${test.name}_${new Date().toISOString()}`;
    
    return await saveMedicalTest({
      fileName,
      results: {
        tests: [test]
      }
    });
  };

  return (
    <div className="container max-w-6xl py-4 sm:py-8">
      <div className="mb-4 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold">Medical Test Analysis</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Upload your medical test reports for instant analysis and visualization
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="p-3 sm:p-6">
          {/* ... Upload Card Content ... */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex min-h-[300px] sm:min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 sm:p-6"
          >
            {preview ? (
              <div className="relative w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="relative w-full max-w-[400px] mx-auto">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="truncate">{processingStage || "Analyzing..."}</span>
                      </>
                    ) : (
                      "Analyze Test Results"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Upload className="mb-4 h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground" />
                <p className="mb-2 text-base sm:text-lg font-medium text-center">
                  Drag and drop your test report here
                </p>
                <p className="mb-4 text-xs sm:text-sm text-muted-foreground text-center">
                  or click to select a file
                </p>
                <Button variant="outline" asChild>
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    Choose File
                  </label>
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Results Summary Card */}
        <Card className="p-3 sm:p-6">
          {/* ... Results Summary Card Content ... */}
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 sm:h-5 w-4 sm:w-5" />
                <h2 className="text-lg sm:text-xl font-semibold">Test Results Summary</h2>
              </div>
              {results && (
                <SaveButton
                  onSave={handleSaveMedicalTest}
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9"
                />
              )}
            </div>

            {loading ? (
              // Skeleton Loading
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="animate-pulse h-40 w-40 rounded-full bg-muted"></div>
                <div className="animate-pulse h-4 w-48 bg-muted rounded"></div>
                <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
              </div>
            ) : results ? (
              <div className="flex-1 flex flex-col">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-500">
                    {Array.isArray(results) && results.filter(r => r.value >= r.normalRange.min && r.value <= r.normalRange.max).length}                    </div>
                    <div className="text-xs text-muted-foreground">Normal</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {Array.isArray(results) && results.filter(r => r.value > r.normalRange.max).length}
                    </div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {Array.isArray(results) && results.filter(r => r.value < r.normalRange.min).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </Card>
                </div>

                {/* Critical Alerts */}
                {Array.isArray(results) && results.some(r => r.critical) && (
                  <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-500">Critical Values Detected</AlertTitle>
                    <AlertDescription className="text-xs text-red-500/80">
                      {Array.isArray(results) && results.filter(r => r.critical).length} test results require immediate attention
                    </AlertDescription>
                  </Alert>
                )}

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {results[0]?.lastUpdated || "Unknown"}</span>
                </div>

                {/* Health Score Visualization */}
                <div className="mb-4">
                  {/* ... Health Score ... */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Health Score</span>
                    <span className="text-sm font-bold">
                      {Math.round(
                        (Array.isArray(results) && results.filter(r => r.value >= r.normalRange.min && r.value <= r.normalRange.max).length /
                          results.length) * 100
                      )}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{
                        width: `${(Array.isArray(results) && results.filter(r => r.value >= r.normalRange.min && r.value <= r.normalRange.max).length /
                          results.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* View Detailed Results Button */}
                <Button
                  variant="outline"
                  className="mt-auto"
                  onClick={() => document.getElementById('detailed-results')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Detailed Results
                </Button>
              </div>
            ) : error ? null : ( // Conditionally render "Upload a test report..." only when no error and not loading
              <div className="flex flex-1 items-center justify-center text-sm sm:text-base text-muted-foreground text-center">
                Upload a test report to see analysis results
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Results Section */}
      {results && (
        <div id="detailed-results" className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Detailed Test Results</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full overflow-x-auto flex justify-start p-1 space-x-1">
              <TabsTrigger value="all" className="flex-shrink-0">All Tests</TabsTrigger>
              <TabsTrigger value="critical" className="flex-shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical
              </TabsTrigger>
              {uniqueCategories.map(category => (
                <TabsTrigger key={category} value={category.toLowerCase()} className="flex-shrink-0">{category}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {Array.isArray(filteredResults) ? (
              filteredResults.map((test) => (
                <Card
                  key={test.name}
                  className={`overflow-hidden ${test.critical ? "border-red-200 dark:border-red-900" : ""}`}
                >
                  {/* ... Card Content for each Test Result ... */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{test.name}</h3>
                        {test.critical && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(test.trend)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleTestExpansion(test.name)}
                        >
                          {expandedTest === test.name ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                         {/* Chat Icon Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link href={`/chatbot?query=Tell me more about ${test.name} medical test.`} title={`Ask about ${test.name}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <SaveButton
                          onSave={() => handleSaveIndividualTest(test)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        />
                      </div>
                    </div>

                    {/* Value Gauge Visualization */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Low</span>
                        <span>Normal Range</span>
                        <span>High</span>
                      </div>
                      <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-green-100 dark:bg-green-900/30"
                          style={{
                            left: `${(test.normalRange.min / (test.normalRange.max * 1.5)) * 100}%`,
                            width: `${((test.normalRange.max - test.normalRange.min) / (test.normalRange.max * 1.5)) * 100}%`
                          }}
                        ></div>

                        {/* Value Indicator */}
                        <div
                          className={`absolute h-full w-1 bg-black dark:bg-white`}
                          style={{
                            left: `${(test.value / (test.normalRange.max * 1.5)) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                        ></div>

                        {/* Value Label */}
                        <div
                          className={`absolute top-0 -mt-6 transform -translate-x-1/2 ${getStatusColor(test.value, test.normalRange.min, test.normalRange.max)
                            }`}
                          style={{
                            left: `${(test.value / (test.normalRange.max * 1.5)) * 100}%`,
                          }}
                        >
                          <span className="text-xs font-bold">{test.value}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(test.value, test.normalRange.min, test.normalRange.max)}
                        <span
                          className={`text-xs font-medium ${getStatusColor(test.value, test.normalRange.min, test.normalRange.max)
                            }`}
                        >
                          {getStatusText(test.value, test.normalRange.min, test.normalRange.max)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Range: {test.normalRange.min}-{test.normalRange.max} {test.unit}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTest === test.name && (
                    <div className="p-4 bg-muted/10">
                      {/* ... Expanded Details Content ... */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Category</div>
                          <div className="text-sm font-medium">{test.category}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Percentile</div>
                          <div className="text-sm font-medium">{test.percentile}th</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Current Value</div>
                          <div className="text-sm font-medium">{test.value} {test.unit}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Last Updated</div>
                          <div className="text-sm font-medium">{test.lastUpdated}</div>
                        </div>
                      </div>
                      {test.interpretation && (
                        <div className="space-y-2 mt-4">
                          <div className="text-xs text-muted-foreground">Interpretation</div>
                          <div className="text-sm font-medium text-wrap">{test.interpretation}</div>
                      </div>
                     )}

                      {test.critical && (
                        <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <AlertTitle className="text-red-500">Critical Value</AlertTitle>
                          <AlertDescription className="text-xs text-red-500/80">
                            This test result requires immediate medical attention. Please consult with your healthcare provider.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                {results === null ? "No results to display yet." : "Error loading results."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}