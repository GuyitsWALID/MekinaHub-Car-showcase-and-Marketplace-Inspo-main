
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Loader2 } from "lucide-react";

interface CarModelProps {
  modelUrl?: string;
  rotation?: number;
  className?: string;
  lightColor?: string; // tint in light mode
  darkColor?: string;  // tint in dark mode
}

export default function CarModel({
  modelUrl = "/corvtt.glb",
  rotation = 0,
  className = "h-[400px] w-full",
  lightColor = "#aebbd4",
  darkColor = "#4e89f5",
}: CarModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  // Listen for theme flips
  useEffect(() => {
    const onThemeChange = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("themeChange", onThemeChange);
    return () => {
      window.removeEventListener("themeChange", onThemeChange);
    };
  }, []);

  // Build / rebuild scene on props or theme change
  useEffect(() => {
    if (!containerRef.current) return;
    // clean up any existing canvas
    containerRef.current.innerHTML = "";

    // --- Scene & Background ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x111111 : 0xffffff);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 2, 3);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // --- Grid & Ground (per-theme) ---
    const gridColor = isDark ? 0x404040 : 0xb3d9ff;
    scene.add(new THREE.GridHelper(10, 10, gridColor, gridColor));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x111111 : 0xe6f3ff,
        roughness: 0.8,
        metalness: 0.2,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Loader & Model ---
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_, loaded, total) =>
      setLoadingProgress((loaded / total) * 100);

    const loader = new GLTFLoader(manager);
    loader.load(
      modelUrl,
      (gltf: { scene: any; }) => {
        const model = gltf.scene;

        // auto‑scale & center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const s = 2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(s);

        // apply per‑theme tint
        model.traverse((child: { castShadow: boolean; receiveShadow: boolean; material: THREE.MeshStandardMaterial; }) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mat = child.material as THREE.MeshStandardMaterial;
            mat.needsUpdate = true;
            mat.side = THREE.FrontSide;
            mat.color = new THREE.Color(isDark ? darkColor : lightColor);
          }
        });

        // initial rotation
        model.rotation.y = (rotation * Math.PI) / 180;

        scene.add(model);
        setLoading(false);
      },
      (prog: { loaded: number; total: number; }) => {
        setLoadingProgress((prog.loaded / prog.total) * 100);
      },
      (err: any) => {
        console.error("Model load error", err);
        setLoading(false);
      }
    );

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle Resize ---
    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", onResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [modelUrl, rotation, isDark, lightColor, darkColor]);

  return (
    <div className="relative" style={{ height: "100%", width: "100%" }}>
      <div ref={containerRef} className={className} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading model… {loadingProgress.toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
