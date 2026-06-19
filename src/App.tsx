/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  Sunrise,
  Sunset,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  History,
  Trash2,
  Calendar,
  Cloud,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowLeftRight
} from "lucide-react";

import { CompleteWeatherReport } from "./types";
import { fetchWeather } from "./utils/weatherApi";
import { getWeatherCondition } from "./utils/weatherCodeMap";
import WeatherIcon from "./components/WeatherIcon";

// Default Preset Cities to display as helper quick tags
const PRESET_CITIES = ["New York", "London", "Tokyo", "Paris", "Sydney", "Mumbai"];

export default function App() {
  const [activeMode, setActiveMode] = useState<"dashboard" | "compare">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherReport, setWeatherReport] = useState<CompleteWeatherReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">(() => {
    // Persistent initial setup
    const saved = localStorage.getItem("weather_unit");
    return (saved as "C" | "F") || "C";
  });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recent_searches");
    return saved ? JSON.parse(saved) : [];
  });

  // Dual-city weather comparison states
  const [city1Query, setCity1Query] = useState("London");
  const [city2Query, setCity2Query] = useState("New York");
  const [compareReport1, setCompareReport1] = useState<CompleteWeatherReport | null>(null);
  const [compareReport2, setCompareReport2] = useState<CompleteWeatherReport | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Load a default city (London) and default comparison list on startup
  useEffect(() => {
    handleLoadCity("London", false);
    handleLoadComparison("London", "New York");
  }, []);

  // Update localStorage when unit or recentSearches change
  useEffect(() => {
    localStorage.setItem("weather_unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  /**
   * Internal routine for loading city weather
   */
  const handleLoadCity = async (city: string, addToHistory: boolean = true) => {
    if (!city.trim()) {
      setError("Please search for a non-empty city name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = await fetchWeather(city);
      setWeatherReport(report);

      if (addToHistory) {
        // Save to dynamic history stack
        setRecentSearches((prev) => {
          const filtered = prev.filter((item) => item.toLowerCase() !== city.trim().toLowerCase());
          const newHistory = [report.city, ...filtered].slice(0, 5); // Limit to top 5 recent searches
          return newHistory;
        });
      }
    } catch (err: any) {
      if (err.message === "EmptyInput") {
        setError("Please enter a city name to search.");
      } else if (err.message === "CityNotFound") {
        setError(`We couldn't find "${city}". Please double-check the spelling.`);
      } else {
        setError("Network error occurred. Please check your internet connection.");
      }
      setWeatherReport(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Asynchronously compares weather data for two target cities using high-end Promise.all routines
   */
  const handleLoadComparison = async (c1: string, c2: string) => {
    if (!c1.trim() || !c2.trim()) {
      setCompareError("Please enter non-empty city names for both fields.");
      return;
    }

    setCompareLoading(true);
    setCompareError(null);

    try {
      const [r1, r2] = await Promise.all([
        fetchWeather(c1),
        fetchWeather(c2)
      ]);
      setCompareReport1(r1);
      setCompareReport2(r2);
      setCity1Query(r1.city);
      setCity2Query(r2.city);
    } catch (err: any) {
      if (err.message === "CityNotFound") {
        setCompareError("One or both cities could not be found. Please check spellings.");
      } else {
        setCompareError("Network link failed. Could not retrieve meteorological comparison properties.");
      }
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCompareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city1Query.trim() && city2Query.trim()) {
      handleLoadComparison(city1Query, city2Query);
    } else {
      setCompareError("Please enter city names for both fields to execute compare analysis.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleLoadCity(searchQuery, true);
    } else {
      setError("Please enter a city name to search.");
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, cityToRemove: string) => {
    e.stopPropagation(); // Avoid triggering city search on list selection click
    setRecentSearches((prev) => prev.filter((c) => c !== cityToRemove));
  };

  const handleClearAllRecents = () => {
    setRecentSearches([]);
  };

  // Temperature display format converters
  const convertTemp = (celsius: number) => {
    if (unit === "C") return Math.round(celsius);
    return Math.round((celsius * 9) / 5 + 32);
  };

  const formatTempStr = (celsius: number) => {
    return `${convertTemp(celsius)}°${unit}`;
  };

  // Direction calculation representation helper
  const getWindCardinalDirection = (degrees: number) => {
    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
    const index = Math.round(((degrees % 360) / 45)) % 8;
    return directions[index];
  };

  // Get weekday names for daily forecast dates
  const getWeekdayName = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const currentCondition = weatherReport
    ? getWeatherCondition(weatherReport.current.weatherCode, weatherReport.current.isDay)
    : null;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-start transition-colors duration-300">
      {/* Absolute Decorative Subtle Circles for elegant Geometric balance layout */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-50/30 dark:bg-purple-950/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 z-10 flex-grow flex flex-col gap-8">
        {/* Header Branding section - styled according to Geometric Balance specification */}
        <header className="flex flex-col items-center gap-4 text-center border-b border-slate-200/60 dark:border-slate-800 pb-6 w-full">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-light tracking-tight text-slate-400 dark:text-slate-500 uppercase letter-spacing-widest">
              Weather Dashboard
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-[0.15em] mt-0.5">
              Live Open-Meteo Meteorological Diagnostics
            </p>
          </div>

          {/* Unit switcher of high quality design + UTC time display */}
          <div className="flex items-center gap-6 mt-1 flex-wrap justify-center">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              System: {new Date().toISOString().slice(0, 10)} {new Date().toISOString().slice(11, 16)} UTC
            </div>

            {/* Premium Unit Switcher Buttons of Scandinavian Geometric aesthetics */}
            <div className="flex bg-slate-200/60 dark:bg-slate-900/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <button
                id="unit-c-selector"
                onClick={() => setUnit("C")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unit === "C"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white"
                }`}
              >
                °C
              </button>
              <button
                id="unit-f-selector"
                onClick={() => setUnit("F")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unit === "F"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white"
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </header>

        {/* Scandinavian Visual Mode Switcher Row */}
        <div className="flex justify-center -mt-2">
          <div className="inline-flex bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setActiveMode("dashboard")}
              className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeMode === "dashboard"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveMode("compare")}
              className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeMode === "compare"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Compare Cities
            </button>
          </div>
        </div>

        {activeMode === "dashboard" ? (
          <>
            {/* Dynamic Interactive Widgets: Search and Recents List wrapper */}
            <section className="flex flex-col gap-4">
              <form 
                id="weather-search-form" 
                onSubmit={handleSearchSubmit} 
                className="w-full flex gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-indigo-650/20"
              >
                <input
                  id="city-search-input"
                  type="text"
                  placeholder="Search city (e.g. Amsterdam, Tokyo)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent px-5 py-3 outline-none text-[15px] text-slate-750 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-light focus:outline-none"
                />
                <button
                  id="search-trigger-btn"
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Search
                  <ChevronRight size={15} />
                </button>
              </form>

              {/* Quick Select Preset City Tags */}
              <div className="flex flex-wrap items-center gap-2 justify-center py-1">
                <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-widest">
                  Quick Tags:
                </span>
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSearchQuery("");
                      handleLoadCity(city, true);
                    }}
                    className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-xs font-medium text-slate-500 dark:text-slate-455 rounded-lg border border-slate-200/50 dark:border-slate-800/80 transition cursor-pointer"
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* History/Recent Searches segment */}
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/60 justify-center">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-widest">
                    <History size={12} />
                    <span>Recent:</span>
                  </div>
                  {recentSearches.map((recCity) => (
                    <div
                      key={recCity}
                      onClick={() => handleLoadCity(recCity, false)}
                      className="group flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-450 rounded-lg border border-slate-200/50 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950 transition"
                    >
                      <span className="font-semibold">{recCity}</span>
                      <button
                        onClick={(e) => handleRemoveRecent(e, recCity)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleClearAllRecents}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition uppercase ml-2 tracking-widest cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </section>

            {/* Dynamic Display Layout Box */}
            <section id="weather-data-container" className="flex-grow flex flex-col justify-start">
              <AnimatePresence mode="wait">
                {/* Loading Skeleton block */}
                {loading && (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="w-full h-64 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="h-48 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl md:col-span-2" />
                      <div className="h-48 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl" />
                    </div>
                  </motion.div>
                )}

                {/* Operational Error Container */}
            {error && !loading && (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4 shadow-sm py-12"
              >
                <div className="text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Weather Lookup Failed</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => handleLoadCity("London", false)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-xl transition cursor-pointer"
                >
                  Reset To London, UK
                </button>
              </motion.div>
            )}

            {/* Standard Primary Weather Report Cards */}
            {weatherReport && !loading && !error && currentCondition && (
              <motion.div
                key="weather-report"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-8"
              >
                {/* Hero Dashboard Section styled like Geometric Balance "Copenhagen" view */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col w-full md:w-auto text-left">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {weatherReport.city}
                    </h2>
                    
                    <p className="text-slate-400 dark:text-slate-500 text-sm md:text-base font-light mt-2 flex flex-wrap items-center gap-1">
                      {weatherReport.region && <span>{weatherReport.region}, </span>}
                      <span>{weatherReport.country}</span>
                      <span className="text-slate-300 dark:text-slate-800 mx-1.5">|</span>
                      <span className="font-mono text-xs">Lat: {weatherReport.latitude.toFixed(2)} Lon: {weatherReport.longitude.toFixed(2)}</span>
                    </p>

                    <div className="flex items-center gap-6 mt-8 flex-wrap">
                      <div className="text-7xl md:text-8xl font-thin tracking-tighter text-indigo-600 dark:text-indigo-400">
                        {convertTemp(weatherReport.current.temperature)}°{unit}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-2xl font-medium text-slate-705 dark:text-slate-200">{currentCondition.text}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-light">Feels like {formatTempStr(weatherReport.current.apparentTemperature)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean rounded icon circle from Geometric Balance theme */}
                  <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center bg-indigo-50/75 dark:bg-slate-800/80 rounded-full flex-shrink-0 border border-indigo-120 dark:border-slate-700">
                    <WeatherIcon name={currentCondition.iconName} className="w-24 h-24 text-indigo-500 dark:text-indigo-400" />
                  </div>
                </div>

                {/* Grid stats layout: Atmospheric details + Forecast lists */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Atmospheric Properties section in grid format */}
                  <section className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-650 dark:text-blue-400 flex-shrink-0">
                      <Droplets size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Humidity</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{weatherReport.current.humidity}%</p>
                    </div>
                  </section>

                  <section className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-650 dark:text-amber-400 flex-shrink-0">
                      <Wind size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Wind Speed</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{weatherReport.current.windSpeed} km/h</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-none">
                        {getWindCardinalDirection(weatherReport.current.windDirection)} ({weatherReport.current.windDirection}°)
                      </p>
                    </div>
                  </section>

                  <section className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-650 dark:text-purple-400 flex-shrink-0">
                      <Sunrise size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Daylight Schedule</p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rise: {weatherReport.sunrise}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Set: {weatherReport.sunset}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sub-layout: 12-Hour Trend & 7-Day Forecast */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {/* Hourly timeline horizontal slide */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                      <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={14} />
                        Hourly Trend (Next 12h)
                      </h3>
                    </div>

                    {/* Scrollbar Timeline row */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 text-center">
                      {weatherReport.hourly.map((hour, idx) => {
                        const hourText = new Date(hour.time).toLocaleTimeString([], {
                          hour: "numeric",
                          hour12: true,
                        });
                        return (
                          <div
                            key={idx}
                            className="flex-shrink-0 flex flex-col items-center p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100/50 dark:border-slate-850 rounded-2xl w-20"
                          >
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {hourText}
                            </span>
                            <div className="my-2.5">
                              <WeatherIcon name={hour.iconName} className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">
                              {formatTempStr(hour.temp)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7-Day Forecast card matching the Scandinavian outline */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={14} className="mt-0.5" />
                        7-Day Forecast
                      </h3>
                    </div>

                    {/* Timeline days sequence */}
                    <div className="flex flex-col gap-3">
                      {weatherReport.daily.map((day, idx) => (
                        <div
                          key={day.date}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800 last:border-none"
                        >
                          <div className="w-24 text-left">
                            <p className="font-bold text-slate-800 dark:text-slate-100">
                              {getWeekdayName(day.date, idx)}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              {day.conditionText}
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <WeatherIcon name={day.iconName} className="w-5 h-5 text-slate-500" />
                          </div>

                          {/* Min / Max graphic layout indicator */}
                          <div className="flex items-center gap-1 text-right w-20 justify-end">
                            <span className="font-semibold text-slate-400 dark:text-slate-500">
                              {convertTemp(day.tempMin)}°
                            </span>
                            <span className="text-xs font-semibold text-slate-300 dark:text-slate-700">/</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {convertTemp(day.tempMax)}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
          </>
        ) : (
          <>
            {/* Compare Selector section */}
            <section className="flex flex-col gap-4">
              <form 
                onSubmit={handleCompareSubmit}
                className="w-full flex flex-col md:flex-row gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Primary City</label>
                    <div className="relative flex items-center">
                      <MapPin size={16} className="absolute left-4 text-indigo-500" />
                      <input
                        type="text"
                        placeholder="e.g. London"
                        value={city1Query}
                        onChange={(e) => setCity1Query(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl outline-none text-[14px] border border-slate-200/50 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Compared City</label>
                    <div className="relative flex items-center">
                      <MapPin size={16} className="absolute left-4 text-purple-500" />
                      <input
                        type="text"
                        placeholder="e.g. New York"
                        value={city2Query}
                        onChange={(e) => setCity2Query(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl outline-none text-[14px] border border-slate-200/50 dark:border-slate-800 focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-center md:pb-0.5">
                  <button
                    type="submit"
                    disabled={compareLoading}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight size={16} />
                    {compareLoading ? "Analyzing..." : "Compare"}
                  </button>
                </div>
              </form>

              {/* Quick Select Preset Comparison Pairs */}
              <div className="flex flex-wrap items-center gap-2 justify-center py-1">
                <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-widest">
                  Quick Pairs:
                </span>
                {[
                  ["Paris", "London"],
                  ["Tokyo", "Sydney"],
                  ["New York", "Mumbai"],
                  ["Amsterdam", "Cairo"]
                ].map(([c1, c2]) => (
                  <button
                    key={`${c1}-${c2}`}
                    onClick={() => {
                      setCity1Query(c1);
                      setCity2Query(c2);
                      handleLoadComparison(c1, c2);
                    }}
                    className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-xs font-medium text-slate-500 dark:text-slate-450 rounded-lg border border-slate-200/50 dark:border-slate-800/80 transition cursor-pointer"
                  >
                    {c1} vs {c2}
                  </button>
                ))}
              </div>
            </section>

            {/* Comparison Display Panel */}
            <section id="compare-data-container" className="flex-grow flex flex-col justify-start">
              <AnimatePresence mode="wait">
                {/* Compare Loading State */}
                {compareLoading && (
                  <motion.div
                    key="compare-loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-44 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl" />
                      <div className="h-44 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl" />
                    </div>
                    <div className="h-64 bg-slate-200/60 dark:bg-slate-900 animate-pulse rounded-3xl" />
                  </motion.div>
                )}

                {/* Compare Error Section */}
                {compareError && !compareLoading && (
                  <motion.div
                    key="compare-error-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4 shadow-sm py-12"
                  >
                    <div className="text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl">
                      <AlertCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comparison Query Failed</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-440 mt-1 max-w-sm">
                        {compareError}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadComparison("London", "New York")}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-xl transition cursor-pointer"
                    >
                      Reset to London vs New York
                    </button>
                  </motion.div>
                )}

                {/* Compare Operational Dashboard */}
                {compareReport1 && compareReport2 && !compareLoading && !compareError && (
                  <motion.div
                    key="compare-filled-state"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Visualizer Cards side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First City Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{compareReport1.city}</h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md shrink-0">
                              {compareReport1.country}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">Lat: {compareReport1.latitude.toFixed(2)} Lon: {compareReport1.longitude.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                          <div className="w-14 h-14 flex items-center justify-center bg-indigo-50/70 dark:bg-slate-800/80 rounded-full border border-indigo-100 dark:border-slate-700 shrink-0">
                            <WeatherIcon 
                              name={getWeatherCondition(compareReport1.current.weatherCode, compareReport1.current.isDay).iconName} 
                              className="w-8 h-8 text-indigo-500 dark:text-indigo-400" 
                            />
                          </div>
                          <div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                              {convertTemp(compareReport1.current.temperature)}°{unit}
                            </div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                              {getWeatherCondition(compareReport1.current.weatherCode, compareReport1.current.isDay).text}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Second City Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{compareReport2.city}</h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 rounded-md shrink-0">
                              {compareReport2.country}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">Lat: {compareReport2.latitude.toFixed(2)} Lon: {compareReport2.longitude.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                          <div className="w-14 h-14 flex items-center justify-center bg-purple-50/70 dark:bg-slate-800/80 rounded-full border border-purple-100 dark:border-slate-700 shrink-0">
                            <WeatherIcon 
                              name={getWeatherCondition(compareReport2.current.weatherCode, compareReport2.current.isDay).iconName} 
                              className="w-8 h-8 text-purple-500 dark:text-purple-400" 
                            />
                          </div>
                          <div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                              {convertTemp(compareReport2.current.temperature)}°{unit}
                            </div>
                            <p className="text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider">
                              {getWeatherCondition(compareReport2.current.weatherCode, compareReport2.current.isDay).text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Diagnostic Matrix Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-3">
                        Comparative Diagnostic Matrix
                      </h3>

                      <div className="space-y-6">
                        {/* Temperature Row with relative analysis */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="truncate max-w-[120px]">{compareReport1.city}</span>
                            <span className="text-slate-500 font-mono">Temperature</span>
                            <span className="truncate max-w-[120px]">{compareReport2.city}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5 text-left text-xl font-bold text-indigo-600 dark:text-indigo-400">
                              {convertTemp(compareReport1.current.temperature)}°{unit}
                            </div>
                            <div className="col-span-2 flex justify-center text-center">
                              {compareReport1.current.temperature > compareReport2.current.temperature ? (
                                <span className="text-[9px] font-bold uppercase bg-orange-50 dark:bg-orange-950/40 text-orange-655 dark:text-orange-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {compareReport1.city} Warmer
                                </span>
                              ) : compareReport1.current.temperature < compareReport2.current.temperature ? (
                                <span className="text-[9px] font-bold uppercase bg-orange-50 dark:bg-orange-950/40 text-orange-655 dark:text-orange-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {compareReport2.city} Warmer
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Equal temp
                                </span>
                              )}
                            </div>
                            <div className="col-span-5 text-right text-xl font-bold text-purple-600 dark:text-purple-400">
                              {convertTemp(compareReport2.current.temperature)}°{unit}
                            </div>
                          </div>
                        </div>

                        {/* Apparent Sensation Row */}
                        <div className="space-y-2 border-t border-slate-100/60 dark:border-slate-800/40 pt-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Sensation: {formatTempStr(compareReport1.current.apparentTemperature)}</span>
                            <span className="text-slate-500 font-mono">Thermal Sensation</span>
                            <span>Sensation: {formatTempStr(compareReport2.current.apparentTemperature)}</span>
                          </div>
                        </div>

                        {/* Humidity Comparison */}
                        <div className="space-y-2 border-t border-slate-100/60 dark:border-slate-800/40 pt-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="truncate max-w-[120px]">{compareReport1.city}</span>
                            <span className="text-slate-500 font-mono">Humidity</span>
                            <span className="truncate max-w-[120px]">{compareReport2.city}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5 text-left text-lg font-bold text-slate-700 dark:text-slate-300">
                              {compareReport1.current.humidity}%
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Droplets size={16} className="text-indigo-400" />
                            </div>
                            <div className="col-span-5 text-right text-lg font-bold text-slate-700 dark:text-slate-300">
                              {compareReport2.current.humidity}%
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-1 rounded-full flex overflow-hidden">
                            <div className="bg-indigo-500" style={{ width: `${compareReport1.current.humidity}%` }} />
                            <div className="bg-slate-200 dark:bg-slate-800 flex-grow" />
                            <div className="bg-purple-500" style={{ width: `${compareReport2.current.humidity}%` }} />
                          </div>
                        </div>

                        {/* Wind Speed and Cardinal properties */}
                        <div className="space-y-2 border-t border-slate-100/60 dark:border-slate-800/40 pt-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="truncate max-w-[120px]">{compareReport1.current.windSpeed} km/h ({getWindCardinalDirection(compareReport1.current.windDirection)})</span>
                            <span className="text-slate-500 font-mono">Wind Velocity</span>
                            <span className="truncate max-w-[120px]">{compareReport2.current.windSpeed} km/h ({getWindCardinalDirection(compareReport2.current.windDirection)})</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-1 rounded-full flex overflow-hidden">
                            {(() => {
                              const totalWind = Math.max(1, compareReport1.current.windSpeed + compareReport2.current.windSpeed);
                              const val1 = (compareReport1.current.windSpeed / totalWind) * 100;
                              const val2 = 100 - val1;
                              return (
                                <>
                                  <div className="bg-indigo-500" style={{ width: `${val1}%` }} />
                                  <div className="bg-purple-500" style={{ width: `${val2}%` }} />
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Day Range comparison */}
                        <div className="space-y-2 border-t border-slate-100/60 dark:border-slate-800/40 pt-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="truncate max-w-[120px]">{compareReport1.city}</span>
                            <span className="text-slate-500 font-mono">Daylight Schedule</span>
                            <span className="truncate max-w-[120px]">{compareReport2.city}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center text-xs text-slate-600 dark:text-slate-300">
                            <div className="bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850">
                              <p className="font-semibold"><span className="text-slate-400">Rise:</span> {compareReport1.sunrise}</p>
                              <p className="font-semibold"><span className="text-zinc-400">Set:</span> {compareReport1.sunset}</p>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850">
                              <p className="font-semibold"><span className="text-slate-400">Rise:</span> {compareReport2.sunrise}</p>
                              <p className="font-semibold"><span className="text-zinc-400">Set:</span> {compareReport2.sunset}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        )}
      </main>

      {/* Footer System Status details matching Scandinavia layout */}
      <footer className="w-full text-center py-6 bg-white dark:bg-slate-900 border-t border-slate-250/20 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex gap-4 sm:gap-6 uppercase tracking-widest font-semibold text-[10px]">
            <span>Elevation: {weatherReport?.latitude ? `${(weatherReport.latitude * 15).toFixed(0)}m` : "--"}</span>
            <span className="hidden sm:inline">•</span>
            <span>Scale: Standard Metric (SI)</span>
            <span className="hidden sm:inline">•</span>
            <span>API: Open-Meteo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-indigo-500" />
            <span>Telemetry: <span className="text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">Connected</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

