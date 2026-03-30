import type { Metadata } from "next";
import Link from "next/link";
import { SigninForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Omnix account to access AI-powered notebooks",
};

export default function SignInPage() {
  return <SigninForm />;
}
