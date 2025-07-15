"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import {
  Camera,
  Sun,
  Moon,
  Monitor,
  Clock,
  AlertCircle,
  FileDown,
  History,
  Microscope,
  Pill,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  ShieldAlert,
  Trash2,
  Search,
  Filter,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Clipboard,
  Utensils,
  Sparkles,
  Printer,
  Download,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Badge } from "@/components/ui/badge";
import type * as z from "zod";
import { useHistory } from "@/hooks/use-history";
import { HistoryItem } from "@/lib/types/history";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormData = z.infer<typeof profileSchema>;

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    borderBottom: "1 solid #eee",
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#1a365d",
  },
  subheading: {
    fontSize: 14,
    marginBottom: 5,
    color: "#4a5568",
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: "#2d3748",
  },
  resultItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f7fafc",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2b6cb0",
  },
  resultValue: {
    fontSize: 12,
    color: "#4a5568",
  },
  warningText: {
    fontSize: 12,
    color: "#c53030",
    marginTop: 5,
  },
});

// Enhanced PDF Document Component
const UserReport = ({
  user,
  history,
}: {
  user: any;
  history: HistoryItem[];
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Health Report Summary</Text>
        <Text style={styles.subheading}>Patient Information</Text>
        <Text style={styles.text}>Name: {user?.username || "N/A"}</Text>
        <Text style={styles.text}>Email: {user?.email || "N/A"}</Text>
        <Text style={styles.text}>Gender: {user?.gender || "N/A"}</Text>
        <Text style={styles.text}>
          Report Generated: {format(new Date(), "PPP")}
        </Text>
      </View>

      {history.map((item, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.subheading}>
            {item.type === "prescription"
              ? "Prescription Analysis"
              : "Medical Test Results"}
          </Text>
          <Text style={styles.text}>
            Date: {format(new Date(item.uploadedAt), "PPP")}
          </Text>

          {item.type === "prescription" && item.results.medicines && (
            <View>
              <Text style={styles.subheading}>Prescribed Medications:</Text>
              {item.results.medicines.map((medicine: any, idx: number) => (
                <View key={idx} style={styles.resultItem}>
                  <Text style={styles.resultTitle}>{medicine.name}</Text>
                  <Text style={styles.text}>Dosage: {medicine.dosage}</Text>
                  <Text style={styles.text}>
                    Frequency: {medicine.frequency}
                  </Text>
                  {medicine.warnings && medicine.warnings.length > 0 && (
                    <Text style={styles.warningText}>
                      Warnings: {medicine.warnings.join(", ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {item.type === "medical-test" && item.results.tests && (
            <View>
              <Text style={styles.subheading}>Test Results:</Text>
              {item.results.tests.map((test: any, idx: number) => (
                <View key={idx} style={styles.resultItem}>
                  <Text style={styles.resultTitle}>{test.name}</Text>
                  <Text style={styles.text}>
                    Value: {test.value} {test.unit}
                  </Text>
                  <Text style={styles.text}>Status: {test.status}</Text>
                  {test.normalRange && (
                    <Text style={styles.text}>
                      Normal Range: {test.normalRange.min} -{" "}
                      {test.normalRange.max} {test.unit}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.text}>
          This report is generated automatically and should be reviewed by a
          healthcare professional. The information provided is for reference
          only.
        </Text>
      </View>
    </Page>
  </Document>
);

export default function ProfilePage() {
  const {
    user,
    updateUser,
    fetchUserProfile,
    isLoading: authIsLoading,
    getUserId,
  } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedResult, setSelectedResult] = useState<HistoryItem | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "personal";

  // Use real history data from the hook
  const { 
    history, 
    isLoading: historyLoading, 
    error: historyError,
    deleteHistoryItem,
    getPrescriptionHistory,
    getMedicalTestHistory 
  } = useHistory();

  // Filter history based on search term and active tab
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type === 'prescription' && item.results.medicines?.some((m: any) => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (item.type === 'medical-test' && item.results.tests?.some((t: any) => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    if (activeHistoryTab === "all") return matchesSearch;
    if (activeHistoryTab === "prescription") return item.type === "prescription" && matchesSearch;
    if (activeHistoryTab === "medical-test") return item.type === "medical-test" && matchesSearch;
    
    return matchesSearch;
  });

  const form = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? "",
      email: user?.email ?? "",
      phone: "",
    },
  });

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      // Ensure user and user.id exist before fetching
      fetchUserProfile(userId).catch((error) => {
        console.error("Error fetching user profile on profile page:", error);
        // Handle error appropriately, maybe show a toast message
        toast.error("Failed to load profile data.");
      });
    }
  }, [getUserId, fetchUserProfile]);

  const onSubmit = async (data: FormData) => {
    try {
      // Removed redundant setIsLoading(true); - authIsLoading from useAuth is used
      await updateUser(data);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      // Removed redundant setIsLoading(false); - authIsLoading from useAuth is used
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTestExpansion = (testId: string) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  const getTimeIcon = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case "morning":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />;
      case "afternoon":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />;
      case "evening":
        return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />;
      case "night":
        return <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />;
      case "multiple":
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />;
      default:
        return (
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        );
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Helper functions for medical test status
  const getStatusColor = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return "text-green-600";
    if (value > max) return "text-red-600";
    return "text-blue-600";
  };

  const getStatusIcon = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (value > max) return <TrendingUp className="h-3 w-3 text-red-600" />;
    return <TrendingDown className="h-3 w-3 text-blue-600" />;
  };

  const getStatusText = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return "Normal";
    if (value > max) return "High";
    return "Low";
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    switch (trend.toLowerCase()) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-4 sm:px-6 sm:py-8 lg:py-12">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          My Health Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage your health information and view your medical history
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="mb-6 overflow-hidden sm:mb-8">
        <div className="gradient-bg p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-full border-4 border-white/20 object-cover sm:h-28 sm:w-28">
                <AvatarFallback className="text-4xl font-bold">{user?.username?.charAt(0) || "N/A"}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                asChild
              >
                <label>
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </Button>
            </div>
            <div className="text-center sm:flex-1 sm:text-left">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                {user?.username}
              </h2>
              <p className="text-sm text-white/80 sm:text-base">
                {user?.email}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3" /> Member since 2024
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  <AlertCircle className="h-3 w-3" /> Complete Profile
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="h-8 text-xs sm:h-9 sm:text-sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
              <PDFDownloadLink
                document={<UserReport user={user} history={history} />}
                fileName="health-report.pdf"
              >
                {({ loading }: { loading: boolean }) => (
                  <Button
                    variant="secondary"
                    className="h-8 text-xs sm:h-9 sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Download Report
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="p-4 sm:p-6">
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="flex w-full items-center justify-start gap-1 overflow-x-auto rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">
                Medical History
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Full Name</Label>
                    <Input
                      id="username"
                      {...form.register("username")}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" className="text-sm" disabled={authIsLoading}>
                      {authIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {/* History Header with Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Medical History</h3>
                    <Badge variant="secondary" className="ml-2">
                      {filteredHistory.length} items
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    
                    {/* Filter Tabs */}
                    <Tabs value={activeHistoryTab} onValueChange={setActiveHistoryTab} className="w-full sm:w-auto">
                      <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="prescription" className="text-xs">
                          <Pill className="h-3 w-3 mr-1" />
                          Prescriptions
                        </TabsTrigger>
                        <TabsTrigger value="medical-test" className="text-xs">
                          <Microscope className="h-3 w-3 mr-1" />
                          Tests
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Loading State */}
                {historyLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading history...</span>
                  </div>
                )}

                {/* Error State */}
                {historyError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{historyError}</AlertDescription>
                  </Alert>
                )}

                {/* History Items */}
                {!historyLoading && !historyError && filteredHistory.length > 0 && (
                  <div className="space-y-4">
                    {filteredHistory.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="gradient-bg p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.type === "prescription" ? (
                            <Pill className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                          ) : (
                            <Microscope className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                          )}
                              <div>
                          <h4 className="text-sm font-medium text-white sm:text-base">
                            {item.fileName}
                          </h4>
                                <p className="text-xs text-white/80">
                                  {format(new Date(item.uploadedAt), "PPP")}
                                </p>
                        </div>
                            </div>
                            <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white hover:text-white/80 sm:h-8 sm:w-8"
                          onClick={() => toggleTestExpansion(item.id)}
                        >
                          {expandedTest === item.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:text-red-300 sm:h-8 sm:w-8"
                                onClick={() => deleteHistoryItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                      </div>
                          </div>
                    </div>

                    {expandedTest === item.id && (
                      <div className="p-3 sm:p-4">
                        {item.type === "prescription" && (
                          <div className="space-y-3">
                                {item.results.medicines?.map((medicine: any) => (
                                  <Card key={medicine.id} className="overflow-hidden">
                                <div className="gradient-bg p-2.5 sm:p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                                          {medicine.name}
                                        </h3>
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
                                          asChild
                                        >
                                          <Link href={`/chatbot?query=Tell me more about ${medicine.name} medicine.`} title={`Ask about ${medicine.name}`}>
                                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                                          {medicine.instructions.slice(0, 2).map((instruction: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                                              <span className="line-clamp-2">{instruction}</span>
                                    </div>
                                          ))}
                                  </div>
                                      )}

                                      <div className="flex justify-between items-center pt-2 border-t">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                                          onClick={() => handleCopyToClipboard(`${medicine.name} ${medicine.dosage || ""} - ${medicine.frequency || ""}`)}
                                        >
                                          <Clipboard className="h-3 w-3 mr-1 shrink-0" />
                                          <span className="hidden xs:inline">Copy</span>
                                        </Button>
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
                        )}

                        {item.type === "medical-test" && (
                          <div className="space-y-3">
                                {item.results.tests?.map((test: any) => (
                                  <Card key={test.name} className={`overflow-hidden ${test.critical ? "border-red-200 dark:border-red-900" : ""}`}>
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
                                            asChild
                                          >
                                            <Link href={`/chatbot?query=Tell me more about ${test.name} medical test.`} title={`Ask about ${test.name}`}>
                                              <MessageSquare className="h-4 w-4" />
                                            </Link>
                                          </Button>
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
                                            className={`absolute top-0 -mt-6 transform -translate-x-1/2 ${getStatusColor(test.value, test.normalRange.min, test.normalRange.max)}`}
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
                                          <span className={`text-xs font-medium ${getStatusColor(test.value, test.normalRange.min, test.normalRange.max)}`}>
                                            {getStatusText(test.value, test.normalRange.min, test.normalRange.max)}
                                                </span>
                                              </div>
                                        <span className="text-xs text-muted-foreground">
                                          Range: {test.normalRange.min}-{test.normalRange.max} {test.unit}
                                        </span>
                                        </div>
                                      </div>

                                    {test.interpretation && (
                                      <div className="p-4 bg-muted/10">
                                        <div className="space-y-2">
                                          <div className="text-xs text-muted-foreground">Interpretation</div>
                                          <div className="text-sm font-medium text-wrap">{test.interpretation}</div>
                                    </div>
                                </div>
                                    )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
                  </div>
                )}

                {/* Empty State */}
                {!historyLoading && !historyError && filteredHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                    <History className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No History Found</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {searchTerm ? "No items match your search criteria." : "You haven't saved any prescriptions or medical tests yet."}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href="/prescription">
                          <Pill className="mr-2 h-4 w-4" />
                          Upload Prescription
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/medical-tests">
                          <Microscope className="mr-2 h-4 w-4" />
                          Upload Test Results
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="space-y-4">
                <Card>
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Theme</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme-switcher">Appearance</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTheme("light")}
                          active={theme === "light"}
                        >
                          <Sun className="h-4 w-4 mr-2" /> Light
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTheme("dark")}
                          active={theme === "dark"}
                        >
                          <Moon className="h-4 w-4 mr-2" /> Dark
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTheme("system")}
                          active={theme === "system"}
                        >
                          <Monitor className="h-4 w-4 mr-2" /> System
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}