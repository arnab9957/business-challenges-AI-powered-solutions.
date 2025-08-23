
"use client";

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateSolutions } from '@/ai/flows/generate-solutions';
import { processFeedback } from '@/ai/flows/process-feedback';
import type { GenerateSolutionsInput, GenerateSolutionsOutput } from '@/ai/schemas/generate-solutions-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Search,
} from 'lucide-react';

const commonProblems = [
  { id: 'low_sales', label: 'Low Sales / Revenue' },
  { id: 'marketing_ineffective', label: 'Ineffective Marketing' },
  { id: 'high_costs', label: 'High Operational Costs' },
  { id: 'customer_retention', label: 'Poor Customer Retention' },
  { id: 'employee_turnover', label: 'High Employee Turnover' },
  { id: 'supply_chain', label: 'Supply Chain Issues' },
  { id: 'cash_flow', label: 'Cash Flow Problems' },
  { id: 'competition', label: 'Intense Competition' },
  { id: 'technology', label: 'Outdated Technology' },
  { id: 'brand_awareness', label: 'Lack of Brand Awareness' },
] as const;

const formSchema = z.object({
  businessContext: z.string().optional(),
  commonProblems: z.array(z.string()).optional(),
  customProblem: z.string().min(10, 'Please describe your problem in more detail.'),
});

type FormData = z.infer<typeof formSchema>;


export default function Home() {
  const [lastInput, setLastInput] = useState<GenerateSolutionsInput | null>(null);
  const [result, setResult] = useState<GenerateSolutionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessContext: '',
      commonProblems: [],
      customProblem: '',
    },
  });

  const filteredProblems = useMemo(() => {
    if (!problemSearch) return commonProblems;
    return commonProblems.filter(p =>
      p.label.toLowerCase().includes(problemSearch.toLowerCase())
    );
  }, [problemSearch]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);
    setFeedbackSubmitted(false);
    try {
      const selectedProblems = data.commonProblems
        ?.map(id => commonProblems.find(p => p.id === id)?.label)
        .filter(Boolean) as string[];

      const input: GenerateSolutionsInput = {
        businessContext: data.businessContext || 'Not provided',
        commonProblems: selectedProblems,
        customProblem: data.customProblem,
      };

      setLastInput(input);
      const response = await generateSolutions(input);

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
    setLastInput(null);
    setFeedbackSubmitted(false);
  };
  
  const handleFeedback = async (feedback: 'helpful' | 'not_helpful') => {
    if (!lastInput || !result) return;
    setFeedbackSubmitted(true);

    try {
      await processFeedback({
        input: lastInput,
        output: result,
        feedback,
      });

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for helping us improve!',
      });
    } catch (error) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not submit feedback. Please try again.',
      });
      setFeedbackSubmitted(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-orange-950/20 via-background to-background">
      {isLoading && <Loader text="Generating your solutions..." />}
      
      {result ? (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
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
                        <div>
                           <h3 className="font-semibold mb-1">{rec.heading}</h3>
                           <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
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
               <div className="mt-8 text-center">
            {!feedbackSubmitted ? (
              <>
                <p className="text-muted-foreground mb-4">Was this action plan helpful?</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="lg" onClick={() => handleFeedback('helpful')}>
                    <ThumbsUp className="mr-2" /> Helpful
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => handleFeedback('not_helpful')}>
                    <ThumbsDown className="mr-2" /> Not Helpful
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-lg text-green-500 font-semibold">Thank you for your feedback!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Logo className="h-12 w-12" />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
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
                      <Textarea {...field} placeholder="e.g., We are a small e-commerce business selling handmade jewelry..." className="h-28" />
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb /> Common Problems</CardTitle>
                  <CardDescription>Select any common challenges your business is facing. You can search for problems too.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search problems..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Controller
                    name="commonProblems"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {filteredProblems.map((problem) => {
                          const isSelected = field.value?.includes(problem.id);
                          return (
                            <div
                              key={problem.id}
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value?.filter((id) => id !== problem.id)
                                  : [...(field.value || []), problem.id];
                                field.onChange(newValue);
                              }}
                              className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors text-sm ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground font-semibold'
                                  : 'bg-secondary hover:bg-secondary/80'
                              }`}
                            >
                              {problem.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                   {filteredProblems.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center mt-4">
                        No problems found.
                      </p>
                    )}
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
                        <Textarea {...field} placeholder="Describe your primary goal, main operational issue, key market concern, etc." className="h-40" />
                        {errors.customProblem && <p className="text-sm text-destructive mt-2">{errors.customProblem.message}</p>}
                      </>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-glow"></div>
                     <Button type="submit" size="lg" className="relative text-primary-foreground font-bold text-lg transition-all duration-300 disabled:opacity-50 hover:-translate-y-1" disabled={isLoading}>
                        Generate Solutions
                        <ArrowRight className="ml-2 h-5 w-5"/>
                    </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
