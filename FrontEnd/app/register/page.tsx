"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerSchema } from "@/lib/validations";
import useAuth from "@/lib/auth"; //**ADD IT!!!!  it is important to user zustand
import type * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { alerts, AlertService } from "@/lib/alerts";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register, isLoading, error, user, token } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("onSubmit called with data:", data);

      if (data.password !== data.confirmPassword) {
        alerts.form.validationError("Passwords do not match.");
        return;
      }

      // Call Zustand register action with the correct payload
      await register({
        username: data.username, // <-- Ensure this matches the backend's expected field
        email: data.email,
        password: data.password,
        gender: data.gender,
      });

      if (token) {
        alerts.auth.registerSuccess();
        router.push("/profile");
      } else if (error) {
        alerts.auth.registerError(error);
      } else {
        alerts.auth.registerSuccess();
        AlertService.info("Please log in with your new account.", {
          title: "Registration Complete"
        });
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      alerts.auth.registerError(error?.message || "An error occurred during registration. Please try again.");
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
        {/* Left side - Register Form */}
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
              <h1 className="text-3xl font-bold">Create account</h1>
              <p className="text-muted-foreground">
                Enter your details to create your account
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Male" />
                            </FormControl>
                            <FormLabel className="flex items-center gap-1.5 font-normal">
                              <svg
                                className="h-5 w-5 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M12 14v8M8 18h8"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Female" />
                            </FormControl>
                            <FormLabel className="flex items-center gap-1.5 font-normal">
                              <svg
                                className="h-5 w-5 text-pink-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M12 14v8M12 18l-4-4M12 18l4-4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Female
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
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
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="relative hidden overflow-hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80"
            alt="Healthcare Technology"
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
                Join Medimate Today
              </h2>
              <p className="relative text-white/90">
                Get access to personalized healthcare assistance, prescription
                analysis, and expert recommendations.
              </p>
              <div className="relative mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <h3 className="font-semibold text-white">Smart Analysis</h3>
                  <p className="text-sm text-white/80">
                    AI-powered prescription scanning
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <h3 className="font-semibold text-white">Expert Guidance</h3>
                  <p className="text-sm text-white/80">
                    Professional recommendations
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
