/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompleteWeatherReport, GeocodingResult } from "../types";
import { getWeatherCondition } from "./weatherCodeMap";

/**
 * Searches and geocodes a location by city name using Open-Meteo's free Geocoding API.
 */
export async function getCoordinates(city: string): Promise<GeocodingResult> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new Error("EmptyInput");
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("NetworkError");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("CityNotFound");
    }

    // Return the best matching candidate
    return data.results[0];
  } catch (err: any) {
    if (err.message === "CityNotFound" || err.message === "EmptyInput" || err.message === "NetworkError") {
      throw err;
    }
    throw new Error("NetworkError");
  }
}

/**
 * Fetches comprehensive meteorological indicators for specified coordinates.
 */
export async function fetchWeather(city: string): Promise<CompleteWeatherReport> {
  // First, retrieve the location coordinates
  const location = await getCoordinates(city);
  const { latitude, longitude, name, country, admin1 } = location;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("NetworkError");
    }

    const data = await response.json();

    const currentData = data.current;
    if (!currentData) {
      throw new Error("MalformedResponse");
    }

    const currentReport = {
      temperature: currentData.temperature_2m,
      apparentTemperature: currentData.apparent_temperature,
      humidity: currentData.relative_humidity_2m,
      windSpeed: currentData.wind_speed_10m,
      windDirection: currentData.wind_direction_10m,
      isDay: currentData.is_day === 1,
      weatherCode: currentData.weather_code,
      cloudCover: currentData.cloud_cover,
    };

    // Parse daily forecast entries (limit to 7 days)
    const dailyReport = [];
    const dailyDates = data.daily.time || [];
    const dailyCodes = data.daily.weather_code || [];
    const dailyMaxes = data.daily.temperature_2m_max || [];
    const dailyMines = data.daily.temperature_2m_min || [];

    for (let i = 0; i < Math.min(dailyDates.length, 7); i++) {
      const code = dailyCodes[i] ?? 0;
      const condition = getWeatherCondition(code, true);
      dailyReport.push({
        date: dailyDates[i],
        tempMin: dailyMines[i] ?? 0,
        tempMax: dailyMaxes[i] ?? 0,
        weatherCode: code,
        conditionText: condition.text,
        iconName: condition.iconName,
      });
    }

    // Parse hourly items (filter to the next 12 hours)
    const hourlyReport = [];
    const hourlyTimes = data.hourly.time || [];
    const hourlyTemps = data.hourly.temperature_2m || [];
    const hourlyCodes = data.hourly.weather_code || [];

    // Find the closest hourly index matching now
    const nowISOString = new Date().toISOString();
    let startIndex = 0;
    for (let i = 0; i < hourlyTimes.length; i++) {
      if (new Date(hourlyTimes[i]).getTime() >= Date.now() - 3600000) {
        startIndex = i;
        break;
      }
    }

    for (let i = startIndex; i < Math.min(startIndex + 12, hourlyTimes.length); i++) {
      const code = hourlyCodes[i] ?? 0;
      const condition = getWeatherCondition(code, true); // default isDay = true for simple icons
      hourlyReport.push({
        time: hourlyTimes[i],
        temp: hourlyTemps[i] ?? 0,
        weatherCode: code,
        iconName: condition.iconName,
      });
    }

    // Format sunrise/sunset cleanly
    const sunriseStr = data.daily.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
    const sunsetStr = data.daily.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

    return {
      city: name,
      country: country || "",
      region: admin1 || "",
      latitude,
      longitude,
      current: currentReport,
      daily: dailyReport,
      hourly: hourlyReport,
      sunrise: sunriseStr,
      sunset: sunsetStr,
    };
  } catch (err) {
    throw new Error("NetworkError");
  }
}
