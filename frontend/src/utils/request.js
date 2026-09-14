import axios from 'axios';
const urlBackend = import.meta.env.VITE_URL_BACKEND;
const apiRequest = axios.create({
	baseURL: 'https://api.example.com',
	timeout: 5000,
	headers: { 'X-Custom-Header': 'foobar' }
});
