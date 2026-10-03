import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';

const maxSize = 500;

export type PickedImageType = {
  dataUrl: string;
  name: string;
};

const getSaveFormat = (mimeType?: string): SaveFormat => {
  if (mimeType === 'image/png') {
    return SaveFormat.PNG;
  }
  if (mimeType === 'image/webp') {
    return SaveFormat.WEBP;
  }
  return SaveFormat.JPEG;
};

// Picks an image from the library and downsizes it to fit in 500x500,
// returning it as a base64 data URL (the format the API expects).
const pickResizedImage = async (): Promise<PickedImageType | null> => {
  const result = await launchImageLibraryAsync({ mediaTypes: ['images'] });
  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  const scale = Math.min(1, maxSize / asset.width, maxSize / asset.height);
  const context = ImageManipulator.manipulate(asset.uri);
  if (scale < 1) {
    context.resize({
      width: Math.round(asset.width * scale),
      height: Math.round(asset.height * scale),
    });
  }

  const image = await context.renderAsync();
  const format = getSaveFormat(asset.mimeType);
  const saved = await image.saveAsync({ base64: true, format });

  return {
    dataUrl: `data:image/${format};base64,${saved.base64}`,
    name: asset.fileName ?? `image.${format}`,
  };
};

export default pickResizedImage;
