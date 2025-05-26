import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch2 } from "../helpers/fetch2";

const initialState = {
  token: "",
  loading: false,
  error: "",
};

export const signupUser = createAsyncThunk("signupuser", async (body) => {
  const result = await fetch2("/api/signup", body);
  return result;
});

export const signinUser = createAsyncThunk("signinuser", async (body) => {
  const result = await fetch2("/api/signin", body);
  return result;
});

const authReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    addToken: (state, action) => {
      state.token = localStorage.getItem("token");
    },
    logout: (state, action) => {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Signup reducers
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        signupUser.fulfilled,
        (state, { payload: { error, message } }) => {
          state.loading = false;
          if (error) {
            state.error = error;
          } else {
            state.error = message;
          }
        }
      )
      .addCase(signupUser.rejected, (state) => {
        state.loading = false;
        state.error = "Kuch galat ho gaya!";
      });

    // Signin reducers (👇 ye naya block hai)
    builder
      .addCase(signinUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signinUser.fulfilled, (state, { payload: { error, token } }) => {
        state.loading = false;
        if (error) {
          state.error = error;
        } else {
          state.token = token;
          localStorage.setItem("token", token);
          state.error = "";
        }
      })
      .addCase(signinUser.rejected, (state) => {
        state.loading = false;
        state.error = "Signin failed!";
      });
  },
});

export const { addToken, logout } = authReducer.actions;
export default authReducer.reducer;
