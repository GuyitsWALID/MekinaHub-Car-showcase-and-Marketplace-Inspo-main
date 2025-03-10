import React, { useState, useEffect } from "react";
import { CarProps } from "@/types";
import { generateCar360Images } from "@/utils";

interface Car360ViewerProps {
  car: CarProps;
}

const Car360Viewer: React.FC<Car360ViewerProps> = ({ car }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  useEffect(() => {
    const urls = generateCar360Images(car);
    setImageUrls(urls);
    setCurrentIndex(0); // reset index when car changes
  }, [car]);

  // When pointer goes down, record the X coordinate.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragStartX(e.clientX);
  };

  // When moving, calculate how far the pointer has moved, and update index.
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    const sensitivity = 10; // adjust sensitivity (pixels per frame change)
    if (Math.abs(deltaX) >= sensitivity) {
      // Dragging right decreases index, left increases index.
      const deltaIndex = Math.floor(deltaX / sensitivity);
      let newIndex = currentIndex - deltaIndex;
      // Normalize index in circular fashion.
      newIndex = ((newIndex % imageUrls.length) + imageUrls.length) % imageUrls.length;
      setCurrentIndex(newIndex);
      // Reset drag start for incremental movement.
      setDragStartX(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setDragStartX(null);
  };

  if (!imageUrls.length) {
    return <div>Loading 360° images...</div>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="relative w-[300px] h-[300px] overflow-hidden select-none cursor-grab"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {imageUrls.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={`angle-${index}`}
            className={`absolute top-0 left-0 w-[300px] h-[300px] object-contain transition-opacity duration-100 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Drag to rotate the car
      </p>
    </div>
  );
};

export default Car360Viewer;

