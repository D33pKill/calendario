// Cliente simple para Open-Meteo (sin API key) fijo en Cerro Navia, Santiago (Los Urales 2163 aprox.)

export interface CurrentWeather {
  temperature: number; // °C
  windSpeed: number; // km/h
  windGusts: number; // km/h
  precipitation: number; // mm
  relativeHumidity: number; // %
  weatherCode: number;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  tempMax: number;
  tempMin: number;
  precipitationSum: number; // mm
  precipitationProbMax: number; // %
  windMax: number; // km/h
  uvIndexMax: number; // index
}

export interface WeatherData {
  current: CurrentWeather | null;
  daily: DailyForecast[];
  fetchedAt: number;
}

// Cerro Navia (aprox): lat -33.4167, lon -70.75, timezone America/Santiago
const LAT = -33.4167;
const LON = -70.75;
const TIMEZONE = 'America/Santiago';

export async function fetchWeatherData(): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current: ['temperature_2m', 'wind_speed_10m', 'wind_gusts_10m', 'precipitation', 'relative_humidity_2m', 'weather_code'].join(','),
    daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'precipitation_probability_max', 'wind_speed_10m_max', 'uv_index_max'].join(','),
    forecast_days: '7',
    timezone: TIMEZONE
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo obtener clima');
  const json = await res.json();

  const current: CurrentWeather | null = json.current ? {
    temperature: json.current.temperature_2m ?? null,
    windSpeed: json.current.wind_speed_10m ?? null,
    windGusts: json.current.wind_gusts_10m ?? null,
    precipitation: json.current.precipitation ?? null,
    relativeHumidity: json.current.relative_humidity_2m ?? null,
    weatherCode: json.current.weather_code ?? null
  } : null;

  const daily: DailyForecast[] = (json.daily?.time || []).map((date: string, i: number) => ({
    date,
    tempMax: json.daily.temperature_2m_max?.[i] ?? null,
    tempMin: json.daily.temperature_2m_min?.[i] ?? null,
    precipitationSum: json.daily.precipitation_sum?.[i] ?? 0,
    precipitationProbMax: json.daily.precipitation_probability_max?.[i] ?? 0,
    windMax: json.daily.wind_speed_10m_max?.[i] ?? 0,
    uvIndexMax: json.daily.uv_index_max?.[i] ?? 0
  }));

  return { current, daily, fetchedAt: Date.now() };
}

export function buildWeatherAdvice(forecast: DailyForecast[]): string[] {
  const msgs: string[] = [];
  const next5 = forecast.slice(0, 5);
  const heavyRain = next5.some(d => d.precipitationProbMax >= 60 || d.precipitationSum >= 5);
  const strongWind = next5.some(d => d.windMax >= 40);
  const heatWave = next5.some(d => d.tempMax >= 30);

  if (heavyRain) msgs.push('Lluvias probables: resguardar macetas y revisar drenaje.');
  if (strongWind) msgs.push('Vientos fuertes: asegurar tutores y buscar abrigo contra ráfagas.');
  if (heatWave) msgs.push('Altas temperaturas: regar temprano (06:30–08:00) o al atardecer (19:30–21:00).');
  if (msgs.length === 0) msgs.push('Sin riesgos relevantes próximos. Mantener riego regular.');
  return msgs;
}


