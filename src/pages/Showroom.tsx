// src/pages/Showroom.tsx
"use client";
import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import CustomFilter from "@/components/CustomFilter";
import BlurText from "@/components/BlurText";
import GradientText from "@/components/GradientText";
import { fetchCars, generateCarImageUrl } from "@/utils";
import CarCard from "@/components/CarCard";
import CarModel from "@/components/3DCarModelViewr";
import { CarProps } from "@/types";

export default function Showroom() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [allCars, setAllCars] = useState<CarProps[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the search is submitted (e.g. manufacturer), update the searchQuery state.
  const handleSearch = async (query: string) => {
    console.log("Searching for manufacturer:", query);
    setSearchQuery(query);
  };

  // Fetch cars based on the current filters: manufacturer, model, and year.
  useEffect(() => {
    async function loadCars() {
      setIsLoading(true);
      const filters = {
        make: searchQuery,
        model: selectedModel,
        year: selectedYear ? parseInt(selectedYear) : 0,
        limit: 10,
        fuel: "",
      };
      const cars = await fetchCars(filters);
      setAllCars(cars);
      setIsLoading(false);
    }
    loadCars();
  }, [searchQuery, selectedModel, selectedYear]);

  const handleSelectCar = (car: CarProps) => {
    setSelectedCar(car);
  };

  const isDataEmpty = !Array.isArray(allCars) || allCars.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 transition-colors duration-300" id="discover">
      <div className="flex-col items-center justify-center mb-12">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="font-sans font-extrabold text-4xl"
        >
          Car Showcase
        </GradientText>

        <BlurText 
          text="Discover the car of your dreams"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-2xl text-gray-600 dark:text-gray-300 items-center justify-center" 
        />
      </div>
      
      {/* Search and Filters */}
      <div className="mx-auto w-200px bg-transparent dark:bg-gray-800 rounded-2xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center gap-3">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSearch={handleSearch}
          />
          <div className="flex gap-2">
            <CustomFilter 
              title="Model" 
              manufacturer={searchQuery} 
              onChange={(value) => setSelectedModel(value)}
            />
            <CustomFilter 
              title="Year" 
              onChange={(value) => setSelectedYear(value)}
            />
          </div>
        </div>
      </div>

      {/* Car Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        {isLoading ? (
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
        ) : isDataEmpty ? (
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          allCars.map((car: CarProps, index: number) => (
            <CarCard key={index} car={car} onSelect={() => handleSelectCar(car)} />
          ))
        )}
      </div>

      {/* 3D/360° Model Viewer */}
      {selectedCar && (
        <div className="lg:h-[400px] lg:w-[300px] rounded-lg overflow-hidden bg-muted">
          <CarModel 
            modelUrl={generateCarImageUrl(selectedCar, "45")}
            color="#0303ff" 
            rotation={30}
          />
        </div>
      )}
    </div>
  );
}
