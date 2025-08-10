import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
] as const;

type Props = {
  control: any;
  errors?: any;
};

const isLight = (hex: string) => {
  // simple luminance check (expect #rrggbb)
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // perceived luminance
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 200;
};

const ColorSelector = ({ control }: Props) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");

  // Ensure we never render duplicate keys
  const allColors = useMemo(
    () =>
      Array.from(new Set([...defaultColors, ...customColors])).map((c) =>
        c.toLowerCase()
      ),
    [customColors]
  );

  const addCustomColor = (c: string) => {
    const color = c.toLowerCase();
    setCustomColors((prev) => (prev.includes(color) ? prev : [...prev, color]));
  };

  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Colors</label>

      <Controller
        name="colors"
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const value: string[] = (field.value || []).map((v: string) =>
            v.toLowerCase()
          );

          const toggleColor = (color: string) => {
            const c = color.toLowerCase();
            if (value.includes(c)) {
              field.onChange(value.filter((v) => v !== c));
            } else {
              field.onChange([...value, c]);
            }
          };

          return (
            <div className="flex gap-3 flex-wrap">
              {allColors.map((color) => {
                const selected = value.includes(color);
                return (
                  <button
                    type="button"
                    key={color} // safe: allColors is unique
                    onClick={() => toggleColor(color)}
                    className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                      selected ? "scale-110 border-white" : "border-transparent"
                    } ${isLight(color) ? "border-gray-600" : ""}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                    title={color}
                  />
                );
              })}

              {/* add new color */}
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-500 bg-gray-800 hover:bg-gray-700 transition"
                onClick={() => setShowColorPicker((s) => !s)}
                aria-label="Add a custom color"
                title="Add a custom color"
              >
                <Plus size={16} />
              </button>

              {/* color picker */}
              {showColorPicker && (
                <div className="relative flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-10 h-10 p-0 border-none cursor-pointer"
                    aria-label="Pick a color"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addCustomColor(newColor);
                      setShowColorPicker(false);
                    }}
                    className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                    disabled={allColors.includes(newColor.toLowerCase())}
                    title={
                      allColors.includes(newColor.toLowerCase())
                        ? "Color already added"
                        : "Add color"
                    }
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ColorSelector;
