"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CustomFilter from '@/components/CustomFilter';
import BlurText from "../components/BlurText";
import { fetchCars } from '@/utils/index';
import CarCard from '@/components/CarCard';

export default function Showroom() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCars, setAllCars] = useState([]);

  useEffect(() => {
    async function loadCars() {
      const cars = await fetchCars();
      setAllCars(cars);
      console.log(cars);
    }
    loadCars();
  }, []);

  const isDataEmpty = !Array.isArray(allCars)|| allCars.length < 1 || !allCars;

  return (
    <div className='mt-2 padding-x padding-y max-width' id="discover">
      <div className='home__text-container flex flex-col items-center'>
        <BlurText 
          text='Car Showcase'
          delay={150}
          animateBy="words"
          direction="top"
          className="font-sans font-extrabold text-4xl mt-0 mb-1" 
        />
        <BlurText 
          text='Discover the car of your dreams'
          delay={150}
          animateBy="words"
          direction="top"
          className="text-2xl mb-8" 
        />
      </div>
      <div className='home__filters flex flex-col items-center'>
        <SearchBar  />
        <div className='home__filter-container'>
          <CustomFilter title="fuel" />
          <CustomFilter title="year" />
        </div>
      </div>

      {!isDataEmpty ? (
        <section>
         <div className='home__cars-wrapper'>
            {allCars?.map((car) => (
              <CarCard car={car}/>
            ))}
         </div>
        </section>  
      ): (
        <div className='home__error-container'>
          <h2 className='text-black text-xl font-bold'>Oops, no results</h2>
          <p>{allCars?.message}</p>
        </div>
      )}
    </div>
  );
}

//so know once the user search a car the card will appear then to look further i want the user to
//be able to click the card then view the 3d model using threejs be able to manipualte and rotate 360.