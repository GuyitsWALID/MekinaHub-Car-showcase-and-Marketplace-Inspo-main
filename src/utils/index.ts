export async function fetchCars() {
    try {
      const response = await fetch("https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?model=corolla", {
        headers: {
          "X-RapidAPI-Key": "523d10003amshea14e4dbb120c59p1ebaefjsn0955757c2468",
          "X-RapidAPI-Host": "cars-by-api-ninjas.p.rapidapi.com",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return []; // Return an empty array or handle the error as needed
    }
  }
  