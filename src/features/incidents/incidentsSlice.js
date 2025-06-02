import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  incidents: [],
  nearbyIncidents: [],
  selectedIncident: null,
  isLoading: false,
  error: null,
};

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setIncidents: (state, action) => {
      state.incidents = action.payload;
    },
    setNearbyIncidents: (state, action) => {
      state.nearbyIncidents = action.payload;
    },
    addIncident: (state, action) => {
      state.incidents.push(action.payload);
      state.nearbyIncidents.push(action.payload);
    },
    updateIncident: (state, action) => {
      const index = state.incidents.findIndex(inc => inc._id === action.payload._id);
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
      const nearbyIndex = state.nearbyIncidents.findIndex(inc => inc._id === action.payload._id);
      if (nearbyIndex !== -1) {
        state.nearbyIncidents[nearbyIndex] = action.payload;
      }
    },
    setSelectedIncident: (state, action) => {
      state.selectedIncident = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setIncidents,
  setNearbyIncidents,
  addIncident,
  updateIncident,
  setSelectedIncident,
  setLoading,
  setError,
} = incidentsSlice.actions;

export default incidentsSlice.reducer;

// Selectors
export const selectAllIncidents = (state) => state.incidents.incidents;
export const selectNearbyIncidents = (state) => state.incidents.nearbyIncidents;
export const selectSelectedIncident = (state) => state.incidents.selectedIncident;
export const selectIncidentsLoading = (state) => state.incidents.isLoading;
export const selectIncidentsError = (state) => state.incidents.error;
