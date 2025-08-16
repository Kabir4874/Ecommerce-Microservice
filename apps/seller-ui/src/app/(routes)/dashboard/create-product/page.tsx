"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ColorSelector from "packages/components/color-selector";
import CustomProperties from "packages/components/custom-properties";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import SizeSelector from "packages/components/size-selector";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import api from "../../../api/api";

type LocalImage = {
  file: File;
  preview: string;
};

type FormValues = {
  title: string;
  short_description: string;
  tags: string;
  warranty: string;
  slug: string;
  brand?: string;
  cash_on_delivery: "yes" | "no";
  category: string;
  subcategory: string;
  detailed_description: string;
  video_url?: string;
  regular_price: number;
  sale_price: number;
  stock: number;
  discountCodes: string[];
  colors: string[];
  sizes: string[];
  custom_specifications: Record<string, any>;
  customProperties: Record<string, any>;
  images: (LocalImage | null)[];
};

const MAX_IMAGES = 8;

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      discountCodes: [],
      cash_on_delivery: "yes",
      images: [null],
      colors: [],
      sizes: [],
      custom_specifications: {},
      customProperties: {},
    },
  });

  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(LocalImage | null)[]>([null]);
  const [pictureUploadingLoader] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await api.get("/product/api/get-discount-codes");
      return res.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};
  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(
    () => (selectedCategory ? subCategoriesData[selectedCategory] || [] : []),
    [selectedCategory, subCategoriesData]
  );

  const ensureTrailingNull = useCallback((arr: (LocalImage | null)[]) => {
    const nonNull = arr.filter(Boolean) as LocalImage[];
    const limited = nonNull.slice(0, MAX_IMAGES);
    if (limited.length === 0) return [null];
    if (limited.length < MAX_IMAGES) return [...limited, null];
    return limited;
  }, []);

  const syncImages = useCallback(
    (next: (LocalImage | null)[]) => {
      const normalized = ensureTrailingNull(next);
      setImages(normalized);
      setValue("images", normalized, { shouldDirty: true, shouldTouch: true });
      setIsChanged(true);
    },
    [ensureTrailingNull, setValue]
  );

  const handleFilesSelected = (files: File[], startIndex: number) => {
    if (!files.length) return;

    const withPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const next = [...images];

    if (next[startIndex]) {
      next[startIndex] = withPreviews[0];
      let cursor = startIndex + 1;
      for (let i = 1; i < withPreviews.length && cursor < MAX_IMAGES; i++) {
        next[cursor] = withPreviews[i];
        cursor++;
      }
    } else {
      let cursor = startIndex;
      for (let i = 0; i < withPreviews.length && cursor < MAX_IMAGES; i++) {
        next[cursor] = withPreviews[i];
        cursor++;
      }
    }

    syncImages(next);
  };

  const handleRemoveImage = (index: number) => {
    const next = [...images];
    next[index] = null;
    syncImages(next);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const createProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/product/api/create-product", payload);
      return res.data;
    },
    onSuccess: () => {
      router.push("/dashboard/all-products");
    },
  });

  const onSubmit = async (form: FormValues) => {
    const picked = images.filter(Boolean) as LocalImage[];
    const imagesBase64 = await Promise.all(
      picked.map(({ file }) => fileToBase64(file))
    );

    const payload = {
      ...form,
      subCategory: form.subcategory,
      images: imagesBase64,
    };

    createProductMutation.mutate(payload);
  };

  const handleSaveDraft = () => {
    setIsChanged(false);
  };

  return (
    <form
      id="createProductForm"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      {/* heading & breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <Link href={"/dashboard"} className="text-[#80deea]">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* content layout */}
      <div className="py-4 w-full flex gap-6">
        {/* left side -> images */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              size="765 x 850"
              small={false}
              index={0}
              onFilesSelected={handleFilesSelected}
              onRemove={handleRemoveImage}
              images={images}
              pictureUploadingLoader={pictureUploadingLoader}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, idx) => (
              <ImagePlaceHolder
                key={`slot-${idx + 1}-${images[idx + 1]?.preview ?? "null"}`}
                size="765 x 850"
                small
                index={idx + 1}
                onFilesSelected={handleFilesSelected}
                onRemove={handleRemoveImage}
                images={images}
                pictureUploadingLoader={pictureUploadingLoader}
              />
            ))}
          </div>
        </div>

        {/* right side -> form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* left column */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("short_description", {
                    required: "Short Description is required",
                    validate: (value) => {
                      const wordCount = String(value ?? "")
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length;
                      return (
                        wordCount <= 150 ||
                        `Description can't exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple,flagship"
                  {...register("tags", {
                    required:
                      "Tags are required. Separate related product tags with a comma.",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty is required",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Use only lowercase letters, numbers and hyphens",
                    },
                    minLength: { value: 3, message: "Min 3 characters" },
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on delivery is required",
                  })}
                  className="w-full border outline-none border-gray-700 bg-transparent"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* right column */}
            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>

              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <Controller
                  name="subcategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent"
                      disabled={!selectedCategory}
                    >
                      <option value="" className="bg-black">
                        Select Subcategory
                      </option>
                      {subCategories?.map((subcategory: string) => (
                        <option
                          value={subcategory}
                          key={subcategory}
                          className="bg-black"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subcategory.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  defaultValue={""}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = String(value ?? "")
                        .split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        "Description must be at least 100 words!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/(embed\/[a-zA-Z0-9_-]+|watch\?v=[a-zA-Z0-9_-]+)$/,
                      message:
                        "Invalid YouTube URL! Use format: https://www.youtube.com/embed/xyz123 or https://www.youtube.com/watch?v=xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="$20"
                  {...register("regular_price", {
                    required: "Regular price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="$15"
                  {...register("sale_price", {
                    required: "Sale price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice)
                        return "Sale price must be less than Regular price";
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: { value: 1000, message: "Stock cannot exceed 1000" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only number are allowed";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
                {discountLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch("discountCodes")?.includes(code.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          const current = watch("discountCodes") || [];
                          const updated = current.includes(code.id)
                            ? current.filter((id: string) => id !== code.id)
                            : [...current, code.id];
                          setValue("discountCodes", updated, {
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                          setIsChanged(true);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          form="createProductForm"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={createProductMutation.isPending}
        >
          {createProductMutation.isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
