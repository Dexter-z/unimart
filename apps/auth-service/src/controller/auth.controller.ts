import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { imagekit } from "@packages/libs/imagekit";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
})

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

        const isProduction = process.env.NODE_ENV === "production";
        
        // Clear only user cookies before setting new ones
        res.clearCookie("user_access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        res.clearCookie("user_refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

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
        setCookie(res, "user_access_token", accessToken);
        setCookie(res, "user_refresh_token", refreshToken);

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, name: user.name, email: user.email },
        })

    } catch (error) {
        return next(error);

    }
}

//Refresh User Token
export const refreshUserToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.user_refresh_token;
        if (!refreshToken) {
            return new ValidationError("Unauthorized access, No refresh Token");
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string, role: string };

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
        if (!user) {
            return (new AuthError("Forbidden!!!, User/Seller not found"));
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        setCookie(res, "user_access_token", newAccessToken);
        return res.status(201).json({ success: true })


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


        const existingSeller = await prisma.sellers.findUnique({ where: { email } })

        if (existingSeller) {
            return next(new ValidationError("A Seller already exists with this email"))
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "seller-activation-mail")

        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        })
    } catch (error) {
        return next(error)
    }
}

//Verify Seller with otp
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;
        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError("All fields are required"));
        }

        const existingSeller = await prisma.sellers.findUnique({ where: { email } });
        if (existingSeller) {
            return next(new ValidationError("A Seller already exists with this email"));
        }

        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone_number,
                country
            }
        })

        res.status(201).json({
            success: true,
            message: "Seller registered successfully",
            seller: { id: newSeller.id, email: newSeller.email }
        });

    } catch (error) {
        return next(error);
    }
}

//Login Seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required"));
        }

        const seller = await prisma.sellers.findUnique({ where: { email } });

        if (!seller) {
            return next(new AuthError("Seller does not exist"));
        }

        //Verify password
        const isMatch = await bcrypt.compare(password, seller.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        const isProduction = process.env.NODE_ENV === "production";
        
        // Clear only seller cookies before setting new ones
        res.clearCookie("seller_access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        res.clearCookie("seller_refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        //Generate access and refresh tokens
        const accessToken = jwt.sign(
            {
                id: seller.id,
                role: "seller"
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            {
                id: seller.id,
                role: "seller"
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        //Store refresh and access token in httpOnly secure cookie
        setCookie(res, "seller_access_token", accessToken);
        setCookie(res, "seller_refresh_token", refreshToken);

        res.status(200).json({
            message: "Login successful",
            seller: { id: seller.id, name: seller.name, email: seller.email },
        })

    } catch (error) {
        return next(error);

    }
}

//Refresh Seller Token
export const refreshSellerToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.seller_refresh_token;
        if (!refreshToken) {
            return new ValidationError("Unauthorized access, No refresh Token");
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string, role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden!, Invalid refresh token");
        }


        const seller = await prisma.sellers.findUnique({ where: { id: decoded.id } });
        if (!seller) {
            return (new AuthError("Forbidden!!!, User/Seller not found"));
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        setCookie(res, "seller_access_token", newAccessToken);
        return res.status(201).json({ success: true })


    } catch (error) {
        return next(error);
    }
}

//Get logged in seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller; // User is set by isAuthenticated middleware
        res.status(201).json({
            success: true,
            seller,
        })
    } catch (error) {
        next(error)
    }
}

//Create Shop 
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, openingHours, website, category, sellerId } = req.body
        if (!name || !bio || !address || !openingHours || !category || !sellerId) {
            return next(new ValidationError("Please fill in the required fields"))
        }

        const shopData: any = {
            name,
            bio,
            address,
            openingHours,
            category,
            sellerId
        }

        if (website && website.trim() != "") {
            shopData.website = website;
        }

        const shop = await prisma.shops.create({
            data: shopData,
        })

        res.status(201).json({
            success: true,
            shop
        })

    } catch (error) {
        return next(error)
    }
}

//Create stripe connect account link. Not necessary for unimart, maybe with paystack
export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body

        if (!sellerId) {
            return next(new ValidationError("Seller Id is Required!"))
        }

        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } })

        if (!seller) {
            return next(new ValidationError("Seller is not available with this ID"))
        }

        const account = await stripe.accounts.create({
            type: "express",
            email: seller?.email,
            country: "US",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            }
        })

        await prisma.sellers.update({
            where: {
                id: sellerId
            },
            data: {
                stripeId: account.id
            }
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding"
        })

        res.json({
            url: accountLink.url
        })
        //Done around 7:43

    } catch (error) {
        return next(error)
    }
}

