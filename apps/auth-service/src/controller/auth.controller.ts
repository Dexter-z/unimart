import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

//Register a new user
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user")
        const { name, email } = req.body

        const existingUser = await prisma.users.findUnique({ where: { email } })

        if (existingUser) {
            return next(new ValidationError("A User already exists with this email"))
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "user-activation-mail")

        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        })
    } catch (error) {
        return next(error)
    }
}

//Verify OTP and activate user account
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required"));
        }

        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new ValidationError("A User already exists with this email"));
        }

        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        return next(error);
    }
}

//Login User
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required"));
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return next(new AuthError("User does not exist"));
        }

        //Verify password
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        //Generate access and refresh tokens
        const accessToken = jwt.sign(
            {
                id: user.id,
                role: "user"
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            {
                id: user.id,
                role: "user"
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        //Store refresh and access token in httpOnly secure cookie
        setCookie(res, "access_token", accessToken);
        setCookie(res, "refresh_token", refreshToken);

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, name: user.name, email: user.email },
        })

    } catch (error) {
        return next(error);

    }
}

//Refresh User Token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return new ValidationError("Unauthorized access, No refresh Token");
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECET as string) as { id: string, role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden!, Invalid refresh token");
        }

        // let account;
        // if(decoded.role === "user") {
        //     account = await prisma.users.findUnique({ where: { id: decoded.id } });
        // } else {
        //     return next(new AuthError("Forbidden!, Invalid role"));
        // }

        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if(!user) {
            return (new AuthError("Forbidden!!!, User/Seller not found"));
        }

        const newAccessToken = jwt.sign(
            {id:decoded.id, role: decoded.role},
            process.env.ACCESS_TOKEN_SECET as string,
            { expiresIn: "15m" }
        )

        setCookie(res, "access_token", newAccessToken);
        return res.status(201).json({success: true})


    } catch (error) {
        return next(error);
    }
}

//Get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user; // User is set by isAuthenticated middleware
        res.status(201).json({
            success: true,
            user,
        })
    } catch (error) {
        next(error)
    }
}

//User forgot password
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await handleForgotPassword(req, res, next, "user");
    } catch (error) {
        return next(error);
    }
}

//Verify OTP for forgot password
export const verifyUserForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
}

//Reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next(new ValidationError("Email and new password are required"));
        }

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return next(new ValidationError("User not found"));
        }

        //Compare new password with existing password
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            return next(new ValidationError("New password cannot be the same as the old password"));
        }

        //Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //Update user password
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        });

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        return next(error);

    }
}

//Register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller")
        const { name, email } = req.body

        const existingUser = await prisma.users.findUnique({ where: { email } })

        if (existingUser) {
            return next(new ValidationError("A User already exists with this email"))
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "user-activation-mail")

        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        })
    } catch (error) {
        return next(error)
    }
}