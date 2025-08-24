import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

// export const isSeller = (req: any, res:Response, next: NextFunction) => {
//     if(req.role != "seller"){
//         return next(new AuthError("Access Denied: Sellers only"))
//     }
// }

export const isSeller = (req: any, res: Response, next: NextFunction) => {
    if (!req.seller) {
        return next(new AuthError("Access Denied: Sellers only"));
    }
    next(); // <-- Always call next() if authorized
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
    if (req.role != "user") {
        return next(new AuthError("Access Denied: Users only"))
    }
    next();
}

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.role != "admin") {
        return next(new AuthError("Access Denied: Admins only"))
    }
    next();
}