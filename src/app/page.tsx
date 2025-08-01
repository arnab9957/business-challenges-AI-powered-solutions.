
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateSolutions } from '@/ai/flows/generate-solutions';
import type { GenerateSolutionsOutput } from '@/ai/schemas/generate-solutions-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/loader';
import { Logo } from '@/components/icons/logo';
import {
  Lightbulb,
  Briefcase,
  MessageSquareText,
  ArrowRight,
  Target,
  BarChart,
  ListChecks,
  ChevronLeft
} from 'lucide-react';

const commonProblems = [
  { id: 'low_sales', label: 'Low Sales / Revenue' },
  { id: 'marketing_ineffective', label: 'Ineffective Marketing' },
  { id: 'high_costs', label: 'High Operational Costs' },
  { id: 'customer_retention', label: 'Poor Customer Retention' },
  { id: 'employee_turnover', label: 'High Employee Turnover' },
  { id: 'supply_chain', label: 'Supply Chain Issues' },
] as const;

const formSchema = z.object({
  businessContext: z.string().optional(),
  commonProblems: z.array(z.string()).optional(),
  customProblem: z.string().min(10, 'Please describe your problem in more detail.'),
});

type FormData = z.infer<typeof formSchema>;


export default function Home() {
  const [result, setResult] = useState<GenerateSolutionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, register, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessContext: '',
      commonProblems: [],
      customProblem: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const selectedProblems = data.commonProblems
        ?.map(id => commonProblems.find(p => p.id === id)?.label)
        .filter(Boolean) as string[];

      const response = await generateSolutions({
        businessContext: data.businessContext || 'Not provided',
        commonProblems: selectedProblems,
        customProblem: data.customProblem,
      });

      if (!response || !response.solutions || !response.kpis) {
        throw new Error('Failed to generate a valid response from AI.');
      }
      
      setResult(response);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate solutions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const renderDashboard = () => (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              Your Action Plan
            </h1>
          </div>
          <Button onClick={handleReset} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks /> Recommended Solutions</CardTitle>
                <CardDescription>
                  Actionable steps to address your business problems.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result?.solutions.map((rec, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-secondary rounded-md">
                      <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0"/>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target /> Key Performance Indicators</CardTitle>
                   <CardDescription>Metrics to track the success of your solutions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {result?.kpis.map((kpi, index) => (
                      <li key={index} className="flex items-start gap-4 p-4 bg-secondary rounded-md">
                         <BarChart className="h-5 w-5 mt-1 text-primary shrink-0"/>
                         <span className="text-sm">{kpi}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
      </div>
    );

  const renderForm = () => (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {isLoading && <Loader text="Generating your solutions..." />}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Logo className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              SME Insights Navigator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Describe your business challenges and get AI-powered solutions.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase /> Business Context</CardTitle>
              <CardDescription>Provide some background about your company. (Optional)</CardDescription>
            </CardHeader>
            <CardContent>
                <Controller
                  name="businessContext"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} placeholder="e.g., We are a small e-commerce business selling handmade jewelry. Our revenue has been flat for the last 6 months." className="h-24" />
                  )}
                />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> Common Problems</CardTitle>
              <CardDescription>Select any common challenges your business is facing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="commonProblems"
                control={control}
                render={({ field }) => (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {commonProblems.map((problem) => (
                      <div key={problem.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={problem.id}
                          checked={field.value?.includes(problem.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), problem.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== problem.id
                                  )
                                );
                          }}
                        />
                        <Label htmlFor={problem.id} className="font-normal cursor-pointer -translate-y-0.5">
                          {problem.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquareText /> Describe Your Main Problem</CardTitle>
              <CardDescription>In your own words, what is the single biggest challenge you want to solve?</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="customProblem"
                control={control}
                render={({ field }) => (
                  <>
                    <Textarea {...field} placeholder="Describe your primary goal, main operational issue, key market concern, etc." className="h-32" />
                    {errors.customProblem && <p className="text-sm text-destructive mt-2">{errors.customProblem.message}</p>}
                  </>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-gradient-to-r from-accent to-primary text-primary-foreground font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              Generate Solutions
              <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background">
      {result ? renderDashboard() : renderForm()}
    </main>
  )
}
