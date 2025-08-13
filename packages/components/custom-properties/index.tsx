import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";

type Property = { label: string; values: string[] };

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          defaultValue={[]}
          render={({ field }) => {
            // helper to update local state and RHF at the same time
            const updateProps = (
              next: Property[] | ((prev: Property[]) => Property[])
            ) => {
              setProperties((prev) => {
                const resolved =
                  typeof next === "function" ? (next as any)(prev) : next;
                field.onChange(resolved);
                return resolved;
              });
            };

            const addProperty = () => {
              const label = newLabel.trim();
              if (!label) return;
              updateProps([...properties, { label, values: [] }]);
              setNewLabel("");
            };

            const addValue = (index: number) => {
              const val = newValue.trim();
              if (!val) return;
              updateProps((prev) => {
                const copy = prev.map((p) => ({ ...p, values: [...p.values] }));
                copy[index].values.push(val);
                return copy;
              });
              setNewValue("");
            };

            const removeProperty = (index: number) => {
              updateProps(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {/* existing properties */}
                  {properties.map((property, index) => (
                    <div
                      key={`${property.label}-${index}`}
                      className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {property.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>

                      {/* add values to property */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                          placeholder="Enter value..."
                          onChange={(e) => setNewValue(e.target.value)}
                          value={newValue}
                        />
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-500 text-white rounded-md"
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>

                      {/* show values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={`${value}-${i}`}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* add new property */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={newLabel}
                      placeholder="Enter property label (e.g., Material, Warranty)"
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center"
                      onClick={addProperty}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {errors?.customProperties && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customProperties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
