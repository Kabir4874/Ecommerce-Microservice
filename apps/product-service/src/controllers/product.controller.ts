import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { uploadImageToImageKit } from "@packages/libs/imagekit";
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

// !create product
export const createProduct = async (
  req: Request & { seller?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      throw new ValidationError("Missing required fields");
    }

    if (!req.seller?.id) {
      throw new AuthError("Only seller can create product");
    }

    const slugChecking = await prisma.products.findUnique({ where: { slug } });
    if (slugChecking) {
      throw new ValidationError(
        "Slug already exist! Please use a different slug!"
      );
    }

    if (!Array.isArray(images)) {
      throw new ValidationError("Invalid images payload");
    }

    const uploaded = await Promise.all(
      images.map(async (base64: string) => {
        const { file_url, fileId } = await uploadImageToImageKit(base64, {
          folder: "/products",
        });
        return { fileId, file_url };
      })
    );

    const tagsArray = Array.isArray(tags)
      ? tags
      : String(tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: tagsArray,
        brand,
        video_url,
        category,
        subCategory,
        colors,
        discount_codes: discountCodes.map((codeId: string) => codeId),
        sizes,
        stock: Number.parseInt(stock, 10),
        sale_price: Number.parseFloat(sale_price),
        regular_price: Number.parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: uploaded.map((img) => ({
            file_id: img.fileId,
            url: img.file_url,
          })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// !get products
export const getProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

//! delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      throw new ValidationError("Product not found");
    }
    if (product.shopId !== sellerId) {
      throw new ValidationError("Unauthorized action");
    }
    if (product.isDeleted) {
      throw new ValidationError("Product is already deleted");
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product is scheduled for deletion for 24 hours. You can restore it withing this time.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      throw new ValidationError("Product not found");
    }

    if (product.shopId !== sellerId) {
      throw new ValidationError("Unauthorized action");
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state" });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "Product successfully restored!" });
  } catch (error) {
    return next(error);
  }
};
