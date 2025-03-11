// src/components/CustomFilter.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import { fetchCarModels } from "../utils";

interface CustomFilterProps {
  title: "Model" | "Year";
  manufacturer?: string; // Only used when title === "Model"
  selected?: string;
  onChange?: (value: string) => void;
}

const CustomFilter: React.FC<CustomFilterProps> = ({ title, manufacturer, selected, onChange }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [internalSelected, setInternalSelected] = useState<string>("");

  // For "Year" filter, generate options from current year to 1885
  useEffect(() => {
    if (title === "Year") {
      const currentYear = new Date().getFullYear();
      const yearOptions = Array.from({ length: currentYear - 1885 + 1 }, (_, index) =>
        (currentYear - index).toString()
      );
      setOptions(yearOptions);
      if (!internalSelected) {
        setInternalSelected(yearOptions[0]);
        if (onChange) onChange(yearOptions[0]);
      }
    }
  }, [title, internalSelected, onChange]);

  // For "Model" filter, fetch options based on manufacturer
  useEffect(() => {
    if (title === "Model" && manufacturer) {
      async function loadModels() {
        const models = await fetchCarModels(manufacturer);
        setOptions(models);
        if (models.length > 0 && !internalSelected) {
          setInternalSelected(models[0]);
          if (onChange) onChange(models[0]);
        }
      }
      loadModels();
    }
  }, [title, manufacturer, internalSelected, onChange]);

  // Use externally controlled selected value if provided
  const currentSelected = selected || internalSelected;

  return (
    <div className="w-fit">
      <Listbox
        value={currentSelected}
        onChange={(value: string) => {
          setInternalSelected(value);
          if (onChange) onChange(value);
        }}
      >
        <div className="relative">
          <Listbox.Button className="relative w-full min-w-[140px] flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer text-sm transition-colors duration-200">
            <span className="block truncate text-gray-700 dark:text-gray-200 capitalize">
              {title}: {currentSelected || "Select"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <Listbox.Option
                    key={index}
                    value={option}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-4 ${
                        active
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center">
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {option}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <Check className={`h-4 w-4 ${active ? "text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400"}`} />
                          </span>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className="py-2 px-4 text-gray-500 dark:text-gray-400">No options</div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CustomFilter;
