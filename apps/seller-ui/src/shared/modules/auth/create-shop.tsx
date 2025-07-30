import { useMutation } from "@tanstack/react-query";
import api from "apps/seller-ui/src/app/api/api";
import { shopCategories } from "apps/seller-ui/src/utils/categories";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/create-shop", data);
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
          {...register("name", {
            required: "Shop name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1 mt-2">
          Bio (Max 100 words) *
        </label>
        <input
          type="text"
          id="bio"
          placeholder="shop bio"
          className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio can't exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1 mt-2">
          Address *
        </label>
        <input
          type="text"
          id="address"
          placeholder="shop location"
          className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
          {...register("address", {
            required: "Shop address is required",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1 mt-2">
          Opening Hours *
        </label>
        <input
          type="text"
          id="opening_hours"
          placeholder="e.g., Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
          {...register("opening_hours", {
            required: "Opening hours is required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1 mt-2">
          Website url
        </label>
        <input
          type="url"
          id="website"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
          {...register("website", {
            pattern: {
              value: /&(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: "Enter valid url",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1 mt-2">
          Category *
        </label>
        <select
          id="category"
          className="w-full p-2 border border-gray-300 outline-none rounded-[4px]"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select your category</option>
          {shopCategories.map((category) => (
            <option value={category.value} key={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-4"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
