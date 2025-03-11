"use client";
import React, { useState, useEffect } from "react";
import { CarProps } from "@/types";
import { generateCar360Images } from "@/utils";

interface Car360ViewerProps {
  car: CarProps;
}

const Car360Viewer: React.FC<Car360ViewerProps> = ({ car }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!car) {
      console.error("Car360Viewer: car is undefined");
      return;
    }
    const urls = generateCar360Images(car);
    setImageUrls(urls);
    setCurrentIndex(0);
  }, [car]);

  if (!imageUrls.length) {
    return <div>Loading 360° images...</div>;
  }

  // Handle slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(e.target.value, 10));
  };

  return (
    <div className="w-full flex flex-col items-center bg-transparent">
      {/* 3D Car Image Container */}
      <div className="relative w-[300px] h-[300px]">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`angle-${index}`}
            className={`absolute top-0 left-0 w-[300px] h-[300px] object-contain
              transition-opacity duration-600 ease-in-out
              ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          />
        ))}
      </div>

      {/* Slider below the image */}
      <input
        type="range"
        min="0"
        max={imageUrls.length - 1}
        value={currentIndex}
        onChange={handleSliderChange}
        className="mt-4 w-1/2" // Adjust the width here (e.g., w-[200px] or w-1/2)
      />

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Use the slider to rotate the car
      </p>
    </div>
  );
};

export default Car360Viewer;
