"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { signInSchema } from "@/lib/validation/auth";

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

import { Mail, Lock, Eye, EyeOff, Loader2, Chrome, Github } from "lucide-react";
import { Logo } from "@/components/common/logo";

export function SigninForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      return;
    }

    setErrors({});
    setLoading(true);

    const toastId = toast.loading("Signing you in...");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    toast.dismiss(toastId);

    if (error) {
      toast.error("Sign in failed", {
        description: error.message,
      });

      setLoading(false);
      return;
    }

    toast.success("Welcome back");

    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-xl py-2">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-3xl mb-2">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Logo size={30} />
            <span>Omnix</span>
          </Link>
        </CardTitle>

        <CardTitle>Welcome Back</CardTitle>

        <CardDescription>
          Sign in to continue building with Omnix
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label>Email</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />

              <Input
                type="email"
                placeholder="hello@omnix.ai"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className="pl-9"
              />
            </div>

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label>Password</Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
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
          </div>

          <Button
            onClick={handleSignin}
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full gap-2">
            <Chrome className="w-4 h-4" />
            Continue with Google
          </Button>

          <Button variant="outline" className="w-full gap-2">
            <Github className="w-4 h-4" />
            Continue with GitHub
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center text-sm">
        Don’t have an account?
        <Link
          href="/sign-up"
          className="ml-1 font-medium text-emerald-500 hover:underline"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
