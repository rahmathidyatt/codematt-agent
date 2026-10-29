export type PhotoDirectiveType =
  | "remove_house_number"
  | "remove_license_plate"
  | "remove_phone_banner"
  | "remove_wires"
  | "custom";

export type RedactionPatchMethod = "inpaint" | "blur" | "pixelate" | "color_fill";

export interface TargetRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppliedDirective {
  id: string;
  type: PhotoDirectiveType;
  label: string;
  method: RedactionPatchMethod;
  region: TargetRegion;
  instruction: string;
  timestamp: string;
}

export interface PresetDirectiveTemplate {
  id: string;
  type: PhotoDirectiveType;
  title: string;
  description: string;
  defaultMethod: RedactionPatchMethod;
  badge: string;
  suggestedInstruction: string;
}

export const PRESET_DIRECTIVES: PresetDirectiveTemplate[] = [
  {
    id: "dir-house-num",
    type: "remove_house_number",
    title: "Sensor / Hapus Nomor Rumah",
    description: "Hapus plat nomor rumah di pilar pagar atau tembok depan untuk privasi pemilik tanpa mengubah arsitektur bangunan.",
    defaultMethod: "inpaint",
    badge: "Privasi Utama",
    suggestedInstruction: "Hapus nomor rumah pada pilar/dinding pagar dan ratakan tekstur dinding di sekitarnya.",
  },
  {
    id: "dir-license-plate",
    type: "remove_license_plate",
    title: "Sensor Plat Nomor Kendaraan",
    description: "Samarkan atau hilangkan plat nomor mobil/motor yang terparkir di carport atau depan gerbang properti.",
    defaultMethod: "blur",
    badge: "Sensor Plat Mobil",
    suggestedInstruction: "Sensor plat nomor polisi kendaraan di area carport dengan blur halus.",
  },
  {
    id: "dir-phone-banner",
    type: "remove_phone_banner",
    title: "Hapus Nomor HP / Spanduk Lama",
    description: "Bersihkan spanduk 'DIJUAL' lama, nomor telepon agen terdahulu, atau papan kontak yang mengganggu.",
    defaultMethod: "inpaint",
    badge: "Clean Listing",
    suggestedInstruction: "Hilangkan teks nomor telepon dan spanduk pada pagar/balkon, pertahankan warna cat pagar asli.",
  },
  {
    id: "dir-wires-clutter",
    type: "remove_wires",
    title: "Bersihkan Kabel & Distraksi Visual",
    description: "Rapikan kabel listrik melintang, tempat sampah, atau noda visual kecil di trotoar depan properti.",
    defaultMethod: "inpaint",
    badge: "Estetika Bangunan",
    suggestedInstruction: "Hapus juntaian kabel atau distraksi visual di depan rumah agar tampak rapi dan bersih.",
  },
];
