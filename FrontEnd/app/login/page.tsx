"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MedimateIcon from "@/components/medimate-icon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/lib/validations";
import useAuth from "@/lib/auth";
import type * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { alerts, AlertService } from "@/lib/alerts";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading, error, user, token } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data); // Wait for the login promise to resolve

      // Check Zustand state for the updated token
      const { token } = useAuth.getState();
      if (token) {
        console.log("Token exists, redirecting to /profile");
        alerts.auth.loginSuccess();
        router.push("/profile");
      } else {
        console.log("No token found, login may have failed");
        alerts.auth.loginError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alerts.auth.loginError(error?.message || "Invalid credentials. Please check your email and password.");
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      AlertService.info("Google Sign-in is coming soon!", { 
        title: "Feature Coming Soon" 
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-2">
        {/* Left side - Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-[400px] space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-primary/10 blur-lg" />
                <MedimateIcon size={48} color="auto" rotate={22.5} className="relative h-12 w-12" />
              </div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl font-bold">Medimate</span>
              </div>
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="relative hidden overflow-hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80"
            alt="Healthcare Professional"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-background/90" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative max-w-[400px] space-y-4">
              <div className="absolute -left-12 -top-12 h-24 w-24 rounded-full border-8 border-white/10 bg-white/5 backdrop-blur-sm" />
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full border-8 border-white/10 bg-white/5 backdrop-blur-sm" />
              <h2 className="relative text-3xl font-bold text-white">
                Your Healthcare Companion
              </h2>
              <p className="relative text-white/90">
                Access personalized medical assistance, analyze prescriptions,
                and get instant answers to your healthcare queries.
              </p>
              <div className="relative mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <h3 className="font-semibold text-white">24/7 Support</h3>
                  <p className="text-sm text-white/80">
                    Always here when you need us
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <h3 className="font-semibold text-white">AI-Powered</h3>
                  <p className="text-sm text-white/80">
                    Smart healthcare solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
