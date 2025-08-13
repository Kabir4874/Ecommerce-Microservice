import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: ["Electronics", "Fashion"],
          subCategories: {
            Electronics: ["Mobiles", "Laptops", "Accessories", "Gaming"],
            Fashion: ["Men", "Women", "Kids", "Footwear"],
          },
        },
      });
    }
  } catch (error) {
    console.error("Error initializing site config: ", error);
  }
};

export default initializeSiteConfig;
