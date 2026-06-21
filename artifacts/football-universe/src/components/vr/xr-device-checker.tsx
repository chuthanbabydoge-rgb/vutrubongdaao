import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Glasses, MonitorSmartphone, Cpu, Wifi, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface XRCapability {
  label: string;
  key: string;
  supported: boolean | null;
  icon: React.ElementType;
  description: string;
}

export function XRDeviceChecker() {
  const [caps, setCaps] = useState<XRCapability[]>([
    { label: "Immersive VR", key: "vr", supported: null, icon: Glasses, description: "Kính VR (Meta Quest, PS VR, Apple Vision)" },
    { label: "Immersive AR", key: "ar", supported: null, icon: MonitorSmartphone, description: "Camera AR (Android WebXR, iOS Safari)" },
    { label: "WebXR API", key: "webxr", supported: null, icon: Cpu, description: "Trình duyệt hỗ trợ WebXR" },
    { label: "WebGL 2.0", key: "webgl2", supported: null, icon: Wifi, description: "Rendering 3D hardware-accelerated" },
  ]);

  useEffect(() => {
    const results: Record<string, boolean> = {};

    results.webxr = "xr" in navigator;
    results.webgl2 = !!document.createElement("canvas").getContext("webgl2");

    Promise.all([
      navigator.xr?.isSessionSupported("immersive-vr").then((ok) => { results.vr = ok; }).catch(() => { results.vr = false; }),
      navigator.xr?.isSessionSupported("immersive-ar").then((ok) => { results.ar = ok; }).catch(() => { results.ar = false; }),
    ].filter(Boolean)).then(() => {
      if (!results.vr) results.vr = false;
      if (!results.ar) results.ar = false;

      setCaps((prev) =>
        prev.map((cap) => ({
          ...cap,
          supported: results[cap.key] ?? false,
        }))
      );
    });
  }, []);

  const supported = caps.filter((c) => c.supported === true).length;
  const total = caps.length;

  return (
    <div className="bg-card/40 border border-border/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-bold uppercase tracking-tight text-sm">Kiểm Tra Thiết Bị XR</h3>
        <Badge className={`font-mono text-xs ${supported >= 3 ? "bg-green-500/10 text-green-400 border-green-400/30" : supported >= 2 ? "bg-yellow-500/10 text-yellow-400 border-yellow-400/30" : "bg-red-500/10 text-red-400 border-red-400/30"}`}>
          {supported}/{total} Tính Năng
        </Badge>
      </div>

      <div className="space-y-3">
        {caps.map((cap) => {
          const Icon = cap.icon;
          const StatusIcon = cap.supported === null ? AlertCircle : cap.supported ? CheckCircle2 : XCircle;
          const statusColor = cap.supported === null ? "text-muted-foreground" : cap.supported ? "text-green-400" : "text-red-400";
          return (
            <div key={cap.key} className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/20">
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold">{cap.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{cap.description}</div>
              </div>
              <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusColor} ${cap.supported === null ? "animate-pulse" : ""}`} />
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-muted-foreground font-mono">
        {supported === total
          ? "✅ Thiết bị của bạn hỗ trợ đầy đủ VR/AR/XR"
          : supported >= 2
          ? "⚠️ Hỗ trợ một phần — 3D hoạt động, VR/AR cần thiết bị thêm"
          : "ℹ️ Hãy dùng Chrome/Edge trên Android hoặc kính VR để trải nghiệm đầy đủ"}
      </div>
    </div>
  );
}
