"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  X,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  Pill,
  Info,
  CheckCircle,
  AlarmClock,
  Sun,
  Moon,
  Utensils,
  Sparkles,
  Printer,
  Download,
  Clipboard,
  Zap,
  MessageSquare, // MessageSquare icon here
  XCircle,
  RefreshCw,
  Camera,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { mainAPI } from "@/lib/axios"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SaveButton } from "@/components/save-button";
import { useHistory } from "@/hooks/use-history";

interface ExtractedMedicine {
  id: number
  name: string
  confidence: number
  possibleMatches: string[]
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string[]
  warnings?: string[]
  category?: string
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "multiple"
  withFood?: boolean
  withWater?: boolean
}

export default function PrescriptionPage() {
  "use client"
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [results, setResults] = useState<ExtractedMedicine[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const { user, addToFavorites } = useAuth()
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const resultsCardRef = useRef<HTMLDivElement>(null);
  const { savePrescription } = useHistory();

  useEffect(() => {
    if (results) {
      const categories = new Set<string>();
      results.forEach(medicine => {
        if (medicine.category && medicine.category.toLowerCase() !== 'expired') {
          categories.add(medicine.category);
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
    setError(null);
    setLoading(true);
    setProcessingStage('Sending prescription for analysis...');

    try {
      if (!file) {
        setError('Please select a prescription image to analyze.');
        setLoading(false);
        setProcessingStage(null);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setProcessingStage('Waiting for analysis results from server...');

      const response = await mainAPI.post('/extract-prescriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("API Response:", response);

      if (response.status === 200) {
        if (Array.isArray(response.data.prescriptions)) {
          if (response.data.prescriptions.length === 0) {
            setError("No medicines detected in the prescription. Please try again or upload a clearer image.");
            setProcessingStage("Analysis failed: No medicines detected.");
            setTimeout(() => setProcessingStage(null), 3000);
          } else {
            setProcessingStage('Processing analysis results...');
            setResults(response.data.prescriptions);
            console.log('Prescription Analysis Results:', response.data);
            setProcessingStage('Analysis complete.');
            setTimeout(() => setProcessingStage(null), 2000);
          }
        } else if (response.data.prescriptions && typeof response.data.prescriptions === 'object' && response.data.prescriptions.error) {
          const serverError = response.data.prescriptions.error;
          setError(`Server Error: ${serverError}. Please check the uploaded file or try again.`);
          console.error("Server JSON Parsing Error:", serverError);
          setProcessingStage("Analysis failed due to server error.");
          setTimeout(() => setProcessingStage(null), 3000);
        }
        else {
          console.error("API response 'prescriptions' is not an array or error object:", response.data);
          setError("Analysis failed: Unexpected data format from server. Please check the server response.");
          setProcessingStage("Analysis failed.");
          setTimeout(() => setProcessingStage(null), 3000);
        }
      } else if (response.status === 400) {
        const errorDetail = response.data?.error || "Analysis failed: No medicines detected.";
        setError(errorDetail);
        console.error("API Error (400 - No Medicines):", response.status, response.data);
        setProcessingStage("Analysis failed: No medicines detected.");
        setTimeout(() => setProcessingStage(null), 3000);
      }
      else {
        const errorDetail = response.data?.error || "Unknown error from server";
        setError(`Analysis failed: Server responded with status ${response.status}. Detail: ${errorDetail}`);
        console.error("API Error:", response.status, response.data);
        setProcessingStage("Analysis failed.");
        setTimeout(() => setProcessingStage(null), 3000);
      }
    } catch (err: any) {
      let errorMessage = "Failed to analyze the prescription. Please try again.";
      if (err.response?.data?.error) {
        errorMessage = `Analysis failed: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `Analysis failed: Network error - ${err.message}`;
      }
      setError(errorMessage);
      console.error('Prescription Analysis Error:', err);
      setProcessingStage('Analysis failed');
      setTimeout(() => setProcessingStage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setResults(null)
    setError(null)
    setProcessingStage(null)
    setActiveTab("all");
  }

  const handleCancel = () => {
    if (loading) {
      setLoading(false)
      setProcessingStage(null)
    }
    handleClear()
  }

  const handleSaveToFavorites = (medicine: ExtractedMedicine) => {
    if (!user) {
      toast.error("Please log in to save medicines to favorites")
      return
    }

    addToFavorites({
      id: medicine.id,
      name: medicine.name,
      category: medicine.category || "Unknown",
      dosage: medicine.dosage || "Not specified",
      usage: medicine.instructions?.join(", ") || "No instructions available",
      sideEffects: medicine.warnings || [],
      rating: 4.5,
      reviews: 120
    })

    toast.success(`${medicine.name} added to favorites`)
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (!resultsCardRef.current) {
      toast.error("Could not share the results card.");
      return;
    }

    try {
      const canvas = await html2canvas(resultsCardRef.current);
      const dataURL = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'prescription-card.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Prescription card downloaded as image!");

    } catch (error) {
      console.error("Error taking screenshot:", error);
      toast.error("Failed to take screenshot and share.");
    }
  }


  const handleDownload = () => {
    if (!results || results.length === 0 || !preview) {
      toast.error("No results to download as PDF.");
      return;
    }

    const pdfDoc = new jsPDF('p', 'mm', 'a4');
    pdfDoc.setFontSize(20);
    pdfDoc.text('Prescription Analysis Report', 15, 20);

    const imgProps= pdfDoc.getImageProperties(preview);
    const pdfWidth = pdfDoc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdfDoc.addImage(preview, 'JPEG', 15, 30, pdfWidth - 30, pdfHeight);

    let yPosition = 30 + pdfHeight + 10;

    pdfDoc.setFontSize(16);
    pdfDoc.text('Detected Medicines:', 15, yPosition);
    yPosition += 10;

    pdfDoc.setFontSize(12);
    results.forEach((medicine, index) => {
      pdfDoc.text(`${index + 1}. ${medicine.name}`, 15, yPosition);
      yPosition += 7;
      if (medicine.dosage) {
        pdfDoc.text(`   Dosage: ${medicine.dosage}`, 15, yPosition);
        yPosition += 7;
      }
      if (medicine.frequency) {
        pdfDoc.text(`   Frequency: ${medicine.frequency}`, 15, yPosition);
        yPosition += 7;
      }
      if (medicine.instructions && medicine.instructions.length > 0) {
        pdfDoc.text(`   Instructions: ${medicine.instructions.join(', ')}`, 15, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
      if (yPosition > pdfDoc.internal.pageSize.getHeight() - 20) {
        pdfDoc.addPage();
        yPosition = 20;
      }
    });

    pdfDoc.save('prescription-report.pdf');
    toast.success("Prescription downloaded as PDF!");
  }

  const getTimeIcon = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case "morning":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
      case "afternoon":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
      case "evening":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
      case "night":
        return <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
      case "multiple":
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
      default:
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
    }
  }

  const filteredResults = results
    ? activeTab === "all"
      ? results
      : results.filter((medicine) =>
          medicine.category?.toLowerCase() === activeTab.toLowerCase())
    : null

  useEffect(() => {
    console.log("Results state updated:", results);
    console.log("Filtered Results:", filteredResults);
    console.log("Unique Categories:", uniqueCategories);
  }, [results, filteredResults, activeTab, uniqueCategories]);

  const ErrorDisplay = ({ message }: { message: string }) => (
    <Card className="p-6 border-destructive/50 bg-destructive/5">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-destructive">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={handleAnalyze}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  );

  const handleSavePrescription = async () => {
    if (!results || !file) return false;
    
    const fileName = file.name || `prescription_${new Date().toISOString()}`;
    
    return await savePrescription({
      fileName,
      results: {
        medicines: results
      }
    });
  };

  const handleSaveIndividualMedicine = async (medicine: ExtractedMedicine) => {
    if (!file) return false;
    
    const fileName = `${medicine.name}_${new Date().toISOString()}`;
    
    return await savePrescription({
      fileName,
      results: {
        medicines: [medicine]
      }
    });
  };

  return (
    <div className="container max-w-6xl py-4 sm:py-8">
      <div className="mb-4 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold">Prescription Analysis</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Upload your prescription for instant medicine detection and detailed instructions
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorDisplay message={error} />
        </div>
      )}

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="p-3 sm:p-6">
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
                      "Analyze Prescription"
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
                <div className="mb-6 relative">
                  <div className="absolute -inset-4 rounded-full bg-primary/10 blur-lg" />
                  <Upload className="relative h-12 w-12 text-primary" />
                </div>
                <p className="mb-2 text-base sm:text-lg font-medium text-center">
                  Drag and drop your prescription here
                </p>
                <p className="mb-4 text-xs sm:text-sm text-muted-foreground text-center">
                  We support JPG, PNG, and PDF files up to 10MB
                </p>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    Choose File
                  </label>
                </Button>

                <div className="mt-8 w-full">
                  <p className="text-xs text-muted-foreground text-center mb-4">Our AI-powered prescription analyzer can:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Pill, text: "Identify medications" },
                      { icon: Info, text: "Extract dosage info" },
                      { icon: AlarmClock, text: "Detect frequency" },
                      { icon: Calendar, text: "Determine duration" },
                      { icon: Zap, text: "Find interactions" },
                      { icon: Sparkles, text: "Suggest alternatives" }
                    ].map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3 text-primary shrink-0" />
                          <span className="line-clamp-1">{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Results Section */}
        <Card className="p-3 sm:p-6" ref={resultsCardRef} id="results-card">
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
                <h2 className="text-lg sm:text-xl font-semibold truncate">Detected Medicines</h2>
              </div>

              {results && (
                <div className="flex items-center gap-1 sm:gap-2 ml-2 shrink-0">
                  <SaveButton
                    onSave={handleSavePrescription}
                    size="sm"
                    variant="outline"
                    className="h-8 sm:h-9"
                  />
                  <Button variant="ghost" size="icon" onClick={handlePrint} title="Print" className="h-8 w-8 sm:h-9 sm:w-9">
                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownload} title="Download" className="h-8 w-8 sm:h-9 sm:w-9">
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Sparkles className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{processingStage}</p>
                  <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                </div>
                <div className="w-full max-w-xs bg-muted h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress"></div>
                </div>
              </div>
            ) : results ? (
              <div className="flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <ScrollArea className="w-full" orientation="horizontal">
                    <TabsList className="inline-flex w-max p-1 space-x-1">
                      <TabsTrigger value="all" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">All</TabsTrigger>
                      {uniqueCategories.map(category => (
                        <TabsTrigger key={category} value={category.toLowerCase()} className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">{category}</TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>
                </Tabs>

                <ScrollArea className="flex-1 pr-2 sm:pr-4">
                  <div className="space-y-3 sm:space-y-4">
                    {filteredResults?.map((medicine) => (
                      <Card key={medicine.id} className="overflow-hidden">
                        <div className="gradient-bg p-2.5 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <h3 className="font-semibold text-white text-sm sm:text-base truncate">{medicine.name}</h3>
                                <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs h-5 px-1.5">
                                  {medicine.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-white/80">
                                  {getTimeIcon(medicine.timeOfDay)}
                                  <span className="truncate">{medicine.frequency}</span>
                                </div>
                                {medicine.withFood && (
                                  <div className="flex items-center gap-1 text-xs text-white/80">
                                    <Utensils className="h-3 w-3 shrink-0" />
                                    <span>With food</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-white/80 h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                              asChild // Make it a Link
                            >
                              <Link href={`/chatbot?query=Tell me more about ${medicine.name} medicine.`} title={`Ask about ${medicine.name}`}>
                                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {/* Replaced Camera with MessageSquare */}
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
                            <Pill className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                            <span className="font-medium">{medicine.dosage}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{medicine.duration}</span>
                          </div>

                          {medicine.instructions && medicine.instructions.length > 0 && (
                            <div className="space-y-1 sm:space-y-1.5">
                              {medicine.instructions.slice(0, 2).map((instruction, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="line-clamp-2">{instruction}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                                onClick={() => handleCopyToClipboard(`${medicine.name} ${medicine.dosage || ""} - ${medicine.frequency || ""}`)}
                              >
                                <Clipboard className="h-3 w-3 mr-1 shrink-0" />
                                <span className="hidden xs:inline">Copy</span>
                              </Button>
                              <SaveButton
                                onSave={() => handleSaveIndividualMedicine(medicine)}
                                size="sm"
                                variant="ghost"
                                className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                              />
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                            >
                              <Link href={`/recommendation?search=${medicine.name}`}>
                                <Search className="h-3 w-3 mr-1 shrink-0" />
                                <span className="hidden xs:inline">Learn More</span>
                                <span className="inline xs:hidden">Details</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm sm:text-base text-muted-foreground text-center">
                <div className="max-w-xs">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Upload a prescription to see detected medicines</p>
                  <p className="text-xs text-muted-foreground">
                    Our AI will analyze your prescription and extract medicine names, dosages, and instructions
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {results && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Next Steps</h2>

          <Card className="p-3 sm:p-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 shrink-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Complete Your Course</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Finish all prescribed medications, even if you feel better before they're gone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Watch for Side Effects</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Contact your doctor if you experience any unusual symptoms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10" asChild>
                  <Link href="/chatbot">
                    <MessageSquare className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">Ask our AI about your medications</span>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10" asChild>
                  <Link href="/recommendation">
                    <Search className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">Browse medicine information</span>
                  </Link>
                </Button>

                <Alert className="mt-2 sm:mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 p-2 sm:p-4">
                  <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
                  <div>
                    <AlertTitle className="text-amber-500 text-xs sm:text-sm">Important Note</AlertTitle>
                    <AlertDescription className="text-xs text-amber-500/80">
                      This analysis is for informational purposes only. Always follow your doctor's instructions.
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}