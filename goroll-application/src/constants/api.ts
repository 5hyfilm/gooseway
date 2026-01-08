export const API_BASE_URL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  } else {
    return "https://goroll-dev-g2fcfrdfa0f2e5ar.southeastasia-01.azurewebsites.net"
  }
}
