import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  baseUrl: 'https://dps-server-b829cf5871b7.herokuapp.com',
};

const baseUrlSlice = createSlice({
  name: 'baseUrl',
  initialState,
  reducers: {
    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
  },
});

export const { setBaseUrl } = baseUrlSlice.actions;
export default baseUrlSlice.reducer;