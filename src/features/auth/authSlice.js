import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/axios";

/**
 * Auth Slice - Production Ready
 * Handles authentication state with Redux Toolkit best practices
 */

// Load persisted auth state from sessionStorage
const loadPersistedAuth = () => {
  try {
    const serializedState = sessionStorage.getItem("auth_ui");
    if (serializedState === null) {
      return { user: null, token: null, status: "idle", error: null };
    }
    const uiState = JSON.parse(serializedState);
    return {
      user: uiState.user,
      token: null,
      status: uiState.status || "idle",
      error: null,
    };
  } catch (err) {
    return { user: null, token: null, status: "idle", error: null };
  }
};

const persistAuthState = (state) => {
  try {
    const uiOnlyState = {
      user: state.user
        ? { name: state.user.name, role: state.user.role }
        : null,
      status: state.status,
    };
    sessionStorage.setItem("auth_ui", JSON.stringify(uiOnlyState));
  } catch (err) {
    production;
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data.content;

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ firstName, lastName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/refugee/signup", {
        firstName,
        lastName,
        email,
        password,
      });
      const { user, token } = response.data.content;

      // Store token in sessionStorage and axios defaults
      sessionStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { user, token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Async thunk for content contributor registration
export const registerContributor = createAsyncThunk(
  "auth/registerContributor",
  async ({ firstName, lastName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/contributor/signup", {
        firstName,
        lastName,
        email,
        password,
      });
      const user = response.data.content;

      // Don't store token for contributors (pending approval)
      // They'll need to login after approval
      return { user, token: null };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");

      // Clear token from storage and axios defaults
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("auth");
      delete api.defaults.headers.common["Authorization"];

      return null;
    } catch (error) {
      // Even if API fails, clear local state
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("auth");
      delete api.defaults.headers.common["Authorization"];

      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

const initialState = loadPersistedAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous action to set user (for manual updates)
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";
      state.error = null;
      persistAuthState(state);
    },
    // Clear user (for manual logout)
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("auth");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("lastEmail");
      delete api.defaults.headers.common["Authorization"];
    },
    // Restore session on app load
    restoreSession: (state) => {
      const token = sessionStorage.getItem("token");
      if (token && state.user) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        state.status = "authenticated";
      }
    },
    // Clear auth error
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "authenticated";
        state.error = null;
        persistAuthState(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "authenticated";
        state.error = null;
        persistAuthState(state);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Register Contributor
    builder
      .addCase(registerContributor.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerContributor.fulfilled, (state) => {
        // Don't set user/token for contributors (pending approval)
        state.status = "idle";
        state.error = null;
      })
      .addCase(registerContributor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear state even if API fails
        state.user = null;
        state.token = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { setUser, clearUser, restoreSession, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) =>
  state.auth.status === "authenticated";
