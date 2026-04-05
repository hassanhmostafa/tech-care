import { Link, useLocation } from "wouter";
import { Heart, Menu, X, LayoutDashboard, LogIn, LogOut, UserCircle2, Globe, Sparkles, Building2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const navLinks = [
    { href: "/find-station", label: t.nav_findStation },
    { href: "/health", label: t.nav_myHealth },
    ...(isAuthenticated ? [{ href: "/ai-plan", label: language === "ar" ? "خطة الذكاء الاصطناعي" : "AI Plan" }] : []),
  ];

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Tech Care</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span
                className={`transition-colors cursor-pointer font-medium ${
                  location === href ? "text-cyan-600" : "text-gray-700 hover:text-cyan-600"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}
          {(user?.role === "kiosk_owner" || user?.role === "admin") && (
            <Link href="/my-kiosks">
              <span
                className={`transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                  location === "/my-kiosks" ? "text-cyan-600" : "text-gray-700 hover:text-cyan-600"
                }`}
              >
                <Building2 className="w-4 h-4" />
                {language === "ar" ? "كشكاتي" : "My Kiosks"}
              </span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin">
              <span
                className={`transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                  location === "/admin" ? "text-cyan-600" : "text-gray-700 hover:text-cyan-600"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.nav_admin}
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Auth + Language */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-colors text-sm font-medium text-gray-600 hover:text-cyan-600"
            title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "عربي" : "EN"}
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <span className={`text-sm font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                  location === "/profile" ? "text-cyan-600" : "text-gray-600 hover:text-cyan-600"
                }`}>
                  <UserCircle2 className="w-4 h-4" />
                  {user?.name?.split(" ")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-red-600"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-1" />
                {t.nav_signOut}
              </Button>
            </>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <Button variant="ghost" className="text-gray-700 hover:text-cyan-600">
                  <LogIn className="w-4 h-4 mr-1" />
                  {t.nav_signIn}
                </Button>
              </a>
              <a href={getLoginUrl()}>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">{t.nav_getStarted}</Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-600"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === "en" ? "عربي" : "EN"}
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container py-4 space-y-2">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}>
                <div
                  className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </div>
              </Link>
            ))}
            {(user?.role === "kiosk_owner" || user?.role === "admin") && (
              <Link href="/my-kiosks">
                <div
                  className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  {language === "ar" ? "كشكاتي" : "My Kiosks"}
                </div>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin">
                <div
                  className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.nav_admin}
                </div>
              </Link>
            )}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="flex-1 text-red-600"
                  onClick={() => { logout(); setIsOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t.nav_signOut}
                </Button>
              ) : (
                <>
                  <a href={getLoginUrl()} className="flex-1">
                    <Button variant="ghost" className="w-full">{t.nav_signIn}</Button>
                  </a>
                  <a href={getLoginUrl()} className="flex-1">
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600">{t.nav_getStarted}</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
