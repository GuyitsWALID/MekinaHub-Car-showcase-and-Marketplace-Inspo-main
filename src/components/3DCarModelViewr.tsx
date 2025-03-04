import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useTheme } from '@mui/material/styles';
import { Loader2 } from 'lucide-react';

interface CarModelProps {
  modelUrl?: string;
  color?: string;
  rotation?: number;
  className?: string;
}

export default function CarModel({ 
  modelUrl = '/corvtt.glb',
  color = '#0f101a',
  rotation = 0,
  className = 'h-[400px] w-full'
}: CarModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Initializing 3D scene with theme:', theme);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.palette.mode === 'dark' ? 0x111111 : 0xffffff);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    // Renderer setup with optimized settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better quality shadows
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024; // Reduced for performance
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Ground plane with grid - light blue in light mode
    const gridHelper = new THREE.GridHelper(
      10, 
      10, 
      theme.palette.mode === 'dark' ? 0x404040 : 0xb3d9ff, // Light blue in light mode
      theme.palette.mode === 'dark' ? 0x404040 : 0xb3d9ff
    );
    scene.add(gridHelper);

    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: theme.palette.mode === 'dark' ? 0x111111 : 0xe6f3ff, // Lighter blue for ground
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load GLB model with optimized settings
    const loader = new GLTFLoader();

    // Enable texture compression
    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total * 100);
      setLoadingProgress(progress);
    };
    loader.manager = manager;

    interface GLTF {
      scene: THREE.Group;
    }

    interface ProgressEvent {
      loaded: number;
      total: number;
    }

    loader.load(
      modelUrl,
      (gltf: GLTF) => {
        console.log('Model loaded successfully');
        const model = gltf.scene;

        // Calculate bounding box for scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        // Scale model to reasonable size
        const scale = 2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);

        // Position at origin
        model.position.set(0, 0, 0);

        // Keep original materials but optimize them
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Optimize materials if they exist
            if (child.material) {
              (child.material as THREE.Material).needsUpdate = true;
              (child.material as THREE.Material).side = THREE.FrontSide; // Only render front faces
            }
          }
        });

        // Apply rotation from props
        model.rotation.y = rotation * Math.PI / 180;

        scene.add(model);
        setLoading(false);
      },
      (progress: ProgressEvent) => {
        const percent = (progress.loaded / progress.total * 100);
        setLoadingProgress(percent);
        console.log('Loading progress:', percent.toFixed(2) + '%');
      },
      (error: ErrorEvent) => {
        console.error('Error loading model:', error);
        setLoading(false);
      }
    );

    // Optimized animation loop
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [color, rotation, theme, modelUrl]);

  return (
    <div className="relative" style={{ height: '100%', width: '100%' }}>
      <div ref={containerRef} className={className} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading model... {loadingProgress.toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}