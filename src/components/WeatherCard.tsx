import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Moon, RefreshCw, MapPin } from 'lucide-react';
import { AppTheme } from '../types';

interface WeatherCardProps {
  theme: AppTheme;
}

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  isNight: boolean;
  code: number;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ theme }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 24,
    condition: 'Pleasant Atmosphere',
    location: 'Current Telemetry',
    isNight: false,
    code: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`
              );
              if (res.ok) {
                const data = await res.json();
                const temp = Math.round(data.current.temperature_2m);
                const code = data.current.weather_code;
                const isDay = data.current.is_day === 1;

                let condition = 'Clear Sky';
                if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
                else if (code >= 51 && code <= 67) condition = 'Rain Showers';
                else if (code >= 95) condition = 'Thunderstorms';
                else if (code >= 71) condition = 'Snow / Flurries';

                setWeather({
                  temp,
                  condition,
                  location: 'Local Region',
                  isNight: !isDay,
                  code,
                });
              }
            } catch (err) {
              console.warn('Weather fetch error:', err);
            } finally {
              setLoading(false);
            }
          },
          () => {
            // Geolocation denied or unavailable
            setWeather((prev) => ({
              ...prev,
              temp: 26,
              condition: 'Clear Sky • Ambient 26°C',
              location: 'Simulated Station',
            }));
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const isDark = theme === 'dark' || theme === 'red' || theme === 'sunset';

  const getWeatherIcon = () => {
    if (weather.code >= 95) return <CloudLightning className="w-7 h-7 text-amber-400" />;
    if (weather.code >= 51) return <CloudRain className="w-7 h-7 text-sky-400" />;
    if (weather.code >= 1 && weather.code <= 3) return <Cloud className="w-7 h-7 text-slate-300" />;
    if (weather.isNight) return <Moon className="w-7 h-7 text-indigo-300" />;
    return <Sun className="w-7 h-7 text-amber-400 animate-spin-slow" />;
  };

  return (
    <div
      onClick={fetchWeather}
      className={`w-full p-4 rounded-2xl flex items-center justify-between cursor-pointer border backdrop-blur-xl transition-all duration-300 active:scale-[0.98] ${
        theme === 'sunset'
          ? 'bg-orange-950/20 border-orange-500/25 hover:border-orange-500/40 text-orange-100 shadow-lg shadow-orange-950/20'
          : theme === 'red'
          ? 'bg-rose-950/20 border-rose-500/25 hover:border-rose-500/40 text-rose-100 shadow-lg shadow-rose-950/20'
          : theme === 'light'
          ? 'bg-white/80 border-slate-200 hover:border-blue-300 text-slate-800 shadow-md shadow-blue-900/5'
          : 'bg-slate-900/40 border-cyan-500/25 hover:border-cyan-500/40 text-cyan-50 shadow-lg shadow-black/40'
      }`}
      title="Tap to refresh live atmospheric barometrics"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl font-extrabold tracking-tight font-mono">
          {weather.temp}°C
        </span>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            <span>{weather.condition}</span>
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{weather.location} • Tap to refresh</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10">
        {getWeatherIcon()}
      </div>
    </div>
  );
};
