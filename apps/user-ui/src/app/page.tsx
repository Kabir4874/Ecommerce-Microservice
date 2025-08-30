import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../shared/components/section/SectionTitle";
import Hero from "../shared/modules/hero";
import api from "./api/api";

const Page = () => {
  const {} = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get(
        "/product/api/get-all-products?page=1&limit=10"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });
  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
