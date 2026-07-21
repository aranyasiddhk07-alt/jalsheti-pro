import { supabase } from "./supabase";

export async function sendOTP(phone: string) {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  return data;
}

export async function verifyOTP(phone: string, token: string) {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: "sms",
  });
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, profile: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("users")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function registerConsumer(
  userId: string,
  name: string,
  village: string,
  taluka: string,
  district: string,
  supplierPhone: string
) {
  const { data: supplier } = await supabase
    .from("users")
    .select("id")
    .eq("phone", supplierPhone)
    .eq("role", "supplier")
    .single();

  if (!supplier) throw new Error("पुरवठादार सापडला नाही. फोन नंबर तपासा.");

  return updateUserProfile(userId, {
    name,
    role: "consumer",
    village,
    taluka,
    district,
    linked_supplier_id: supplier.id,
    subscription_status: "trial",
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

export async function registerSupplier(
  userId: string,
  name: string,
  village: string,
  taluka: string,
  district: string,
  adminCode: string,
  referralCode?: string
) {
  const { data, error } = await supabase.functions.invoke("validate-supplier-code", {
    body: { adminCode },
  });

  if (error || !data?.valid) {
    throw new Error("चुकीचा पुरवठादार कोड. कृपया तपासा.");
  }

  const profile: Record<string, unknown> = {
    name,
    role: "supplier",
    village,
    taluka,
    district,
    subscription_status: "free",
  };

  if (referralCode) {
    const { data: referrer } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", referralCode)
      .single();
    if (referrer) profile.referred_by = referrer.id;
  }

  return updateUserProfile(userId, profile);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
