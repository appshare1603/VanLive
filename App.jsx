import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Battery, 
  RefreshCw, 
  Clock, 
  Cloud, 
  Waves, 
  AlertTriangle, 
  Sun, 
  CloudRain, 
  Navigation,
  ExternalLink,
  Zap,
  Compass
} from 'lucide-react';

/**
 * Van-Dashboard Simulation
 * Diese Ansicht simuliert die Datenabfrage von einem ESP32-Sensor-Node.
 * Neu: Neigungssensor (Leveling) für die perfekte Ausrichtung des Vans.
 */

const VanDashboard = () => {
  const [data, setData] = useState({
    tempIn: "--",
    tempOut: "--",
    humidity: "--",
    batteryBoard: "--",
    batteryStart: "--",
    waterLevel: 0,
    gasValue: 0,
    pitch: 0, // Neigung vorne/hinten
    roll: 0,  // Neigung links/rechts
    weather: {
      condition: "Sonnig",
      temp: "--",
      forecast: "Heiter bis wolkig"
    },
    lastUpdate: "Warte auf Daten..."
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = {
        tempIn: (19 + Math.random() * 5).toFixed(1),
        tempOut: (4 + Math.random() * 8).toFixed(1),
        humidity: (35 + Math.random() * 20).toFixed(0),
        batteryBoard: (12.6 + Math.random() * 0.6).toFixed(1),
        batteryStart: (12.2 + Math.random() * 0.4).toFixed(1),
        waterLevel: Math.floor(35 + Math.random() * 40),
        gasValue: Math.floor(Math.random() * 450),
        pitch: (Math.random() * 4 - 2).toFixed(1), // -2° bis +2°
        roll: (Math.random() * 6 - 3).toFixed(1),  // -3° bis +3°
        weather: {
          condition: Math.random() > 0.7 ? "Regen" : (Math.random() > 0.4 ? "Bewölkt" : "Sonnig"),
          temp: (5 + Math.random() * 10).toFixed(0),
          forecast: "In 3h leichter Regen erwartet"
        },
        lastUpdate: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setData(mockData);
    } catch (err) {
      setError("Datenabruf fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const isGasAlarm = parseInt(data.gasValue) > 350;
  const isStartBatteryLow = parseFloat(data.batteryStart) < 11.8;
  const isUnlevel = Math.abs(data.pitch) > 1.5 || Math.abs(data.roll) > 1.5;

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Regen": return <CloudRain className="w-6 h-6 text-blue-400" />;
      case "Bewölkt": return <Cloud className="w-6 h-6 text-slate-400" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent text-left">
            Van-Zentrale
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider font-semibold">ESP32 Hybrid-System Aktiv</p>
          </div>
        </div>
        
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700 shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-sm text-white">Update</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Wetter Forecast */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-blue-400/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                {getWeatherIcon(data.weather.condition)}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Navigation className="w-3 h-3" /> Cloud Forecast
              </div>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold italic">Vorhersage</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tighter">{data.weather.temp}</span>
              <span className="text-xl text-slate-500 font-light">°C</span>
              <span className="ml-2 text-sm text-slate-400 font-medium">{data.weather.condition}</span>
            </div>
            <p className="mt-4 text-xs text-slate-500 italic border-t border-slate-800 pt-3 text-left">
              {data.weather.forecast}
            </p>
          </div>

          {/* 2. Neigungssensor (Leveling) */}
          <div className={`bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl transition-all group ${isUnlevel ? 'border-purple-500/40' : 'border-slate-800 hover:border-purple-400/30'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Compass className={`w-6 h-6 text-purple-400 ${isUnlevel ? 'animate-pulse' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IMU Sensor</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Ausrichtung</h2>
            <div className="flex gap-6 mt-2">
              <div className="text-left">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Pitch (Längs)</p>
                <p className="text-3xl font-bold">{data.pitch}°</p>
              </div>
              <div className="text-left border-l border-slate-800 pl-6">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Roll (Quer)</p>
                <p className="text-3xl font-bold">{data.roll}°</p>
              </div>
            </div>
            {/* Kleine visuelle Libelle */}
            <div className="mt-4 h-8 bg-slate-950/50 rounded-full relative flex items-center justify-center border border-slate-800 overflow-hidden">
               <div className="absolute w-4 h-4 bg-purple-500/30 rounded-full blur-sm" />
               <div 
                 className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_purple] transition-all duration-500 ease-out"
                 style={{ 
                   transform: `translate(${data.roll * 8}px, ${data.pitch * 4}px)` 
                 }}
               />
               <div className="w-0.5 h-full bg-slate-800 absolute left-1/2 -translate-x-1/2" />
               <div className="h-0.5 w-full bg-slate-800 absolute top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 3. Innentemperatur */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-orange-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform text-left">
                <Thermometer className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Sensor INT</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Innenraum</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className="text-5xl font-bold tracking-tighter text-orange-100">{data.tempIn}</span>
              <span className="text-xl text-slate-500 font-light">°C</span>
            </div>
          </div>

          {/* 4. Außentemperatur */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-blue-300/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-300/10 rounded-xl group-hover:scale-110 transition-transform text-left">
                <Thermometer className="w-6 h-6 text-blue-300" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sensor EXT</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Außen (Lokal)</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className="text-5xl font-bold tracking-tighter text-blue-100">{data.tempOut}</span>
              <span className="text-xl text-slate-500 font-light">°C</span>
            </div>
          </div>

          {/* 5. Bordbatterie */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-emerald-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4 text-left">
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Battery className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wohnraum</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Bordbatterie</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className="text-5xl font-bold tracking-tighter text-emerald-100">{data.batteryBoard}</span>
              <span className="text-xl text-slate-500 font-light">V</span>
            </div>
          </div>

          {/* 6. Starterbatterie */}
          <div className={`bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl transition-all group ${isStartBatteryLow ? 'border-amber-500/50 hover:border-amber-500' : 'border-slate-800 hover:border-yellow-500/30'}`}>
            <div className="flex justify-between items-start mb-4 text-left">
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${isStartBatteryLow ? 'bg-amber-500/20' : 'bg-yellow-500/10'}`}>
                <Zap className={`w-6 h-6 ${isStartBatteryLow ? 'text-amber-500 animate-pulse' : 'text-yellow-500'}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-bold">Motor</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Starterbatterie</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className={`text-5xl font-bold tracking-tighter ${isStartBatteryLow ? 'text-amber-500' : 'text-yellow-100'}`}>{data.batteryStart}</span>
              <span className="text-xl text-slate-500 font-light">V</span>
            </div>
          </div>

          {/* 7. Frischwasser */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-blue-500/30 transition-colors group relative overflow-hidden text-left">
            <div className="relative z-10 text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-bold">Vorrat</span>
              </div>
              <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Frischwasser</h2>
              <div className="flex items-baseline gap-2 text-left">
                <span className="text-5xl font-bold tracking-tighter text-blue-100">{data.waterLevel}</span>
                <span className="text-xl text-slate-500 font-light">%</span>
              </div>
              <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${data.waterLevel}%` }} />
              </div>
            </div>
          </div>

          {/* 8. Gaswarnung */}
          <div className={`backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl transition-all duration-500 group ${isGasAlarm ? 'bg-red-500/20 border-red-500' : 'bg-slate-900/50 border-slate-800 hover:border-red-400/30'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${isGasAlarm ? 'bg-red-500 animate-bounce' : 'bg-slate-800'}`}>
                <AlertTriangle className={`w-6 h-6 ${isGasAlarm ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-bold">Sicherheit</span>
            </div>
            <h2 className={`${isGasAlarm ? 'text-red-400 font-bold' : 'text-slate-400'} text-sm font-medium mb-1 text-left font-semibold`}>Gassensor</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className={`text-5xl font-bold tracking-tighter ${isGasAlarm ? 'text-red-500' : 'text-slate-100'}`}>{data.gasValue}</span>
              <span className="text-xl text-slate-500 font-light">ppm</span>
            </div>
          </div>

          {/* 9. Feuchtigkeit */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl hover:border-cyan-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:scale-110 transition-transform text-left">
                <Droplets className="w-6 h-6 text-cyan-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-bold">Klima</span>
            </div>
            <h2 className="text-slate-400 text-sm font-medium mb-1 text-left font-semibold">Rel. Feuchte</h2>
            <div className="flex items-baseline gap-2 text-left">
              <span className="text-5xl font-bold tracking-tighter text-cyan-100">{data.humidity}</span>
              <span className="text-xl text-slate-500 font-light">%</span>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 px-4 border-t border-slate-800 pt-8">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-tight tracking-tighter text-slate-400">Letztes Update: {data.lastUpdate}</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
             <span>Hardware: ESP32-VAN-NODE</span>
             <span className="text-emerald-500/50 flex items-center gap-1 font-bold italic"><ExternalLink className="w-3 h-3"/> System OK</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App = () => <VanDashboard />;