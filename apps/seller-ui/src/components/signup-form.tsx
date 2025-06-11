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
import { countries } from "@/utils/countries";
import { shopCategories } from "@/utils/categories";


type FormData = {
    name: string;
    email: string;
    phone_number: string;
    country: string;
    password: string;
    confirmPassword: string;
    rememberMe?: boolean;
    store_name: string;
    bio: string;
    address: string;
    openingHours: string;
    website?: string;
    category: string;
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
    const [sellerData, setSellerData] = useState<FormData | null>(null);
    const [activeStep, setActiveStep] = useState(1); // 1, 2, or 3
    const [sellerId, setSellerId] = useState("")

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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`, data)

            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    })

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`, data)

            return response.data;
        },

        onSuccess: () => {
            setActiveStep(3)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
                {
                    ...sellerData, //To spread the name, email and password instead of using them as an object
                    otp: otp.join("") // Join the OTP array into a string
                }
            )
            return response.data;
        },
        onSuccess: (data) => {
            console.log("Seller data: " + data?.seller?.id)
            setSellerId(data?.seller?.id)
            setActiveStep(2)
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

    const resendOtp = () => {
        if (sellerData) {
            signUpMutation.mutate(sellerData);
        }
    }

    const onSubmit = async (data: FormData) => {
        signUpMutation.mutate(data);
    };

    const onShopSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }
        shopCreateMutation.mutate(shopData);
        console.log(data)
        console.log(shopData)
        // try {
        //   console.log(data);
        //   setServerError(null);
        // } catch (err) {
        //   setServerError("Invalid email or password."); // Or use err.message
        // }
    };

    const connectStripe = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`, { sellerId })

            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.log("Stripe Connection Error: ", error)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>

                <CardContent>
                    <div className="relative flex flex-col items-center w-full mb-8">
                        {/* Stepper track */}
                        <div
                            className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300 -translate-y-1/2 rounded"
                            style={{ margin: '0 10%' }}
                        />
                        {/* Sliding active bar */}
                        <div
                            className="absolute top-1/2 h-1 bg-blue-500 rounded transition-all duration-300"
                            style={{
                                width: '26.66%', // 33.33% of 80% (track width) = 26.66% of 100%
                                left: `calc(10% + ${(activeStep - 1) * 26.66}%)`,
                                transform: 'translateY(-50%)',
                            }}
                        />
                    </div>
                    {/* Step label under the stepper, NOT inside the relative container */}
                    <div className="mb-6 flex justify-center w-full">

                    </div>

                    {/*Steps content */}
                    <div>
                        {/* First step */}
                        {activeStep === 1 && (
                            <div>
                                {!showOtp ? (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <h3 className="text-2xl font-semibold text-center mb-4">
                                            Create Account
                                        </h3>
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
                                                    <Label htmlFor="phone_number">Phone Number</Label>
                                                    <Input
                                                        id="phone_number"
                                                        type="tel"
                                                        placeholder="e.g. +2348012345678"
                                                        {...register("phone_number", {
                                                            required: "Phone number is required",
                                                            pattern: {
                                                                value: /^\+?[0-9]{7,15}$/,
                                                                message: "Enter a valid phone number",
                                                            },
                                                        })}
                                                    />
                                                    {errors.phone_number && (
                                                        <span className="text-red-500 text-xs">{errors.phone_number.message}</span>
                                                    )}
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="country">Country</Label>
                                                    <select
                                                        id="country"
                                                        {...register("country", { required: "Country is required" })}
                                                        className={`border rounded w-full py-2 ${!watch("country") ? "text-gray-400" : "text-black"}`}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>
                                                            Select your country
                                                        </option>
                                                        {countries.map((country) => (
                                                            <option key={country.code} value={country.code} className="text-black">
                                                                {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.country && (
                                                        <span className="text-red-500 text-xs">{errors.country.message}</span>
                                                    )}
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

                                                {/* Show signup mutation error */}
                                                {signUpMutation.isError && signUpMutation.error instanceof AxiosError && (
                                                    <div className="mb-4 text-center text-red-500 text-sm">
                                                        {signUpMutation.error.response?.data?.message || signUpMutation.error.message}
                                                    </div>
                                                )}
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
                            </div>
                        )}

                        {/* Second step */}
                        {activeStep === 2 && (
                            <div>
                                <form
                                    onSubmit={handleSubmit(onShopSubmit)}
                                >
                                    <h3 className="text-2xl font-semibold text-center mb-4">
                                        Setup New Store
                                    </h3>
                                    <div className="grid gap-6">
                                        {/* Store name */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="store_name">Store Name *</Label>
                                            <Input
                                                id="store_name"
                                                type="text"
                                                placeholder="Enter your store name"
                                                className="w-full"
                                                {...register("store_name", { required: "Store name is required" })}
                                            />
                                            {errors.store_name && (
                                                <span className="text-red-500 text-xs">{errors.store_name.message}</span>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="bio">Bio *</Label>
                                            <Input
                                                id="bio"
                                                type="text"
                                                placeholder="Short description about your store"
                                                className="w-full"
                                                {...register("bio", { required: "Bio is required" })}
                                            />
                                            {errors.bio && (
                                                <span className="text-red-500 text-xs">{errors.bio.message}</span>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="address">Address *</Label>
                                            <Input
                                                id="address"
                                                type="text"
                                                placeholder="Store address"
                                                className="w-full"
                                                {...register("address", { required: "Address is required" })}
                                            />
                                            {errors.address && (
                                                <span className="text-red-500 text-xs">{errors.address.message}</span>
                                            )}
                                        </div>

                                        {/* Opening Hours */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="openingHours">Opening Hours *</Label>
                                            <Input
                                                id="openingHours"
                                                type="text"
                                                placeholder="e.g. Mon-Fri 9am-5pm"
                                                className="w-full"
                                                {...register("openingHours", { required: "Opening hours are required" })}
                                            />
                                            {errors.openingHours && (
                                                <span className="text-red-500 text-xs">{errors.openingHours.message}</span>
                                            )}
                                        </div>

                                        {/* Website */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                placeholder="https://yourstore.com"
                                                className="w-full"
                                                {...register("website", {
                                                    pattern: {
                                                        value: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i,
                                                        message: "Please enter a valid URL",
                                                    },
                                                })}
                                            />
                                            {errors.website && (
                                                <span className="text-red-500 text-xs">{errors.website.message}</span>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                id="category"
                                                className={`border rounded w-full py-2 ${!watch("category") ? "text-gray-400" : "text-black"}`}
                                                {...register("category", { required: "Category is required" })}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>
                                                    Select a category
                                                </option>
                                                {shopCategories.map((category) => (
                                                    <option key={category.value} value={category.value} className="text-black">
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <span className="text-red-500 text-xs">{errors.category.message}</span>
                                            )}
                                        </div>

                                        {/* Global required fields error */}
                                        {(errors.store_name || errors.bio || errors.address || errors.openingHours || errors.category) && (
                                            <div className="mb-2 text-center text-red-500 text-sm">
                                                Please fill in the required fields
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={shopCreateMutation.isPending}
                                            className="w-full bg-[#3489FF] hover:bg-blue-600 transition-colors"
                                        >
                                            {shopCreateMutation.isPending ? "Creating Store..." : "Create Store"}
                                        </Button>
                                        {shopCreateMutation.isError && shopCreateMutation.error instanceof AxiosError && (
                                            <div className="mb-4 text-center text-red-500 text-sm">
                                                {shopCreateMutation.error.response?.data?.message || shopCreateMutation.error.message}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Third step */}
                        {activeStep === 3 && (
                            <div className="text-center">
                                <h3 className="text-2xl font-semibold text-center mb-4">
                                    Withdrawal method
                                </h3>
                                <Button
                                    className="bg-[#635bff] hover:bg-[#7a6fff] text-white mt-6"
                                    onClick={connectStripe}
                                >
                                    Connect Stripe {/*Stripe logo here */}
                                </Button>
                                <br />
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}
