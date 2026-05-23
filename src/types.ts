/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  country?: string;
}

export interface WeatherCondition {
  text: string;
  iconName: string; // Map to dynamic Lucide icons
  bgGradient: string; // Tailwind gradient classes
  mainColor: string; // Accent color hex or Tailwind class
}

export interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
  weatherCode: number;
  cloudCover: number;
}

export interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  conditionText: string;
  iconName: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  weatherCode: number;
  iconName: string;
}

export interface CompleteWeatherReport {
  city: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  current: CurrentWeatherData;
  daily: ForecastDay[];
  hourly: HourlyForecast[];
  sunrise: string;
  sunset: string;
}
