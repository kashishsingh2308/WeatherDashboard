/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherCondition } from "../types";

export function getWeatherCondition(code: number, isDay: boolean): WeatherCondition {
  switch (code) {
    // Clear Sky
    case 0:
      return {
        text: "Clear Sky",
        iconName: isDay ? "Sun" : "Moon",
        bgGradient: isDay
          ? "from-amber-50 to-orange-100 dark:from-sky-950 dark:to-orange-950/20"
          : "from-slate-900 to-indigo-950",
        mainColor: "text-amber-500",
      };

    // Mainly Clear, Partly Cloudy, Overcast
    case 1:
      return {
        text: "Mainly Clear",
        iconName: isDay ? "CloudSun" : "CloudMoon",
        bgGradient: isDay
          ? "from-blue-50 to-amber-50 dark:from-slate-900 dark:to-slate-800"
          : "from-slate-900 to-slate-950",
        mainColor: "text-blue-400",
      };
    case 2:
      return {
        text: "Partly Cloudy",
        iconName: isDay ? "CloudSun" : "CloudMoon",
        bgGradient: "from-slate-50 to-blue-100 dark:from-slate-900 dark:to-slate-800",
        mainColor: "text-blue-400",
      };
    case 3:
      return {
        text: "Overcast",
        iconName: "Cloud",
        bgGradient: "from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800",
        mainColor: "text-slate-400",
      };

    // Fog and depositing rime fog
    case 45:
    case 48:
      return {
        text: "Foggy",
        iconName: "CloudFog",
        bgGradient: "from-slate-100 to-zinc-200 dark:from-zinc-900 dark:to-slate-950",
        mainColor: "text-zinc-400",
      };

    // Drizzle
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        text: "Drizzle",
        iconName: "CloudDrizzle",
        bgGradient: "from-sky-50 to-slate-100 dark:from-slate-900 dark:to-sky-950/20",
        mainColor: "text-sky-400",
      };

    // Rain
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        text: "Rainy",
        iconName: "CloudRain",
        bgGradient: "from-blue-150 to-sky-200 dark:from-slate-900 dark:to-blue-950/30",
        mainColor: "text-blue-500",
      };

    // Freezing Rain
    case 66:
    case 67:
      return {
        text: "Freezing Rain",
        iconName: "CloudSnow",
        bgGradient: "from-sky-100 to-cyan-100 dark:from-slate-900 dark:to-cyan-950/20",
        mainColor: "text-cyan-400",
      };

    // Snow fall
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        text: "Snowy",
        iconName: "Snowflake",
        bgGradient: "from-slate-50 to-sky-50 dark:from-slate-900 dark:to-indigo-950/20",
        mainColor: "text-sky-300",
      };

    // Thunderstorm
    case 95:
    case 96:
    case 99:
      return {
        text: "Thunderstorm",
        iconName: "CloudLightning",
        bgGradient: "from-slate-800 to-zinc-900 dark:from-zinc-950 dark:to-black",
        mainColor: "text-yellow-400",
      };

    default:
      return {
        text: "Unknown",
        iconName: "HelpCircle",
        bgGradient: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
        mainColor: "text-slate-400",
      };
  }
}
