// Admin-specific authentication middleware
const isAdminAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["admin_access_token"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Admin token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "admin" | "seller" | "user";
        }

        if (!decoded || decoded.role !== "admin") {
            return res.status(401).json({
                message: "Unauthorised! Invalid admin token"
            })
        }

        const admin = await prisma.admins.findUnique({ where: { id: decoded.id } })

        if (!admin) {
            return res.status(401).json({ message: "Unauthorized! Admin not found" });
        }

        req.admin = admin;
        req.role = decoded.role;

        return next();

    } catch (error: any) {
        console.log("Error in isAdminAuthenticated: ", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Admin token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(401).json({
            message: "Unauthorized! Invalid admin token"
        })
    }
}
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        console.log("In isAuthenticated function")
        
        // First try to get user token, then seller token
        const userToken = req.cookies["user_access_token"];
        const sellerToken = req.cookies["seller_access_token"];
        const headerToken = req.headers.authorization?.split(" ")[1];
        
        console.log("Available tokens:", {
            userToken: userToken ? "present" : "missing",
            sellerToken: sellerToken ? "present" : "missing",
            headerToken: headerToken ? "present" : "missing"
        });
        
        const token = userToken || sellerToken || headerToken;

        if (!token) {
            console.log("No token found in request");
            return res.status(401).json({ message: "Unauthorized! Token Missing" });
        }

        //To verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller";
        }

        console.log("Decoded token:", { id: decoded.id, role: decoded.role });

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorised! Invalid token"
            })
        }

        let account;

        if(decoded.role === "user"){
            account = await prisma.users.findUnique({ where: { id: decoded.id } })
            req.user = account;
        } else if(decoded.role === "seller"){
            account = await prisma.sellers.findUnique({ 
                where: { id: decoded.id },
                include: {shop:true} 
            });
            
            req.seller = account
            //console.log("Account: ", account)
        }

        

        if (!account) {
            console.log("Account not found for:", { id: decoded.id, role: decoded.role });
            return res.status(401).json({ message: "Unauthorized! Account not found" });
        }

        req.role = decoded.role;
        console.log("Authentication successful for:", decoded.role);

        return next();

    } catch (error: any) {
        console.log("Error in isAuthenticated: ", error);
        
        // Check if it's a token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        
        return res.status(401).json({
            message: "Unauthorized! Invalid token"
        })
    }
}

// User-specific authentication middleware
const isUserAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["user_access_token"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! User token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller";
        }

        if (!decoded || decoded.role !== "user") {
            return res.status(401).json({
                message: "Unauthorised! Invalid user token"
            })
        }

        const user = await prisma.users.findUnique({ where: { id: decoded.id } })
        
        if (!user) {
            return res.status(401).json({ message: "Unauthorized! User not found" });
        }

        req.user = user;
        req.role = decoded.role;

        return next();

    } catch (error: any) {
        console.log("Error in isUserAuthenticated: ", error);
        
        // Check if it's a token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "User token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        
        return res.status(401).json({
            message: "Unauthorized! Invalid user token"
        })
    }
}

// Seller-specific authentication middleware
const isSellerAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["seller_access_token"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Seller token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller";
        }

        if (!decoded || decoded.role !== "seller") {
            return res.status(401).json({
                message: "Unauthorised! Invalid seller token"
            })
        }

        const seller = await prisma.sellers.findUnique({ 
            where: { id: decoded.id },
            include: {shop:true} 
        });
        
        if (!seller) {
            return res.status(401).json({ message: "Unauthorized! Seller not found" });
        }

        req.seller = seller;
        req.role = decoded.role;

        return next();

    } catch (error: any) {
        console.log("Error in isSellerAuthenticated: ", error);
        
        // Check if it's a token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Seller token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        
        return res.status(401).json({
            message: "Unauthorized! Invalid seller token"
        })
    }
}

export default isAuthenticated;
export { isUserAuthenticated, isSellerAuthenticated, isAdminAuthenticated };