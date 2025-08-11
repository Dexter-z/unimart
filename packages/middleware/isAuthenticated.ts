import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        console.log("In isAuthenticated function")
        const token = req.cookies["user_access_token"] || req.cookies["seller_access_token"] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Token Missing" });
        }

        //To verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: "user" | "seller";
        }

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
            return res.status(401).json({ message: "Unauthorized! Account not found" });
        }

        req.role = decoded.role;

        return next();

    } catch (error) {
        console.log("Error in isAuthenticated: ", error);
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

    } catch (error) {
        console.log("Error in isUserAuthenticated: ", error);
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

    } catch (error) {
        console.log("Error in isSellerAuthenticated: ", error);
        return res.status(401).json({
            message: "Unauthorized! Invalid seller token"
        })
    }
}

export default isAuthenticated;
export { isUserAuthenticated, isSellerAuthenticated };