//Add user address
export const addUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id; 
        const { name, phone, address, city, state, landmark, addressType, isDefault } = req.body;

        // Input validation and sanitization
        if (!name || !phone || !address || !city || !state || !landmark || !addressType) {
            return next(new ValidationError("Please fill in all required fields"));
        }

        // Validate input lengths to prevent buffer overflow
        if (name.length > 100 || phone.length > 20 || address.length > 500 || 
            city.length > 100 || state.length > 100 || landmark.length > 200) {
            return next(new ValidationError("Input data exceeds maximum length limits"));
        }

        // Validate address type to prevent injection
        const validAddressTypes = ['home', 'work', 'other'];
        if (!validAddressTypes.includes(addressType)) {
            return next(new ValidationError("Invalid address type"));
        }

        // Sanitize inputs to prevent XSS
        const sanitizedData = {
            name: name.trim(),
            phone: phone.trim().replace(/[^\d\s\-\+\(\)]/g, ''), // Only allow phone characters
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            landmark: landmark.trim(),
            addressType: addressType.trim(),
            isDefault: Boolean(isDefault),
            userId
        };

        // Validate phone number format
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
        if (!phoneRegex.test(sanitizedData.phone)) {
            return next(new ValidationError("Invalid phone number format"));
        }

        // Check user address limit (security measure)
        const userAddressCount = await prisma.address.count({
            where: { userId }
        });

        if (userAddressCount >= 10) { // Maximum 10 addresses per user
            return next(new ValidationError("Maximum address limit reached (10 addresses)"));
        }

        if(sanitizedData.isDefault){
            // If this address is set as default, unset all other addresses
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.address.create({
            data: sanitizedData
        });

        res.status(201).json({
            success: true,
            address: newAddress
        });
    } catch (error) {
        return next(error);
    }
}

//Delete user address
export const deleteUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id; 
        const { addressId } = req.params;

        if (!addressId) {
            return next(new ValidationError("Address ID is required"));
        }

        // Validate ObjectId format to prevent injection
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(addressId)) {
            return next(new ValidationError("Invalid address ID format"));
        }

        // Secure query - explicitly check userId to prevent unauthorized access
        const address = await prisma.address.findFirst({
            where: { 
                id: addressId,
                userId: userId // Explicit userId check for security
            }
        });

        if (!address) {
            return next(new ValidationError("Address not found or access denied"));
        }

        // Prevent deletion if it's the only address and is default
        if (address.isDefault) {
            const addressCount = await prisma.address.count({
                where: { userId }
            });
            
            if (addressCount === 1) {
                return next(new ValidationError("Cannot delete the only remaining address"));
            }
        }

        await prisma.address.delete({ 
            where: { 
                id: addressId,
                userId: userId // Double-check userId for security
            } 
        });

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        return next(error);
    }
}

//Get user addresses
export const getUserAddresses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id; 

        if (!userId) {
            return next(new ValidationError("User authentication required"));
        }

        // Validate ObjectId format
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(userId)) {
            return next(new ValidationError("Invalid user ID format"));
        }

        // Secure query with explicit userId filtering
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                landmark: true,
                addressType: true,
                isDefault: true,
                createdAt: true,
                updatedAt: true
                // Explicitly exclude userId from response for security
            }
        });

        res.status(200).json({
            success: true,
            addresses: addresses || []
        });
    }
    catch (error) {
        return next(error);
    }
}

//Update user address
export const updateUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { addressId } = req.params;
        const { name, phone, address, city, state, landmark, addressType, isDefault } = req.body;

        if (!addressId) {
            return next(new ValidationError("Address ID is required"));
        }

        // Validate ObjectId format to prevent injection
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(addressId)) {
            return next(new ValidationError("Invalid address ID format"));
        }

        if (!name || !phone || !address || !city || !state || !landmark || !addressType) {
            return next(new ValidationError("Please fill in all required fields"));
        }

        // Validate input lengths to prevent buffer overflow
        if (name.length > 100 || phone.length > 20 || address.length > 500 || 
            city.length > 100 || state.length > 100 || landmark.length > 200) {
            return next(new ValidationError("Input data exceeds maximum length limits"));
        }

        // Validate address type to prevent injection
        const validAddressTypes = ['home', 'work', 'other'];
        if (!validAddressTypes.includes(addressType)) {
            return next(new ValidationError("Invalid address type"));
        }

        // Check if address exists and belongs to the user - using findFirst for security
        const existingAddress = await prisma.address.findFirst({
            where: { 
                id: addressId, 
                userId: userId // Explicit userId check
            }
        });

        if (!existingAddress) {
            return next(new ValidationError("Address not found or access denied"));
        }

        // Sanitize inputs to prevent XSS
        const sanitizedData = {
            name: name.trim(),
            phone: phone.trim().replace(/[^\d\s\-\+\(\)]/g, ''), // Only allow phone characters
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            landmark: landmark.trim(),
            addressType: addressType.trim(),
            isDefault: Boolean(isDefault)
        };

        // Validate phone number format
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
        if (!phoneRegex.test(sanitizedData.phone)) {
            return next(new ValidationError("Invalid phone number format"));
        }

        if (sanitizedData.isDefault) {
            // If this address is set as default, unset all other addresses
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { 
                id: addressId,
                userId: userId // Double-check userId for security
            },
            data: sanitizedData
        });

        res.status(200).json({
            success: true,
            address: updatedAddress
        });
    } catch (error) {
        return next(error);
    }
}

