
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/loader';
import { Logo } from '@/components/icons/logo';
import { BarChart as BarChartIcon, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, PieChart, Pie, Cell, Sector } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Lightbulb,
  Briefcase,
  MessageSquareText,
  ArrowRight,
  Target,
  ListChecks,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Search,
  X,
  FileText,
  Tags,
  CheckCircle,
  ChevronDown,
  LineChart,
  Building,
  Users,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const industries = [
    { id: 'tech', label: 'Technology' },
    { id: 'retail', label: 'Retail & E-commerce' },
    { id: 'health', label: 'Healthcare & Wellness' },
    { id: 'finance', label: 'Finance & Insurance' },
    { id: 'hospitality', label: 'Hospitality & Tourism' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'education', label: 'Education' },
    { id: 'real_estate', label: 'Real Estate' },
    { id: 'other', label: 'Other' },
] as const;

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
  { id: 'cybersecurity_threats', label: 'Cybersecurity Threats' },
  { id: 'slow_digital_adoption', label: 'Slow Digital Adoption' },
  { id: 'legacy_systems', label: 'Legacy Systems Holding Back Efficiency' },
  { id: 'data_driven_decision_making', label: 'Lack of Data-Driven Decision Making' },
  { id: 'integration_issues', label: 'Integration Issues Across Tools/Platforms' },
  { id: 'customer_acquisition_costs', label: 'Customer Acquisition Costs Too High' },
  { id: 'weak_online_presence', label: 'Weak Online Presence' },
  { id: 'market_reach_barriers', label: 'Limited Market Reach / Expansion Barriers' },
  { id: 'product_differentiation', label: 'Poor Product Differentiation' },
  { id: 'declining_customer_loyalty', label: 'Declining Customer Loyalty' },
] as const;

const formSchema = z.object({
  industry: z.string().min(1, "Please select your industry."),
  businessContext: z.string().optional(),
  commonProblems: z.array(z.string()).optional(),
  customProblem: z.string().min(10, 'Please describe your problem in more detail (min. 10 characters).'),
});

type FormData = z.infer<typeof formSchema>;


