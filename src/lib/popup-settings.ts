import fs from 'fs'
import path from 'path'

export interface PopupSettings {
  enabled: boolean
  whatsappNumber: string
  names: string[]
  cities: string[]
}

export const DEFAULT_POPUP_SETTINGS: PopupSettings = {
  enabled: true,
  whatsappNumber: '923247277489',
  names: [
    'Ahmed', 'Bilal', 'Usman', 'Fatima', 'Ayesha', 'Zainab',
    'Hamza', 'Ali', 'Hassan', 'Umar', 'Sana', 'Maryam', 'Junaid', 'Kashif',
  ],
  cities: [
    'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan',
    'Peshawar', 'Sialkot', 'Rawalpindi', 'Quetta', 'Gujranwala',
  ],
}

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'popup-settings.json')

export function readPopupSettings(): PopupSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return DEFAULT_POPUP_SETTINGS
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))
    return {
      enabled: raw.enabled !== false,
      whatsappNumber: (raw.whatsappNumber as string) || DEFAULT_POPUP_SETTINGS.whatsappNumber,
      names: Array.isArray(raw.names) && raw.names.length ? raw.names : DEFAULT_POPUP_SETTINGS.names,
      cities: Array.isArray(raw.cities) && raw.cities.length ? raw.cities : DEFAULT_POPUP_SETTINGS.cities,
    }
  } catch {
    return DEFAULT_POPUP_SETTINGS
  }
}

export function writePopupSettings(settings: PopupSettings): { ok: boolean; error?: string } {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
