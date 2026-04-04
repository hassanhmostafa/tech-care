import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Calendar, Save, UserCircle2, UserCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.profile.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setGender((profile.gender as "male" | "female") ?? "");
      setBirthDate(profile.birthDate ?? "");
    }
  }, [profile]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Sign in to manage your profile</h2>
            <a href={getLoginUrl()}>
              <Button className="bg-cyan-500 hover:bg-cyan-600">Sign In</Button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      gender: gender || null,
      birthDate: birthDate || null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      <main className="flex-1 container max-w-2xl py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-cyan-500" />
            My Profile
          </h1>
          <p className="text-gray-500 mt-2">
            Keep your profile up to date so Tech Care can calculate accurate health metrics like BMI.
          </p>
        </div>

        <Card className="p-8 shadow-lg border-0 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="max-w-sm"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Gender</Label>
            <p className="text-xs text-gray-400">Used to calculate your ideal BMI using the Devine formula.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                  gender === "male"
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                    : "border-gray-200 text-gray-500 hover:border-cyan-300"
                }`}
              >
                <UserCircle2 className="w-5 h-5" />
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                  gender === "female"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-500 hover:border-pink-300"
                }`}
              >
                <UserCircle className="w-5 h-5" />
                Female
              </button>
            </div>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date of Birth
            </Label>
            <p className="text-xs text-gray-400">Used to calculate your age for BMI range adjustments.</p>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="max-w-xs"
            />
          </div>

          {/* Save */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card>

        {/* Info card */}
        <Card className="mt-6 p-6 border-0 bg-cyan-50 shadow-sm">
          <h3 className="font-semibold text-cyan-800 mb-2">Why do we need this?</h3>
          <p className="text-sm text-cyan-700 leading-relaxed">
            Your <strong>gender</strong> and <strong>date of birth</strong> allow Tech Care to calculate your{" "}
            <strong>ideal BMI</strong> using the Devine formula, and to apply age-appropriate healthy BMI ranges
            (e.g., seniors aged 65+ have a slightly higher healthy range of 22–27). Your weight and height are
            measured directly from the physical kiosk device.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
