// // import { map, filter } from 'lodash';
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

////////////////////////////////////////////////////////////////////////

const initialState = {
  isLoading: false,
  isAuthenticated: 1,
  userDetails: null,
  error: "",
};

const handleTokenExpired = (exp) => {
  let expiredTimer;

  window.clearTimeout(expiredTimer);
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;
  console.log(timeLeft);
  expiredTimer = window.setTimeout(() => {
    console.log("Session expired");
    // You can do what ever you want here, like show a notification
  }, timeLeft);
};  

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    // This function below will handle when token is expired
    const { exp, role, username, email, empId } = jwtDecode(accessToken);
    localStorage.setItem("role", role);
    localStorage.setItem("empId",empId)
    localStorage.setItem("username", username);
    localStorage.setItem("mail", email);

    console.log(localStorage.getItem("mail", email));
    handleTokenExpired(exp);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// Login action
export const fetchLoginDetailsAsync = createAsyncThunk(
  "auth/fetchLoginDetails",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(
        "blog/login",
        payload
      );

      setSession(response.data.tokens.access_token);
      
      console.log(response.data.tokens.access_token);

      return response.data;
    } catch (err) {
      console.log("failure")
      return rejectWithValue(err.data);
    }
  }
);

// Logout action
export const logoutAction = () => (dispatch) => {
  dispatch(setIsAuthenticated(1));
  dispatch({ type: "USER_LOGOUT" });
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      
    },

    resetError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginDetailsAsync.pending, (state) => ({ ...state, isLoading: true }),)
      .addCase(fetchLoginDetailsAsync.fulfilled, (state, action) => {
        console.log("Fetched Successfully!", action.payload);
        return {
        ...state,
        isAuthenticated:2,
        userDetails:action.payload,
        isLoading:false
      };
        
      })
      .addCase(fetchLoginDetailsAsync.rejected, (state, action) => ({
        ...state,
        isAuthenticated: 3,
        error: action.payload,
        isLoading: false
      }));
  },
});
export default authSlice;
export const {
  startLoading,
  stopLoading,
  setIsAuthenticated,

 
  resetError,
} = authSlice.actions;

// Selector
export const getIsLoadingFromAuth = (state) => state.auth.isLoading;
export const getIsAuthenticatedFromAuth = (state) => state.auth.isAuthenticated;
export const getErrorFromAuth = (state) => state.auth.error;
export const getUserDetailsFromAuth = (state) => state.auth.userDetails;
