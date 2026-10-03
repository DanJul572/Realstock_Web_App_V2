import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const overlayKey = '__overlay';

// On web, the phone's back button/gesture pops browser history and leaves an
// open overlay on top of the next page. While `isOpen`, an extra history entry
// is pushed so "back" only closes the overlay. On native, Modal's
// onRequestClose already handles the hardware back button.
const useBackToClose = (isOpen: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || !isOpen) {
      return;
    }

    // Keep the router's own state so it treats this entry as the same page.
    window.history.pushState({ ...window.history.state, [overlayKey]: true }, '');
    let isClosedByBack = false;

    const handlePopState = () => {
      isClosedByBack = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Closed some other way (selection, backdrop, swipe): drop the entry we
      // pushed so the next "back" leaves the page as expected.
      if (!isClosedByBack && window.history.state?.[overlayKey]) {
        window.history.back();
      }
    };
  }, [isOpen]);
};

export default useBackToClose;