function LivePreview({ control, setValue }: { control: any, setValue: any }) {
    const formData = useWatch({ control });

    const selectedProblemLabels = useMemo(() => {
        return (formData.commonProblems || [])
            .map((id: string) => commonProblems.find(p => p.id === id)?.label)
            .filter(Boolean);
    }, [formData.commonProblems]);

    const selectedIndustryLabel = useMemo(() => {
        return industries.find(i => i.id === formData.industry)?.label;
    }, [formData.industry]);

    const customProblemWordCount = useMemo(() => {
        return formData.customProblem?.trim().split(/\s+/).filter(Boolean).length || 0;
    }, [formData.customProblem]);
    
    const progress = useMemo(() => {
        let completedSteps = 0;
        if (formData.industry) completedSteps++;
        if (formData.businessContext && formData.businessContext.length > 0) completedSteps++;
        if (formData.commonProblems && formData.commonProblems.length > 0) completedSteps++;
        if (formData.customProblem && formData.customProblem.length >= 10) completedSteps++;
        return (completedSteps / 4) * 100;
    }, [formData]);

    const removeProblem = (problemLabel: string) => {
        const problemId = commonProblems.find(p => p.label === problemLabel)?.id;
        if (problemId) {
            const currentProblems = control._formValues.commonProblems || [];
            const newProblems = currentProblems.filter((id: string) => id !== problemId);
            setValue('commonProblems', newProblems, { shouldValidate: true, shouldDirty: true });
        }
    };

    return (
        <Card className="sticky top-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle />
                    Live Preview
                </CardTitle>
                <CardDescription>Your inputs will appear here as you type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="text-sm font-medium">Form Progress</Label>
                    <div className="flex items-center gap-3 mt-2">
                        <Progress value={progress} className="w-full" />
                        <span className="text-sm font-semibold text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                </div>
                 <div>
                    <Label className="flex items-center gap-2 mb-2"><Building /> Industry</Label>
                    <p className="text-sm text-muted-foreground">{selectedIndustryLabel || 'Not selected'}</p>
                </div>
                <div>
                    <Label className="flex items-center gap-2 mb-2"><Tags /> Selected Problems</Label>
                    <div className="flex flex-wrap gap-2">
                        {selectedProblemLabels.length > 0 ? (
                            selectedProblemLabels.map((label: string) => (
                                <Badge key={label} variant="secondary" className="flex items-center gap-1.5 pr-1">
                                    {label}
                                    <button onClick={() => removeProblem(label)} className="rounded-full hover:bg-background/50">
                                      <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground">No problems selected yet.</p>
                        )}
                    </div>
                </div>
                 <div>
                    <Label className="flex items-center gap-2 mb-2"><FileText /> Main Problem</Label>
                     <p className="text-xs text-muted-foreground">{customProblemWordCount} words</p>
                </div>
            </CardContent>
        </Card>
    );
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function Home() {
  const [lastInput, setLastInput] = useState<GenerateSolutionsInput | null>(null);
  const [result, setResult] = useState<GenerateSolutionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
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
  
  const problemsToShow = useMemo(() => {
      if (showAllProblems || problemSearch) {
          return filteredProblems;
      }
      return filteredProblems.slice(0, 7);
  }, [filteredProblems, showAllProblems, problemSearch]);


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);
    setFeedbackSubmitted(false);
    try {
      const selectedProblems = data.commonProblems
        ?.map(id => commonProblems.find(p => p.id === id)?.label)
        .filter(Boolean) as string[];

      const input: GenerateSolutionsInput = {
        industry: data.industry,
        businessContext: data.businessContext || 'Not provided',
        commonProblems: selectedProblems,
        customProblem: data.customProblem,
      };

      setLastInput(input);
      const response = await generateSolutions(input);

      if (!response || !response.solutions || !response.kpis || !response.impactAnalysis) {
        throw new Error('Failed to generate a valid response from AI.');
      }
      
      setResult(response);
      setActiveSolutionIndex(0);

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
  
  const donutData = useMemo(() => {
      if (!result || !result.impactAnalysis[activeSolutionIndex]) return [];
      const distribution = result.impactAnalysis[activeSolutionIndex].stakeholderValueDistribution;
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [result, activeSolutionIndex]);

  const onPieEnter = (_: any, index: number) => {
    setActiveDonutIndex(index);
  };
  
  const handleBarClick = (data: any) => {
      if(data && data.activePayload && data.activePayload[0]) {
          const solutionName = data.activePayload[0].payload.name;
          const index = result?.impactAnalysis.findIndex(s => s.name === solutionName);
          if(index !== -1 && index !== undefined) {
              setActiveSolutionIndex(index);
          }
      }
  }

  const chartConfig = {
      projectedImpact: { label: "Projected Impact", color: "hsl(var(--chart-1))" },
      confidenceInterval: { label: "Confidence Interval", color: "hsl(var(--chart-2))" },
  };
  
  const DONUT_COLORS = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
  ];

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
            <Button onClick={handleReset} variant="outline" suppressHydrationWarning>
              <ChevronLeft className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </div>
          <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ListChecks /> Recommended Solutions</CardTitle>
                  <CardDescription>
                    Actionable steps to address your business problems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {result?.solutions.map((rec, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-secondary rounded-md">
                        <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0"/>
                        <div>
                           <h3 className="font-semibold mb-2">{rec.heading}</h3>
                           <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {rec.description.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                           </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LineChart /> Predictive Impact Modeling</CardTitle>
                    <CardDescription>Projected outcomes with confidence intervals. Click a bar to see the stakeholder value breakdown below.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] w-full">
                     <ChartContainer config={chartConfig} className="h-full w-full">
                          <ComposedChart data={result.impactAnalysis} layout="vertical" margin={{ left: 120, right: 40 }} onClick={handleBarClick}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} className="text-xs truncate" />
                            <XAxis type="number" domain={[0, 100]} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                            <Legend />
                            <Area dataKey="confidenceInterval" type="monotone" fill={chartConfig.confidenceInterval.color} stroke="transparent" fillOpacity={0.3} activeDot={false} />
                            <Bar dataKey="projectedImpact" barSize={20} fill={chartConfig.projectedImpact.color} radius={[4, 4, 4, 4]} />
                          </ComposedChart>
                        </ChartContainer>
                </CardContent>
            </Card>

              <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target /> Key Performance Indicators</CardTitle>
                     <CardDescription>Metrics to track the success of your solutions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {result?.kpis.map((kpi, index) => (
                        <li key={index} className="flex items-start gap-4 p-4 bg-secondary rounded-md">
                           <BarChartIcon className="h-5 w-5 mt-1 text-primary shrink-0"/>
                           <span className="text-sm">{kpi}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Stakeholder Value Distribution</CardTitle>
                        <CardDescription>
                            {result.impactAnalysis[activeSolutionIndex]?.name ? `For: ${result.impactAnalysis[activeSolutionIndex].name}` : 'Select a solution to see details.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-80">
                       <PieChart width={400} height={400}>
                          <Pie
                            activeIndex={activeDonutIndex}
                            activeShape={renderActiveShape}
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                          >
                            {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                            ))}
                           </Pie>
                        </PieChart>
                    </CardContent>
                    <CardFooter>
                       <p className="text-xs text-center text-muted-foreground w-full">{result.dataNarrative}</p>
                    </CardFooter>
                </Card>
              </div>
            </div>
               <div className="mt-8 text-center">
            {!feedbackSubmitted ? (
              <>
                <p className="text-muted-foreground mb-4">Was this action plan helpful?</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="lg" onClick={() => handleFeedback('helpful')} suppressHydrationWarning>
                    <ThumbsUp className="mr-2" /> Helpful
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => handleFeedback('not_helpful')} suppressHydrationWarning>
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
            <div className="text-center mb-12">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Logo className="h-12 w-12" />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  SME Insights Navigator
                </h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Describe your business challenges and get AI-powered solutions. This form is a live preview - your inputs will be reflected on the right.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
             <div className="md:col-span-2 space-y-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building /> 1. Industry</CardTitle>
                        <CardDescription>Select the industry your business operates in.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Controller
                          name="industry"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger suppressHydrationWarning>
                                <SelectValue placeholder="Select an industry..." />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map(industry => (
                                  <SelectItem key={industry.id} value={industry.id}>
                                    {industry.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.industry && <p className="text-sm text-destructive mt-2">{errors.industry.message}</p>}
                      </CardContent>
                    </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Briefcase /> 2. Business Context</CardTitle>
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
                      <CardTitle className="flex items-center gap-2"><Lightbulb /> 3. Common Problems</CardTitle>
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
                          suppressHydrationWarning
                        />
                      </div>
                      <Controller
                        name="commonProblems"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-2">
                            {problemsToShow.map((problem) => {
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
                         {!problemSearch && filteredProblems.length > 7 && (
                          <div className="text-center mt-4">
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => setShowAllProblems(!showAllProblems)}
                              suppressHydrationWarning
                            >
                              {showAllProblems ? 'Show less' : 'Show all'}
                               <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAllProblems ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><MessageSquareText /> 4. Describe Your Main Problem</CardTitle>
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
                         <Button type="submit" size="lg" className="relative text-primary-foreground font-bold text-lg transition-all duration-300 disabled:opacity-50 hover:-translate-y-1" disabled={isLoading} suppressHydrationWarning>
                            Generate Solutions
                            <ArrowRight className="ml-2 h-5 w-5"/>
                        </Button>
                    </div>
                  </div>
                </form>
             </div>
             <div className="md:col-span-1">
                <LivePreview control={control} setValue={setValue} />
             </div>
            </div>
        </div>
      )}
    </main>
  );
}
