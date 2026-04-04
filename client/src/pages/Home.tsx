import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Clock, Zap, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/hero-saudi-men-v2-hoJqY6wbb2nWcn7TZn8r3k.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-block bg-cyan-500/20 border border-cyan-400/50 rounded-full px-4 py-2 text-sm font-medium text-cyan-300">
                ✨ Your Health, Anytime, Anywhere
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Your Health, Our Priority
              </h1>

              <p className="text-lg text-gray-200 leading-relaxed">
                Access advanced health screenings at convenient kiosk locations across Jeddah. Measure your vital signs,
                track your wellness journey, and get personalized health insights with Tech Care.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/find-station">
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white w-full sm:w-auto">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find a Station
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex gap-8 pt-8 text-sm">
                <div>
                  <div className="text-3xl font-bold text-cyan-400">8+</div>
                  <div className="text-gray-300">Active Stations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400">50K+</div>
                  <div className="text-gray-300">Users Screened</div>
                </div>
              </div>
            </div>

            {/* Metrics Visual */}
            <div className="hidden md:block">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/metrics-saudi-men-v2-ic8MSPfMaYeSjUHa7b2D8s.webp"
                alt="Saudi man in white thobe viewing health metrics at a kiosk"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Find Your Nearest Station</h2>
            <p className="text-gray-600">Search by location or browse all available kiosks</p>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Enter your location or station name..." className="flex-1" />
            <Button className="bg-cyan-500 hover:bg-cyan-600">Search</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Tech Care?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience modern healthcare accessibility with our comprehensive health screening platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Convenient Locations</h3>
              <p className="text-gray-600">
                Find health stations in shopping malls, pharmacies, and community centers across Jeddah
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Extended Hours</h3>
              <p className="text-gray-600">
                Access health screenings during extended hours, from early morning to late evening
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Screening</h3>
              <p className="text-gray-600">
                Measure blood pressure, weight, BMI, heart rate, and receive personalized health assessments
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your health metrics over time and receive insights to improve your wellness
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy Protected</h3>
              <p className="text-gray-600">
                Your health data is encrypted and protected with industry-leading security standards
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
              <p className="text-gray-600">
                Get immediate health screening results and recommendations at the kiosk
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Health Screening Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our kiosks provide comprehensive health measurements and assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🩸", name: "Blood Pressure", desc: "Monitor your cardiovascular health" },
              { icon: "⚖️", name: "Weight & BMI", desc: "Track your body composition" },
              { icon: "❤️", name: "Heart Rate", desc: "Check your pulse and rhythm" },
              { icon: "🌡️", name: "Temperature", desc: "Measure body temperature" },
              { icon: "📊", name: "Health Assessment", desc: "Get personalized health insights" },
              { icon: "⚠️", name: "Risk Screening", desc: "Identify potential health risks" },
            ].map((service, idx) => (
              <Card key={idx} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/cta-saudi-men-v2-UEdVAg6Asj7XjvMrzeeFX6.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/85 via-blue-700/75 to-cyan-600/85"></div>
        </div>
        <div className="relative z-10 container text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Wellness Journey?</h2>
          <p className="text-xl mb-8 text-cyan-50 max-w-2xl mx-auto">
            Find your nearest Tech Care station today and take control of your health
          </p>
          <Link href="/find-station">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100">
              <MapPin className="w-4 h-4 mr-2" />
              Find a Station Near You
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
