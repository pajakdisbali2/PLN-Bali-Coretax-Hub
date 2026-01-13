
export type UnitName = "UID Bali" | "UP3 Bali Selatan" | "UP3 Bali Timur" | "UP3 Bali Utara" | "UP2D";

export interface FormData {
  nama: string;
  nip: string;
  unit: UnitName;
  buktiSertifikat: File | null;
  suratKodeDJP: File | null;
  npwpGabung: "Gabung" | "Pisah";
  timestamp?: string;
}

export interface Submission {
  id: string;
  nama: string;
  nip: string;
  unit: UnitName;
  buktiSertifikatUrl: string;
  suratKodeDJPUrl: string;
  npwpStatus: "Gabung" | "Pisah";
  timestamp: string;
}

export interface UnitStats {
  name: UnitName;
  totalPegawai: number;
  totalMengisi: number;
}
