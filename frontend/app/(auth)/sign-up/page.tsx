"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import { Button } from "@/components/shadcn-ui/button";
import { Separator } from "@/components/shadcn-ui/separator";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast.warning("Missing fields", {
        description: "Please fill in your name, email, and password.",
      });
      return;
    }
    if (password.length < 8) {
      toast.warning("Password too short", {
        description: "Your password must be at least 8 characters long.",
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your account…", {
      description: "Setting up your Omnix workspace.",
    });

    const { error } = await authClient.signUp.email({ email, password, name });

    if (error) {
      toast.dismiss(toastId);
      toast.error("Sign up failed", {
        description: error.message ?? "Something went wrong. Please try again.",
      });
      console.log(error);
      setLoading(false);
      return;
    }

    toast.dismiss(toastId);
    toast.success("Account created! 🎉", {
      description: "Welcome to Omnix. You can now sign in.",
    });
    setLoading(false);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#050807" }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(74,222,128,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── PRIMARY glow — bottom-right, hot and tight ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-38%, 18%)",
          width: "340px",
          height: "340px",
          background:
            "radial-gradient(ellipse at center, #22c55e 0%, rgba(34,197,94,0.55) 20%, rgba(34,197,94,0.15) 50%, transparent 72%)",
          filter: "blur(28px)",
        }}
      />
      {/* soft halo around the primary */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-42%, 30%)",
          width: "520px",
          height: "320px",
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* ── SECONDARY glow — top-left, dimmer and wide ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-70%, -58%)",
          width: "260px",
          height: "260px",
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.45) 0%, rgba(34,197,94,0.18) 35%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />
      {/* wide atmospheric bleed from secondary */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-80%, -52%)",
          width: "420px",
          height: "300px",
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Card */}
      <div
        className="auth-card relative z-20 w-full max-w-[360px] mx-4 flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.09 0.008 145 / 0.97)",
          border: "1px solid rgba(34,197,94,0.18)",
          boxShadow:
            "0 0 0 1px rgba(34,197,94,0.06), 0 40px 80px -20px rgba(0,0,0,0.95)",
        }}
      >
        {/* Top glow line */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.55), transparent)",
          }}
        />

        <div className="px-8 pt-8 pb-8 flex flex-col gap-5">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden
                className="logo-spin"
              >
                <circle cx="14" cy="14" r="12.5" stroke="#4ade80" strokeWidth="2" />
                <path d="M9 9 L19 19 M19 9 L9 19" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-display text-xl font-semibold tracking-tight" style={{ color: "rgba(240,250,244,0.95)" }}>
                Omnix
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "rgba(245,255,248,0.97)" }}>
              Create your account
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "rgba(180,200,185,0.6)" }}>
              Start building powerful AI workflows
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-name" className="text-xs font-medium" style={{ color: "rgba(160,185,168,0.7)" }}>
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(120,160,130,0.6)" }} />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-10 text-sm"
                  style={{
                    background: "rgba(10,18,12,0.8)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    color: "rgba(230,245,235,0.9)",
                    borderRadius: "0.5rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-email" className="text-xs font-medium" style={{ color: "rgba(160,185,168,0.7)" }}>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(120,160,130,0.6)" }} />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="hello@omnix.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-sm"
                  style={{
                    background: "rgba(10,18,12,0.8)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    color: "rgba(230,245,235,0.9)",
                    borderRadius: "0.5rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-password" className="text-xs font-medium" style={{ color: "rgba(160,185,168,0.7)" }}>
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(120,160,130,0.6)" }} />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  className="pl-9 pr-10 h-10 text-sm"
                  style={{
                    background: "rgba(10,18,12,0.8)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    color: "rgba(230,245,235,0.9)",
                    borderRadius: "0.5rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-90 transition-opacity"
                  aria-label="Toggle password"
                  style={{ color: "rgba(180,220,190,0.8)" }}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px]" style={{ color: "rgba(100,140,112,0.55)" }}>
                At least 8 characters
              </p>
            </div>

            {/* Create Account button */}
            <button
              id="signup-submit"
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="auth-btn mt-1 w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" style={{ background: "rgba(34,197,94,0.14)" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(120,160,130,0.55)" }}>OR</span>
            <Separator className="flex-1" style={{ background: "rgba(34,197,94,0.14)" }} />
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-2.5">
            <Button
              id="signup-google"
              variant="outline"
              type="button"
              className="social-btn w-full h-10 gap-3 text-sm font-medium justify-center"
              style={{
                background: "rgba(10,18,12,0.5)",
                border: "1px solid rgba(34,197,94,0.18)",
                color: "rgba(200,230,210,0.8)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <Button
              id="signup-github"
              variant="outline"
              type="button"
              className="social-btn w-full h-10 gap-3 text-sm font-medium justify-center"
              style={{
                background: "rgba(10,18,12,0.5)",
                border: "1px solid rgba(34,197,94,0.18)",
                color: "rgba(200,230,210,0.8)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs" style={{ color: "rgba(100,140,112,0.6)" }}>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold hover:brightness-125 transition-all" style={{ color: "#4ade80" }}>
              Sign in
            </Link>
          </p>
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.25), transparent)" }} />
      </div>

      <style>{`
        .auth-card {
          animation: authCardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes authCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logo-spin {
          animation: logoSpin 3s linear infinite;
          transform-origin: 14px 14px;
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .auth-btn {
          background: #22c55e;
          color: #050807;
          box-shadow: 0 0 20px rgba(34,197,94,0.4);
          transition: all 0.2s ease;
        }
        .auth-btn:not(:disabled):hover {
          background: #4ade80;
          box-shadow: 0 0 36px rgba(34,197,94,0.6);
          transform: translateY(-1px);
        }
        .auth-btn:not(:disabled):active {
          transform: translateY(0);
        }

        .social-btn:hover {
          border-color: rgba(74,222,128,0.4) !important;
          background: rgba(20,40,26,0.6) !important;
          color: rgba(220,245,228,0.95) !important;
        }
      `}</style>
    </div>
  );
}