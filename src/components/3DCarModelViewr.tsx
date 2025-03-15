"use client";
import React, { useState, useEffect } from "react";
import { CarProps } from "../types";
import { generateCar360Images } from "../utils";

interface Car360ViewerProps {
  car: CarProps;
}

const Car360Viewer: React.FC<Car360ViewerProps> = ({ car }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

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

  // Looping logic for slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newIndex = parseInt(e.target.value, 10);
    setCurrentIndex(newIndex);
  };

  // Handle mouse drag for manual rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 10) {
      if (delta > 0) {
        setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
      } else {
        setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
      }
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full flex flex-col items-center bg-transparent">
      {/* 3D Car Image Container with drag rotation */}
      <div
        className="relative w-[300px] h-[300px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`angle-${index}`}
            className={`absolute top-0 left-0 w-[300px] h-[300px] object-contain
              transition-opacity duration-300 ease-in-out
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
        className="mt-4 w-1/2"
      />

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Drag or use the slider to rotate the car
      </p>
    </div>
  );
};

export default Car360Viewer;
