import React from "react";
import { Combobox, Transition } from "@headlessui/react";
import { manufacturers } from "../constants";
import { useState, Fragment } from "react";
import { Search, Check } from "lucide-react";

interface SearchManufacturerProps {
  manufacturer: string;
  setManufacturer: React.Dispatch<React.SetStateAction<string>>;
}

const SearchManufacturer: React.FC<SearchManufacturerProps> = ({ 
  manufacturer, 
  setManufacturer 
}) => {
  const [query, setQuery] = useState('');
  
  const filteredManufacturers = 
    query === "" 
      ? manufacturers
      : manufacturers.filter((item) => (
        item.toLowerCase()
        .replace(/\s+/g, '')
        .includes(query.toLowerCase().replace(/\s+/g, '')
      )));

  return (
    <div className="w-full">
      <Combobox value={manufacturer} onChange={setManufacturer}>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <Combobox.Input
            className="w-full h-12 pl-10 py-3 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-xl outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
            placeholder="Search by manufacturer"
            displayValue={(manufacturer: string) => manufacturer}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700">
              {filteredManufacturers.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-3 px-4 text-gray-500 dark:text-gray-400 text-center">
                  No manufacturers found
                </div>
              ) : (
                filteredManufacturers.map((item) => (
                  <Combobox.Option
                    key={item}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-3 px-4 ${
                        active 
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
                          : "text-gray-700 dark:text-gray-300"
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center">
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {item}
                        </span>
                        
                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <Check 
                              className={`h-5 w-5 ${
                                active ? "text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400"
                              }`} 
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default SearchManufacturer;