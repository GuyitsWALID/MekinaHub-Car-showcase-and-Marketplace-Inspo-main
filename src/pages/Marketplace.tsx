import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import CustomFilter from "../components/CustomFilter";
import { supabase } from "../supabaseClient";
import { CarProps } from "../types";
import Car360Viewer from "../components/3DCarModelViewr";
import { Button } from "../components/ui/button";
import { Heart, HeartOff, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: number;
  title: string;
  price: string;
  image: string;
  status: string;
  details: string;
  car_type?: string;
  fuel_type?: string;
  transmission?: string;
  year?: number;
  make?: string;
  model?: string;
  dealer_id: number;
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "ETB">("USD");
  const [usdToEtb] = useState(135);

  const [selectedFuel, setSelectedFuel] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Listing | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch car listings
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      let query = supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery)   query = query.ilike("make", `%${searchQuery}%`);
      if (selectedModel) query = query.ilike("model", `%${selectedModel}%`);
      if (selectedYear)  query = query.eq("year", Number(selectedYear));
      if (selectedFuel)  query = query.ilike("fuel_type", `%${selectedFuel}%`);
      if (minPrice)      query = query.gte("price", Number(minPrice));
      if (maxPrice)      query = query.lte("price", Number(maxPrice));

      const { data, error } = await query;
      if (error) {
        console.error(error);
        setListings([]);
      } else {
        setListings(data || []);
      }
      setIsLoading(false);
    }
    fetchListings();
  }, [searchQuery, selectedModel, selectedYear, selectedFuel, minPrice, maxPrice]);

  // Fetch favorites (demo userId = 1)
  useEffect(() => {
    async function fetchFavorites() {
      const userId = 1;
      const { data } = await supabase
        .from("favorites")
        .select("car_id")
        .eq("user_id", userId);
      if (data) setFavorites(data.map((f: any) => f.car_id));
    }
    fetchFavorites();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (carId: number) => {
    setFavLoading(carId);
    const userId = 1;
    if (favorites.includes(carId)) {
      await supabase
        .from("favorites")
        .delete()
        .eq("car_id", carId)
        .eq("user_id", userId);
      setFavorites(prev => prev.filter(id => id !== carId));
    } else {
      await supabase
        .from("favorites")
        .insert([{ car_id: carId, user_id: userId }]);
      setFavorites(prev => [...prev, carId]);
    }
    setFavLoading(null);
  };

  const handleSearch = (q: string) => setSearchQuery(q);
  const handleSelectCar = (car: Listing) => setSelectedCar(car);
  const handleDeselectCar = () => setSelectedCar(null);

  const convertPrice = (priceStr: string) => {
    const priceNum = parseFloat(priceStr);
    if (currency === "USD") return `$${priceNum.toLocaleString()}`;
    return `ETB ${Math.round(priceNum * usdToEtb).toLocaleString()}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Authentication error:", userError);
        alert("Authentication error. Please try logging in again.");
        return;
      }
      if (!user?.id) {
        alert("Please sign in to submit a dealer application");
        return;
      }

      const companyName  = formData.get("company_name") as string;
      const contactEmail = formData.get("contact_email") as string;
      const contactPhone = formData.get("contact_phone") as string;
      const location     = formData.get("location") as string;
      const description  = formData.get("description") as string;
      const logoFile     = formData.get("logo") as File;

      // validations...
      if (!companyName || companyName.length < 2) {
        alert("Please enter a valid company name");
        setIsSubmitting(false);
        return;
      }
      if (!contactEmail.includes("@")) {
        alert("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }
      if (!contactPhone || contactPhone.length < 10) {
        alert("Please enter a valid phone number");
        setIsSubmitting(false);
        return;
      }
      if (!location || location.length < 2) {
        alert("Please enter a valid location");
        setIsSubmitting(false);
        return;
      }
      if (!description || description.length < 10) {
        alert("Please provide a detailed description");
        setIsSubmitting(false);
        return;
      }

      let logoUrl = "";
      if (logoFile && logoFile.size > 0) {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(logoFile.type)) {
          alert("Please upload a PNG, JPG or JPEG");
          setIsSubmitting(false);
          return;
        }
        if (logoFile.size > 5 * 1024 * 1024) {
          alert("Logo must be less than 5MB");
          setIsSubmitting(false);
          return;
        }
        const ext = logoFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("dealers")
          .upload(`logos/${fileName}`, logoFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: logoFile.type,
          });
        if (uploadError || !uploadData?.path) {
          console.error("Upload error:", uploadError);
          alert("Failed to upload logo");
          setIsSubmitting(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage
          .from("dealers")
          .getPublicUrl(`logos/${fileName}`);
        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("dealer_applications")
        .insert([{
          user_id: user.id,
          company_name: companyName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          location,
          description,
          logo_url: logoUrl || null,
          status: "pending",
        }]);
      if (error) {
        console.error("Submission error:", error);
        alert(`Failed to submit: ${error.message}`);
      } else {
        alert("Application submitted!");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred; please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">
          Marketplace
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Browse, search, and connect with dealers
        </p>
        <button
          className="text-primary-600 font-semibold hover:underline mt-2"
          onClick={() => setIsModalOpen(true)}
        >
          Become a Dealer - Apply Now!
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow mb-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
<div className="relative w-full max-w-md">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      handleSearch(e.target.value);
    }}
    placeholder="Search cars by make..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
  />
  {searchQuery && (
    <button
      onClick={() => {
        setSearchQuery('');
        handleSearch('');
      }}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      ×
    </button>
  )}
</div>
          <div className="flex flex-col w-full max-w-xs gap-2">
            <div className="flex justify-between text-sm">
              <span>Price Range: ${minPrice || '0'} - ${maxPrice || '100000'}</span>
            </div>
            <div className="relative h-2">
              <div className="absolute w-full h-2 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <div
                className="absolute h-2 bg-blue-500 rounded-lg"
                style={{
                  left: `${((Number(minPrice) || 0) / 100000) * 100}%`,
                  right: `${100 - ((Number(maxPrice) || 100000) / 100000) * 100}%`
                }}
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={minPrice || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Number(value) <= Number(maxPrice) || !maxPrice) {
                    setMinPrice(value);
                  }
                }}
                className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={maxPrice || 100000}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Number(value) >= Number(minPrice) || !minPrice) {
                    setMaxPrice(value);
                  }
                }}
                className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
          <select
            className="border dark:bg-slate-800 rounded px-2 py-1"
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value as "USD" | "ETB")
            }
          >
            <option value="USD">USD</option>
            <option value="ETB">ETB</option>
          </select>


        </div>
      </div>

      {/* 360° View or Listings Grid */}
      {selectedCar ? (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
          {/* ... your selectedCar view ... */}
        </div>
      ) : (
        <div className="my-8 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-64">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center text-gray-500">No cars found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings.map((car) => (
                <div
                  key={car.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200 relative"
                >
                  <img
                    src={car.image}
                    alt={car.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleSelectCar(car)}
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-1">{car.title}</h3>
                    <p className="text-blue-600 dark:text-blue-300 font-bold mb-1">
                      {convertPrice(car.price)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {car.details}
                    </p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {car.status && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {car.status}
                        </span>
                      )}
                      {car.car_type && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {car.car_type}
                        </span>
                      )}
                      {car.fuel_type && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {car.fuel_type}
                        </span>
                      )}
                      {car.transmission && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                          {car.transmission}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant={favorites.includes(car.id) ? "secondary" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => toggleFavorite(car.id)}
                        disabled={favLoading === car.id}
                      >
                        {favLoading === car.id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : favorites.includes(car.id) ? (
                          <>
                            <Heart className="w-4 h-4 text-red-500" /> Remove Favorite
                          </>
                        ) : (
                          <>
                            <HeartOff className="w-4 h-4" /> Add to Favorites
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/messages?dealerId=${car.dealer_id}`)}
                        className="flex items-center gap-1"
                      >
                        Contact Dealer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dealer Application Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
            <button
              aria-label="Close modal"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 id="modal-title" className="text-2xl font-bold mb-4">
              Apply to Become a Dealer
            </h2>
            <form onSubmit={handleFormSubmit}>
              {/* Company Name */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {/* Contact Email */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {/* Contact Phone */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {/* Location */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {/* Logo Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload your company logo (PNG, JPG, JPEG)
                </p>
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? "bg-gray-400" : "bg-primary-600 hover:bg-primary-700"
                } text-white py-2 rounded-lg transition-colors duration-200`}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
