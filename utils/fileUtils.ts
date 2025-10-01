
export const fileToMimeTypeAndBase64 = (file: File): Promise<{ mimeType: string; base64: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [dataUrlPrefix, base64] = result.split(',');
      const mimeTypeMatch = dataUrlPrefix.match(/:(.*?);/);
      if (!mimeTypeMatch || !base64) {
        return reject(new Error("Invalid file format."));
      }
      const mimeType = mimeTypeMatch[1];
      resolve({ mimeType, base64 });
    };
    reader.onerror = (error) => reject(error);
  });
};
