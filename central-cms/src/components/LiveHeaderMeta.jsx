"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  RotateCw,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import ShimmerBadge from "./ShimmerBadge";

// Helper to decode WMO Weather Codes to text & icon
function getWeatherMeta(code, isDay = 1) {
  if (code === 0) {
    return {
      text: isDay ? "Clear Sky" : "Clear Night",
      Icon: isDay ? Sun : Moon,
      color: isDay ? "text-amber-400" : "text-indigo-300",
    };
  }
  if (code === 1 || code === 2) {
    return {
      text: isDay ? "Partly Cloudy" : "Cloudy Night",
      Icon: isDay ? CloudSun : CloudMoon,
      color: "text-amber-300",
    };
  }
  if (code === 3) {
    return {
      text: "Overcast",
      Icon: Cloud,
      color: "text-slate-300",
    };
  }
  if (code === 45 || code === 48) {
    return {
      text: "Foggy",
      Icon: CloudFog,
      color: "text-slate-400",
    };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      text: "Rain Showers",
      Icon: CloudRain,
      color: "text-sky-400",
    };
  }
  if ([95, 96, 99].includes(code)) {
    return {
      text: "Thunderstorm",
      Icon: CloudLightning,
      color: "text-amber-400",
    };
  }
  return {
    text: "Clear",
    Icon: isDay ? CloudSun : CloudMoon,
    color: "text-amber-300",
  };
}

const LiveHeaderMeta = memo(function LiveHeaderMeta() {
  const [dayName, setDayName] = useState("");
  const [dateFormatted, setDateFormatted] = useState("");
  const [timeFormatted, setTimeFormatted] = useState("");

  // Live Weather state
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Live Syncing",
    code: 1,
    isDay: 1,
    humidity: 65,
    location: "Dhaka",
    lastUpdated: null,
  });
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Clock timer
  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const updateTime = () => {
      const now = new Date();
      setDayName(days[now.getDay()]);
      setDateFormatted(`${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`);
      setTimeFormatted(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live Weather from Open-Meteo
  const fetchWeather = useCallback(async (manual = false) => {
    if (manual) setWeatherLoading(true);
    try {
      // Default coordinates for Dhaka, Bangladesh
      const lat = 23.8103;
      const lon = 90.4125;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=Asia%2FDhaka`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        if (current) {
          const tempVal = Math.round(current.temperature_2m);
          const meta = getWeatherMeta(current.weather_code, current.is_day);

          const weatherObj = {
            temp: tempVal,
            condition: meta.text,
            code: current.weather_code,
            isDay: current.is_day,
            humidity: current.relative_humidity_2m,
            location: "Dhaka",
            lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          };

          setWeather(weatherObj);
          try {
            localStorage.setItem("cms_live_weather_v2", JSON.stringify(weatherObj));
          } catch (e) {}
        }
      }
    } catch (e) {
      // Keep existing cached weather if offline
    } finally {
      if (manual) {
        setTimeout(() => setWeatherLoading(false), 500);
      }
    }
  }, []);

  // Initialize weather & set recurring 10-minute auto-update
  useEffect(() => {
    // 1. Try restoring cached weather immediately
    try {
      const saved = localStorage.getItem("cms_live_weather_v2");
      if (saved) {
        setWeather(JSON.parse(saved));
      }
    } catch (e) {}

    // 2. Fetch fresh weather
    fetchWeather(false);

    // 3. Regular update system: auto-refresh every 10 minutes (600,000 ms)
    const weatherTimer = setInterval(() => {
      fetchWeather(false);
    }, 10 * 60 * 1000);

    return () => clearInterval(weatherTimer);
  }, [fetchWeather]);

  const weatherMeta = getWeatherMeta(weather.code, weather.isDay);
  const WeatherIcon = weatherMeta.Icon;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs font-mono">
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <AnimatedLogo size={22} showText={false} />
      </div>

      {/* Date & Live Clock Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111622] border border-[#1E2638] text-slate-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-emerald-400 font-semibold">{dayName || "Today"}</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300">{dateFormatted || "Live"}</span>
        {timeFormatted && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-teal-300 font-bold tracking-wider">{timeFormatted}</span>
          </>
        )}
      </div>

      {/* Live Regular Updating Weather Pill */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111622] border border-[#1E2638] text-amber-300 shadow-sm transition hover:border-amber-500/30 group select-none"
        title={`Live Weather (${weather.location}): ${weather.temp}°C, ${weather.condition}. Humidity: ${weather.humidity}%. Click to refresh.`}
      >
        <WeatherIcon className={`w-3.5 h-3.5 ${weatherMeta.color} shrink-0 animate-pulse`} />
        <span className="font-bold text-white">{weather.temp}°C</span>
        <span className="text-slate-400 text-[11px] hidden sm:inline">({weather.condition})</span>

        {/* Live Auto-Update Indicator / Refresh Button */}
        <button
          type="button"
          onClick={() => fetchWeather(true)}
          disabled={weatherLoading}
          className="text-slate-500 hover:text-amber-400 p-0.5 rounded transition cursor-pointer"
          title="Refresh live weather now"
        >
          <RotateCw className={`w-3 h-3 ${weatherLoading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      <ShimmerBadge variant="emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
        <span>Live Sync Active</span>
      </ShimmerBadge>
    </div>
  );
});

export default LiveHeaderMeta;
