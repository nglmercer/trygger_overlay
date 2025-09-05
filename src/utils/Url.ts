const baseUrl = 'http://localhost:3000';
const getFullImageUrl = (relativePath: string,imageBaseUrl: string = baseUrl): string => {
  if (!imageBaseUrl || relativePath.startsWith('http')) {
    return relativePath;
  }
  // Elimina slashes duplicados entre la base y la ruta
  return `${imageBaseUrl.replace(/\/$/, '')}/${relativePath.replace(/^\//, '')}`;
};

export { getFullImageUrl };