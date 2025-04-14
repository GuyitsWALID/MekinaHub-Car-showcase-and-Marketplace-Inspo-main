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

  // Check if there is at least one valid filter value
  if (!make && !year && !model) {
    throw new Error("At least one filter value must be provided to fetch cars.");
  }

  const headers: HeadersInit = {
    "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY || "523d10003amshea14e4dbb120c59p1ebaefjsn0955757c2468",
    "X-RapidAPI-Host": "cars-by-api-ninjas.p.rapidapi.com",
  };

  const params = new URLSearchParams();
  if (make) {
    params.append("make", make);
  }
  if (year) {
    params.append("year", year.toString());
  }
  if (model) {
    params.append("model", model);
  }

  const url = `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?${params.toString()}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch cars: ${response.status} ${response.statusText}`);
  }
  
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
// Add to utils/index.ts
// A simple cache to store comparisons keyed by car details
const compareCache = new Map<string, string>();

export const compareCars = async (car1: CarProps, car2: CarProps): Promise<string> => {
  try {
    // Validate that required fields exist in both car objects
    const requiredFields: (keyof CarProps)[] = ['make', 'model', 'year', 'city_mpg'];
    for (const field of requiredFields) {
      if (!car1[field] || !car2[field]) {
        throw new Error(`Missing ${field} in one of the car objects.`);
      }
    }

    // Generate a unique cache key based on the car details
    const cacheKey = `${car1.make}-${car1.model}-${car1.year}-${car1.city_mpg}::${car2.make}-${car2.model}-${car2.year}-${car2.city_mpg}`;
    
    // If the result is already cached, return it immediately.
    if (compareCache.has(cacheKey)) {
      console.log("Returning cached comparison result.");
      return compareCache.get(cacheKey)!;
    }

    // Load the API key from environment variables
    const API_KEY = import.meta.env.VITE_OPENAI_KEY;
    if (!API_KEY) {
      throw new Error("API key is missing. Please check your environment variables.");
    }

    // Construct the prompt to send to OpenAI
    const prompt = `Compare the following two cars based on their specifications:
- Car 1: ${car1.make} ${car1.model} (${car1.year}), ${car1.city_mpg} MPG
- Car 2: ${car2.make} ${car2.model} (${car2.year}), ${car2.city_mpg} MPG

Provide a detailed analysis including aspects such as performance, efficiency, and practicality.`;

    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return "Failed to fetch comparison. Please check the console for details.";
    }

    // Parse the response
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No response from AI.";

    // Cache the result to avoid duplicate API calls in the future
    compareCache.set(cacheKey, result);

    return result;

  } catch (error) {
    console.error("Comparison error:", error);
    return "Comparison unavailable. Please check the console for error details.";
  }
};
