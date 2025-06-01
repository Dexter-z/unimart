import crypto from "crypto"
import { ValidationError } from "@packages/error-handler";
import { NextFunction } from "express";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";


const emailRegex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const {name, email, password, phone_number, country} = data;

    if(!name || !email || !password || (userType === "seller" && (!phone_number || !country))){
        throw new ValidationError(`Missing Required Fields`)
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid Email Format")
    }
}

export const checkOtpRestrictions = async (email:string, next:NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
        return next(new ValidationError("Account temporarily locked due to multiple failed attempts!. Try again after 30 minutes"))
    }
    if(await redis.get(`otp_spam_lock:${email}`)){
        return next(new ValidationError("Too many otp requests!. Please wait 1 hour before requesting for another"))
    }
    if(await redis.get(`otp_cooldown:${email}`)){
        return next(new ValidationError("Please wait 1 minute before requesting for a new otp"))
    }
}

export const trackOtpRequests = async(email:string, next:NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0")

    if(otpRequests >= 3){
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600)
        return next(new ValidationError("Too many otp requests. Please try again after 1 hour")) 
    }

    await redis.set(otpRequestKey,otpRequests + 1, "EX", 3600)
}

export const sendOtp = async(name:string, email:string, template:string) => {
    const otp = crypto.randomInt(1000, 9999).toString()
    await sendEmail(email, "Verify your email", template, {name, otp});
    await redis.set(`otp: ${email}`, otp, "EX", 300)
    await redis.set(`otp_cooldown: ${email}`, "true", "EX", 60)
}

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp: ${email}`);
    if (!storedOtp) {
        throw new ValidationError("Invalid or expired OTP.");
    }

    const failedAttemptsKey = `otp_failed_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if(storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp: ${email}`, failedAttemptsKey);
            throw new ValidationError("Account temporarily locked due to multiple failed attempts!. Try again after 30 minutes");
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
        throw new ValidationError(`Invalid OTP. ${2 - failedAttempts} attempts left.`);
    }

    await redis.del(`otp: ${email}`, failedAttemptsKey);
}