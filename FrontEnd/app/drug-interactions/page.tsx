'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InlineAlert, InlineAlertTitle, InlineAlertDescription } from '@/components/ui/inline-alert';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Pill, 
  Plus, 
  X, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Loader2,
  Shield,
  Activity
} from 'lucide-react';
import { useDrugInteractions } from '@/hooks/use-drug-interactions';
import { DrugInteraction } from '@/lib/types/drug-interaction';
import { AlertService } from '@/lib/alerts';

// Form validation schema
const drugInteractionSchema = z.object({
  primaryDrug: z.string().min(1, 'Primary drug is required'),
});

type FormData = z.infer<typeof drugInteractionSchema>;

// Sample drug suggestions for better UX
const SAMPLE_DRUGS = [
  'Simvastatin', 'Clarithromycin', 'Warfarin', 'Aspirin', 'Metformin',
  'Lisinopril', 'Amlodipine', 'Omeprazole', 'Ibuprofen', 'Acetaminophen'
];

export default function DrugInteractionsPage() {
  const [newRelatedDrug, setNewRelatedDrug] = useState('');
  const {
    isLoading,
    result,
    error,
    checkInteractions,
    clearResults,
    addRelatedDrug,
    removeRelatedDrug,
    updatePrimaryDrug,
    hasInteractions,
    totalDrugsChecked,
    drugsWithInteractions,
    relatedDrugs,
  } = useDrugInteractions();

  const form = useForm<FormData>({
    resolver: zodResolver(drugInteractionSchema),
    defaultValues: {
      primaryDrug: '',
    },
  });

  // Sync form with hook state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'primaryDrug' && value.primaryDrug) {
        updatePrimaryDrug(value.primaryDrug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updatePrimaryDrug]);

  const handleSubmit = async (data: FormData) => {
    if (!data.primaryDrug.trim()) {
      AlertService.error('Please enter a primary drug');
      return;
    }

    if (relatedDrugs.length === 0) {
      AlertService.error('Please add at least one related drug to check');
      return;
    }

    await checkInteractions({
      primary_drug: data.primaryDrug.trim(),
      related_drugs: relatedDrugs,
    });
  };

  const handleAddRelatedDrug = (drug: string) => {
    if (drug.trim()) {
      addRelatedDrug(drug.trim());
      setNewRelatedDrug('');
    }
  };

  const handleQuickCheck = async () => {
    await checkInteractions({
      primary_drug: 'Simvastatin',
      related_drugs: ['Clarithromycin', 'Warfarin', 'Aspirin'],
    });
  };

  const InteractionCard = ({ interaction }: { interaction: DrugInteraction }) => (
    <Card className={`transition-all duration-200 ${
      interaction.has_interactions 
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
        : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <CardTitle className="text-lg">{interaction.drug}</CardTitle>
          </div>
          <Badge variant={interaction.has_interactions ? 'destructive' : 'default'}>
            {interaction.has_interactions ? (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" />
                Interactions Found
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                No Interactions
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {interaction.has_interactions ? (
          <div className="space-y-2">
            {interaction.interactions.map((interactionText, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {interactionText}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">
              {interaction.message || 'No known interactions found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Drug Interaction Checker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Check for potential drug interactions between your primary medication and other drugs. 
            Get instant results to ensure your medication safety.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Check Drug Interactions</span>
                </CardTitle>
                <CardDescription>
                  Enter your primary drug and related drugs to check for potential interactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Primary Drug */}
                    <FormField
                      control={form.control}
                      name="primaryDrug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Drug *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Simvastatin"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Related Drugs */}
                    <div className="space-y-3">
                      <Label>Related Drugs *</Label>
                      
                      {/* Add new drug input */}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="e.g., Clarithromycin"
                          value={newRelatedDrug}
                          onChange={(e) => setNewRelatedDrug(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddRelatedDrug(newRelatedDrug);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddRelatedDrug(newRelatedDrug)}
                          disabled={!newRelatedDrug.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Sample drugs */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Quick add sample drugs:</p>
                        <div className="flex flex-wrap gap-2">
                          {SAMPLE_DRUGS.map((drug) => (
                            <Button
                              key={drug}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddRelatedDrug(drug)}
                              className="text-xs"
                            >
                              {drug}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Added drugs */}
                      {relatedDrugs.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Drugs to check:</p>
                          <div className="flex flex-wrap gap-2">
                            {relatedDrugs.map((drug, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                <span>{drug}</span>
                                <button
                                  type="button"
                                  onClick={() => removeRelatedDrug(index)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isLoading || !form.watch('primaryDrug') || relatedDrugs.length === 0}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Check Interactions
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleQuickCheck}
                        disabled={isLoading}
                      >
                        Quick Demo
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Error Display */}
                {error && (
                  <InlineAlert variant="destructive">
                    <InlineAlertTitle>Error</InlineAlertTitle>
                    <InlineAlertDescription>{error}</InlineAlertDescription>
                  </InlineAlert>
                )}
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>How it works</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <p>Enter your primary medication and other drugs you're taking</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <p>Our system checks for known drug interactions</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <p>Get detailed results with safety recommendations</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <p>Always consult with your healthcare provider for medical advice</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Results Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {totalDrugsChecked}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Drugs Checked
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {drugsWithInteractions}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Interactions Found
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Primary Drug:</span>
                        <Badge variant="outline">{result.primary_drug}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearResults}
                      >
                        Clear Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Interactions List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Drug Interactions</h3>
                  {result.interactions.map((interaction, index) => (
                    <InteractionCard key={index} interaction={interaction} />
                  ))}
                </div>

                {/* Safety Notice */}
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Important Safety Notice
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          This tool provides general information about drug interactions. 
                          Always consult with your healthcare provider or pharmacist before 
                          making any changes to your medication regimen. This information 
                          should not replace professional medical advice.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Empty State */}
            {!result && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                    <p className="text-muted-foreground">
                      Enter your drugs above to check for potential interactions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 