import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

export const isSeller = (req: any, res:Response, next: NextFunction) => {
    if(req.role != "seller"){
        return next(new AuthError("Access Denied: Sellers only"))
    }
}

export const isUser = (req: any, res:Response, next: NextFunction) => {
    if(req.role != "user"){
        return next(new AuthError("Access Denied: Users only"))
    }
}