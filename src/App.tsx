import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import "./App.css";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threeRef.current) return;

    // Create the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer();
    const composer = new EffectComposer(renderer);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeRef.current.appendChild(renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Load the font
    const loader = new FontLoader();
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font: Font) => {
        // Create text geometry for 'A'
        const textGeometryA = new TextGeometry("A", {
          font: font,
          size: 1,
          depth: 0.1,
        });

        // Alphabet Material
        const alphabetMaterial = new THREE.MeshPhongMaterial({
          color: 0x98fb98,
          specular: 0xffffff,
          shininess: 50, // Kecepatan pencahayaan
        });
        const textMeshA = new THREE.Mesh(textGeometryA, alphabetMaterial);
        textMeshA.position.x = 0;
        textMeshA.position.z = 1;
        scene.add(textMeshA);

        // Create text geometry for '0'
        const textGeometry0 = new TextGeometry("5", {
          font: font,
          size: 1,
          depth: 0.1,
        });

        // Digit Material
        const digitMaterial = new THREE.MeshStandardMaterial({
          color: 0x670467,
          roughness: 0.5,
          metalness: 1,
        });
        const textMesh0 = new THREE.Mesh(textGeometry0, digitMaterial);
        textMesh0.position.x = 1; // Position closer to the cube
        textMesh0.position.z = 1;
        scene.add(textMesh0);

        // Create a glowing cube at the center with red emissive color
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Smaller cube
        const cubeMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 1, // Increase emissive intensity
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        scene.add(cube);

        // Add a point light at the cube's position with white color
        const pointLight = new THREE.PointLight(0xffffff, 25, 10); // Increase distance and change color to white
        pointLight.position.copy(cube.position);
        scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.415); // Decrease intensity
        scene.add(ambientLight);

        // Set up post-processing for bloom effect
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.1, // Increase strength
          2, // Radius
          0.85 // Threshold
        );
        composer.addPass(bloomPass);

        // Handle keydown events for interactivity
        const handleKeyDown = (event: KeyboardEvent) => {
          switch (event.key) {
            case "w":
              cube.position.y += 0.1;
              break;
            case "s":
              cube.position.y -= 0.1;
              break;
            case "9":
              cube.position.x -= 0.1;
              break;
            case "0":
              cube.position.x += 0.1;
              break;
            case "-":
              cube.position.z -= 0.1;
              break;
            case "+":
              cube.position.z += 0.1;
              break;

            case "a":
              camera.position.x += 0.1;
              break;
            case "d":
              camera.position.x -= 0.1;
              break;
          }
          // Update light position
          pointLight.position.copy(cube.position);
        };
        window.addEventListener("keydown", handleKeyDown);

        const animate = () => {
          requestAnimationFrame(animate);
          composer.render();
        };
        animate();

        return () => {
          window.removeEventListener("resize", handleResize);
          // window.removeEventListener("keydown", handleKeyDown);
          if (threeRef.current) {
            threeRef.current.removeChild(renderer.domElement);
          }
        };
      }
    );
  }, []);

  return (
    <div
      ref={threeRef}
      style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}
    ></div>
  );
}

export default App;
