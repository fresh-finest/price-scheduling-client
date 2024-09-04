import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  baseUrl: `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000`,
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