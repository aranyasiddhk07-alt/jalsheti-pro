import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const phoneSchema = z.object({
  phone: z.string().regex(phoneRegex, "वैध 10-अंकी मोबाइल नंबर टाका"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP 6 अंकी असावा"),
});

export const supplierRegisterSchema = z.object({
  name: z.string().min(2, "नाव किमान 2 अक्षरी हवे").max(50),
  village: z.string().min(2, "गावाचे नाव टाका").max(100),
  taluka: z.string().min(2, "तालुक्याचे नाव टाका").max(100),
  district: z.string().default("Kolhapur"),
  adminCode: z.string().min(6, "पुरवठादार कोड चुकीचा आहे"),
  referralCode: z.string().optional(),
});

export const consumerRegisterSchema = z.object({
  name: z.string().min(2, "नाव किमान 2 अक्षरी हवे").max(50),
  village: z.string().min(2, "गावाचे नाव टाका").max(100),
  taluka: z.string().min(2, "तालुक्याचे नाव टाका").max(100),
  district: z.string().default("Kolhapur"),
  supplierPhone: z.string().regex(phoneRegex, "पुरवठादाराचा वैध मोबाइल नंबर टाका"),
});

export const fieldSetupSchema = z.object({
  fieldAreaAcres: z.number().min(0.1, "किमान 0.1 एकर").max(100),
  sugarcaneVariety: z.enum(["Co86032", "CoM0265", "Co94012", "Co0238", "other"]),
  plantingDate: z.string().min(1, "लागवडीची तारीख निवडा"),
  cropType: z.enum(["Suru", "Adsali", "Pre-seasonal"]).default("Suru"),
  rowSpacingFeet: z.number().min(2).max(8).default(4),
});

export const waterScheduleSchema = z.object({
  consumerId: z.string().uuid(),
  fieldId: z.string().uuid(),
  scheduledDate: z.string().min(1),
  plannedStartTime: z.string().min(1),
  plannedEndTime: z.string().min(1),
  notes: z.string().max(200).optional(),
});

export type PhoneInput = z.infer<typeof phoneSchema>;
export type OTPInput = z.infer<typeof otpSchema>;
export type SupplierRegisterInput = z.infer<typeof supplierRegisterSchema>;
export type ConsumerRegisterInput = z.infer<typeof consumerRegisterSchema>;
export type FieldSetupInput = z.infer<typeof fieldSetupSchema>;
export type WaterScheduleInput = z.infer<typeof waterScheduleSchema>;
