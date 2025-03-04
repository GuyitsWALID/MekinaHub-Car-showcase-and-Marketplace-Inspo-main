import React, { useState } from "react";
import SearchManufacturer from "../components/SearchManufacturer";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [manufacturer, setManufacturer] = useState('');
  
  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Your search logic here
  };

  return (
    <form 
      className={`relative w-80 ${className}`}
      onSubmit={handleSearch}
    >
      <div className="flex items-center w-full overflow-visible">
        <div className="flex-1 relative">
          <SearchManufacturer
            manufacturer={manufacturer}
            setManufacturer={setManufacturer}
          />
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="p-3 h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200 text-white rounded-r-xl flex items-center justify-center"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;