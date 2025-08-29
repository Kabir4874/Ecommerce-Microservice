import { Pencil, X } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef } from "react";

interface LocalImage {
  preview: string; // object URL
  file: File;
}

interface Props {
  size: string;
  small?: boolean;
  index: number;
  images: (LocalImage | null)[];
  pictureUploadingLoader: boolean;
  /** Called when user selects one or more files. Parent decides how to place them. */
  onFilesSelected: (files: File[], startIndex: number) => void;
  /** Remove the image in this slot (keeps placeholder in the same position). */
  onRemove?: (index: number) => void;
}

const ImagePlaceHolder = ({
  size,
  small,
  index,
  images,
  pictureUploadingLoader,
  onFilesSelected,
  onRemove,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imagePreview = useMemo(
    () => images[index]?.preview ?? null,
    [images, index]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    onFilesSelected(files, index);
    // Reset the input so selecting the same file again still triggers change
    event.currentTarget.value = "";
  };

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center overflow-hidden`}
    >
      {/* Hidden file input (multiple) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {/* If there is an image, show Edit (open picker) and Delete */}
      {imagePreview ? (
        <>
          <button
            type="button"
            disabled={pictureUploadingLoader}
            onClick={() => onRemove?.(index)}
            className="absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg hover:opacity-90"
            aria-label="Delete image"
            title="Delete"
          >
            <X size={16} />
          </button>

          <button
            type="button"
            disabled={pictureUploadingLoader}
            onClick={openPicker}
            className="absolute top-3 right-[52px] p-2 rounded bg-slate-700 shadow-lg hover:opacity-90"
            aria-label="Edit image"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
        </>
      ) : (
        // Empty state: clicking anywhere opens the picker (and there’s also a small pencil)
        <>
          <button
            type="button"
            onClick={openPicker}
            disabled={pictureUploadingLoader}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label="Pick images"
            title="Pick images"
          />
          <button
            type="button"
            onClick={openPicker}
            disabled={pictureUploadingLoader}
            className="absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg hover:opacity-90"
            aria-label="Pick images"
            title="Pick images"
          >
            <Pencil size={16} />
          </button>
        </>
      )}

      {/* Image or placeholder text */}
      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="uploaded"
          width={400}
          height={300}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center px-2 text-center">
          <p
            className={`text-gray-400 ${
              small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {size}
          </p>
          <p className={`text-gray-500 ${small ? "text-sm" : "text-lg"} pt-2`}>
            Click to choose images
            <br />
            (keeps expected ratio)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
