import axios from './axios';

export const getScenes = async () => {
  const response = await axios.get('/api/scenes');
  return response.data;
};

export const createScene = async (sceneData) => {
  const response = await axios.post('/api/scenes', sceneData);
  return response.data;
};

export const getSceneById = async (id) => {
  const response = await axios.get(`/api/scenes/${id}`);
  return response.data;
};

export const updateScene = async (id, sceneData) => {
  const response = await axios.put(`/api/scenes/${id}`, sceneData);
  return response.data;
};

export const deleteScene = async (id) => {
  const response = await axios.delete(`/api/scenes/${id}`);
  return response.data;
};

export const getPublicScenes = async () => {
  const response = await axios.get('/api/scenes/public');
  return response.data;
};
