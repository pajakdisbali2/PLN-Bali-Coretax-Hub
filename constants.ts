
import { UnitStats } from './types';

export const UNITS: string[] = ["UID Bali", "UP3 Bali Selatan", "UP3 Bali Timur", "UP3 Bali Utara", "UP2D"];

export const UNIT_TOTALS: UnitStats[] = [
  { name: "UID Bali", totalPegawai: 124, totalMengisi: 0 },
  { name: "UP3 Bali Selatan", totalPegawai: 162, totalMengisi: 0 },
  { name: "UP3 Bali Timur", totalPegawai: 108, totalMengisi: 0 },
  { name: "UP3 Bali Utara", totalPegawai: 101, totalMengisi: 0 },
  { name: "UP2D", totalPegawai: 56, totalMengisi: 0 },
];

export const APP_CONFIG = {
  // URL Web App dari Google Apps Script yang telah dideploy oleh user
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyaj1Vmro1ET_CrS1_Li5rrOKMcD4zWXhweLZRP-DSLi66pPw8fng68vmzWaOy1X4CPLw/exec",
  GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg/edit",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/u/0/folders/1HL7NFQ8t_7MIBh5tS5Ge2vvWNJNtoMUb",
  ADMIN_EMAIL: "pajak.disbali2@gmail.com",
  ADMIN_PASS: "PLNBali#2025"
};
