import { Link, useLocation } from "wouter";
import { Heart, Menu, X, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/find-station", label: "Find Station" },
    { href: "/health", label: "My Health" },
  ];

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
          {user?.role === "admin" && (
            <Link href="/admin">
              <span
                className={`transition-colors cursor-pointer font-medium flex items-center gap-1 ${
                  location === "/admin" ? "text-cyan-600" : "text-gray-700 hover:text-cyan-600"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 font-medium">{user?.name?.split(" ")[0]}</span>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-red-600"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <Button variant="ghost" className="text-gray-700 hover:text-cyan-600">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </a>
              <a href={getLoginUrl()}>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Get Started</Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
            {user?.role === "admin" && (
              <Link href="/admin">
                <div
                  className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
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
                  Sign Out
                </Button>
              ) : (
                <>
                  <a href={getLoginUrl()} className="flex-1">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </a>
                  <a href={getLoginUrl()} className="flex-1">
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600">Get Started</Button>
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
