"use client";
import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import CustomFilter from "@/components/CustomFilter";
import BlurText from "@/components/BlurText";
import GradientText from "@/components/GradientText";
import { fetchCars } from "@/utils";
import CarCard from "@/components/CarCard";
import Car360Viewer from "@/components/3DCarModelViewr"; // 360° viewer with slider
import { CarProps } from "@/types";

export default function Showroom() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [allCars, setAllCars] = useState<CarProps[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle manufacturer search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  // Fetch cars based on filters
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
      try {
        const cars = await fetchCars(filters);
        setAllCars(cars);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setAllCars([]);
      }
      setIsLoading(false);
    }
    loadCars();
  }, [searchQuery, selectedModel, selectedYear]);

  // Select a car to show side-by-side layout
  const handleSelectCar = (car: CarProps) => {
    setSelectedCar(car);
  };

  // Deselect the car (go back to grid view)
  const handleDeselectCar = () => {
    setSelectedCar(null);
  };

  const isDataEmpty = !Array.isArray(allCars) || allCars.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 transition-colors duration-300">
      {/* Page Title */}
      <div className="flex flex-col items-center justify-center mb-12 text-center">
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
          className="text-2xl text-gray-600 dark:text-gray-300"
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-transparent rounded-2xl p-4 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
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

      {/* Conditional Rendering */}
      {selectedCar ? (
        // Show the side-by-side layout
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
          {/* Car Card on the left */}
          <div className="w-full md:w-1/2">
            <CarCard
              car={selectedCar}
              onSelect={handleDeselectCar} // Clicking again deselects
            />
          </div>
          {/* 360° Viewer on the right */}
          <div className="w-full md:w-1/2 h-[500px] rounded-lg bg-transparent flex items-center justify-center">
            <Car360Viewer car={selectedCar} />
          </div>
        </div>
      ) : (
        // Show the grid
        <div className="my-8 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-64">
              <div>Loading...</div>
            </div>
          ) : isDataEmpty ? (
            <div className="text-center">No results found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto place-items-center">
              {allCars.map((car: CarProps, index: number) => (
                <CarCard
                  key={index}
                  car={car}
                  onSelect={() => handleSelectCar(car)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
