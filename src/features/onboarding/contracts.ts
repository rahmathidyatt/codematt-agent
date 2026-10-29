export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  agentName: string;
  agencyOffice: string;
  licenseNumber: string;
  whatsappNumber: string;
  primaryColor: string;
  preferredFirstTool: "flyer" | "listing" | "photo-editor" | "assistant";
  isCompleted: boolean;
}

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const BRIGHTON_OFFICES = [
  "Brighton Grand",
  "Brighton Central",
  "Brighton Graha Family",
  "Brighton Citraland",
  "Brighton Pakuwon City",
  "Brighton Manyar",
  "Brighton Jemursari",
  "Brighton Jakarta Barat",
  "Brighton Jakarta Selatan",
  "Brighton Kelapa Gading",
  "Brighton BSD City",
  "Brighton Alam Sutera",
  "Brighton Bali Sunset Road",
  "Brighton Medan",
  "Brighton Makassar",
] as const;

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStep: 1,
  totalSteps: 3,
  agentName: "Rahmat Hidayat",
  agencyOffice: "Brighton Grand",
  licenseNumber: "AREBI-BRIGHTON-88291",
  whatsappNumber: "6281234567890",
  primaryColor: "#f5b800",
  preferredFirstTool: "flyer",
  isCompleted: false,
};
