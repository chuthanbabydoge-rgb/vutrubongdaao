import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Glasses, Maximize2, RotateCcw, ZoomIn, ZoomOut,
  MonitorSmartphone, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Move, Eye,
} from "lucide-react";

export interface StadiumPlayer {
  id: number;
  name: string;
  position: string;
  rating: number;
  teamId?: number | null;
}

interface FootballStadium3DProps {
  players?: StadiumPlayer[];
  onXREnter?: (mode: "vr" | "ar") => void;
  className?: string;
  style?: React.CSSProperties;
}

function makeNameSprite(name: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.roundRect(0, 8, 256, 48, 8);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const short = name.split(" ").slice(-1)[0].toUpperCase().slice(0, 10);
  ctx.fillText(short, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.5, 0.9, 1);
  return sprite;
}

function buildPlayerAvatar(name: string, teamColor: number, labelColor: string): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: teamColor });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.1, 8), mat);
  body.position.y = 0.55; body.castShadow = true;
  group.add(body);
  const headMat = new THREE.MeshLambertMaterial({ color: 0xffddbb });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), headMat);
  head.position.y = 1.38; head.castShadow = true;
  group.add(head);
  const legMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), legMat);
  lLeg.position.set(-0.14, 0, 0);
  group.add(lLeg);
  const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), legMat);
  rLeg.position.set(0.14, 0, 0);
  group.add(rLeg);
  const sprite = makeNameSprite(name, labelColor);
  sprite.position.y = 2.2;
  group.add(sprite);
  return group;
}

const FORMATION_HOME: [number, number][] = [
  [0, -30], [-8, -20], [0, -22], [8, -20],
  [-15, -10], [-5, -10], [5, -10], [15, -10],
  [-8, 2], [8, 2], [0, 6],
];
const FORMATION_AWAY: [number, number][] = [
  [0, 30], [-8, 20], [0, 22], [8, 20],
  [-15, 10], [-5, 10], [5, 10], [15, 10],
  [-8, -2], [8, -2], [0, -6],
];

