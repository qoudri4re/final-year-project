import axios from "axios";

let baseURL = "http://localhost:3001";

const client = axios.create({
  baseURL,
});
client.defaults.withCredentials = true;
/**
 * header configuration for requests
 * @param {*} jwtToken
 * @returns header config
 */
function requestHeaderConfig(jwtToken) {
  const config = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };
  return config;
}

export { client, requestHeaderConfig };
