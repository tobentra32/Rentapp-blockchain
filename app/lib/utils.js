// utils/formatDate.js
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}