import { useParams, Link } from "wouter";
import { Clock, Phone, MapPin, Star, ArrowLeft, Heart, Droplet, Zap, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { JEDDAH_KIOSKS } from "@/lib/kiosks";

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const kiosk = JEDDAH_KIOSKS.find((k) => k.id === id);

  if (!kiosk) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Station Not Found</h1>
            <p className="text-gray-600 mb-4">The station you're looking for doesn't exist.</p>
            <Link href="/find-station">
              <Button className="bg-cyan-500 hover:bg-cyan-600">Back to Stations</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-8">
          <div className="container">
            <Link href="/find-station">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stations
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">{kiosk.name}</h1>
            <p className="text-cyan-50">{kiosk.location}</p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Image */}
                <Card className="overflow-hidden border-0 shadow-lg">
                  <img src={kiosk.image} alt={kiosk.name} className="w-full h-96 object-cover" />
                </Card>

                {/* About Section */}
                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">About This Station</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    This health screening station is equipped with state-of-the-art medical devices to provide you with
                    comprehensive health assessments. Our trained staff is available to assist you with all your screening
                    needs.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-cyan-50 rounded-lg">
                      <div className="text-3xl font-bold text-cyan-600 mb-1">8</div>
                      <div className="text-sm text-gray-600">Services Available</div>
                    </div>
                    <div className="p-4 bg-cyan-50 rounded-lg">
                      <div className="text-3xl font-bold text-cyan-600 mb-1">{kiosk.rating}</div>
                      <div className="text-sm text-gray-600">Customer Rating</div>
                    </div>
                  </div>
                </Card>

                {/* Services Section */}
                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6">Available Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kiosk.services.map((service, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {idx === 0 && <Droplet className="w-5 h-5 text-cyan-600" />}
                          {idx === 1 && <Zap className="w-5 h-5 text-cyan-600" />}
                          {idx === 2 && <Heart className="w-5 h-5 text-cyan-600" />}
                          {idx === 3 && <Thermometer className="w-5 h-5 text-cyan-600" />}
                          {idx >= 4 && <Star className="w-5 h-5 text-cyan-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{service}</h3>
                          <p className="text-sm text-gray-600">Professional measurement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Operating Hours */}
                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6">Operating Hours</h2>
                  <div className="space-y-3">
                    {kiosk.hours.map((hour, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{hour.day}</span>
                        <span className="text-gray-600">
                          {hour.open} - {hour.close}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Contact & Actions */}
              <div className="space-y-6">
                {/* Contact Card */}
                <Card className="p-6 border-0 shadow-lg sticky top-24">
                  <h3 className="text-xl font-bold mb-6">Contact Information</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{kiosk.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${kiosk.phone}`} className="font-medium text-cyan-600 hover:text-cyan-700">
                          {kiosk.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${kiosk.email}`} className="font-medium text-cyan-600 hover:text-cyan-700 break-all">
                          {kiosk.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      Book Screening
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </Card>

                {/* Rating Card */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">Customer Rating</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(kiosk.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{kiosk.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">Based on customer reviews</p>
                </Card>

                {/* Info Card */}
                <Card className="p-6 border-0 shadow-lg bg-cyan-50">
                  <h3 className="font-bold text-gray-900 mb-3">Quick Tips</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ Screenings are completely free</li>
                    <li>✓ No appointment necessary</li>
                    <li>✓ Results available immediately</li>
                    <li>✓ Privacy fully protected</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-12 mt-12">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for Your Health Screening?</h2>
            <p className="text-cyan-50 mb-6 max-w-2xl mx-auto">
              Visit {kiosk.name} today and take the first step towards better health
            </p>
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100">
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
