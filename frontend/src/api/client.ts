import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const { code, detail } = error.response.data
      return Promise.reject(new Error(detail || code || 'Unknown error'))
    }
    return Promise.reject(error)
  },
)

export default client
