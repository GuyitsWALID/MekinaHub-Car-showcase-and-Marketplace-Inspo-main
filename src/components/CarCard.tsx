"use client";
import React from "react";
import { calculateCarRent, generateCarImageUrl } from "../utils";
import { CarProps } from "../types";

interface CarCardProps {
  car: CarProps;
  onSelect?: () => void;
  disableHoverEffect?: boolean;
  isSelected?: boolean; // NEW PROP
}


const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  disableHoverEffect = false,
  isSelected = false, // DEFAULT VALUE
}) => {
  const { city_mpg, year, make, model, transmission, drive } = car;
  const carRent = calculateCarRent(city_mpg, year);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(); // SAFE CALL
  };

  return (
    <div
      onClick={handleClick} // UPDATED HANDLER
      className={`
        flex flex-col p-6 justify-center items-start text-black-100 
        bg-transparent rounded-3xl cursor-pointer relative
        ${isSelected ? "ring-2 ring-blue-500" : ""} // SELECTION INDICATOR
        ${
          !disableHoverEffect
            ? "hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            : ""
        }
      `}
    >
      <div className="w-full flex justify-between items-start gap-2">
        <h2 className="text-[22px] leading-[26px] font-bold capitalize text-gray-900 dark:text-gray-100">
          {make} {model} {year}
        </h2>
      </div>

      <p className="flex mt-6 text-[32px] leading-[38px] font-extrabold text-gray-900 dark:text-gray-100">
        <span className="self-start text-[14px] leading-[17px] font-semibold">$</span>
        {carRent}
        <span className="self-end text-[14px] leading-[17px] font-medium">/day</span>
      </p>

      <div className="relative w-full h-40 my-3 object-contain">
        <img
          src={generateCarImageUrl(car)}
          alt="car model"
          className="object-contain w-full h-full"
        />
      </div>

      <div className="relative flex w-full mt-2 justify-between text-gray-500 dark:text-gray-400">
        <div className="flex flex-col justify-center items-center gap-2">
          <img src="/steering-wheel.svg" width={20} height={20} alt="steering wheel" />
          <p className="text-[14px] leading-[17px]">
            {transmission === "a" ? "Automatic" : "Manual"}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <img src="/tire.svg" width={20} height={20} alt="tire" />
          <p className="text-[14px] leading-[17px]">{drive.toUpperCase()}</p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <img src="/gas.svg" width={20} height={20} alt="gas" />
          <p className="text-[14px] leading-[17px]">{city_mpg} MPG</p>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