//Logout User
export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        
        // Clear the cookies with consistent settings
        res.clearCookie("user_access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        
        res.clearCookie("user_refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return next(error);
    }
}

//Logout Seller
export const logoutSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        
        // Clear the cookies with consistent settings
        res.clearCookie("seller_access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        
        res.clearCookie("seller_refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return next(error);
    }
}

//Update Shop Details
export const updateShop = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const { name, bio, address, openingHours, website, category, avatar, coverBanner } = req.body;

        if (!sellerId) {
            return next(new AuthError("Seller authentication required"));
        }

        // Find the shop by sellerId
        const existingShop = await prisma.shops.findUnique({
            where: { sellerId }
        });

        if (!existingShop) {
            return next(new ValidationError("Shop not found"));
        }

        // Prepare update data - only include fields that are provided
        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (address !== undefined) updateData.address = address;
        if (openingHours !== undefined) updateData.openingHours = openingHours;
        if (website !== undefined) updateData.website = website;
        if (category !== undefined) updateData.category = category;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (coverBanner !== undefined) updateData.coverBanner = coverBanner;

        const updatedShop = await prisma.shops.update({
            where: { sellerId },
            data: updateData,
            include: {
                images: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Shop updated successfully",
            shop: updatedShop
        });

    } catch (error) {
        return next(error);
    }
}

//Upload Shop Image
export const uploadShopImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        
        if (!fileName) {
            return next(new ValidationError("Image file is required"));
        }

        // Extract mime type from base64 string
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        
        // Validate image format
        const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
        if (!allowedFormats.includes(extension.toLowerCase())) {
            return next(new ValidationError("Invalid image format. Allowed formats: JPEG, PNG, WebP, GIF"));
        }

        console.log('uploadShopImage:', { mimeType, extension, fileName: fileName.slice(0, 30) });
        
        const response = await imagekit.upload({
            file: fileName,
            fileName: `shop-${Date.now()}.${extension}`,
            folder: "/shops",
            transformation: {
                pre: 'w-500,h-500,c-maintain_ratio'
            }
        });
        
        res.status(201).json({
            file_url: response.url,
            file_name: response.fileId,
        });
    } catch (error) {
        console.error('uploadShopImage error:', error);
        next(error);
    }
}

//Delete Shop Image
export const deleteShopImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;
        
        if (!fileId) {
            return next(new ValidationError("File ID is required"));
        }

        const response = await imagekit.deleteFile(fileId);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            response
        });
    } catch (error) {
        console.error('deleteShopImage error:', error);
        next(error);
    }
}

//Update user Password
export const updateUserPassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword, confirmPassword} = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new ValidationError("All fields are required"));
        }

        if (newPassword !== confirmPassword) {
            return next(new ValidationError("New password and confirmation do not match"));
        }

        if(currentPassword === newPassword) {
            return next(new ValidationError("New password must be different from current password"));
        }

        // Find user by ID
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user || !user.password) {
            return next(new AuthError("User not found or password not set"));
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new AuthError("Current password is incorrect"));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

        const isAdmin = user.role === "admin";

        // if(!isAdmin){
        //     sendLog({
        //         type: "error",
        //         message: `Admin Login failed for ${email} - Not an admin`,
        //         source: "auth-service"
        //     })

        //     return next(new AuthError("Not an admin"));
        // }

        // sendLog({
        //     type: "success",
        //     message: `Admin Login successful for ${email}`,
        //     source: "auth-service"
        // })

        const isProduction = process.env.NODE_ENV === "production";
        
        // Clear only seller cookies before setting new ones
        res.clearCookie("seller_access_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax" 
        });
        res.clearCookie("seller_refresh_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        //Generate access and refresh tokens
        const accessToken = jwt.sign(
            {
                id: user.id,
                role: "admin"
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            {
                id: user.id,
                role: "admin"
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        //Store refresh and access token in httpOnly secure cookie
        setCookie(res, "admin_access_token", accessToken);
        setCookie(res, "admin_refresh_token", refreshToken);

        res.status(200).json({
            message: "Login successful",
            admin: { id: user.id, name: user.name, email: user.email },
        })

    } catch (error) {
        return next(error);

    }
}