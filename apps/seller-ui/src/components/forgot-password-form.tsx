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
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";


type FormData = {
    email: string;
    password: string;
};

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0; // Reset timer
                }
                return prev - 1;
            });
        }, 1000);
    }

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,
                { email },
            );
            return response.data;
        },
        onSuccess: (_, { email }) => {
            setUserEmail(email);
            setStep("otp");
            setServerError(null);
            setCanResend(false);
            setTimer(60); // Reset timer to 60 seconds
            startResendTimer();
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP, Please try again.";
            setServerError(errorMessage);
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
                { email: userEmail, otp: otp.join("") },
            )
            return response.data;
        },
        onSuccess: () => {
            setStep("reset");
            setServerError(null);
        },

        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP, Please try again.";
            setServerError(errorMessage);
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-forgot-password-user`,
                { email: userEmail, newPassword: password },
            )
            return response.data;
        },
        onSuccess: () => {
            setStep("email");
            toast.success("Password reset successfully. You can now log in with your new password.");
            setServerError(null);
            router.push("/login");
        },

        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Failed to reset password, Please try again.";
            setServerError(errorMessage);
        }
    })

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return; // Allow only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus(); // Move to next input
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus(); // Move to previous input
        }
    }

    const onSubmitEmail = async ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email });
    }

    const onSubmitPassword = async ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password });
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {step === "email" && (<Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Reset Password</CardTitle>
                    <CardDescription>
                        Input the Email you signed up with to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                                <Button
                                    type="submit"
                                    className="w-full bg-[#3489FF] hover:bg-blue-600 transition-colors"
                                    disabled={requestOtpMutation.isPending}>
                                    {requestOtpMutation.isPending ? "Sending Reset Email..." : "Send Reset Email"}
                                </Button>
                            </div>

                            {serverError && (
                                <div className="text-red-500 text-sm text-center mb-2">{serverError}</div>
                            )}

                            <div className="text-center text-sm">
                                Don't have an account?{" "}
                                <a href="/sign-up" className="underline underline-offset-4">
                                    Sign up
                                </a>
                            </div>
                            <div className="text-center text-sm">
                                Go back to login?{" "}
                                <a href="/login" className="underline underline-offset-4">
                                    Login
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>)}

            {step === "otp" && (
                <div>
                    <h3 className="text-xl font-semibold text-center mb-4">
                        Enter OTP
                    </h3>
                    <div className="flex justify-center gap-6">
                        {otp?.map((digit, index) => (
                            <input key={index} type="text" ref={(el) => {
                                if (el) {
                                    inputRefs.current[index] = el;
                                }
                            }}
                                maxLength={1}
                                className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                                value={digit}
                                onChange={(e) => { handleOtpChange(index, e.target.value); }}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            />
                        ))}
                    </div>

                    <button
                        className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={verifyOtpMutation.isPending}
                        onClick={() => verifyOtpMutation.mutate()}
                    >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </button>

                    <p className="text-center text-sm mt-4">
                        {canResend ? (
                            <button
                                onClick={() => requestOtpMutation.mutate({ email: userEmail! })}
                                className="text-blue-500 hover:underline"
                            >
                                Resend OTP
                            </button>
                        ) :
                            `Resend OTP in ${timer} seconds`
                        }
                    </p>
                    {
                        verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                            <p className="text-red-500 text-sm text-center mt-2">
                                {
                                    ((verifyOtpMutation.error as AxiosError).response?.data as { message?: string })?.message
                                    || verifyOtpMutation.error.message
                                }
                            </p>
                        )
                    }
                </div>
            )}

            {step === "reset" && (
                <div>
                    <h3 className="text-xl font-semibold text-center mb-4">
                        Reset Your Password
                    </h3>
                    <form onSubmit={handleSubmit(onSubmitPassword)}>
                        <div className="grid gap-3">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
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
                            {serverError && (
                                <span className="text-red-500 text-xs text-center">{serverError}</span>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#3489FF] hover:bg-blue-600 transition-colors"
                                disabled={resetPasswordMutation.isPending}
                                onClick={() => { console.log() }}
                            >
                                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
