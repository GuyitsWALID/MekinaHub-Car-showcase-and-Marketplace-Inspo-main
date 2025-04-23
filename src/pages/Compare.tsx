"use client";
import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import GradientText from "../components/GradientText";
import SearchBar from "../components/SearchBar";
import CustomFilter from "../components/CustomFilter";
import CarCard from "../components/CarCard";
import { CarProps } from "../types";
import { fetchCars, compareCars } from "../utils";

export default function Compare() {
  // Car 1 States
  const [searchQuery1, setSearchQuery1] = useState("");
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedYear1, setSelectedYear1] = useState("");
  const [allCars1, setAllCars1] = useState<CarProps[]>([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [selectedCar1, setSelectedCar1] = useState<CarProps | null>(null);

  // Car 2 States
  const [searchQuery2, setSearchQuery2] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");
  const [allCars2, setAllCars2] = useState<CarProps[]>([]);
  const [isLoading2, setIsLoading2] = useState(false);
  const [selectedCar2, setSelectedCar2] = useState<CarProps | null>(null);

  // Comparison States
  const [comparisonResult, setComparisonResult] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  // Fetch cars for Car 1
  useEffect(() => {
    async function loadCars1() {
      setIsLoading1(true);
      try {
        const filters = {
          make: searchQuery1,
          model: selectedModel1,
          year: selectedYear1 ? parseInt(selectedYear1) : 0,
          limit: 10,
          fuel: "",
        };
        const cars = await fetchCars(filters);
        setAllCars1(cars);
      } catch (error) {
        console.error("Error fetching Car 1 data:", error);
        setAllCars1([]);
      }
      setIsLoading1(false);
    }
    loadCars1();
  }, [searchQuery1, selectedModel1, selectedYear1]);

  // Fetch cars for Car 2
  useEffect(() => {
    async function loadCars2() {
      setIsLoading2(true);
      try {
        const filters = {
          make: searchQuery2,
          model: selectedModel2,
          year: selectedYear2 ? parseInt(selectedYear2) : 0,
          limit: 10,
          fuel: "",
        };
        const cars = await fetchCars(filters);
        setAllCars2(cars);
      } catch (error) {
        console.error("Error fetching Car 2 data:", error);
        setAllCars2([]);
      }
      setIsLoading2(false);
    }
    loadCars2();
  }, [searchQuery2, selectedModel2, selectedYear2]);

  // Debounced function to compare cars
  const debouncedCompareCars = useCallback(
    debounce(async (car1: CarProps, car2: CarProps) => {
      try {
        const result = await compareCars(car1, car2);
        setComparisonResult(result);
      } catch (error) {
        console.error("Comparison error:", error);
        setComparisonResult("Comparison unavailable. Please check console for error details.");
      }
      setIsComparing(false);
    }, 2000), // Adjust delay as needed
    []
  );

  // Handler to trigger the debounced comparison
  const handleCompare = () => {
    if (!selectedCar1 || !selectedCar2) {
      alert("Please select one car from each column");
      return;
    }
    setIsComparing(true);
    debouncedCompareCars(selectedCar1, selectedCar2);
  };

  // Derived states for empty data
  const isDataEmpty1 = !Array.isArray(allCars1) || allCars1.length === 0;
  const isDataEmpty2 = !Array.isArray(allCars2) || allCars2.length === 0;

  return (
    <>
      {/* Page Title */}
      <div className="flex flex-col items-center justify-center mb-12">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="font-sans font-extrabold text-4xl bg-transparent"
        >
          Car Compare
        </GradientText>
      </div>

      {/* Comparison Sections */}
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* Car 1 Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <h2 className="text-2xl font-extrabold mb-4 text-gray-700 dark:text-gray-200">Car 1</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
            <SearchBar
              searchQuery={searchQuery1}
              setSearchQuery={setSearchQuery1}
              onSearch={(query) => setSearchQuery1(query)}
            />
            <div className="flex flex-row gap-3">
              <CustomFilter
                title="Model"
                manufacturer={searchQuery1}
                onChange={(value) => setSelectedModel1(value)}
              />
              <CustomFilter
                title="Year"
                onChange={(value) => setSelectedYear1(value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading1 ? (
              <LoadingSkeleton />
            ) : isDataEmpty1 ? (
              <EmptyState />
            ) : (
              allCars1.map((car) => (
                <CarCard
                  key={`${car.make}-${car.model}-${car.year}`}
                  car={car}
                  onSelect={() => setSelectedCar1(car)}
                  isSelected={selectedCar1?.model === car.model}
                />
              ))
            )}
          </div>
        </div>

        {/* Car 2 Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <h2 className="text-2xl font-extrabold mb-4 text-gray-700 dark:text-gray-200">Car 2</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
            <SearchBar
              searchQuery={searchQuery2}
              setSearchQuery={setSearchQuery2}
              onSearch={(query) => setSearchQuery2(query)}
            />
            <div className="flex flex-row gap-3">
              <CustomFilter
                title="Model"
                manufacturer={searchQuery2}
                onChange={(value) => setSelectedModel2(value)}
              />
              <CustomFilter
                title="Year"
                onChange={(value) => setSelectedYear2(value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading2 ? (
              <LoadingSkeleton />
            ) : isDataEmpty2 ? (
              <EmptyState />
            ) : (
              allCars2.map((car) => (
                <CarCard
                  key={`${car.make}-${car.model}-${car.year}`}
                  car={car}
                  onSelect={() => setSelectedCar2(car)}
                  isSelected={selectedCar2?.model === car.model}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="max-w-7xl mx-auto p-4">
        <button
          onClick={handleCompare}
          disabled={isComparing}
          className={`w-full p-4 text-white rounded-xl transition-colors ${
            isComparing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isComparing ? "Comparing..." : "Compare Cars"}
        </button>
      </div>

      {/* Warning Message */}
      {comparisonResult.includes("unavailable") && (
        <div className="max-w-7xl mx-auto p-4 text-yellow-600 bg-yellow-100 rounded-xl">
          ⚠️ Comparison service temporary unavailable. Please try again later.
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-blue-100 to-white dark:from-blue-900 dark:via-gray-900 dark:to-blue-900 rounded-2xl mt-8 shadow-2xl text-gray-800 dark:text-white">
          <div className="comparison-container space-y-6">
            {comparisonResult.split("\n").map((line, index) => {
              // Main Title (H1)
              if (line.startsWith("# ")) {
                return (
                  <div key={index} className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 animate-gradient">
                      {line.replace("# ", "")}
                    </h1>
                    <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                  </div>
                );
              }
              
              // Car Section Titles (H2)
              if (line.startsWith("## ")) {
                return (
                  <div key={index} className="transform hover:scale-[1.01] transition-all duration-300">
                    <div className="bg-white/80 dark:bg-blue-800/30 rounded-xl p-6 mb-6 backdrop-blur-sm shadow-lg border border-blue-100 dark:border-blue-800">
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-800 dark:text-white">
                        <span className="inline-block p-2 bg-blue-100 dark:bg-blue-700 rounded-lg">
                          🚗
                        </span>
                        {line.replace("## ", "")}
                      </h2>
                    </div>
                  </div>
                );
              }
              
              // Section Headers (H3)
              if (line.startsWith("### ")) {
                return (
                  <div key={index} className="relative">
                    <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                      {line.replace("### ", "")}
                    </h3>
                  </div>
                );
              }
              
              // List Items
              if (line.startsWith("-")) {
                return (
                  <div key={index} 
                    className="flex items-center space-x-3 mb-2 p-3 hover:bg-blue-50/50 dark:hover:bg-blue-800/20 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                  >
                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">{line.substring(1).trim()}</p>
                  </div>
                );
              }
              
              // Comparison Table
              if (line.includes("|")) {
                const cells = line.split("|").filter(cell => cell.trim());
                return (
                  <div key={index} className="overflow-hidden">
                    <div className="transform hover:scale-[1.01] transition-all duration-300">
                      <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/50 dark:to-blue-800/30 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-6">
                          {cells.map((cell, cellIndex) => (
                            <div key={cellIndex} className="text-center">
                              <div className="bg-white/80 dark:bg-blue-900/50 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-700">
                                <p className="font-medium text-gray-800 dark:text-white">
                                  {cell.trim()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Default paragraph styling
              return (
                <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-200 px-4">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s linear infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .comparison-container {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </>
  );
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="flex justify-center items-center min-h-64">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-2xl p-12 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
      />
    </svg>
    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
      No results found
    </h2>
    <p className="text-gray-500 dark:text-gray-400">
      Try adjusting your search criteria
    </p>
  </div>
);
