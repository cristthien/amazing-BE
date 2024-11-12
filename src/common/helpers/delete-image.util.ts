import * as fs from 'fs';
import * as path from 'path';

function deleteImages(imagePaths: string[]): void {
  for (const imagePath of imagePaths) {
    const fullImagePath = path.join(__dirname, '..', '..', imagePath);
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath); // Delete the file
    }
  }
}

export default deleteImages;
