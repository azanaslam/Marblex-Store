import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { useOnlineStatus } from "../hooks/useStandaloneApp";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      className="sticky top-0 z-[65] flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500 px-3 py-2 text-center text-[12px] font-bold text-[#0a3d52]"
      role="status"
    >
      <WifiOffRoundedIcon sx={{ fontSize: 16 }} />
      You&apos;re offline — cached pages still work. Orders / WhatsApp need connection.
    </div>
  );
}
