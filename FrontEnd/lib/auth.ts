import { create } from "zustand";
import { persist } from "zustand/middleware";
import {api, mainAPI} from "./axios";
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  _id: string; // Support both id and _id for compatibility
  username?: string; // Make username optional for partial loading
  email: string;
  gender?: 'Male' | 'Female';
  profileImage?: string;
  Role?: string;
  createdAt?: string;
  favorites?: any[]; // Adjust this type as needed
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  initializeAuth: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    username?: string;
    email: string;
    gender?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  addToFavorites: (medicine: any) => void;
  removeFromFavorites: (medicineId: number) => void;
  // Helper function to get user ID consistently
  getUserId: () => string | null;
}

type DecodedToken = {
  userId: string;
  email: string;
  Role: string;
  iat: number;
  exp: number;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      token: null,
      
      // Helper function to get user ID consistently
      getUserId: () => {
        const state = get();
        if (!state.user) return null;
        return state.user.id || state.user._id || null;
      },
      
      // Initialize auth state from localStorage and fetch user profile if needed
      initializeAuth: async () => {
        const storedToken = localStorage.getItem('auth-token');
        if (storedToken) {
          try {
            const decodedToken = jwtDecode<DecodedToken>(storedToken);

            if (decodedToken.exp * 1000 < Date.now()) {
              throw new Error('Token expired');
            }

            set({ token: storedToken, isAuthenticated: true });

            const state = get();
            if (!state.user || state.user.id !== decodedToken.userId) {
              const response = await api.get(`/users/${decodedToken.userId}`);
              if (response.data?.Status === 'Success' && response.data?.Data) {
                const userData = response.data.Data;
                const userWithIds = {
                  ...userData,
                  id: userData._id,
                  _id: userData._id,
                };
                set({ user: userWithIds });
              } else {
                throw new Error('Failed to fetch user profile during initialization.');
              }
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            get().logout();
            set({ error: 'Session expired. Please log in again.' });
          }
        }
      },
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/login", credentials);
          console.log('Login response:', response.data);

          if (response.data.Status === 'Success' && response.data.Data?.token) {
            const { token } = response.data.Data;
            
            localStorage.setItem('auth-token', token);
            const decodedToken = jwtDecode<DecodedToken>(token);

            // Set auth state immediately with info from token
            set({
              isAuthenticated: true,
              token,
              isLoading: false,
              error: null,
              user: { // Set a partial user object. Full profile will be fetched next.
                id: decodedToken.userId,
                _id: decodedToken.userId,
                email: decodedToken.email,
                Role: decodedToken.Role,
              },
            });

            console.log('Login successful. Fetching full user profile...');
            // Fetch the complete user profile using the ID from the token
            await get().fetchUserProfile(decodedToken.userId);

          } else {
            const error = response.data?.message || 'Login failed due to invalid response';
            set({ error, isLoading: false, isAuthenticated: false, user: null, token: null });
            throw new Error(error);
          }
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'An unknown login error occurred';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/register", {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            gender: userData.gender,
          });

          if (response.data.status === 'Success' && response.data.data) {
            set({
              isLoading: false,
            });
          } else {
            const errorMsg = response.data.message || 'Invalid registration response';
            throw new Error(errorMsg);
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          console.error('Error response:', error.response?.data);
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, isAuthenticated: false, token: null, error: null });
      },
      
      fetchUserProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/users/${userId}`);
          console.log('User Profile API response:', response.data);

          if (response.data.Status === 'Success' && response.data.Data) {
            const userData = response.data.Data;
            
            if (!userData._id) {
              throw new Error("Invalid response structure from server");
            }

            // Ensure user has both id and _id fields
            const userWithIds = {
              ...userData,
              id: userData._id,
              _id: userData._id
            };

            set({
              user: userWithIds,
              isLoading: false,
            });

            console.log("User profile fetched successfully:", userWithIds);
          } else {
            throw new Error("Invalid response structure from server");
          }
        } catch (error: any) {
          console.error("Fetch profile error:", error);
          set({
            error: error.response?.data?.message || "Failed to fetch profile",
            isLoading: false,
          });
          throw new Error(
            error.response?.data?.error || "Failed to fetch profile"
          );
        }
      },

      updateUser: async (userData) => {
        try {
          const response = await api.put("/users/profile", userData);
          const { user } = response.data;
          set((state) => ({
            user: { ...state.user, ...user },
          }));
        } catch (error: any) {
          throw new Error(
            error.response?.data?.error || "Profile update failed"
          );
        }
      },
      
      addToFavorites: (medicine) => {
        set((state) => {
          if (!state.user) return state;
          const favorites = state.user.favorites || [];
          if (!favorites.some((fav) => fav.id === medicine.id)) {
            return {
              user: {
                ...state.user,
                favorites: [...favorites, medicine],
              },
            };
          }
          return state;
        });
      },
      
      removeFromFavorites: (medicineId) => {
        set((state) => {
          if (!state.user) return state;
          const favorites = state.user.favorites || [];
          return {
            user: {
              ...state.user,
              favorites: favorites.filter(
                (medicine) => medicine.id !== medicineId
              ),
            },
          };
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth state when the store is rehydrated
        if (state) {
          state.initializeAuth();
        }
      },
    }
  )
);
export default useAuth;
