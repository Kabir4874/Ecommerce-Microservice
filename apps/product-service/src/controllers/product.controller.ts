import { NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

// !get product category
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      throw new NotFoundError("Categories not found");
    }
    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// !create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountCodeExist) {
      throw new ValidationError(
        "Discount code is already available please use a different code!"
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountCode,
        discountType,
        discountValue: parseFloat(discountValue),
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

// !get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: { sellerId: req.seller.id },
    });
    if (!discount_codes) {
      throw new NotFoundError("Discount codes not found");
    }

    res.status(201).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    return next(error);
  }
};

// !delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      throw new NotFoundError("Discount code not found");
    }

    if (discountCode.sellerId !== sellerId) {
      throw new ValidationError("Unauthorized access!");
    }

    await prisma.discount_codes.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: "Discount code successfully deleted" });
  } catch (error) {
    return next(error);
  }
};

// !upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Math.floor(
        1000 + Math.random() * 9000
      )}-${Date.now()}.jpg`,
      folder: "/products",
    });
    res.status(201).json({
      file_url: response.url,
      fileName: response.fileId,
    });
  } catch (error) {
    return next(error);
  }
};
