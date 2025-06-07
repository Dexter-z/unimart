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
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";


type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe?: boolean;
};

export function SignUpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    //const [serverError, setServerError] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
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

    const signUpMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`, data)

            return response.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
                {
                    ...userData, //To spread the name, email and password instead of using them as an object
                    otp: otp.join("") // Join the OTP array into a string
                }
            )
            return response.data;
        },
        onSuccess: () => {
            router.push("/login");
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

    const resendOtp = () => { }

    const onSubmit = async (data: FormData) => {
        console.log(data);
        signUpMutation.mutate(data);
        // try {
        //   console.log(data);
        //   setServerError(null);
        // } catch (err) {
        //   setServerError("Invalid email or password."); // Or use err.message
        // }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome to Unimart UNN</CardTitle>
                    <CardDescription>
                        Signup with your Email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showOtp ? (<form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Full name"
                                        {...register("name", { required: "Name is required" })}
                                    />
                                    {errors.name && (
                                        <span className="text-red-500 text-xs">{errors.name.message}</span>
                                    )}
                                </div>

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
                                

                                <div className="grid gap-3">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            {...register("confirmPassword", {
                                                required: "Please confirm your password",
                                                validate: (value) =>
                                                    value === watch("password") || "Passwords do not match",
                                            })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
                                    )}
                                </div>

                                <Button type="submit" disabled={signUpMutation.isPending} className="w-full bg-[#3489FF] hover:bg-blue-600 transition-colors">
                                    {signUpMutation.isPending ? "Signing up..." : "Sign Up"}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <a href="/login" className="underline underline-offset-4">
                                    Login
                                </a>
                            </div>
                        </div>
                    </form>) : (
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
                                        onClick={resendOtp}
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
                                        {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}

                                    </p>
                                )
                            }
                        </div>
                    )}

                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
