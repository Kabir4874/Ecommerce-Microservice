import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";

type Property = { label: string; values: string[] };

interface Props {
  control: any;
  errors?: any;
}

function propsEqual(a?: Property[] | null, b?: Property[] | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].label !== b[i].label) return false;
    const va = a[i].values;
    const vb = b[i].values;
    if (va.length !== vb.length) return false;
    for (let j = 0; j < va.length; j++) {
      if (va[j] !== vb[j]) return false;
    }
  }
  return true;
}

const CustomProperties: React.FC<Props> = ({ control, errors }) => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          defaultValue={[] as Property[]}
          render={({ field }) => {
            // Initialize local state from RHF value once
            const [properties, setProperties] = useState<Property[]>(
              Array.isArray(field.value) ? field.value : []
            );
            // Per-property pending input values
            const [newValues, setNewValues] = useState<Record<number, string>>(
              {}
            );
            const [newLabel, setNewLabel] = useState("");

            // Sync local -> RHF only when different (prevents infinite loops)
            useEffect(() => {
              if (!propsEqual(field.value as Property[], properties)) {
                field.onChange(properties);
              }
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [properties]);

            // Sync RHF -> local (e.g., on form reset) only when different
            useEffect(() => {
              const incoming = Array.isArray(field.value)
                ? (field.value as Property[])
                : [];
              if (!propsEqual(incoming, properties)) {
                setProperties(incoming);
              }
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value]);

            const addProperty = () => {
              const label = newLabel.trim();
              if (!label) return;
              setProperties((prev) => [...prev, { label, values: [] }]);
              setNewLabel("");
            };

            const removeProperty = (index: number) => {
              setProperties((prev) => prev.filter((_, i) => i !== index));
              setNewValues((prev) => {
                const next = { ...prev };
                delete next[index];
                return next;
              });
            };

            const setValueInput = (index: number, val: string) => {
              setNewValues((prev) => ({ ...prev, [index]: val }));
            };

            const addValue = (index: number) => {
              const val = (newValues[index] ?? "").trim();
              if (!val) return;
              setProperties((prev) => {
                const copy = prev.map((p) => ({ ...p, values: [...p.values] }));
                copy[index].values.push(val);
                return copy;
              });
              setValueInput(index, "");
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
                          className="p-1 hover:opacity-80"
                          aria-label="Remove property"
                          title="Remove property"
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
                          onChange={(e) => setValueInput(index, e.target.value)}
                          value={newValues[index] ?? ""}
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
                      className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1"
                      onClick={addProperty}
                    >
                      <Plus size={16} />
                      Add
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
