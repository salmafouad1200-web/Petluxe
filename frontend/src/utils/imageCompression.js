/**
 * Compresse une image côté client avant l'envoi au serveur.
 * Utilise l'API Canvas HTML5 pour redimensionner et réduire la qualité.
 * 
 * @param {File} file Le fichier image original
 * @param {number} maxWidth La largeur maximale (ex: 1200)
 * @param {number} quality La qualité JPEG/WEBP (0 à 1, ex: 0.8)
 * @returns {Promise<File>} Le fichier compressé
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Calculer les nouvelles dimensions tout en conservant le ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Créer un canvas pour le redimensionnement
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Déterminer le format de sortie (on convertit en webp pour de meilleures performances si possible, sinon jpeg)
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        // Convertir le canvas en blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression.'));
              return;
            }
            // Créer un nouveau fichier à partir du blob
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
