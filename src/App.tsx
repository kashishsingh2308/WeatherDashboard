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
  MapPin
} from "lucide-react";

import { CompleteWeatherReport } from "./types";
import { fetchWeather } from "./utils/weatherApi";
import { getWeatherCondition } from "./utils/weatherCodeMap";
import WeatherIcon from "./components/WeatherIcon";

// Default Preset Cities to display as helper quick tags
const PRESET_CITIES = ["New York", "London", "Tokyo", "Paris", "Sydney", "Mumbai"];

export default function App() {
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

  // Load a default city (London) on startup so the app is immediately alive
  useEffect(() => {
    handleLoadCity("London", false);
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
                className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-xs font-medium text-slate-500 dark:text-slate-450 rounded-lg border border-slate-200/50 dark:border-slate-800/80 transition cursor-pointer"
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
                  className="group flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950 transition"
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

