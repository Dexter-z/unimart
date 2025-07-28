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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";


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
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`,
        data,
        { withCredentials: true } // To make sure cookies are sent with the requests
      )
      console.log(response.data)
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      queryClient.setQueryData(["user"], data.user);
      router.push("/")
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
      <Card className="bg-[#232326] border-[#232326] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-[#ff8800]">
            Login with your Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="bg-[#18181b] border-[#ff8800] text-white placeholder-gray-400"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline text-[#ff8800]"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="bg-[#18181b] border-[#ff8800] text-white placeholder-gray-400"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ff8800]"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-400 text-xs">{errors.password.message}</span>
                  )}
                </div>
                {serverError && (
                  <div className="text-red-400 text-sm text-center mb-2">{serverError}</div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 rounded border-[#ff8800] text-[#ff8800] focus:ring-[#ff8800] bg-[#18181b]"
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium text-white">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#ff8800] text-[#18181b] hover:bg-orange-600 hover:text-white transition-colors font-bold border-none"
                  disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm text-white">
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="underline underline-offset-4 text-[#ff8800]">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 text-gray-400">
        By clicking continue, you agree to our <a href="#" className="text-[#ff8800]">Terms of Service</a>{" "}
        and <a href="#" className="text-[#ff8800]">Privacy Policy</a>.
      </div>
    </div>
  )
}
