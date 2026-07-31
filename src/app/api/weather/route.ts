// Real weather API for Gram Panchayat Chandra
// Uses Open-Meteo (free, no API key) for live + forecast + historical data
// Chandra village, Shankargarh, Prayagraj: 25.18°N, 81.95°E

import { NextResponse } from 'next/server'

const LAT = 25.18
const LON = 81.95
const TIMEZONE = 'Asia/Kolkata'

// WMO weather code → bilingual condition + icon
const WMO_CODES: Record<number, { hi: string; en: string; icon: 'sun' | 'cloud' | 'cloud-rain' | 'fog' | 'snow' }> = {
  0: { hi: 'साफ आसमान', en: 'Clear sky', icon: 'sun' },
  1: { hi: 'मुख्यतः साफ', en: 'Mainly clear', icon: 'sun' },
  2: { hi: 'आंशिक बादल', en: 'Partly cloudy', icon: 'cloud' },
  3: { hi: 'बादलयुक्त', en: 'Overcast', icon: 'cloud' },
  45: { hi: 'कोहरा', en: 'Fog', icon: 'fog' },
  48: { hi: 'घना कोहरा', en: 'Rime fog', icon: 'fog' },
  51: { hi: 'हल्की बूंदाबांदी', en: 'Light drizzle', icon: 'cloud-rain' },
  53: { hi: 'बूंदाबांदी', en: 'Moderate drizzle', icon: 'cloud-rain' },
  55: { hi: 'तेज बूंदाबांदी', en: 'Dense drizzle', icon: 'cloud-rain' },
  56: { hi: 'हिमी बूंदाबांदी', en: 'Freezing drizzle', icon: 'cloud-rain' },
  57: { hi: 'तेज हिमी बूंदाबांदी', en: 'Dense freezing drizzle', icon: 'cloud-rain' },
  61: { hi: 'हल्की बारिश', en: 'Slight rain', icon: 'cloud-rain' },
  63: { hi: 'बारिश', en: 'Moderate rain', icon: 'cloud-rain' },
  65: { hi: 'तेज बारिश', en: 'Heavy rain', icon: 'cloud-rain' },
  66: { hi: 'हिमी बारिश', en: 'Freezing rain', icon: 'cloud-rain' },
  67: { hi: 'तेज हिमी बारिश', en: 'Heavy freezing rain', icon: 'cloud-rain' },
  71: { hi: 'हल्की बर्फबारी', en: 'Slight snow', icon: 'snow' },
  73: { hi: 'बर्फबारी', en: 'Moderate snow', icon: 'snow' },
  75: { hi: 'तेज बर्फबारी', en: 'Heavy snow', icon: 'snow' },
  77: { hi: 'बर्फ के कण', en: 'Snow grains', icon: 'snow' },
  80: { hi: 'हल्की बौछारें', en: 'Slight showers', icon: 'cloud-rain' },
  81: { hi: 'बौछारें', en: 'Moderate showers', icon: 'cloud-rain' },
  82: { hi: 'तेज बौछारें', en: 'Violent showers', icon: 'cloud-rain' },
  85: { hi: 'हल्की हिम बौछारें', en: 'Slight snow showers', icon: 'snow' },
  86: { hi: 'तेज हिम बौछारें', en: 'Heavy snow showers', icon: 'snow' },
  95: { hi: 'गरज के साथ बारिश', en: 'Thunderstorm', icon: 'cloud-rain' },
  96: { hi: 'गरज ओलावृष्टि', en: 'Thunderstorm + slight hail', icon: 'cloud-rain' },
  99: { hi: 'तेज गरज ओलावृष्टि', en: 'Thunderstorm + heavy hail', icon: 'cloud-rain' },
}

function uvLabel(uv: number): { hi: string; en: string } {
  if (uv < 3) return { hi: 'निम्न', en: 'Low' }
  if (uv < 6) return { hi: 'मध्यम', en: 'Moderate' }
  if (uv < 8) return { hi: 'उच्च', en: 'High' }
  if (uv < 11) return { hi: 'बहुत उच्च', en: 'Very High' }
  return { hi: 'अत्यधिक', en: 'Extreme' }
}

function windDirLabel(deg: number): { hi: string; en: string } {
  const dirs = [
    { hi: 'उत्तर', en: 'N' }, { hi: 'उत्तर-पूर्व', en: 'NE' },
    { hi: 'पूर्व', en: 'E' }, { hi: 'दक्षिण-पूर्व', en: 'SE' },
    { hi: 'दक्षिण', en: 'S' }, { hi: 'दक्षिण-पश्चिम', en: 'SW' },
    { hi: 'पश्चिम', en: 'W' }, { hi: 'उत्तर-पश्चिम', en: 'NW' },
  ]
  return dirs[Math.round(deg / 45) % 8]
}

