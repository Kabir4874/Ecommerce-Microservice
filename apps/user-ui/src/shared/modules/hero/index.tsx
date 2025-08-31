import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br /> Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off
            this week
          </p>
          <br />
          <Link
            href={"/products"}
            className="w-[140px] gap-2 font-semibold h-[40px] border border-transparent hover:border-white hover:text-white flex items-center justify-center bg-white hover:bg-transparent rounded-md transition-all duration-300"
          >
            Shop Now <MoveRight />
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src={
              "https://media.istockphoto.com/id/2153369285/vector/green-background-product-wall-display-with-natural-tree-leaf-shadow-on-backdrop-nude-studio.jpg?s=612x612&w=0&k=20&c=pMT_C866Ja5CnTQbVXxPDV1Bk28Uf3gW8BHZqvT1wAg="
            }
            alt="banner"
            width={450}
            height={450}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
