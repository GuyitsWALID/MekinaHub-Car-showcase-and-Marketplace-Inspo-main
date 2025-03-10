// src/utils/index.ts
import { CarProps, FilterProps } from "../types";

export const calculateCarRent = (city_mpg: number, year: number): string => {
  const basePricePerDay = 50; // Base rental price per day in dollars
  const mileageFactor = 0.1; // Additional rate per mile driven
  const ageFactor = 0.05; // Additional rate per year of vehicle age

  const mileageRate = city_mpg * mileageFactor;
  const ageRate = (new Date().getFullYear() - year) * ageFactor;
  const rentalRatePerDay = basePricePerDay + mileageRate + ageRate;
  return rentalRatePerDay.toFixed(0);
};

export const updateSearchParams = (type: string, value: string): string => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(type, value);
  return `${window.location.pathname}?${searchParams.toString()}`;
};

export const deleteSearchParams = (type: string): string => {
  const newSearchParams = new URLSearchParams(window.location.search);
  newSearchParams.delete(type.toLowerCase());
  return `${window.location.pathname}?${newSearchParams.toString()}`;
};

export async function fetchCars(filters: FilterProps): Promise<any> {
  const { make, year, model } = filters;
  const headers: HeadersInit = {
    "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY || "523d10003amshea14e4dbb120c59p1ebaefjsn0955757c2468",
    "X-RapidAPI-Host": "cars-by-api-ninjas.p.rapidapi.com",
  };

  const response = await fetch(
    `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?make=${make || ""}&year=${year || ""}&model=${model || ""}`,
    { headers }
  );

  const result = await response.json();
  return result;
}

// New function to fetch unique car models based on manufacturer
export async function fetchCarModels(make: string): Promise<string[]> {
  if (!make) return [];
  const cars = await fetchCars({ make, limit: 100 });
  // Extract unique model names from the returned cars
  const models = Array.from(new Set((cars as CarProps[]).map((car: CarProps) => car.model)));
  return models;
}

export const generateCarImageUrl = (car: CarProps, angle?: string): string => {
  const url = new URL("https://cdn.imagin.studio/getimage");
  const { make, model, year } = car;
  url.searchParams.append("customer", import.meta.env.VITE_IMAGIN_API_KEY || "hrjavascript-mastery");
  url.searchParams.append("make", make);
  url.searchParams.append("modelFamily", model.split(" ")[0]);
  url.searchParams.append("zoomType", "fullscreen");
  url.searchParams.append("modelYear", `${year}`);
  url.searchParams.append("angle", `${angle}`);
  return url.toString();
};
export function generateCar360Images(car: CarProps, angles?: string[]): string[] {
  // Default angles from ~200 to ~231. Adjust as needed.
  const defaultAngles = [
    "200","201","202","203","204","205","206","207","208","209","210","211",
    "212","213","214","215","216","217","218","219","220","221","222","223",
    "224","225","226","227","228","229","230","231"
  ];

  // Use provided angles if any, otherwise use default
  const angleList = angles && angles.length ? angles : defaultAngles;

  const { make, model, year } = car;

  // Build a URL for each angle
  const urls = angleList.map((angle) => {
    const url = new URL("https://cdn.imagin.studio/getimage");
    url.searchParams.append(
      "customer",
      import.meta.env.VITE_IMAGIN_API_KEY || "hrjavascript-mastery"
    );
    url.searchParams.append("make", make);
    url.searchParams.append("modelFamily", model.split(" ")[0]);
    url.searchParams.append("zoomType", "fullscreen");
    url.searchParams.append("modelYear", `${year}`);
    url.searchParams.append("angle", angle);
    return url.toString();
  });

  return urls;
}