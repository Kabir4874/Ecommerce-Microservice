import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

export const isSeller = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    throw new AuthError("Access denied: seller only!");
  }
};

export const isUser = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    throw new AuthError("Access denied: user only!");
  }
};
