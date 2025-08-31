"use client";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Ratings from "../ratings";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-[9999]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <Image
              src={
                data?.images?.[activeImage]?.url ||
                "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
              }
              alt={data?.title}
              width={400}
              height={400}
              className="w-full rounded-lg object-contain"
            />

            {/* thumbnails  */}
            <div className="flex gap-2 mt-4">
              {data?.images?.map((img: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border rounded-md ${
                    activeImage === index
                      ? "border-gray-500 pt-1"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={
                      img?.url ||
                      "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                    }
                    alt={`Thumbnail ${index}`}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* seller info  */}
            <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between">
              <div className="flex items-start gap-3">
                {/* shop logo  */}
                <Image
                  src={
                    data?.shop?.avatar ||
                    "https://www.largeherds.co.za/wp-content/uploads/2024/01/logo-placeholder-image.png"
                  }
                  alt="Shop Logo"
                  width={60}
                  height={60}
                  className="rounded-full w-[60px] h-[60px] object-cover"
                />
                <div>
                  <Link href={`/shop/${data?.shop?.id}`}>
                    {data?.shop?.name}
                  </Link>
                  <span className="block mt-1">
                    <Ratings rating={data?.shop?.ratings} />
                  </span>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <MapPin size={20} />
                    {data?.shop?.address || "Location Not Available"}
                  </p>
                </div>
              </div>
              <button
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={() => router.push(`/inbox?shopId=${data?.shop?.id}`)}
              >
                Chat with Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
