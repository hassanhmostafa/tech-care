import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ShieldAlert,
  Clock,
  X,
  Stethoscope,
} from "lucide-react";
import { Link } from "wouter";

interface HourEntry {
  day: string;
  open: string;
  close: string;
}

interface KioskFormData {
  name: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  image: string;
  rating: string;
  hours: HourEntry[];
  services: string[];
}

const DEFAULT_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const emptyForm: KioskFormData = {
  name: "",
  location: "",
  address: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  image: "",
  rating: "",
  hours: [],
  services: [],
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KioskFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Service input state
  const [serviceInput, setServiceInput] = useState("");

  const { data: kiosks, isLoading } = trpc.admin.listKiosks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.admin.createKiosk.useMutation({
    onSuccess: () => {
      utils.admin.listKiosks.invalidate();
      utils.kiosks.list.invalidate();
      setShowForm(false);
      setFormData(emptyForm);
      setServiceInput("");
      toast.success("Kiosk created successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateKiosk.useMutation({
    onSuccess: () => {
      utils.admin.listKiosks.invalidate();
      utils.kiosks.list.invalidate();
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      setServiceInput("");
      toast.success("Kiosk updated successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.admin.toggleKiosk.useMutation({
    onSuccess: () => {
      utils.admin.listKiosks.invalidate();
      utils.kiosks.list.invalidate();
      toast.success("Kiosk status updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteKiosk.useMutation({
    onSuccess: () => {
      utils.admin.listKiosks.invalidate();
      utils.kiosks.list.invalidate();
      setDeleteId(null);
      toast.success("Kiosk deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleEdit = (kiosk: any) => {
    setEditingId(kiosk.id);
    setFormData({
      name: kiosk.name,
      location: kiosk.location,
      address: kiosk.address,
      latitude: kiosk.latitude,
      longitude: kiosk.longitude,
      phone: kiosk.phone ?? "",
      email: kiosk.email ?? "",
      image: kiosk.image ?? "",
      rating: kiosk.rating ?? "",
      hours: Array.isArray(kiosk.hours) ? kiosk.hours : [],
      services: Array.isArray(kiosk.services) ? kiosk.services : [],
    });
    setServiceInput("");
    setShowForm(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      location: formData.location,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      image: formData.image || undefined,
      rating: formData.rating || undefined,
      hours: formData.hours.length > 0 ? formData.hours : undefined,
      services: formData.services.length > 0 ? formData.services : undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setServiceInput("");
  };

  // ── Hours helpers ────────────────────────────────────────────────────────────
  const addHourRow = () => {
    const usedDays = formData.hours.map((h) => h.day);
    const nextDay = DEFAULT_DAYS.find((d) => !usedDays.includes(d)) ?? "Sunday";
    setFormData((p) => ({
      ...p,
      hours: [...p.hours, { day: nextDay, open: "09:00", close: "21:00" }],
    }));
  };

  const updateHourRow = (idx: number, field: keyof HourEntry, value: string) => {
    setFormData((p) => {
      const updated = [...p.hours];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...p, hours: updated };
    });
  };

  const removeHourRow = (idx: number) => {
    setFormData((p) => ({ ...p, hours: p.hours.filter((_, i) => i !== idx) }));
  };

  // ── Services helpers ─────────────────────────────────────────────────────────
  const addService = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed) return;
    if (formData.services.includes(trimmed)) {
      toast.error("Service already added");
      return;
    }
    setFormData((p) => ({ ...p, services: [...p.services, trimmed] }));
    setServiceInput("");
  };

  const removeService = (idx: number) => {
    setFormData((p) => ({ ...p, services: p.services.filter((_, i) => i !== idx) }));
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  // ── Auth guard ───────────────────────────────────────────────────────────────
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

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md px-4">
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">This page is restricted to administrators only.</p>
            <Link href="/">
              <Button className="bg-cyan-500 hover:bg-cyan-600">Go Home</Button>
            </Link>
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
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-10">
          <div className="container flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
              <p className="text-slate-300">Manage Tech Care kiosk locations</p>
            </div>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => { setEditingId(null); setFormData(emptyForm); setServiceInput(""); setShowForm(true); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Kiosk
            </Button>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white border-b border-gray-200 py-4">
          <div className="container flex gap-8 text-sm">
            <div>
              <span className="font-semibold text-gray-900">{kiosks?.length ?? 0}</span>
              <span className="text-gray-500 ml-1">Total Kiosks</span>
            </div>
            <div>
              <span className="font-semibold text-green-600">
                {kiosks?.filter((k) => k.isActive === "true").length ?? 0}
              </span>
              <span className="text-gray-500 ml-1">Active</span>
            </div>
            <div>
              <span className="font-semibold text-red-500">
                {kiosks?.filter((k) => k.isActive === "false").length ?? 0}
              </span>
              <span className="text-gray-500 ml-1">Inactive</span>
            </div>
          </div>
        </section>

        {/* Kiosk Table */}
        <section className="py-8">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {kiosks?.map((kiosk) => (
                  <Card key={kiosk.id} className="p-5 border-0 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{kiosk.name}</h3>
                          <Badge
                            variant={kiosk.isActive === "true" ? "default" : "secondary"}
                            className={kiosk.isActive === "true" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                          >
                            {kiosk.isActive === "true" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {kiosk.address}
                          </span>
                          {kiosk.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {kiosk.phone}
                            </span>
                          )}
                          {kiosk.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {kiosk.email}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(kiosk.services) && kiosk.services.slice(0, 4).map((s: string) => (
                            <span key={s} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                          {Array.isArray(kiosk.services) && kiosk.services.length > 4 && (
                            <span className="text-xs text-gray-400">+{kiosk.services.length - 4} more</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {kiosk.latitude}, {kiosk.longitude} · Rating: {kiosk.rating ?? "N/A"} ·{" "}
                          {Array.isArray(kiosk.hours) ? kiosk.hours.length : 0} hour entries
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleMutation.mutate({
                              id: kiosk.id,
                              isActive: kiosk.isActive === "true" ? "false" : "true",
                            })
                          }
                          disabled={toggleMutation.isPending}
                          title={kiosk.isActive === "true" ? "Deactivate" : "Activate"}
                        >
                          {kiosk.isActive === "true" ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(kiosk)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600 hover:border-red-300"
                          onClick={() => setDeleteId(kiosk.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kiosk" : "Add New Kiosk"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ── Basic Info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: "name", label: "Station Name *", placeholder: "Red Sea Mall Health Station", full: true },
                  { key: "location", label: "Location / Area *", placeholder: "Red Sea Mall", full: false },
                  { key: "address", label: "Full Address *", placeholder: "King Abdulaziz Road, Jeddah", full: true },
                  { key: "latitude", label: "Latitude *", placeholder: "21.5433", full: false },
                  { key: "longitude", label: "Longitude *", placeholder: "39.1726", full: false },
                  { key: "phone", label: "Phone", placeholder: "+966 12 645 8888", full: false },
                  { key: "email", label: "Email", placeholder: "station@techcare.com", full: false },
                  { key: "image", label: "Image URL", placeholder: "https://...", full: true },
                  { key: "rating", label: "Rating (0–5)", placeholder: "4.8", full: false },
                ] as { key: keyof KioskFormData; label: string; placeholder: string; full: boolean }[]
              ).map(({ key, label, placeholder, full }) => (
                key === "hours" || key === "services" ? null : (
                  <div key={key} className={full ? "sm:col-span-2" : ""}>
                    <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                    <Input
                      id={key}
                      value={formData[key] as string}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="mt-1"
                    />
                  </div>
                )
              ))}
            </div>

            {/* ── Operating Hours ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  Operating Hours
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addHourRow}
                  disabled={formData.hours.length >= 7}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Day
                </Button>
              </div>

              {formData.hours.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">No hours added yet. Click "Add Day" to start.</p>
              ) : (
                <div className="space-y-2">
                  {formData.hours.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.day}
                        onChange={(e) => updateHourRow(idx, "day", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        {DEFAULT_DAYS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={row.open}
                        onChange={(e) => updateHourRow(idx, "open", e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="time"
                        value={row.close}
                        onChange={(e) => updateHourRow(idx, "close", e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-600 px-1.5"
                        onClick={() => removeHourRow(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Services ── */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Stethoscope className="w-4 h-4 text-cyan-600" />
                Available Services
              </Label>

              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g. Blood Pressure, BMI, Heart Rate..."
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addService} disabled={!serviceInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.services.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No services added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((svc, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 bg-cyan-50 text-cyan-700 text-sm px-3 py-1 rounded-full"
                    >
                      {svc}
                      <button
                        type="button"
                        onClick={() => removeService(idx)}
                        className="ml-1 text-cyan-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={handleSubmit}
              disabled={isBusy || !formData.name || !formData.address || !formData.latitude || !formData.longitude}
            >
              {isBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Save Changes" : "Create Kiosk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Kiosk?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. The kiosk will be removed from the map
              and all station pages. Consider deactivating it instead if you may need it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
