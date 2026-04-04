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
} from "lucide-react";
import { Link } from "wouter";

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
}

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
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KioskFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: kiosks, isLoading } = trpc.admin.listKiosks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.admin.createKiosk.useMutation({
    onSuccess: () => {
      utils.admin.listKiosks.invalidate();
      utils.kiosks.list.invalidate();
      setShowForm(false);
      setFormData(emptyForm);
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
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      image: formData.image || undefined,
      rating: formData.rating || undefined,
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
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  // Auth guard
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
            <p className="text-gray-600 mb-6">
              This page is restricted to administrators only.
            </p>
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
              onClick={() => { setEditingId(null); setFormData(emptyForm); setShowForm(true); }}
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
                        <p className="text-xs text-gray-400 mt-1">
                          {kiosk.latitude}, {kiosk.longitude} · Rating: {kiosk.rating ?? "N/A"}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(kiosk)}
                        >
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

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kiosk" : "Add New Kiosk"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(
              [
                { key: "name", label: "Station Name *", placeholder: "Red Sea Mall Health Station" },
                { key: "location", label: "Location / Area *", placeholder: "Red Sea Mall" },
                { key: "address", label: "Full Address *", placeholder: "King Abdulaziz Road, Jeddah" },
                { key: "latitude", label: "Latitude *", placeholder: "21.5433" },
                { key: "longitude", label: "Longitude *", placeholder: "39.1726" },
                { key: "phone", label: "Phone", placeholder: "+966 12 645 8888" },
                { key: "email", label: "Email", placeholder: "station@techcare.com" },
                { key: "image", label: "Image URL", placeholder: "https://..." },
                { key: "rating", label: "Rating (0–5)", placeholder: "4.8" },
              ] as { key: keyof KioskFormData; label: string; placeholder: string }[]
            ).map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
                <Input
                  id={key}
                  value={formData[key]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
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

      {/* Delete Confirmation */}
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
