"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignOutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutConfirmDialog({
  open,
  onOpenChange,
}: SignOutConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      toast.success("Signed out successfully.");
      await signOut({
        redirect: false,
      });
      window.location.href = "/sign-in";
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E5E7EB]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 text-base font-semibold">
                Sign Out
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                Session termination confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-slate-600">
          Are you sure you want to sign out of your Billora workspace? You will need
          to enter your credentials again to access your dashboard.
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-slate-200 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignOut}
            disabled={loading}
            className="bg-[#EF4444] hover:bg-red-600 text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Signing Out..." : "Sign Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