export function FootballStadium3D({ players = [], onXREnter, className = "", style }: FootballStadium3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarGroupsRef = useRef<THREE.Group[]>([]);
  const avatarTargetsRef = useRef<{ x: number; z: number; angle: number }[]>([]);
  const crowdMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const startTimeRef = useRef(performance.now());
  const lastTimeRef = useRef(performance.now());
  const ballRef = useRef<THREE.Mesh | null>(null);
  const ballAngle = useRef(0);

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 55 });
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  const walkMode = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const walkPos = useRef(new THREE.Vector3(0, 1.8, 30));
  const walkYaw = useRef(0);
  const walkPitch = useRef(0);

  const [vrSupported, setVrSupported] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [xrActive, setXrActive] = useState(false);
  const [isWalk, setIsWalk] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(0);

  const buildScene = useCallback((): THREE.Scene => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    scene.fog = new THREE.Fog(0x0a0f1a, 90, 160);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff8e7, 1.1);
    sun.position.set(20, 45, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -65; sun.shadow.camera.right = 65;
    sun.shadow.camera.top = 65; sun.shadow.camera.bottom = -65;
    sun.shadow.camera.far = 130;
    scene.add(sun);
    [[-40, 35, -35], [40, 35, 35], [-40, 35, 35], [40, 35, -35]].forEach(([x, y, z]) => {
      const sl = new THREE.SpotLight(0xffffff, 0.5);
      sl.position.set(x, y, z);
      scene.add(sl);
    });

    // Pitch
    const pitch = new THREE.Mesh(new THREE.BoxGeometry(100, 0.4, 68), new THREE.MeshLambertMaterial({ color: 0x2d6a2d }));
    pitch.receiveShadow = true; pitch.position.y = -0.2; scene.add(pitch);
    for (let i = 0; i < 10; i += 2) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(10, 0.41, 68), new THREE.MeshLambertMaterial({ color: 0x256025 }));
      stripe.position.set(-45 + i * 10 + 5, 0, 0); scene.add(stripe);
    }

    // Lines
    const lm = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = (x1: number, z1: number, x2: number, z2: number) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, 0.22, z1), new THREE.Vector3(x2, 0.22, z2)]);
      scene.add(new THREE.Line(g, lm));
    };
    line(-50, -34, 50, -34); line(-50, 34, 50, 34); line(-50, -34, -50, 34); line(50, -34, 50, 34); line(0, -34, 0, 34);
    const circle = new THREE.EllipseCurve(0, 0, 9.15, 9.15, 0, Math.PI * 2, false, 0);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(circle.getPoints(64).map(p => new THREE.Vector3(p.x, 0.22, p.y))), lm));
    const goalBox = (s: number) => { line(s * 50, -20.16, s * 33.85, -20.16); line(s * 50, 20.16, s * 33.85, 20.16); line(s * 33.85, -20.16, s * 33.85, 20.16); line(s * 50, -9.16, s * 44.84, -9.16); line(s * 50, 9.16, s * 44.84, 9.16); line(s * 44.84, -9.16, s * 44.84, 9.16); };
    goalBox(1); goalBox(-1);

    // Goals
    const postMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const addGoal = (s: number) => {
      [[-3.66], [3.66]].forEach(([z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.44, 8), postMat); p.position.set(s * 50, 1.22, z); scene.add(p); });
      const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.32, 8), postMat); cb.rotation.x = Math.PI / 2; cb.position.set(s * 50, 2.44, 0); scene.add(cb);
    };
    addGoal(1); addGoal(-1);

    // Stands + Crowd
    const standData = [
      { x: 0, z: -48, rx: 0, w: 106, d: 10 },
      { x: 0, z: 48, rx: 0, w: 106, d: 10 },
      { x: -62, z: 0, rx: Math.PI / 2, w: 72, d: 10 },
      { x: 62, z: 0, rx: Math.PI / 2, w: 72, d: 10 },
    ];
    const standMat = new THREE.MeshLambertMaterial({ color: 0x131c2e });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x0e1520 });
    standData.forEach(({ x, z, rx, w, d }) => {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(w, 14, d), standMat); stand.position.set(x, 6, z); stand.rotation.y = rx; stand.receiveShadow = true; scene.add(stand);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 3, 0.6, d + 3), roofMat); roof.position.set(x, 13.3, z); roof.rotation.y = rx; scene.add(roof);
    });

    // Dynamic crowd (InstancedMesh)
    const crowdGeo = new THREE.BoxGeometry(0.4, 0.9, 0.4);
    const crowdMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const CROWD_COUNT = 1200;
    const crowdMesh = new THREE.InstancedMesh(crowdGeo, crowdMat, CROWD_COUNT);
    crowdMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const colors = new Float32Array(CROWD_COUNT * 3);
    const dummy = new THREE.Object3D();
    const crowdPositions: { x: number; y: number; z: number; base: number }[] = [];
    let ci = 0;
    const fillStand = (ox: number, oz: number, rows: number, cols: number, rotY: number, startY: number) => {
      for (let r = 0; r < rows && ci < CROWD_COUNT; r++) {
        for (let c = 0; c < cols && ci < CROWD_COUNT; c++) {
          const lx = (c - cols / 2) * 1.1;
          const ly = startY + r * 1.5;
          const cosR = Math.cos(rotY); const sinR = Math.sin(rotY);
          const wx = ox + cosR * lx; const wz = oz + sinR * lx;
          crowdPositions.push({ x: wx, y: ly, z: wz, base: ly });
          const teamColor = Math.random() > 0.5 ? [0.13, 0.78, 0.33] : [0.2, 0.45, 0.85];
          colors[ci * 3] = teamColor[0]; colors[ci * 3 + 1] = teamColor[1]; colors[ci * 3 + 2] = teamColor[2];
          dummy.position.set(wx, ly, wz); dummy.updateMatrix(); crowdMesh.setMatrixAt(ci, dummy.matrix);
          ci++;
        }
      }
    };
    fillStand(0, -43, 4, 55, 0, 1);
    fillStand(0, 43, 4, 55, 0, 1);
    fillStand(-57, 0, 4, 36, Math.PI / 2, 1);
    fillStand(57, 0, 4, 36, Math.PI / 2, 1);
    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
    crowdGeo.setAttribute("color", colorAttr);
    crowdMesh.instanceMatrix.needsUpdate = true;
    scene.add(crowdMesh);
    crowdMeshRef.current = crowdMesh;
    (crowdMesh as any).__positions = crowdPositions;

    // Floodlights
    const floodMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const lightHeadMat = new THREE.MeshLambertMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.5 });
    [[-58, -42], [58, -42], [-58, 42], [58, 42]].forEach(([x, z]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 22, 8), floodMat); pole.position.set(x, 11, z); scene.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 2), lightHeadMat); head.position.set(x, 23, z); scene.add(head);
    });

    // Ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    ball.position.set(0, 0.55, 0); ball.castShadow = true; scene.add(ball);
    ballRef.current = ball;

    return scene;
  }, []);

  const buildAvatars = useCallback((scene: THREE.Scene, playersData: StadiumPlayer[]) => {
    avatarGroupsRef.current.forEach(g => scene.remove(g));
    avatarGroupsRef.current = [];
    avatarTargetsRef.current = [];

    const home = playersData.filter(p => p.teamId && p.teamId % 2 === 0).slice(0, 11);
    const away = playersData.filter(p => !p.teamId || p.teamId % 2 !== 0).slice(0, 11);

    const fallbackNames = ["Tiến Linh", "Quang Hải", "Văn Hậu", "Công Phượng", "Duy Mạnh", "Hoàng Đức", "Tuấn Anh", "Tấn Tài", "Văn Lâm", "Quế Hải", "Bùi Tiến"];
    while (home.length < 11) home.push({ id: -home.length, name: fallbackNames[home.length % fallbackNames.length], position: "MF", rating: 75 });
    const awayNames = ["Eriksen", "Salah", "Kane", "Mbappe", "De Bruyne", "Modric", "Benzema", "Neymar", "Lewandowski", "Ronaldo", "Messi"];
    while (away.length < 11) away.push({ id: -100 - away.length, name: awayNames[away.length % awayNames.length], position: "FW", rating: 88 });

    home.forEach((p, i) => {
      const [fx, fz] = FORMATION_HOME[i] ?? [0, -25 + i * 3];
      const avatar = buildPlayerAvatar(p.name, 0x22c55e, "#4ade80");
      avatar.position.set(fx, 0, fz);
      scene.add(avatar);
      avatarGroupsRef.current.push(avatar);
      avatarTargetsRef.current.push({ x: fx, z: fz, angle: Math.random() * Math.PI * 2 });
    });
    away.forEach((p, i) => {
      const [fx, fz] = FORMATION_AWAY[i] ?? [0, 25 - i * 3];
      const avatar = buildPlayerAvatar(p.name, 0x1d4ed8, "#60a5fa");
      avatar.position.set(fx, 0, fz);
      scene.add(avatar);
      avatarGroupsRef.current.push(avatar);
      avatarTargetsRef.current.push({ x: fx, z: fz, angle: Math.random() * Math.PI * 2 });
    });
    setPlayerCount(home.length + away.length);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // WebGL pre-check
    const testCanvas = document.createElement("canvas");
    const testCtx = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!testCtx) {
      setWebglError("Trình duyệt này không hỗ trợ WebGL. Vui lòng dùng Chrome/Edge/Firefox trên thiết bị có GPU.");
      return;
    }

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    sceneRef.current = scene;

    const updateOrbitCamera = () => {
      const { theta, phi, radius } = spherical.current;
      camera.position.set(
        lookAt.current.x + radius * Math.sin(phi) * Math.sin(theta),
        lookAt.current.y + radius * Math.cos(phi),
        lookAt.current.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(lookAt.current);
    };
    updateOrbitCamera();

    // Check XR support
    if ("xr" in navigator) {
      navigator.xr?.isSessionSupported("immersive-vr").then(ok => setVrSupported(ok)).catch(() => {});
      navigator.xr?.isSessionSupported("immersive-ar").then(ok => setArSupported(ok)).catch(() => {});
    }

    // Animation loop
    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // Walk mode locomotion
      if (walkMode.current && cameraRef.current) {
        const speed = (keys.current["ShiftLeft"] || keys.current["ShiftRight"]) ? 18 : 9;
        const dir = new THREE.Vector3();
        if (keys.current["KeyW"] || keys.current["ArrowUp"]) dir.z -= 1;
        if (keys.current["KeyS"] || keys.current["ArrowDown"]) dir.z += 1;
        if (keys.current["KeyA"] || keys.current["ArrowLeft"]) dir.x -= 1;
        if (keys.current["KeyD"] || keys.current["ArrowRight"]) dir.x += 1;
        if (dir.lengthSq() > 0) {
          dir.normalize().multiplyScalar(speed * delta);
          dir.applyEuler(new THREE.Euler(0, walkYaw.current, 0));
          walkPos.current.add(dir);
          walkPos.current.x = Math.max(-60, Math.min(60, walkPos.current.x));
          walkPos.current.z = Math.max(-50, Math.min(50, walkPos.current.z));
        }
        cameraRef.current.position.copy(walkPos.current);
        cameraRef.current.rotation.order = "YXZ";
        cameraRef.current.rotation.y = walkYaw.current;
        cameraRef.current.rotation.x = walkPitch.current;
      }

      // Ball movement
      ballAngle.current += 0.01;
      if (ballRef.current) {
        ballRef.current.position.x = Math.sin(ballAngle.current) * 20;
        ballRef.current.position.z = Math.sin(ballAngle.current * 0.65) * 12;
        ballRef.current.rotation.x += 0.04;
        ballRef.current.rotation.z += 0.02;
      }

      // Avatar movement (random roaming towards targets)
      avatarGroupsRef.current.forEach((avatar, i) => {
        const tgt = avatarTargetsRef.current[i];
        if (!tgt) return;
        const dx = tgt.x - avatar.position.x;
        const dz = tgt.z - avatar.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.5) {
          const base = i < 11 ? FORMATION_HOME[i % 11] : FORMATION_AWAY[i % 11];
          tgt.x = (base?.[0] ?? 0) + (Math.random() - 0.5) * 8;
          tgt.z = (base?.[1] ?? 0) + (Math.random() - 0.5) * 8;
        } else {
          const speed = 3;
          avatar.position.x += (dx / dist) * speed * delta;
          avatar.position.z += (dz / dist) * speed * delta;
          avatar.rotation.y = Math.atan2(dx, dz);
          // Leg animation
          const legSwing = Math.sin(elapsed * 8 + i) * 0.3;
          const lLeg = avatar.children[2] as THREE.Mesh;
          const rLeg = avatar.children[3] as THREE.Mesh;
          if (lLeg) lLeg.position.y = legSwing * 0.2;
          if (rLeg) rLeg.position.y = -legSwing * 0.2;
        }
      });

      // Crowd wave animation
      if (crowdMeshRef.current) {
        const positions = (crowdMeshRef.current as any).__positions as { x: number; y: number; z: number; base: number }[];
        const dummy2 = new THREE.Object3D();
        if (positions) {
          const waveSpeed = 1.5;
          const waveLength = 20;
          let changed = false;
          positions.forEach((pos, ci) => {
            const wave = Math.sin(elapsed * waveSpeed + pos.x / waveLength + pos.z / waveLength) * 0.3;
            dummy2.position.set(pos.x, pos.base + wave, pos.z);
            dummy2.updateMatrix();
            crowdMeshRef.current!.setMatrixAt(ci, dummy2.matrix);
            changed = true;
          });
          if (changed) crowdMeshRef.current.instanceMatrix.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // Mouse/touch for orbit
    const canvas = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.005;
      const dy = (e.clientY - lastMouse.current.y) * 0.005;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      if (walkMode.current) {
        walkYaw.current -= dx * 1.2;
        walkPitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, walkPitch.current - dy * 1.2));
      } else {
        spherical.current.theta -= dx;
        spherical.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, spherical.current.phi + dy));
        updateOrbitCamera();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (walkMode.current) return;
      spherical.current.radius = Math.max(15, Math.min(95, spherical.current.radius + e.deltaY * 0.05));
      updateOrbitCamera();
    };
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: true });

    // Touch
    let touchStart: { x: number; y: number; dist: number } | null = null;
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
      else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStart = { x: 0, y: 0, dist: Math.sqrt(dx * dx + dy * dy) };
      }
    });
    canvas.addEventListener("touchmove", (e) => {
      if (!touchStart) return;
      if (e.touches.length === 1) {
        const dx = (e.touches[0].clientX - touchStart.x) * 0.005; const dy = (e.touches[0].clientY - touchStart.y) * 0.005;
        if (walkMode.current) { walkYaw.current -= dx * 1.2; walkPitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, walkPitch.current - dy * 1.2)); }
        else { spherical.current.theta -= dx; spherical.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, spherical.current.phi + dy)); updateOrbitCamera(); }
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!walkMode.current) { spherical.current.radius = Math.max(15, Math.min(95, spherical.current.radius - (dist - touchStart.dist) * 0.1)); updateOrbitCamera(); }
        touchStart.dist = dist;
      }
    });

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Resize
    const onResize = () => {
      if (!mountRef.current || !cameraRef.current) return;
      const w2 = mountRef.current.clientWidth; const h2 = mountRef.current.clientHeight || 520;
      cameraRef.current.aspect = w2 / h2; cameraRef.current.updateProjectionMatrix(); renderer.setSize(w2, h2);
      if (!walkMode.current) updateOrbitCamera();
    };
    window.addEventListener("resize", onResize);

    return () => {
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current?.contains(canvas)) mountRef.current.removeChild(canvas);
    };
  }, [buildScene]);

  // Rebuild avatars when players change
  useEffect(() => {
    if (!sceneRef.current) return;
    buildAvatars(sceneRef.current, players);
  }, [players, buildAvatars, sceneRef.current]);

  const toggleWalkMode = () => {
    const next = !walkMode.current;
    walkMode.current = next;
    setIsWalk(next);
    if (!next && cameraRef.current) {
      spherical.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 55 };
      const { theta, phi, radius } = spherical.current;
      cameraRef.current.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.rotation.set(0, 0, 0);
    } else if (next) {
      walkPos.current.set(0, 1.8, 30);
      walkYaw.current = 0;
      walkPitch.current = 0;
    }
  };

  const resetCamera = () => {
    if (walkMode.current) { walkPos.current.set(0, 1.8, 30); walkYaw.current = 0; walkPitch.current = 0; return; }
    spherical.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 55 };
    if (!cameraRef.current) return;
    const { theta, phi, radius } = spherical.current;
    cameraRef.current.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
    cameraRef.current.lookAt(0, 0, 0);
  };

  const zoom = (dir: number) => {
    if (walkMode.current) return;
    spherical.current.radius = Math.max(15, Math.min(95, spherical.current.radius + dir * 8));
    if (!cameraRef.current) return;
    const { theta, phi, radius } = spherical.current;
    cameraRef.current.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
    cameraRef.current.lookAt(0, 0, 0);
  };

  const enterVR = async () => {
    if (!rendererRef.current) return;
    try {
      const session = await navigator.xr!.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"] });
      rendererRef.current.xr.setSession(session);
      setXrActive(true);
      session.addEventListener("end", () => setXrActive(false));
      onXREnter?.("vr");
    } catch (e) { console.warn("VR not available:", e); }
  };

  const enterAR = async () => {
    if (!rendererRef.current) return;
    try {
      const session = await navigator.xr!.requestSession("immersive-ar", { optionalFeatures: ["dom-overlay", "hit-test"], domOverlay: { root: document.body } });
      rendererRef.current.xr.setSession(session);
      setXrActive(true);
      session.addEventListener("end", () => setXrActive(false));
      onXREnter?.("ar");
    } catch (e) { console.warn("AR not available:", e); }
  };

  if (webglError) {
    return (
      <div className={`relative rounded-2xl border border-border/30 bg-card/40 flex flex-col items-center justify-center text-center p-8 space-y-4 ${className}`} style={style}>
        <div className="text-4xl">🖥️</div>
        <h3 className="font-mono font-bold text-sm uppercase">WebGL Không Khả Dụng</h3>
        <p className="text-muted-foreground text-sm max-w-xs">{webglError}</p>
        <div className="flex flex-wrap gap-2 justify-center text-xs font-mono text-muted-foreground">
          {["Chrome", "Edge", "Firefox", "Safari 15+"].map(b => <span key={b} className="px-2 py-1 rounded border border-border/30">{b}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-primary/20 bg-[#0a0f1a] ${className}`} style={style}>
      <div ref={mountRef} className="w-full h-full" style={{ touchAction: "none" }} />

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <Badge className="font-mono text-[10px] bg-black/60 text-primary border-primary/30 backdrop-blur h-5">⚡ THREE.JS</Badge>
        <Badge className="font-mono text-[10px] bg-black/60 text-green-400 border-green-400/30 backdrop-blur h-5">🌐 WebXR</Badge>
        {playerCount > 0 && <Badge className="font-mono text-[10px] bg-black/60 text-yellow-400 border-yellow-400/30 backdrop-blur h-5">👥 {playerCount} cầu thủ</Badge>}
        {xrActive && <Badge className="font-mono text-[10px] bg-primary/20 text-primary border-primary/40 backdrop-blur h-5 animate-pulse">🥽 XR ACTIVE</Badge>}
        {isWalk && <Badge className="font-mono text-[10px] bg-orange-500/20 text-orange-400 border-orange-400/30 backdrop-blur h-5">🚶 WALK MODE</Badge>}
      </div>

      {/* Right controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <Button size="sm" variant="outline" onClick={toggleWalkMode} title={isWalk ? "Về orbit mode" : "Walk WASD mode"}
          className={`h-8 w-8 p-0 backdrop-blur border-white/20 ${isWalk ? "bg-orange-500/30 text-orange-300 hover:bg-orange-500/50" : "bg-black/60 text-white hover:bg-black/80"}`}>
          {isWalk ? <Eye className="w-3.5 h-3.5" /> : <Move className="w-3.5 h-3.5" />}
        </Button>
        <Button size="sm" variant="outline" onClick={resetCamera} className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur"><RotateCcw className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="outline" onClick={() => zoom(-1)} className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur"><ZoomIn className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="outline" onClick={() => zoom(1)} className="h-8 w-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 backdrop-blur"><ZoomOut className="w-3.5 h-3.5" /></Button>
      </div>

      {/* Walk mode WASD hint */}
      {isWalk && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
          <div className="flex gap-1">
            <div className="w-7 h-7 rounded bg-black/70 border border-white/20 flex items-center justify-center"><ArrowUp className="w-3 h-3 text-white/70" /></div>
          </div>
          <div className="flex gap-1">
            <div className="w-7 h-7 rounded bg-black/70 border border-white/20 flex items-center justify-center"><ArrowLeft className="w-3 h-3 text-white/70" /></div>
            <div className="w-7 h-7 rounded bg-black/70 border border-white/20 flex items-center justify-center"><ArrowDown className="w-3 h-3 text-white/70" /></div>
            <div className="w-7 h-7 rounded bg-black/70 border border-white/20 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-white/70" /></div>
          </div>
          <span className="text-[9px] text-white/40 font-mono mt-0.5">WASD / Mũi tên · Kéo chuột để nhìn · Shift tăng tốc</span>
        </div>
      )}

      {/* Bottom XR buttons */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 justify-center">
        {vrSupported
          ? <Button size="sm" onClick={enterVR} className="font-mono text-xs bg-primary/90 hover:bg-primary backdrop-blur h-9"><Glasses className="w-4 h-4 mr-1.5" />VÀO VR</Button>
          : <Button size="sm" disabled className="font-mono text-xs bg-black/60 border border-white/10 text-white/40 backdrop-blur h-9"><Glasses className="w-4 h-4 mr-1.5" />VR (Cần kính VR)</Button>
        }
        {arSupported
          ? <Button size="sm" onClick={enterAR} variant="outline" className="font-mono text-xs bg-black/60 border-primary/40 text-primary hover:bg-primary/10 backdrop-blur h-9"><MonitorSmartphone className="w-4 h-4 mr-1.5" />VÀO AR</Button>
          : <Button size="sm" disabled variant="outline" className="font-mono text-xs bg-black/40 border-white/10 text-white/40 backdrop-blur h-9"><MonitorSmartphone className="w-4 h-4 mr-1.5" />AR (Cần thiết bị)</Button>
        }
        <Button size="sm" variant="ghost" onClick={() => mountRef.current?.requestFullscreen()} className="font-mono text-xs bg-black/40 text-white/70 hover:text-white backdrop-blur h-9"><Maximize2 className="w-3.5 h-3.5 mr-1.5" />Toàn màn hình</Button>
      </div>

      <div className="absolute bottom-14 left-3 text-[9px] font-mono text-white/25">
        {isWalk ? "👁️ Walk: WASD di chuyển · Chuột nhìn xung quanh" : "🖱️ Kéo xoay · Cuộn zoom · Move⬆ Walk Mode"}
      </div>
    </div>
  );
}
