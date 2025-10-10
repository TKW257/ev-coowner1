import axiosClient from './axiosClient';

const vehiclesApi = {

  getCars: (params) => {
    const url = '/vehicles';
    return axiosClient.get(url, { params });
  },

  getCarById: (id) => {
    const url = `/vehicles/${id}`;
    return axiosClient.get(url);
  },
};

export default vehiclesApi;
