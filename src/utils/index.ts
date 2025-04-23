// src/utils/index.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

 

const compareCache = new Map<string, string>();

export const compareCars = async (car1: CarProps, car2: CarProps): Promise<string> => {
  try {
    // Validate that required fields exist in both car objects
    const requiredFields: (keyof CarProps)[] = ['make', 'model', 'year', 'city_mpg'];
    for (const field of requiredFields) {
      // Check for null, undefined, or empty string for make/model
      if (field === 'make' || field === 'model') {
         if (!car1[field] || !car2[field]) {
            throw new Error(`Missing or empty ${field} in one of the car objects.`);
         }
      } else {
         // Check for null or undefined for year/mpg
         if (car1[field] == null || car2[field] == null) { // Using == null checks for both null and undefined
             throw new Error(`Missing ${field} in one of the car objects.`);
         }
      }
    }
    const cacheKey = `compare-${car1.make}-${car1.model}-${car1.year}-${car1.city_mpg}::${car2.make}-${car2.model}-${car2.year}-${car2.city_mpg}`;

    // --- Check Cache ---
    if (compareCache.has(cacheKey)) {
      console.log("Returning cached comparison result.");
      return compareCache.get(cacheKey)!;
    }

    // --- Load API Key ---
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // 
    if (!API_KEY) {
      throw new Error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
    }

    // --- Initialize Gemini Client ---
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest", // Or "gemini-pro" if flash isn't available/suitable
        // --- Safety Settings (Optional but Recommended) ---
        // Adjust these based on your needs. Blocking potentially sensitive car comparisons might not be necessary.
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ]
    });

    // --- Construct Prompt ---
    const prompt = `Create a visually engaging car comparison with the following format:

# 🚗 Vehicle Comparison: [Theme based on cars being compared]

## ${car1.make} ${car1.model} (${car1.year}) [appropriate emoji]
### ✨ Key Highlights
- Main Feature Category [emoji]
  - Sub-feature 1
  - Sub-feature 2
  - Sub-feature 3

### 💪 Strengths
- [emoji] Key strength 1
- [emoji] Key strength 2
- [emoji] Key strength 3
- [emoji] Key strength 4
- [emoji] Key strength 5

### 👥 Perfect For
- [emoji] Target audience 1
- [emoji] Target audience 2
- [emoji] Target audience 3
- [emoji] Target audience 4

[Repeat same structure for ${car2.make} ${car2.model}]

## 📊 Head-to-Head Comparison
Create a comparison table with the following features rated with stars (⭐):
- Best For
- Fuel Economy (based on city_mpg: ${car1.city_mpg} vs ${car2.city_mpg})
- Luxury
- Price Point
- Space
- City Driving
- Off-Road Capability

## 🎯 Final Verdict

Choose the ${car1.model} if you:
- [emoji] Reason 1
- [emoji] Reason 2
- [emoji] Reason 3
- [emoji] Reason 4

Choose the ${car2.model} if you:
- [emoji] Reason 1
- [emoji] Reason 2
- [emoji] Reason 3
- [emoji] Reason 4

Remember: The best choice depends on your lifestyle, budget, and primary use case! 🎯

Important formatting rules:
1. Use emojis extensively for visual appeal
2. Create clear section breaks
3. Use bullet points for easy scanning
4. Group similar information
5. Keep the tone professional but engaging
6. Use stars (⭐) for ratings in the comparison table
7. Ensure all sections are properly formatted with markdown`;

    // --- Call Gemini API ---
    console.log("Calling Gemini API...");
    const generationConfig = {
        temperature: 0.7, // Controls randomness (0 = deterministic, 1 = max randomness)
        maxOutputTokens: 400, // Adjust token limit as needed
        // topP: 0.9, // Optional: Nucleus sampling
        // topK: 40, // Optional: Top-k sampling
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig,
    });

    const response = result.response;

    // --- Process Response ---
    // Check if the response was blocked or had issues
    if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content?.parts?.[0]?.text) {
        console.error("Gemini API Error: No valid response received or content was blocked.", response?.promptFeedback || 'No feedback available.');
        // Check for safety blocks specifically
        if (response?.promptFeedback?.blockReason) {
             return `Comparison generation blocked. Reason: ${response.promptFeedback.blockReason}`;
        }
        return "Failed to get comparison from AI. Response was empty or invalid.";
    }

    const comparisonText = response.candidates[0].content.parts[0].text;

    // --- Cache Result ---
    compareCache.set(cacheKey, comparisonText);
    console.log("Comparison successful, result cached.");

    // The rest of the function remains the same, just update the prompt
    
    return comparisonText;

  } catch (error: any) {
    console.error("Gemini Comparison Error:", error);
    // Provide more specific error messages if possible
    if (error.message && error.message.includes('API key not valid')) {
        return "Comparison unavailable: Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY.";
    }
    if (error.message && error.message.includes('quota')) {
        return "Comparison unavailable: API quota exceeded. Please check your usage limits.";
    }
    // General error message
    return `Comparison unavailable due to an error: ${error.message || 'Unknown error'}. Check console for details.`;
  }
};
