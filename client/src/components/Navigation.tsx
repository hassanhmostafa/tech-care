import { Link } from "wouter";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Higi Saudi</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/find-station">
            <span className="text-gray-700 hover:text-cyan-600 transition-colors cursor-pointer font-medium">
              Find Station
            </span>
          </Link>
          <Link href="/about">
            <span className="text-gray-700 hover:text-cyan-600 transition-colors cursor-pointer font-medium">
              About
            </span>
          </Link>
          <Link href="/services">
            <span className="text-gray-700 hover:text-cyan-600 transition-colors cursor-pointer font-medium">
              Services
            </span>
          </Link>
          <Link href="/contact">
            <span className="text-gray-700 hover:text-cyan-600 transition-colors cursor-pointer font-medium">
              Contact
            </span>
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-gray-700 hover:text-cyan-600">
            Sign In
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Get Started</Button>
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
          <div className="container py-4 space-y-4">
            <Link href="/find-station">
              <div className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium">
                Find Station
              </div>
            </Link>
            <Link href="/about">
              <div className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium">
                About
              </div>
            </Link>
            <Link href="/services">
              <div className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium">
                Services
              </div>
            </Link>
            <Link href="/contact">
              <div className="text-gray-700 hover:text-cyan-600 py-2 cursor-pointer font-medium">
                Contact
              </div>
            </Link>
            <div className="flex gap-2 pt-4">
              <Button variant="ghost" className="flex-1">
                Sign In
              </Button>
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
