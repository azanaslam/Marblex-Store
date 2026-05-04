import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 120;

/**
 * Only auto-scrolls the chat when the user is already near the bottom,
 * or after stickToBottomNext() (send message, open thread). Scrolling up
 * to read history is no longer interrupted by polling refreshes.
 */
export function useChatAutoScroll(messages, loading) {
  const scrollContainerRef = useRef(null);
  const bottomMarkerRef = useRef(null);
  const userAtBottomRef = useRef(true);
  const forceScrollNextRef = useRef(true);

  const onScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    userAtBottomRef.current = dist < NEAR_BOTTOM_PX;
  }, []);

  const stickToBottomNext = useCallback(() => {
    forceScrollNextRef.current = true;
    userAtBottomRef.current = true;
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!userAtBottomRef.current && !forceScrollNextRef.current) return;
    forceScrollNextRef.current = false;
    bottomMarkerRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages, loading]);

  return {
    scrollContainerRef,
    bottomMarkerRef,
    onScroll,
    stickToBottomNext,
  };
}
