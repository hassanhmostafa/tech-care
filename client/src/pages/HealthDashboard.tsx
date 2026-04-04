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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";

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

// ─── BMI Comparison Card ───────────────────────────────────────────────────

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

      {/* Measurement details */}
      <div className="text-xs text-gray-400 border-t pt-3 flex flex-wrap gap-4">
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

  const { data: readings, isLoading: readingsLoading } = trpc.health.myReadings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: bmiData, isLoading: bmiLoading } = trpc.health.bmiComparison.useQuery(
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

  // Build chart data from readings (newest first → reverse for chart)
  const chartData = useMemo(() => {
    if (!readings) return [];
    return [...readings]
      .reverse()
      .slice(-10)
      .map((r) => ({
        date: format(new Date(r.recordedAt), "MMM d"),
        systolic: r.bloodPressureSystolic ?? null,
        diastolic: r.bloodPressureDiastolic ?? null,
        heartRate: r.heartRate ?? null,
        weight: r.weight ? parseFloat(r.weight) : null,
        bmi: r.bmi ? parseFloat(r.bmi) : null,
      }));
  }, [readings]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md px-4">
            <Heart className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Track Your Health</h1>
            <p className="text-gray-600 mb-6">
              Sign in to view your health history, log new readings, and track your wellness trends over time.
            </p>
            <a href={getLoginUrl()}>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Continue
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
              <h1 className="text-3xl font-bold mb-1">My Health Dashboard</h1>
              <p className="text-cyan-100">Welcome back, {user?.name?.split(" ")[0]}</p>
            </div>
            <Button
              className="bg-white text-cyan-700 hover:bg-cyan-50"
              onClick={() => setShowLog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Reading
            </Button>
          </div>
        </section>

        <div className="container py-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Activity className="w-5 h-5 text-red-500" />,
                label: "Blood Pressure",
                value: latest?.bloodPressureSystolic
                  ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
                  : "—",
                unit: "mmHg",
                trend: <Trend values={bpSystolicValues} />,
              },
              {
                icon: <Heart className="w-5 h-5 text-pink-500" />,
                label: "Heart Rate",
                value: latest?.heartRate ?? "—",
                unit: "bpm",
                trend: <Trend values={hrValues} />,
              },
              {
                icon: <Scale className="w-5 h-5 text-blue-500" />,
                label: "Weight",
                value: latest?.weight ? parseFloat(latest.weight).toFixed(1) : "—",
                unit: "kg",
                trend: <Trend values={weightValues} />,
              },
              {
                icon: <Thermometer className="w-5 h-5 text-orange-500" />,
                label: "BMI",
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
          {chartData.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Blood Pressure Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} dot={false} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Heart Rate & Weight</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="heartRate" stroke="#ec4899" strokeWidth={2} dot={false} name="Heart Rate (bpm)" />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={false} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* BMI Comparison Section */}
          <BmiComparisonCard bmiData={bmiData} bmiLoading={bmiLoading} />

          {/* Readings History */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reading History</h2>
            {readingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              </div>
            ) : !readings || readings.length === 0 ? (
              <Card className="p-10 border-0 shadow-sm text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No readings logged yet.</p>
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setShowLog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Reading
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
