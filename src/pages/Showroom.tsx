"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CustomFilter from '@/components/CustomFilter';
import BlurText from "../components/BlurText";
import GradientText from '@/components/GradientText';
import { fetchCars } from '@/utils/index';
import CarCard from '@/components/CarCard';
import CarModel from '@/components/3DCarModelViewr';

export default function Showroom() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCars, setAllCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      setIsLoading(true);
      const cars = await fetchCars();
      setAllCars(cars);
      setIsLoading(false);
    }
    loadCars();
  }, []);

  const isDataEmpty = !Array.isArray(allCars) || allCars.length < 1 || !allCars;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 transition-colors duration-300" id="discover">
      <div className="flex-col items-center justify-center mb-12">
      
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="font-sans font-extrabold text-4xl  " 
        >
          Car Showcase
        </GradientText>

        <BlurText 
          text='Discover the car of your dreams'
          delay={150}
          animateBy="words"
          direction="top"
          className="text-2xl text-gray-600 dark:text-gray-300 items-center justify-center" 
        />
      </div>
      
  <div className="mx-auto w-200px bg-transparent dark:bg-gray-800 rounded-2xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl">
  {/* Parent container in a row */}
  <div className="flex items-center gap-3">
    {/* Let the SearchBar expand as needed */}
    <SearchBar className="flex-1 w-full" />

    {/* Filters side by side */}
    <div className="flex gap-2">
      <CustomFilter title="Fuel" />
      <CustomFilter title="Year" />
    </div>
  </div>
</div>


      {/*{isLoading ? (
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
      ) : !isDataEmpty ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {allCars?.map((car, index) => (
            <div key={`car-${index}`} className="transform transition-all duration-300 hover:-translate-y-2">
              <CarCard car={car} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No results found</h2>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}*/}

      <div className='lg:h-[400px] lg:w-l-[300px]rounded-lg overflow-hidden bg-muted rounded-xl'>
        <CarModel modelUrl='/corvett.glb' color="#0303ff" rotation={30}/>
      </div>
    </div>
  );
}