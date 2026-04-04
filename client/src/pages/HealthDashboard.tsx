import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Heart,
  Activity,
  Scale,
  Thermometer,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  LogIn,
  Target,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogFormData {
  kioskId: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  weight: string;
  height: string;
  temperature: string;
  notes: string;
}

const emptyForm: LogFormData = {
  kioskId: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  weight: "",
  height: "",
  temperature: "",
  notes: "",
};

function calcBmi(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return "";
  return (w / (h * h)).toFixed(1);
}

function Trend({ values }: { values: (number | null | undefined)[] }) {
  const clean = (values ?? []).filter((v): v is number => v != null);
  if (clean.length < 2) return <Minus className="w-4 h-4 text-gray-400" />;
  const last = clean[clean.length - 1];
  const prev = clean[clean.length - 2];
  if (last > prev) return <TrendingUp className="w-4 h-4 text-red-500" />;
  if (last < prev) return <TrendingDown className="w-4 h-4 text-green-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

// ─── Health Score Banner ──────────────────────────────────────────────────

type HealthScoreData =
  | {
      status: "ok";
      score: number;
      grade: "Excellent" | "Good" | "Fair" | "Poor";
      gradeColor: string;
      breakdown: {
        bloodPressure: number | null;
        heartRate: number | null;
        bmi: number | null;
        temperature: number | null;
      };
      readingDate: Date;
    }
  | { status: "no_readings" }
  | undefined;

function HealthScoreBanner({
  scoreData,
  scoreLoading,
}: {
  scoreData: HealthScoreData;
  scoreLoading: boolean;
}) {
  if (scoreLoading) {
    return (
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Calculating your health score...</span>
        </div>
      </Card>
    );
  }

  if (!scoreData || scoreData.status === "no_readings") {
    return (
      <Card className="p-6 border-0 shadow-sm bg-blue-50">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">No Health Score Yet</h3>
            <p className="text-sm text-blue-700">Log your first reading to get your overall health score.</p>
          </div>
        </div>
      </Card>
    );
  }

  const data = scoreData as Exclude<HealthScoreData, { status: "no_readings" } | undefined>;
  if (data.status !== "ok") return null;

  const circumference = 2 * Math.PI * 45; // r=45
  const dashOffset = circumference - (data.score / 100) * circumference;

  const breakdownItems = [
    { label: "Blood Pressure", value: data.breakdown.bloodPressure, icon: <Activity className="w-4 h-4" /> },
    { label: "BMI", value: data.breakdown.bmi, icon: <Scale className="w-4 h-4" /> },
    { label: "Heart Rate", value: data.breakdown.heartRate, icon: <Heart className="w-4 h-4" /> },
    { label: "Temperature", value: data.breakdown.temperature, icon: <Thermometer className="w-4 h-4" /> },
  ];

  return (
    <Card className="p-6 border-0 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Circular gauge */}
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* Track */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            {/* Score arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={data.gradeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
            <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#111827">
              {data.score}
            </text>
            <text x="50" y="62" textAnchor="middle" fontSize="10" fill="#6b7280">
              out of 100
            </text>
          </svg>
        </div>

        {/* Grade + breakdown */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Overall Health Score</div>
              <div className="text-2xl font-bold" style={{ color: data.gradeColor }}>
                {data.grade}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.value !== null ? (
                  <>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor:
                            item.value >= 90 ? "#22c55e" :
                            item.value >= 75 ? "#06b6d4" :
                            item.value >= 50 ? "#f97316" : "#ef4444",
                        }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-700">{item.value}/100</div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">No data</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── BMI Comparison Card ───────────────────────────────────────────────────

type WeightTarget = {
  idealWeightKg: number;
  currentWeightKg: number;
  diffKg: number;
  progressPct: number;
  direction: "lose" | "gain" | "at_ideal";
};

type BmiDataOk = {
  status: "ok";
  actualBmi: number;
  idealBmi: number;
  healthyMin: number;
  healthyMax: number;
  classification: "Underweight" | "Normal" | "Overweight" | "Obese";
  age: number;
  weight: number;
  height: number;
  readingDate: Date;
  weightTarget: WeightTarget;
};

type BmiDataState =
  | BmiDataOk
  | { status: "profile_incomplete" }
  | { status: "no_readings" }
  | undefined;

function BmiComparisonCard({ bmiData, bmiLoading }: { bmiData: BmiDataState; bmiLoading: boolean }) {
  if (bmiLoading) {
    return (
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Calculating BMI comparison...</span>
        </div>
      </Card>
    );
  }

  if (!bmiData || bmiData.status === "profile_incomplete") {
    return (
      <Card className="p-6 border-0 shadow-sm bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">Complete Your Profile for BMI Analysis</h3>
            <p className="text-sm text-amber-700 mb-3">
              Add your gender and date of birth to your profile so Tech Care can calculate your actual vs ideal BMI.
            </p>
            <Link href="/profile">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
                <User className="w-4 h-4" />
                Set Up Profile
              </button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (bmiData.status === "no_readings") {
    return (
      <Card className="p-6 border-0 shadow-sm bg-blue-50">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">No Weight/Height Data Yet</h3>
            <p className="text-sm text-blue-700">
              Log a reading that includes your weight and height to see your BMI comparison.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const data = bmiData as BmiDataOk;
  const diff = parseFloat((data.actualBmi - data.idealBmi).toFixed(1));
  const isNormal = data.classification === "Normal";
  const classColor =
    data.classification === "Normal"
      ? "text-green-600"
      : data.classification === "Underweight"
      ? "text-blue-600"
      : data.classification === "Overweight"
      ? "text-orange-600"
      : "text-red-600";

  // Build gauge bar: range 10–45 BMI
  const gaugeMin = 10;
  const gaugeMax = 45;
  const toPercent = (v: number) => Math.min(100, Math.max(0, ((v - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
  const healthyMinPct = toPercent(data.healthyMin);
  const healthyMaxPct = toPercent(data.healthyMax);
  const actualPct = toPercent(data.actualBmi);
  const idealPct = toPercent(data.idealBmi);

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-cyan-500" />
        <h2 className="text-xl font-bold text-gray-900">BMI Comparison</h2>
        {isNormal && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className={`text-3xl font-bold ${classColor}`}>{data.actualBmi}</div>
          <div className="text-xs text-gray-500 mt-1">Your BMI</div>
          <div className={`text-xs font-medium mt-0.5 ${classColor}`}>{data.classification}</div>
        </div>
        <div className="text-center p-4 bg-cyan-50 rounded-xl">
          <div className="text-3xl font-bold text-cyan-600">{data.idealBmi}</div>
          <div className="text-xs text-gray-500 mt-1">Ideal BMI</div>
          <div className="text-xs font-medium text-cyan-600 mt-0.5">For your profile</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl font-bold text-gray-700">
            {diff > 0 ? "+" : ""}{diff}
          </div>
          <div className="text-xs text-gray-500 mt-1">Difference</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">
            {diff === 0 ? "At ideal" : diff > 0 ? "Above ideal" : "Below ideal"}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-sm font-bold text-gray-700">{data.healthyMin}–{data.healthyMax}</div>
          <div className="text-xs text-gray-500 mt-1">Healthy Range</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Age {data.age}</div>
        </div>
      </div>

      {/* Visual gauge bar */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 flex justify-between">
          <span>BMI {gaugeMin}</span>
          <span>BMI {gaugeMax}</span>
        </div>
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
          {/* Healthy zone */}
          <div
            className="absolute h-full bg-green-200 rounded-full"
            style={{ left: `${healthyMinPct}%`, width: `${healthyMaxPct - healthyMinPct}%` }}
          />
          {/* Ideal BMI marker */}
          <div
            className="absolute top-0 h-full w-1 bg-cyan-500"
            style={{ left: `${idealPct}%` }}
          />
          {/* Actual BMI marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow"
            style={{
              left: `calc(${actualPct}% - 8px)`,
              backgroundColor:
                data.classification === "Normal" ? "#22c55e" :
                data.classification === "Underweight" ? "#3b82f6" :
                data.classification === "Overweight" ? "#f97316" : "#ef4444",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-200"></span> Healthy zone</span>
          <span className="flex items-center gap-1"><span className="inline-block w-1 h-3 bg-cyan-500"></span> Ideal</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span> Your BMI</span>
        </div>
      </div>

      {/* Weight Target Section */}
      {data.weightTarget && (
        <div className="mt-5 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-500" />
              Ideal Weight Target
            </span>
            <span className="text-sm font-bold text-cyan-600">{data.weightTarget.idealWeightKg} kg</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${data.weightTarget.progressPct}%`,
                backgroundColor:
                  data.weightTarget.direction === "at_ideal" ? "#22c55e" :
                  data.weightTarget.progressPct >= 70 ? "#06b6d4" :
                  data.weightTarget.progressPct >= 40 ? "#f97316" : "#ef4444",
              }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              {data.weightTarget.direction === "at_ideal"
                ? "✓ You are at your ideal weight!"
                : data.weightTarget.direction === "lose"
                ? `Need to lose ${Math.abs(data.weightTarget.diffKg)} kg`
                : `Need to gain ${Math.abs(data.weightTarget.diffKg)} kg`}
            </span>
            <span className="font-semibold text-gray-600">{data.weightTarget.progressPct}% there</span>
          </div>
        </div>
      )}

      {/* Measurement details */}
      <div className="text-xs text-gray-400 border-t pt-3 mt-4 flex flex-wrap gap-4">
        <span>Weight: <strong className="text-gray-600">{data.weight} kg</strong></span>
        <span>Height: <strong className="text-gray-600">{data.height} cm</strong></span>
        <span>Age: <strong className="text-gray-600">{data.age} yrs</strong></span>
        <span>Reading: <strong className="text-gray-600">{format(new Date(data.readingDate), "MMM d, yyyy")}</strong></span>
      </div>
    </Card>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function HealthDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const [showLog, setShowLog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<LogFormData>(emptyForm);
  const [chartRange, setChartRange] = useState<"1W" | "1M" | "1Y" | "MAX">("1M");

  const { data: readings, isLoading: readingsLoading } = trpc.health.myReadings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: bmiData, isLoading: bmiLoading } = trpc.health.bmiComparison.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: healthScore, isLoading: scoreLoading } = trpc.health.healthScore.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: kiosks } = trpc.kiosks.list.useQuery(undefined, { enabled: isAuthenticated });

  const logMutation = trpc.health.logReading.useMutation({
    onSuccess: () => {
      utils.health.myReadings.invalidate();
      setShowLog(false);
      setForm(emptyForm);
      toast.success("Health reading logged successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.health.deleteReading.useMutation({
    onSuccess: () => {
      utils.health.myReadings.invalidate();
      setDeleteId(null);
      toast.success("Reading deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.kioskId) {
      toast.error("Please select a kiosk");
      return;
    }
    const bmi = calcBmi(form.weight, form.height);
    logMutation.mutate({
      kioskId: form.kioskId,
      bloodPressureSystolic: form.bloodPressureSystolic ? parseInt(form.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: form.bloodPressureDiastolic ? parseInt(form.bloodPressureDiastolic) : undefined,
      heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
      weight: form.weight || undefined,
      height: form.height || undefined,
      bmi: bmi || undefined,
      temperature: form.temperature || undefined,
      notes: form.notes || undefined,
    });
  };

  const { data: chartRaw, isLoading: chartLoading } = trpc.health.chartReadings.useQuery(
    { range: chartRange },
    { enabled: isAuthenticated }
  );

  // Format x-axis date label based on range
  function formatChartDate(dateVal: Date | string, range: string): string {
    const d = new Date(dateVal);
    if (range === "1W") return format(d, "EEE d");   // Mon 4
    if (range === "1M") return format(d, "MMM d");   // Apr 4
    if (range === "1Y") return format(d, "MMM");     // Apr
    return format(d, "MMM yy");                       // Apr 25
  }

  // Build chart data from range-filtered readings (oldest first for chart)
  const chartData = useMemo(() => {
    if (!chartRaw) return [];
    return [...chartRaw]
      .reverse()
      .map((r) => ({
        date: formatChartDate(r.recordedAt, chartRange),
        systolic: r.bloodPressureSystolic ?? null,
        diastolic: r.bloodPressureDiastolic ?? null,
        heartRate: r.heartRate ?? null,
        weight: r.weight ? parseFloat(r.weight) : null,
        bmi: r.bmi ? parseFloat(r.bmi) : null,
      }));
  }, [chartRaw, chartRange]);

  // Latest values for summary cards
  const latest = readings?.[0];
  const bpSystolicValues = (readings ?? []).map((r) => r.bloodPressureSystolic ?? null);
  const hrValues = (readings ?? []).map((r) => r.heartRate ?? null);
  const weightValues = (readings ?? []).map((r) => (r.weight ? parseFloat(r.weight) : null));
  const bmiValues = (readings ?? []).map((r) => (r.bmi ? parseFloat(r.bmi) : null));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </main>
      </div>
    );
  }

  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md px-4">
            <Heart className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t.health_title}</h1>
            <p className="text-gray-600 mb-6">{t.health_signInPrompt}</p>
            <a href={getLoginUrl()}>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <LogIn className="w-4 h-4 mr-2" />
                {t.health_signInBtn}
              </Button>
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-10">
          <div className="container flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{t.health_title}</h1>
              <p className="text-cyan-100">{t.health_welcome}, {user?.name?.split(" ")[0]}</p>
            </div>
            <Button
              className="bg-white text-cyan-700 hover:bg-cyan-50"
              onClick={() => setShowLog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.health_logReading}
            </Button>
          </div>
        </section>

        <div className="container py-8 space-y-8">
          {/* Health Score Banner */}
          <HealthScoreBanner scoreData={healthScore} scoreLoading={scoreLoading} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Activity className="w-5 h-5 text-red-500" />,
                label: t.health_bpLabel,
                value: latest?.bloodPressureSystolic
                  ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
                  : "—",
                unit: "mmHg",
                trend: <Trend values={bpSystolicValues} />,
              },
              {
                icon: <Heart className="w-5 h-5 text-pink-500" />,
                label: t.health_hrLabel,
                value: latest?.heartRate ?? "—",
                unit: "bpm",
                trend: <Trend values={hrValues} />,
              },
              {
                icon: <Scale className="w-5 h-5 text-blue-500" />,
                label: t.health_weightLabel,
                value: latest?.weight ? parseFloat(latest.weight).toFixed(1) : "—",
                unit: "kg",
                trend: <Trend values={weightValues} />,
              },
              {
                icon: <Thermometer className="w-5 h-5 text-orange-500" />,
                label: t.health_bmiLabel,
                value: latest?.bmi ? parseFloat(latest.bmi).toFixed(1) : "—",
                unit: "",
                trend: <Trend values={bmiValues} />,
              },
            ].map((card) => (
              <Card key={card.label} className="p-5 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    {card.icon}
                  </div>
                  {card.trend}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                  {card.unit && <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="space-y-4">
            {/* Range selector */}
            <div className="flex items-center gap-2">
              {(["1W", "1M", "1Y", "MAX"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    chartRange === r
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {r === "1W" ? "1 Week" : r === "1M" ? "1 Month" : r === "1Y" ? "1 Year" : "Max"}
                </button>
              ))}
              {chartLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-2" />}
            </div>

            {chartData.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Pressure Chart */}
                <Card className="p-5 border-0 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">{t.health_bpTrend}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradSystolic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradDiastolic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} fill="url(#gradSystolic)" dot={false} name="Systolic" />
                      <Area type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} fill="url(#gradDiastolic)" dot={false} name="Diastolic" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Heart Rate & Weight Chart */}
                <Card className="p-5 border-0 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">{t.health_hrWeight}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradHR" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="heartRate" stroke="#ec4899" strokeWidth={2} fill="url(#gradHR)" dot={false} name="Heart Rate (bpm)" />
                      <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} fill="url(#gradWeight)" dot={false} name="Weight (kg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            ) : (
              !chartLoading && (
                <Card className="p-8 border-0 shadow-sm text-center text-gray-400">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No readings in this time range. Try a wider range.</p>
                </Card>
              )
            )}
          </div>

          {/* BMI Comparison Section */}
          <BmiComparisonCard bmiData={bmiData} bmiLoading={bmiLoading} />

          {/* Readings History */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.health_history}</h2>
            {readingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              </div>
            ) : !readings || readings.length === 0 ? (
              <Card className="p-10 border-0 shadow-sm text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">{t.health_noReadings}</p>
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setShowLog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.health_logReading}
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {readings.map((r) => (
                  <Card key={r.id} className="p-4 border-0 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {r.bloodPressureSystolic && (
                            <span className="flex items-center gap-1 text-red-600 font-medium">
                              <Activity className="w-3.5 h-3.5" />
                              {r.bloodPressureSystolic}/{r.bloodPressureDiastolic} mmHg
                            </span>
                          )}
                          {r.heartRate && (
                            <span className="flex items-center gap-1 text-pink-600 font-medium">
                              <Heart className="w-3.5 h-3.5" />
                              {r.heartRate} bpm
                            </span>
                          )}
                          {r.weight && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <Scale className="w-3.5 h-3.5" />
                              {parseFloat(r.weight).toFixed(1)} kg
                            </span>
                          )}
                          {r.bmi && (
                            <span className="text-gray-600 font-medium">BMI {parseFloat(r.bmi).toFixed(1)}</span>
                          )}
                          {r.temperature && (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                              <Thermometer className="w-3.5 h-3.5" />
                              {parseFloat(r.temperature).toFixed(1)}°C
                            </span>
                          )}
                        </div>
                        {r.notes && <p className="text-sm text-gray-500 mt-1 italic">"{r.notes}"</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(r.recordedAt), "EEEE, MMMM d, yyyy · h:mm a")}
                          {" · Kiosk ID: "}{r.kioskId}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Log Reading Dialog */}
      <Dialog open={showLog} onOpenChange={(open) => { if (!open) { setShowLog(false); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Health Reading</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Kiosk selector */}
            <div>
              <Label className="text-sm font-medium">Station *</Label>
              <Select value={form.kioskId} onValueChange={(v) => setForm((p) => ({ ...p, kioskId: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select the kiosk you visited" />
                </SelectTrigger>
                <SelectContent>
                  {kiosks?.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Systolic BP (mmHg)</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={form.bloodPressureSystolic}
                  onChange={(e) => setForm((p) => ({ ...p, bloodPressureSystolic: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Diastolic BP (mmHg)</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={form.bloodPressureDiastolic}
                  onChange={(e) => setForm((p) => ({ ...p, bloodPressureDiastolic: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Heart Rate (bpm)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={form.heartRate}
                  onChange={(e) => setForm((p) => ({ ...p, heartRate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.6"
                  value={form.temperature}
                  onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  value={form.weight}
                  onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={form.height}
                  onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {form.weight && form.height && (
              <p className="text-sm text-cyan-600 font-medium">
                Calculated BMI: {calcBmi(form.weight, form.height)}
              </p>
            )}

            <div>
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Input
                placeholder="Any observations or comments..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowLog(false); setForm(emptyForm); }}>
              Cancel
            </Button>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={handleSubmit}
              disabled={logMutation.isPending || !form.kioskId}
            >
              {logMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reading?</AlertDialogTitle>
            <AlertDialogDescription>
              This health reading will be permanently removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
