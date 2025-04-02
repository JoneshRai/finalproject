// store/auth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";

// Create Zustand store with persistence
const useAuthStore = create(
    persist(
        (set, get) => ({
            // Store all user data
            allUserData: null,

            // Loading state
            loading: false,

            // Get user details
            user: () => ({
                user_id: get().allUserData?.user_id || null,
                username: get().allUserData?.username || null,
            }),

            // Set user data
            setUser: (user) => set({ allUserData: user }),

            // Set loading state
            setLoading: (loading) => set({ loading }),

            // Check if user is logged in
            isLoggedIn: () => get().allUserData !== null,

            // Logout function
            logout: () => set({ allUserData: null }),
        }),
        {
            name: "auth-storage", // Key name in localStorage
            getStorage: () => localStorage, // Store in localStorage
        }
    )
);

// Attach DevTools only in development mode
if (import.meta.env.DEV) {
    mountStoreDevtool("AuthStore", useAuthStore);
}

// Export store
export { useAuthStore };
