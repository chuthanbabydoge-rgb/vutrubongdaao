import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, Maximize2, RotateCcw, ZoomIn, ZoomOut, MonitorSmartphone } from "lucide-react";

interface FootballStadium3DProps {
  onXREnter?: (mode: "vr" | "ar") => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FootballStadium3D({ onXREnter, className = "", style }: FootballStadium3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 55 });
  const ballRef = useRef<THREE.Mesh | null>(null);
  const ballAngle = useRef(0);

  const [vrSupported, setVrSupported] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [xrActive, setXrActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const buildScene = useCallback(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    scene.fog = new THREE.Fog(0x0a0f1a, 80, 150);
    sceneRef.current = scene;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    const floodLight1 = new THREE.SpotLight(0xffffff, 0.8);
    floodLight1.position.set(-40, 30, -30);
    scene.add(floodLight1);
    const floodLight2 = new THREE.SpotLight(0xffffff, 0.8);
    floodLight2.position.set(40, 30, 30);
    scene.add(floodLight2);

    const pitchGeo = new THREE.BoxGeometry(100, 0.4, 68);
    const pitchMat = new THREE.MeshLambertMaterial({ color: 0x2d6a2d });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.receiveShadow = true;
    pitch.position.y = -0.2;
    scene.add(pitch);

    const stripeCount = 10;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) {
        const stripeMat = new THREE.MeshLambertMaterial({ color: 0x256025 });
        const stripeGeo = new THREE.BoxGeometry(10, 0.41, 68);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(-45 + i * 10 + 5, 0, 0);
        scene.add(stripe);
      }
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lineThickness = 0.18;

    const addLine = (x1: number, z1: number, x2: number, z2: number, y = 0.21) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
      ]);
      scene.add(new THREE.Line(geo, lineMat));
    };

    addLine(-50, -34, 50, -34);
    addLine(-50, 34, 50, 34);
    addLine(-50, -34, -50, 34);
    addLine(50, -34, 50, 34);
    addLine(0, -34, 0, 34);

    const circleCurve = new THREE.EllipseCurve(0, 0, 9.15, 9.15, 0, Math.PI * 2, false, 0);
    const circlePoints = circleCurve.getPoints(64).map((p) => new THREE.Vector3(p.x, 0.21, p.y));
    const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
    scene.add(new THREE.Line(circleGeo, lineMat));

    const addGoalBox = (sign: number) => {
      addLine(sign * 50, -20.16, sign * 33.85, -20.16);
      addLine(sign * 50, 20.16, sign * 33.85, 20.16);
      addLine(sign * 33.85, -20.16, sign * 33.85, 20.16);
      addLine(sign * 50, -9.16, sign * 44.84, -9.16);
      addLine(sign * 50, 9.16, sign * 44.84, 9.16);
      addLine(sign * 44.84, -9.16, sign * 44.84, 9.16);
    };
    addGoalBox(1);
    addGoalBox(-1);

    const addGoal = (sign: number) => {
      const postMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.44, 8);
      const lp = new THREE.Mesh(postGeo, postMat);
      lp.position.set(sign * 50, 1.22, -3.66);
      lp.castShadow = true;
      scene.add(lp);
      const rp = new THREE.Mesh(postGeo, postMat);
      rp.position.set(sign * 50, 1.22, 3.66);
      rp.castShadow = true;
      scene.add(rp);
      const crossbarGeo = new THREE.CylinderGeometry(0.12, 0.12, 7.32, 8);
      const crossbar = new THREE.Mesh(crossbarGeo, postMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(sign * 50, 2.44, 0);
      crossbar.castShadow = true;
      scene.add(crossbar);
    };
    addGoal(1);
    addGoal(-1);

    const addFlagPole = (x: number, z: number) => {
      const poleMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 0.75, z);
      scene.add(pole);
    };
    addFlagPole(-50, -34); addFlagPole(50, -34); addFlagPole(-50, 34); addFlagPole(50, 34);

    const addStand = (x: number, z: number, width: number, depth: number, rotY: number) => {
      const standMat = new THREE.MeshLambertMaterial({ color: 0x1a2535 });
      const standGeo = new THREE.BoxGeometry(width, 12, depth);
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(x, 5.8, z);
      stand.rotation.y = rotY;
      stand.receiveShadow = true;
      scene.add(stand);

      const roofMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
      const roofGeo = new THREE.BoxGeometry(width + 2, 0.5, depth + 2);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x, 12, z);
      roof.rotation.y = rotY;
      scene.add(roof);

      const accentCount = Math.floor(width / 5);
      for (let i = 0; i < accentCount; i++) {
        const seatColor = [0x22c55e, 0x1d4ed8, 0xef4444, 0xf59e0b][i % 4];
        const seatMat = new THREE.MeshLambertMaterial({ color: seatColor });
        const seatGeo = new THREE.BoxGeometry(3, 1.5, 0.4);
        const seat = new THREE.Mesh(seatGeo, seatMat);
        const offset = -width / 2 + i * 5 + 2.5;
        seat.position.set(
          x + (rotY === 0 ? offset : 0),
          3,
          z + (rotY === 0 ? 0 : offset)
        );
        seat.rotation.y = rotY;
        scene.add(seat);
      }
    };

    addStand(0, -42, 104, 10, 0);
    addStand(0, 42, 104, 10, 0);
    addStand(-58, 0, 10, 72, 0);
    addStand(58, 0, 10, 72, 0);

    const floodlightMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const addFloodlight = (x: number, z: number) => {
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.5, 20, 8);
      const pole = new THREE.Mesh(poleGeo, floodlightMat);
      pole.position.set(x, 10, z);
      scene.add(pole);
      const headGeo = new THREE.BoxGeometry(4, 0.5, 2);
      const headMat = new THREE.MeshLambertMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(x, 21, z);
      scene.add(head);
    };
    addFloodlight(-55, -38); addFloodlight(55, -38);
    addFloodlight(-55, 38); addFloodlight(55, 38);

    const ballGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const ballMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 0.55, 0);
    ball.castShadow = true;
    scene.add(ball);
    ballRef.current = ball;

    const penaltySpotGeo = new THREE.CircleGeometry(0.15, 12);
    const penaltyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const penaltySpot = new THREE.Mesh(penaltySpotGeo, penaltyMat);
    penaltySpot.rotation.x = -Math.PI / 2;
    penaltySpot.position.set(0, 0.22, 0);
    scene.add(penaltySpot);

    const addPenaltySpot = (x: number) => {
      const geo = new THREE.CircleGeometry(0.15, 12);
      const spot = new THREE.Mesh(geo, penaltyMat);
      spot.rotation.x = -Math.PI / 2;
      spot.position.set(x, 0.22, 0);
      scene.add(spot);
    };
    addPenaltySpot(39); addPenaltySpot(-39);

    return scene;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      setWebglError("Trình duyệt này không hỗ trợ WebGL. Vui lòng dùng Chrome/Edge/Firefox trên máy tính hoặc thiết bị di động hỗ trợ GPU.");
      return;
    }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    cameraRef.current = camera;

    const scene = buildScene();

    const updateCamera = () => {
      const { theta, phi, radius } = spherical.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const animate = () => {
      ballAngle.current += 0.012;
      if (ballRef.current) {
        ballRef.current.position.x = Math.sin(ballAngle.current) * 18;
        ballRef.current.position.z = Math.sin(ballAngle.current * 0.7) * 10;
        ballRef.current.rotation.x += 0.05;
        ballRef.current.rotation.z += 0.03;
      }
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    if ("xr" in navigator) {
      navigator.xr?.isSessionSupported("immersive-vr").then((ok) => setVrSupported(ok));
      navigator.xr?.isSessionSupported("immersive-ar").then((ok) => setArSupported(ok));
    }

    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.005;
      const dy = (e.clientY - lastMouse.current.y) * 0.005;
      spherical.current.theta -= dx;
      spherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, spherical.current.phi + dy));
      lastMouse.current = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      spherical.current.radius = Math.max(20, Math.min(90, spherical.current.radius + e.deltaY * 0.05));
      updateCamera();
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel);

    let touchStart: { x: number; y: number; dist: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStart = { x: 0, y: 0, dist: Math.sqrt(dx * dx + dy * dy) };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;
      if (e.touches.length === 1) {
        const dx = (e.touches[0].clientX - touchStart.x) * 0.005;
        const dy = (e.touches[0].clientY - touchStart.y) * 0.005;
        spherical.current.theta -= dx;
        spherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, spherical.current.phi + dy));
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
        updateCamera();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        spherical.current.radius = Math.max(20, Math.min(90, spherical.current.radius - (dist - touchStart.dist) * 0.1));
        touchStart.dist = dist;
        updateCamera();
      }
    };
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);

    const onResize = () => {
      if (!mountRef.current) return;
      const w2 = mountRef.current.clientWidth;
      const h2 = mountRef.current.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current && canvas.parentNode === mountRef.current) {
        mountRef.current.removeChild(canvas);
      }
    };
  }, [buildScene]);

  const enterVR = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    try {
      const session = await navigator.xr!.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
      });
      rendererRef.current.xr.setSession(session);
      setXrActive(true);
      session.addEventListener("end", () => setXrActive(false));
      onXREnter?.("vr");
    } catch (e) {
      console.warn("WebXR VR not available:", e);
    }
  };

  const enterAR = async () => {
    if (!rendererRef.current) return;
    try {
      const session = await navigator.xr!.requestSession("immersive-ar", {
        optionalFeatures: ["dom-overlay", "hit-test"],
        domOverlay: { root: document.body },
      });
      rendererRef.current.xr.setSession(session);
      setXrActive(true);
      session.addEventListener("end", () => setXrActive(false));
      onXREnter?.("ar");
    } catch (e) {
      console.warn("WebXR AR not available:", e);
    }
  };

  const resetCamera = () => {
    spherical.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 55 };
    if (!cameraRef.current) return;
    const { theta, phi, radius } = spherical.current;
    cameraRef.current.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(0, 0, 0);
  };

  const zoom = (dir: number) => {
    spherical.current.radius = Math.max(20, Math.min(90, spherical.current.radius + dir * 8));
    if (!cameraRef.current) return;
    const { theta, phi, radius } = spherical.current;
    cameraRef.current.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(0, 0, 0);
  };

  if (webglError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-border/30 bg-card/40 flex flex-col items-center justify-center text-center p-8 space-y-4 ${className}`} style={style}>
        <div className="text-4xl">🖥️</div>
        <h3 className="font-mono font-bold text-sm uppercase text-foreground">WebGL Không Khả Dụng</h3>
        <p className="text-muted-foreground text-sm max-w-xs">{webglError}</p>
        <div className="flex flex-wrap gap-2 justify-center text-xs font-mono text-muted-foreground">
          {["Chrome", "Edge", "Firefox", "Safari 15+"].map((b) => (
            <span key={b} className="px-2 py-1 rounded border border-border/30 bg-background/30">{b}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-primary/20 bg-[#0a0f1a] ${className}`} style={style}>
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: "none" }} />

      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <Badge className="font-mono text-xs bg-black/60 text-primary border-primary/30 backdrop-blur">
          ⚡ THREE.JS 3D ENGINE
        </Badge>
        <Badge className="font-mono text-xs bg-black/60 text-green-400 border-green-400/30 backdrop-blur">
          🌐 WebXR Ready
        </Badge>
        {xrActive && (
          <Badge className="font-mono text-xs bg-primary/20 text-primary border-primary/40 backdrop-blur animate-pulse">
            🥽 XR ACTIVE
          </Badge>
        )}
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={resetCamera}
          className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => zoom(-1)}
          className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur">
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => zoom(1)}
          className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur">
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 justify-center">
        {vrSupported ? (
          <Button size="sm" onClick={enterVR}
            className="font-mono text-xs bg-primary/90 hover:bg-primary backdrop-blur h-9">
            <Glasses className="w-4 h-4 mr-1.5" /> VÀO VR
          </Button>
        ) : (
          <Button size="sm" disabled
            className="font-mono text-xs bg-black/60 border border-white/10 text-white/40 backdrop-blur h-9 cursor-not-allowed">
            <Glasses className="w-4 h-4 mr-1.5" /> VR (Cần kính VR)
          </Button>
        )}
        {arSupported ? (
          <Button size="sm" onClick={enterAR} variant="outline"
            className="font-mono text-xs bg-black/60 border-primary/40 text-primary hover:bg-primary/10 backdrop-blur h-9">
            <MonitorSmartphone className="w-4 h-4 mr-1.5" /> VÀO AR
          </Button>
        ) : (
          <Button size="sm" disabled variant="outline"
            className="font-mono text-xs bg-black/40 border-white/10 text-white/40 backdrop-blur h-9 cursor-not-allowed">
            <MonitorSmartphone className="w-4 h-4 mr-1.5" /> AR (Cần thiết bị)
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => mountRef.current?.requestFullscreen()}
          className="font-mono text-xs bg-black/40 text-white/70 hover:text-white backdrop-blur h-9">
          <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Toàn Màn Hình
        </Button>
      </div>

      <div className="absolute bottom-14 left-3 text-[10px] font-mono text-white/30">
        Kéo để xoay · Cuộn để zoom · Chạm 2 ngón để thu phóng
      </div>
    </div>
  );
}
