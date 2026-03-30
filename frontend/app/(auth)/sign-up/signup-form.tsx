"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signUpSchema } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth/client";

import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shadcn-ui/card";

import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import { Button } from "@/components/shadcn-ui/button";
import { Separator } from "@/components/shadcn-ui/separator";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Github,
  Chrome,
  BadgeCheck,
} from "lucide-react";

import { Logo } from "@/components/common/logo";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signUpSchema.safeParse({ name, email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      return;
    }

    setErrors({});
    setLoading(true);

    const toastId = toast.loading("Creating account...");

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    toast.dismiss(toastId);

    if (error) {
      toast.error("Sign up failed", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast.success("Account created");
    router.push("/dashboard");
  };

  const lastMethod = authClient.getLastUsedLoginMethod();

  return (
    <Card className="mx-auto w-full max-w-md border-border/40 bg-card/80 shadow-xl shadow-black/10 backdrop-blur-2xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 mb-1 hover:opacity-80 transition-opacity">
          <Logo size={28} />
          <span className="text-2xl font-bold tracking-tight">Omnix</span>
        </Link>

        <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
        <CardDescription className="text-sm">Start building powerful AI workflows</CardDescription>
      </CardHeader>

      <CardContent className="pb-6">
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</Label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="pl-10 py-2 bg-background/60 border-border/60 focus:border-primary/60"
              />
            </div>

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                type="email"
                placeholder="hello@omnix.ai"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className="pl-10 py-2 bg-background/60 border-border/60 focus:border-primary/60"
              />
            </div>

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="pl-10 pr-10 py-2 bg-background/60 border-border/60 focus:border-primary/60"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}

            <p className="text-[11px] text-muted-foreground">
              At least 8 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-medium shadow-md shadow-primary/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <Separator className="flex-1 bg-border/40" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Or continue with</span>
          <Separator className="flex-1 bg-border/40" />
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className={`w-full py-2 border-border/60 bg-background/40 hover:bg-background/70 transition-colors ${lastMethod === 'google' ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
            {lastMethod === 'google' && <BadgeCheck className="w-4 h-4 ml-auto text-primary" />}
          </Button>

          <Button 
            variant="outline" 
            className={`w-full py-2 border-border/60 bg-background/40 hover:bg-background/70 transition-colors ${lastMethod === 'github' ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
            {lastMethod === 'github' && <BadgeCheck className="w-4 h-4 ml-auto text-primary" />}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/40 bg-muted/20 py-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