const HI_DAYS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HI_MONTHS = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function GET() {
  try {
    // 1. Current weather + 7-day forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset` +
      `&timezone=${TIMEZONE}&forecast_days=7`

    // 2. Historical precipitation (last 30 days) for "when did it last rain" + dry spell
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}` +
      `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
      `&daily=precipitation_sum,temperature_2m_max,temperature_2m_min` +
      `&timezone=${TIMEZONE}`

    const [forecastRes, archiveRes] = await Promise.all([
      fetch(forecastUrl, { next: { revalidate: 1800 } }), // cache 30 min
      fetch(archiveUrl, { next: { revalidate: 3600 } }),  // cache 1 hour
    ])

    if (!forecastRes.ok) throw new Error(`forecast API ${forecastRes.status}`)
    const forecast = await forecastRes.json()

    // Archive may occasionally fail; degrade gracefully
    let archive: any = null
    if (archiveRes.ok) archive = await archiveRes.json()

    // ─── Build current weather ───
    const c = forecast.current
    const wmo = WMO_CODES[c.weather_code] || WMO_CODES[0]
    const uv = uvLabel(c.uv_index ?? 0)
    const wind = windDirLabel(c.wind_direction_10m ?? 0)
    const now = new Date(c.time)
    const updatedHi = `${HI_DAYS[now.getDay()]}, ${now.getDate()} ${HI_MONTHS[now.getMonth()]} ${now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    const updatedEn = `${EN_DAYS[now.getDay()]}, ${now.getDate()} ${EN_MONTHS[now.getMonth()]} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`

    // ─── Build 7-day forecast ───
    const daily = forecast.daily
    const forecast_days = daily.time.map((t: string, i: number) => {
      const d = new Date(t)
      const isToday = i === 0
      return {
        date: t,
        dayHi: isToday ? 'आज' : HI_DAYS[d.getDay()],
        dayEn: isToday ? 'Today' : EN_DAYS[d.getDay()],
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
        icon: (WMO_CODES[daily.weather_code[i]] || WMO_CODES[0]).icon,
        conditionHi: (WMO_CODES[daily.weather_code[i]] || WMO_CODES[0]).hi,
        conditionEn: (WMO_CODES[daily.weather_code[i]] || WMO_CODES[0]).en,
        rainMm: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
        rainProb: daily.precipitation_probability_max?.[i] ?? 0,
      }
    })

    // ─── Build rainfall history + dry spell ───
    let rainfall30d: { date: string; mm: number }[] = []
    let totalRain30d = 0
    let lastRainDate: string | null = null
    let drySpellDays = 0
    let monthlyTotals: { month: string; mm: number }[] = []

    if (archive?.daily) {
      const aTimes: string[] = archive.daily.time
      const aRain: number[] = archive.daily.precipitation_sum
      rainfall30d = aTimes.map((t, i) => ({ date: t, mm: Math.round((aRain[i] || 0) * 10) / 10 }))
      totalRain30d = Math.round(aRain.reduce((s: number, r: number) => s + (r || 0), 0) * 10) / 10

      // Find last rain day (counting from most recent backwards)
      for (let i = aTimes.length - 1; i >= 0; i--) {
        if ((aRain[i] || 0) > 0.1) { lastRainDate = aTimes[i]; break }
      }
      // Dry spell = days since last rain (counting today)
      if (lastRainDate) {
        const last = new Date(lastRainDate)
        const today = new Date()
        drySpellDays = Math.max(0, Math.round((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)))
      }

      // Monthly totals (group by YYYY-MM)
      const monthMap: Record<string, number> = {}
      aTimes.forEach((t, i) => {
        const m = t.slice(0, 7) // YYYY-MM
        monthMap[m] = (monthMap[m] || 0) + (aRain[i] || 0)
      })
      monthlyTotals = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, mm]) => ({ month: m, mm: Math.round(mm * 10) / 10 }))
    }

    // ─── Build response ───
    return NextResponse.json({
      current: {
        tempC: Math.round(c.temperature_2m * 10) / 10,
        feelsLikeC: Math.round(c.apparent_temperature * 10) / 10,
        humidityPct: c.relative_humidity_2m,
        windKmh: Math.round(c.wind_speed_10m * 10) / 10,
        windDirDeg: c.wind_direction_10m,
        windDirEn: wind.en,
        windDirHi: wind.hi,
        uvIndex: Math.round((c.uv_index ?? 0) * 10) / 10,
        uvLabelHi: uv.hi,
        uvLabelEn: uv.en,
        conditionHi: wmo.hi,
        conditionEn: wmo.en,
        icon: wmo.icon,
        isDay: c.is_day === 1,
        time: c.time,
        updatedHi,
        updatedEn,
        locationEn: 'Chandra, Shankargarh, Prayagraj',
        locationHi: 'चंद्रा, शंकरगढ़, प्रयागराज',
        coords: { lat: LAT, lon: LON },
        source: 'Open-Meteo',
      },
      forecast: forecast_days,
      rainfall: {
        history30d: rainfall30d,
        total30d: totalRain30d,
        lastRainDate,
        drySpellDays,
        monthlyTotals,
        source: 'Open-Meteo Archive',
      },
      sunrise: daily.sunrise?.[0] || null,
      sunset: daily.sunset?.[0] || null,
      generatedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[api/weather] error:', e)
    return NextResponse.json(
      { error: 'weather_fetch_failed', message: (e as Error).message },
      { status: 502 },
    )
  }
}
