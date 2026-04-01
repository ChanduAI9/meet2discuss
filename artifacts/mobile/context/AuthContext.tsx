import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  yearsExperience: string;
  expertiseTags: string[];
  bio: string;
  linkedIn: string;
  avatarUrl: string;
  reputationScore: number;
  discussionsAttended: number;
  discussionsHosted: number;
  joinedAt: string;
  isVerified: boolean;
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (email: string) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "m2d_user";
const OTP_KEY = "m2d_otp";
const OTP_EMAIL_KEY = "m2d_otp_email";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setUser(parsed);
        setIsOnboarded(!!parsed.name);
      }
    } catch (e) {
      console.error("Error loading user:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await AsyncStorage.setItem(OTP_KEY, JSON.stringify({ otp, expiry }));
    await AsyncStorage.setItem(OTP_EMAIL_KEY, email);
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return otp;
  }

  async function verifyOtp(email: string, otp: string): Promise<boolean> {
    const stored = await AsyncStorage.getItem(OTP_KEY);
    const storedEmail = await AsyncStorage.getItem(OTP_EMAIL_KEY);
    if (!stored || storedEmail !== email) return false;

    const { otp: savedOtp, expiry } = JSON.parse(stored);
    if (Date.now() > expiry) return false;
    if (otp !== savedOtp) return false;

    // Check if user already exists
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as UserProfile;
      if (parsed.email === email) {
        setUser(parsed);
        setIsOnboarded(!!parsed.name);
        return true;
      }
    }

    // Create new user
    const newUser: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      name: "",
      role: "",
      company: "",
      yearsExperience: "",
      expertiseTags: [],
      bio: "",
      linkedIn: "",
      avatarUrl: "",
      reputationScore: 0,
      discussionsAttended: 0,
      discussionsHosted: 0,
      joinedAt: new Date().toISOString(),
      isVerified: false,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setIsOnboarded(false);
    return true;
  }

  async function saveProfile(profile: Partial<UserProfile>) {
    if (!user) return;
    const updated = { ...user, ...profile };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
    setIsOnboarded(true);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsOnboarded(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        login,
        verifyOtp,
        saveProfile,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
