import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useForm } from "react-hook-form";


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import useSeller from "@/hooks/useSeller";


type FormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const {refetch} = useSeller()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-seller`,
        data,
        { withCredentials: true } // To make sure cookies are sent with the request
      )
      console.log(response.data)
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      refetch();
      router.push("/dashboard")
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid email or password.";
      setServerError(errorMessage);
    }
  })

  const onSubmit = async (data: FormData) => {
    console.log(data);
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline text-blue-800"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*\d).+$/,
                          message: "Password must contain an uppercase letter and a number",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-xs">{errors.password.message}</span>
                  )}
                </div>
                {serverError && (
                  <div className="text-red-500 text-sm text-center mb-2">{serverError}</div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#3489FF] hover:bg-blue-600 transition-colors"
                  disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
