import React, { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

// Define sample options for filters
const fuelOptions = ["Gasoline", "Diesel", "Electric", "Hybrid"];
// Get current year
const currentYear = new Date().getFullYear();

// Create year options from current year back to 1885 (year Benz Patent-Motorwagen was invented)
const yearOptions = Array.from(
  { length: currentYear - 1885 + 1 },
  (_, index) => (currentYear - index).toString()
);

// Result (if current year is 2024):
// ["2024", "2023", "2022", ..., "1885"]
interface CustomFilterProps {
  title: string;
}

const CustomFilter = ({ title }: CustomFilterProps) => {
  const options = title === "fuel" ? fuelOptions : yearOptions;
  const [selected, setSelected] = useState(options[0]);

  return (
    <div className="w-fit">
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative">
          <Listbox.Button className="relative w-full min-w-[140px] flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer text-sm transition-colors duration-200">
            <span className="block truncate text-gray-700 dark:text-gray-200 capitalize">
              {title}: {selected}
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
              {options.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-4 ${
                      active
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <div className="flex items-center">
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {option}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Check 
                            className={`h-4 w-4 ${
                              active ? "text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400"
                            }`} 
                          />
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CustomFilter;