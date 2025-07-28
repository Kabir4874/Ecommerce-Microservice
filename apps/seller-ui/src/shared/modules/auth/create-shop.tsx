import { useMutation } from "@tanstack/react-query";
import api from "apps/seller-ui/src/app/api/api";
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
      </form>
    </div>
  );
};

export default CreateShop;
