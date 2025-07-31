"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeBusinessData } from '@/ai/flows/analyze-business-data';
import { generateRecommendations } from '@/ai/flows/generate-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/loader';
import { Logo } from '@/components/icons/logo';
import {
  DatabaseZap,
  Users,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  Landmark,
  Network,
  BarChart,
  Target,
  ListChecks,
  FileText,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from "recharts"

const formSchema = z.object({
  erpData: z.string().optional(),
  crmData: z.string().optional(),
  questionnaire: z.object({
    q1: z.string().optional(),
    q2: z.string().optional(),
  }),
  challenges: z.string().min(10, 'Please describe your challenges in more detail.'),
  analysisType: z.enum(['SWOT', 'PESTLE', "Porter's Five Forces"]),
});

type FormData = z.infer<typeof formSchema>;

type AnalysisResult = {
  analysis: string;
  recommendations: string[];
  kpis: string[];
};

type KpiChartDataItem = {
  name: string;
  fullName: string;
  current: number;
  target: number;
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kpiChartData, setKpiChartData] = useState<KpiChartDataItem[]>([]);
  const { toast } = useToast();

  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      erpData: '',
      crmData: '',
      questionnaire: {
        q1: '',
        q2: '',
      },
      challenges: '',
      analysisType: 'SWOT',
    },
  });

  const analysisType = watch('analysisType');

  useEffect(() => {
    if (result?.kpis) {
      const data = result.kpis.map((kpi, index) => {
        const match = kpi.match(/(\d+)%/);
        const percentage = match ? parseInt(match[1], 10) : (Math.random() * 20 + 5);
        const name = kpi.replace(/by \d+% in the next (quarter|year)/, '').trim();
        const isIncrease = kpi.toLowerCase().includes('increase');
        
        return {
          name: name.length > 30 ? `KPI ${index + 1}` : name,
          fullName: name,
          current: 100,
          target: isIncrease ? 100 + percentage : 100 - percentage,
        };
      });
      setKpiChartData(data);
    }
  }, [result?.kpis]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const businessData = `
        ERP Data: ${data.erpData || 'Not provided'}.
        CRM Data: ${data.crmData || 'Not provided'}.
        Questionnaire Answers: 
        - Strengths/Opportunities: ${data.questionnaire.q1 || 'Not provided'}.
        - Weaknesses/Threats: ${data.questionnaire.q2 || 'Not provided'}.
        User Described Challenges: ${data.challenges}.
      `;

      const analysisResponse = await analyzeBusinessData({
        businessData,
        analysisType: data.analysisType,
      });

      if (!analysisResponse || !analysisResponse.analysisResult) {
        throw new Error('Analysis failed to generate a result.');
      }
      
      const recommendationsResponse = await generateRecommendations({
        businessDiagnosis: analysisResponse.analysisResult,
      });

      setResult({
        analysis: analysisResponse.analysisResult,
        recommendations: recommendationsResponse.recommendations,
        kpis: recommendationsResponse.kpis,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate insights. Please try again.',
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
            Your Business Insights
          </h1>
        </div>
        <Button onClick={handleReset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
      <Tabs defaultValue="diagnosis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnosis"><FileText className="mr-2 h-4 w-4" />Diagnosis</TabsTrigger>
          <TabsTrigger value="recommendations"><ListChecks className="mr-2 h-4 w-4" />Recommendations</TabsTrigger>
          <TabsTrigger value="kpis"><Target className="mr-2 h-4 w-4" />KPIs</TabsTrigger>
        </TabsList>
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Business Analysis</CardTitle>
              <CardDescription>
                Here is the {analysisType} analysis based on the data you provided.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed p-4 bg-secondary rounded-md">
                {result?.analysis}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Actionable Recommendations</CardTitle>
              <CardDescription>
                Strategic initiatives to drive growth and efficiency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {result?.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-4 p-4 bg-secondary rounded-md">
                    <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0"/>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kpis">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                 <CardDescription>Metrics to track your success.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result?.kpis.map((kpi, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{kpi.split('by')[0]}</TableCell>
                        <TableCell className="text-right text-primary font-bold">{kpi.match(/by (.*)/)?.[1]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
               <CardHeader>
                <CardTitle>KPI Visualization</CardTitle>
                <CardDescription>A visual representation of your goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <RechartsBarChart data={kpiChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderForm = () => (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {isLoading && <Loader text="Generating your business insights..." />}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Logo className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              SME Insights Navigator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Unlock AI-powered diagnostics for your business strategy.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DatabaseZap /> Connect Data Sources</CardTitle>
              <CardDescription>Securely connect to your business systems for automated data extraction. (Optional)</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="erpData" className="flex items-center gap-2"><Users className="h-4 w-4" /> ERP Data (e.g., financials, inventory)</Label>
                <Controller
                  name="erpData"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} id="erpData" placeholder="Paste your ERP data here..." className="h-24" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crmData" className="flex items-center gap-2"><Users className="h-4 w-4" /> CRM Data (e.g., sales, customer feedback)</Label>
                <Controller
                  name="crmData"
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} id="crmData" placeholder="Paste your CRM data here..." className="h-24" />
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList /> Answer Questionnaire</CardTitle>
              <CardDescription>Guide the AI with structured assessments of your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="q1">What are your company's key strengths and market opportunities?</Label>
                <Controller
                  name="questionnaire.q1"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="q1" placeholder="e.g., Strong brand recognition, growing market demand" />
                  )}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="q2">What are your company's main weaknesses and potential threats?</Label>
                <Controller
                  name="questionnaire.q2"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="q2" placeholder="e.g., High operational costs, new competitors" />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquareText /> Describe Your Challenges</CardTitle>
              <CardDescription>Use natural language to tell us about your challenges and concerns.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="challenges"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Textarea {...field} placeholder="Describe your business goals, operational issues, market positioning, etc." className="h-32" />
                    {fieldState.error && <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Choose Analysis Framework</CardTitle>
                <CardDescription>Select the diagnostic tool you want to use.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="analysisType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid sm:grid-cols-3 gap-4"
                  >
                    <Label htmlFor="swot" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <RadioGroupItem value="SWOT" id="swot" className="sr-only" />
                      <ShieldCheck className="mb-3 h-6 w-6" />
                      SWOT
                    </Label>
                    <Label htmlFor="pestle" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <RadioGroupItem value="PESTLE" id="pestle" className="sr-only" />
                      <Landmark className="mb-3 h-6 w-6" />
                      PESTLE
                    </Label>
                    <Label htmlFor="porter" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <RadioGroupItem value="Porter's Five Forces" id="porter" className="sr-only" />
                      <Network className="mb-3 h-6 w-6" />
                      Porter's Five Forces
                    </Label>
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-gradient-to-r from-accent to-primary text-primary-foreground font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              Generate Insights
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
