/**
 * UserSearchCombobox – searchable user picker for admin owner assignment.
 * Searches by name or email with debounce. Shows role badge next to each result.
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, User } from "lucide-react";

type UserOption = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "kiosk_owner" | "expert" | "admin";
};

interface UserSearchComboboxProps {
  value: UserOption | null;
  onChange: (user: UserOption | null) => void;
  placeholder?: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  kiosk_owner: "bg-cyan-100 text-cyan-700",
  user: "bg-gray-100 text-gray-600",
};

export function UserSearchCombobox({ value, onChange, placeholder = "Search by name or email…" }: UserSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = trpc.admin.searchUsers.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.trim().length >= 1 }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (user: UserOption) => {
    onChange(user);
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setDebouncedQuery("");
  };

  // If a user is already selected, show the selected state
  if (value) {
    return (
      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
        <User className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.name ?? "Unknown"}</p>
          {value.email && <p className="text-xs text-gray-500 truncate">{value.email}</p>}
        </div>
        <Badge className={`text-xs shrink-0 ${ROLE_COLORS[value.role]}`}>
          {value.role.replace("_", " ")}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6 shrink-0 text-gray-400 hover:text-red-500"
          onClick={handleClear}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>

      {open && debouncedQuery.trim().length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
          ) : !results || results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                onClick={() => handleSelect(user as UserOption)}
              >
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name ?? "Unknown"}</p>
                  {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                </div>
                <Badge className={`text-xs shrink-0 ${ROLE_COLORS[user.role]}`}>
                  {user.role.replace("_", " ")}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
