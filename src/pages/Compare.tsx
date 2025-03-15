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
        <div className="max-w-7xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl mt-4 shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Comparison Results</h3>
          <div className="prose dark:prose-invert max-w-none">
            {comparisonResult.split("\n").map((line, index) => (
              <p key={index} className="mb-3">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
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
