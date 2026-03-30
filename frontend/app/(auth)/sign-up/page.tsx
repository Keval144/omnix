import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Omnix account and start generating AI-powered notebooks",
};

export default function Page() {
  return <SignupForm />;
}
