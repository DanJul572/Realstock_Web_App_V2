export type CameraIssueType =
  'denied' | 'in_use' | 'insecure' | 'not_found' | 'unknown' | 'unsupported';

// Browsers only expose the camera on HTTPS (or localhost); on plain HTTP
// `navigator.mediaDevices` is undefined and no permission prompt ever shows.
export const getCameraSupportIssue = (): CameraIssueType | null => {
  if (!window.isSecureContext) {
    return 'insecure';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'unsupported';
  }
  return null;
};

// expo-camera's web permission request hides why getUserMedia failed, so ask
// the browser directly to tell the user what to fix.
export const probeCamera = async (): Promise<CameraIssueType | null> => {
  const issue = getCameraSupportIssue();
  if (issue) {
    return issue;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return null;
  } catch (error) {
    switch ((error as DOMException).name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'denied';
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'not_found';
      case 'NotReadableError':
      case 'AbortError':
        return 'in_use';
      case 'NotSupportedError':
        return 'unsupported';
      default:
        return 'unknown';
    }
  }
};

type FocusCapabilitiesType = MediaTrackCapabilities & { focusMode?: string[] };

// expo-camera reports "ready" just before it attaches the stream to <video>.
const waitForStream = async (root: HTMLElement): Promise<MediaStream | null> => {
  for (let attempt = 0; attempt < 50; attempt++) {
    const stream = root.querySelector('video')?.srcObject;
    if (stream instanceof MediaStream) {
      return stream;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
};

// expo-camera opens the web stream without a resolution, so browsers fall back
// to ~640x480: too blurry to read barcode bars. Once the camera is ready, ask
// the track for HD and continuous focus.
export const improveCameraQuality = async (root: unknown) => {
  if (!(root instanceof HTMLElement)) {
    return;
  }
  const stream = await waitForStream(root);
  if (!stream) {
    return;
  }
  const [track] = stream.getVideoTracks();
  if (!track) {
    return;
  }
  const resolution = { height: { ideal: 1080 }, width: { ideal: 1920 } };
  try {
    await track.applyConstraints(resolution);
  } catch {
    return;
  }

  const capabilities = track.getCapabilities?.() as FocusCapabilitiesType | undefined;
  if (!capabilities?.focusMode?.includes('continuous')) {
    return;
  }
  // Each applyConstraints() replaces the previous constraints, so resolution
  // and focus go together. Some browsers then ignore the resolution; keep HD
  // in that case (phones default to autofocus without a focus constraint).
  const hdWidth = track.getSettings().width ?? 0;
  try {
    await track.applyConstraints({
      ...resolution,
      advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
    });
    if ((track.getSettings().width ?? 0) < hdWidth) {
      await track.applyConstraints(resolution);
    }
  } catch {
    await track.applyConstraints(resolution).catch(() => undefined);
  }
};
