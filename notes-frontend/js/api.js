const API_BASE_URL = "http://localhost:3000/api";

async function request(endpoint, method = "GET", data = null, token = null) {
  const config = {
    method: method,
    headers: {},
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.error || `HTTP error! status: ${response.status}`
      );
    }
    return responseData;
  } catch (error) {
    console.error(`Request failed for ${method} ${endpoint}:`, error.message);
    alert(`Error: ${error.message}`);
    throw error;
  }
}
