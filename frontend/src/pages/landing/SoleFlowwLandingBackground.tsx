import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import heroSneakerImg from '../../assets/images/hero-3d-sneaker-crisp.png';

interface SoleFlowwLandingBackgroundProps {
  className?: string;
}

/**
 * SoleFlowwLandingBackground
 *
 * A continuous, premium, full-page 3D footwear ecosystem background for the SoleFlow landing page.
 *
 * Features:
 * - Mounted once at the landing-page root; spans from navbar & hero all the way to the footer.
 * - Multi-depth footwear 3D universe: flagship athletic sneaker, secondary runners,
 *   wholesale shoe cartons with overhanging lids and B2B label decals, and flowing order-flow logistics curves.
 * - Scroll-linked camera glide: as the user scrolls down through the sections (Hero -> Features ->
 *   Product View -> Calculator -> Process -> Types -> FAQ -> CTA -> Footer), the camera glides smoothly
 *   through the 3D space with continuous visual continuity.
 * - Interactive mouse parallax with smooth lerp damping.
 * - Ambient micro-particle field with soft upward buoyancy.
 * - Mobile performance scaling and prefers-reduced-motion static fallback.
 * - Completely non-blocking (pointer-events: none, aria-hidden="true").
 */
export const SoleFlowwLandingBackground: React.FC<SoleFlowwLandingBackgroundProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Accessibility: Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Mobile & Tablet Scaling
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    // 3. Scene, Camera & Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.5));
    renderer.setClearColor(0x000000, 0); // Transparent canvas
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    // 4. Studio Footwear Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.8); // Crisp Sky-Blue Key
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.5); // Warm Amber Dispatch Rim
    rimLight.position.set(-8, -6, -4);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x06b6d4, 2.2, 35); // Cyan product accent
    accentLight.position.set(4, 2, 4);
    scene.add(accentLight);

    // 5. Memory Disposables Register
    const disposables: {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
      texture?: THREE.Texture;
    }[] = [];

    const registerDisposable = (item: {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
      texture?: THREE.Texture;
    }) => {
      disposables.push(item);
    };

    // 6. PROCEDURAL 3D SNEAKER BUILDER
    const createProceduralSneaker = (options: {
      scale?: number;
      accentColor?: number;
      upperColor?: number;
      soleColor?: number;
    }) => {
      const group = new THREE.Group();
      const s = options.scale || 1;
      const accent = options.accentColor || 0x38bdf8;
      const upperCol = options.upperColor || 0x1e293b;
      const soleCol = options.soleColor || 0xf8fafc;

      // Sole / Midsole
      const soleShape = new THREE.Shape();
      soleShape.moveTo(-1.6, -0.4);
      soleShape.lineTo(1.6, -0.4);
      soleShape.quadraticCurveTo(1.8, -0.2, 1.7, 0.0);
      soleShape.quadraticCurveTo(0.6, 0.05, -0.4, 0.0);
      soleShape.quadraticCurveTo(-1.2, 0.15, -1.6, 0.1);
      soleShape.lineTo(-1.6, -0.4);

      const soleGeo = new THREE.ExtrudeGeometry(soleShape, {
        depth: 0.9,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08,
      });
      soleGeo.center();
      const soleMat = new THREE.MeshStandardMaterial({
        color: soleCol,
        roughness: 0.35,
        metalness: 0.1,
      });
      registerDisposable({ geometry: soleGeo, material: soleMat });
      const soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, -0.3, 0);
      group.add(soleMesh);

      // Midsole Stripe
      const stripeGeo = new THREE.BoxGeometry(3.0, 0.07, 0.96);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: accent,
        roughness: 0.3,
        metalness: 0.4,
        emissive: accent,
        emissiveIntensity: 0.35,
      });
      registerDisposable({ geometry: stripeGeo, material: stripeMat });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.position.set(0.05, -0.32, 0);
      group.add(stripeMesh);

      // Upper Mesh
      const upperShape = new THREE.Shape();
      upperShape.moveTo(-1.5, -0.1);
      upperShape.lineTo(1.5, -0.1);
      upperShape.quadraticCurveTo(1.4, 0.4, 0.7, 0.55);
      upperShape.lineTo(0.1, 0.85);
      upperShape.quadraticCurveTo(-0.4, 0.95, -0.8, 0.65);
      upperShape.quadraticCurveTo(-1.4, 0.5, -1.5, -0.1);
      upperShape.lineTo(-1.5, -0.1);

      const upperGeo = new THREE.ExtrudeGeometry(upperShape, {
        depth: 0.8,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 2,
        bevelSize: 0.07,
        bevelThickness: 0.07,
      });
      upperGeo.center();
      const upperMat = new THREE.MeshStandardMaterial({
        color: upperCol,
        roughness: 0.65,
        metalness: 0.15,
      });
      registerDisposable({ geometry: upperGeo, material: upperMat });
      const upperMesh = new THREE.Mesh(upperGeo, upperMat);
      upperMesh.position.set(0, 0.22, 0);
      group.add(upperMesh);

      // TPU Heel Clip
      const heelGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.45, 16, 1, true, -Math.PI / 2, Math.PI);
      const heelMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.8,
        roughness: 0.25,
      });
      registerDisposable({ geometry: heelGeo, material: heelMat });
      const heelMesh = new THREE.Mesh(heelGeo, heelMat);
      heelMesh.rotation.y = Math.PI / 2;
      heelMesh.position.set(-1.0, 0.1, 0);
      group.add(heelMesh);

      // Lateral Brand Flash
      const flashGeo = new THREE.BoxGeometry(0.8, 0.12, 0.86);
      const flashMat = new THREE.MeshStandardMaterial({
        color: accent,
        roughness: 0.2,
        metalness: 0.5,
        emissive: accent,
        emissiveIntensity: 0.5,
      });
      registerDisposable({ geometry: flashGeo, material: flashMat });
      const flashMesh = new THREE.Mesh(flashGeo, flashMat);
      flashMesh.rotation.z = -0.35;
      flashMesh.position.set(0.1, 0.3, 0);
      group.add(flashMesh);

      group.scale.set(s, s, s);
      return group;
    };

    // 7. 3D FOOTWEAR INVENTORY CARTON BUILDER (Wholesale Packing Carton)
    const createShoeBox = (options: {
      scale?: number;
      boxColor?: number;
      lidColor?: number;
      accentColor?: number;
    }) => {
      const group = new THREE.Group();
      const s = options.scale || 1;
      const boxCol = options.boxColor || 0x0f172a;
      const lidCol = options.lidColor || 0x1e293b;
      const accent = options.accentColor || 0x38bdf8;

      const boxGeo = new THREE.BoxGeometry(2.2, 1.1, 1.4);
      const boxMat = new THREE.MeshStandardMaterial({
        color: boxCol,
        roughness: 0.5,
        metalness: 0.2,
      });
      registerDisposable({ geometry: boxGeo, material: boxMat });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      group.add(boxMesh);

      const lidGeo = new THREE.BoxGeometry(2.3, 0.28, 1.5);
      const lidMat = new THREE.MeshStandardMaterial({
        color: lidCol,
        roughness: 0.4,
        metalness: 0.25,
      });
      registerDisposable({ geometry: lidGeo, material: lidMat });
      const lidMesh = new THREE.Mesh(lidGeo, lidMat);
      lidMesh.position.set(0, 0.55, 0);
      group.add(lidMesh);

      // Shipping Decal
      const labelGeo = new THREE.PlaneGeometry(0.8, 0.35);
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
      });
      registerDisposable({ geometry: labelGeo, material: labelMat });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(0.3, 0, 0.71);
      group.add(labelMesh);

      // Lid Accent Stripe
      const stripeGeo = new THREE.BoxGeometry(2.32, 0.04, 1.52);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.4,
      });
      registerDisposable({ geometry: stripeGeo, material: stripeMat });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.position.set(0, 0.65, 0);
      group.add(stripeMesh);

      group.scale.set(s, s, s);
      return group;
    };

    // 8. TEXTURED HERO SNEAKER (Upper Landing Page Depth - Hero Zone)
    const textureLoader = new THREE.TextureLoader();
    const heroSneakerGroup = new THREE.Group();
    scene.add(heroSneakerGroup);

    textureLoader.load(
      heroSneakerImg,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        const planeGeo = new THREE.PlaneGeometry(4.6, 2.8);
        const planeMat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.02,
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        registerDisposable({ geometry: planeGeo, material: planeMat, texture });

        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        heroSneakerGroup.add(planeMesh);

        // Soft backlight glow
        const glowGeo = new THREE.PlaneGeometry(5.0, 3.0);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.14,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        registerDisposable({ geometry: glowGeo, material: glowMat });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.z = -0.15;
        heroSneakerGroup.add(glowMesh);
      },
      undefined,
      (err) => {
        console.warn('SoleFloww Landing Background: Hero sneaker texture fallback', err);
      }
    );

    heroSneakerGroup.position.set(isMobile ? 1.0 : 4.5, isMobile ? -0.8 : 0.4, -1.0);
    heroSneakerGroup.rotation.set(0.12, -0.3, 0.05);

    // 9. VERTICALLY DISTRIBUTED 3D FOOTWEAR OBJECTS ACROSS THE ENTIRE PAGE
    // Zone 1: Hero & Features (Y = 1.0 down to -4.0)
    const shoeHeroUpper = createProceduralSneaker({
      scale: 0.72,
      accentColor: 0x06b6d4,
      upperColor: 0x1e3a8a,
      soleColor: 0xffffff,
    });
    shoeHeroUpper.position.set(5.5, 3.2, -4.5);
    shoeHeroUpper.rotation.set(0.2, -0.8, -0.15);
    scene.add(shoeHeroUpper);

    const boxHero = createShoeBox({
      scale: 0.85,
      boxColor: 0x091428,
      lidColor: 0x172554,
      accentColor: 0x38bdf8,
    });
    boxHero.position.set(isMobile ? 2.0 : 6.8, -2.4, -3.0);
    boxHero.rotation.set(0.3, -0.5, 0.15);
    scene.add(boxHero);

    // Zone 2: Product View & Wholesale Calculator (Y = -5.0 down to -10.0)
    const shoeMidPage = createProceduralSneaker({
      scale: 0.8,
      accentColor: 0x38bdf8,
      upperColor: 0x0f172a,
      soleColor: 0xf1f5f9,
    });
    shoeMidPage.position.set(-6.0, -6.5, -4.0);
    shoeMidPage.rotation.set(-0.15, 0.85, 0.18);
    scene.add(shoeMidPage);

    const boxMidPage = createShoeBox({
      scale: 0.75,
      boxColor: 0x1e293b,
      lidColor: 0x334155,
      accentColor: 0x10b981,
    });
    boxMidPage.position.set(6.4, -8.5, -3.5);
    boxMidPage.rotation.set(0.25, -0.6, 0.1);
    scene.add(boxMidPage);

    // Zone 3: How SoleFlow Works & Business Types (Y = -11.0 down to -16.0)
    const shoeLowerPage = createProceduralSneaker({
      scale: 0.75,
      accentColor: 0xf59e0b,
      upperColor: 0x1e1b4b,
      soleColor: 0xffffff,
    });
    shoeLowerPage.position.set(5.8, -13.5, -4.2);
    shoeLowerPage.rotation.set(0.18, -0.9, -0.1);
    if (!isMobile) scene.add(shoeLowerPage);

    const boxLowerPage = createShoeBox({
      scale: 0.8,
      boxColor: 0x0f172a,
      lidColor: 0x1e293b,
      accentColor: 0xf59e0b,
    });
    boxLowerPage.position.set(-6.2, -15.5, -3.8);
    boxLowerPage.rotation.set(-0.2, 0.65, -0.15);
    scene.add(boxLowerPage);

    // Zone 4: FAQ, Final CTA & Footer (Y = -17.0 down to -23.0)
    const shoeFooterZone = createProceduralSneaker({
      scale: 0.82,
      accentColor: 0x06b6d4,
      upperColor: 0x091428,
      soleColor: 0xf8fafc,
    });
    shoeFooterZone.position.set(-5.6, -20.5, -4.5);
    shoeFooterZone.rotation.set(-0.1, 0.75, 0.15);
    scene.add(shoeFooterZone);

    const boxFooterZone = createShoeBox({
      scale: 0.9,
      boxColor: 0x091428,
      lidColor: 0x1e293b,
      accentColor: 0x38bdf8,
    });
    boxFooterZone.position.set(6.0, -22.5, -3.5);
    boxFooterZone.rotation.set(0.22, -0.5, 0.12);
    scene.add(boxFooterZone);

    // 10. CONTINUOUS FULL-PAGE ORDER FLOW MOTION TRAILS (Spanning top to footer)
    // Sinuous spline descending through all sections
    const flowCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 3.5, -6),
      new THREE.Vector3(-3, 1.0, -4),
      new THREE.Vector3(4, -1.5, -3),
      new THREE.Vector3(7, -5.5, -5),
      new THREE.Vector3(2, -9.0, -4),
      new THREE.Vector3(-6, -13.0, -5),
      new THREE.Vector3(4, -17.5, -4),
      new THREE.Vector3(7, -21.0, -5),
      new THREE.Vector3(0, -24.5, -6),
    ]);

    const flowCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(7, 2.0, -5),
      new THREE.Vector3(2, -3.0, -4),
      new THREE.Vector3(-5, -7.5, -5),
      new THREE.Vector3(-2, -11.5, -4),
      new THREE.Vector3(5, -15.0, -5),
      new THREE.Vector3(-4, -19.0, -4),
      new THREE.Vector3(2, -23.0, -5),
    ]);

    const createTrailLine = (curve: THREE.CatmullRomCurve3, color: number) => {
      const points = curve.getPoints(120);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      registerDisposable({ geometry: lineGeo, material: lineMat });
      return new THREE.Line(lineGeo, lineMat);
    };

    scene.add(createTrailLine(flowCurve1, 0x38bdf8));
    if (!isMobile) scene.add(createTrailLine(flowCurve2, 0x06b6d4));

    // Traveling glowing energy packets along the order flow paths
    const nodeCount = isMobile ? 4 : 8;
    const orderNodes: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      speed: number;
      offset: number;
    }[] = [];

    const nodeGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    registerDisposable({ geometry: nodeGeo, material: nodeMat });

    for (let i = 0; i < nodeCount; i++) {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      const chosenCurve = i % 2 === 0 ? flowCurve1 : flowCurve2;
      const speed = 0.025 + (i * 0.008);
      const offset = i / nodeCount;
      scene.add(nodeMesh);
      orderNodes.push({ mesh: nodeMesh, curve: chosenCurve, speed, offset });
    }

    // 11. AMBIENT DEPTH PARTICLES (Distributed from top Y = 6 down to Y = -26)
    const particleCount = isMobile ? 55 : isTablet ? 90 : 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = 6 - (Math.random() * 32); // Covers full Y span from +6 to -26
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: Math.random() * 0.003 + 0.0015,
        z: (Math.random() - 0.5) * 0.002,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: isMobile ? 0.06 : 0.08,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    registerDisposable({ geometry: particleGeo, material: particleMat });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 12. SCROLL & MOUSE PARALLAX TRACKING
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        targetScrollProgress = Math.max(0, Math.min(1, window.scrollY / docHeight));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraX = mouseX * 0.6;
      targetCameraY = mouseY * 0.35;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 13. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.2 : 1.5));
    };

    window.addEventListener('resize', handleResize);

    // 14. ANIMATION & RENDER LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clock.getDelta();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // If reduced motion is requested, render static scene with single frame
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      // Smooth scroll lerp
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;

      // Scroll glides camera Y position from 0 (top/hero) down to -22 (footer)
      const targetBaseY = -currentScrollProgress * 22;

      // Smooth camera parallax
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += ((targetBaseY + targetCameraY) - camera.position.y) * 0.04;
      camera.lookAt(0, camera.position.y, 0);

      // Accent light follows camera descent
      accentLight.position.y = camera.position.y + 2 + Math.cos(elapsedTime * 0.6) * 1.5;
      accentLight.position.x = 4 + Math.sin(elapsedTime * 0.8) * 1.8;

      // 1. Floating Hero Sneaker (Zone 1)
      const floatY = Math.sin(elapsedTime * 1.2) * 0.16;
      heroSneakerGroup.position.y = (isMobile ? -0.8 : 0.4) + floatY;
      heroSneakerGroup.rotation.z = 0.05 + Math.cos(elapsedTime * 0.9) * 0.03;
      heroSneakerGroup.rotation.y = -0.3 + Math.sin(elapsedTime * 0.7) * 0.05 + (mouseX * 0.06);

      // Secondary hero sneaker
      shoeHeroUpper.rotation.y += delta * 0.2;
      shoeHeroUpper.position.y = 3.2 + Math.sin(elapsedTime * 0.85 + 1.2) * 0.14;

      // Hero box
      boxHero.rotation.y += delta * 0.14;
      boxHero.position.y = -2.4 + Math.sin(elapsedTime * 0.9 + 2.0) * 0.12;

      // 2. Mid Page Objects (Zone 2: Products & Calculator)
      shoeMidPage.rotation.y -= delta * 0.18;
      shoeMidPage.position.y = -6.5 + Math.cos(elapsedTime * 0.95) * 0.15;

      boxMidPage.rotation.y += delta * 0.12;
      boxMidPage.position.y = -8.5 + Math.sin(elapsedTime * 0.75 + 1.0) * 0.14;

      // 3. Lower Page Objects (Zone 3: Process & Business Types)
      if (!isMobile) {
        shoeLowerPage.rotation.y += delta * 0.16;
        shoeLowerPage.position.y = -13.5 + Math.sin(elapsedTime * 0.9 + 0.5) * 0.15;
      }

      boxLowerPage.rotation.y -= delta * 0.14;
      boxLowerPage.position.y = -15.5 + Math.cos(elapsedTime * 0.8 + 1.8) * 0.13;

      // 4. Footer Zone Objects (Zone 4: FAQ & Footer)
      shoeFooterZone.rotation.y -= delta * 0.15;
      shoeFooterZone.position.y = -20.5 + Math.cos(elapsedTime * 1.05) * 0.14;

      boxFooterZone.rotation.y += delta * 0.16;
      boxFooterZone.position.y = -22.5 + Math.sin(elapsedTime * 0.85 + 2.2) * 0.15;

      // 5. Update Order Flow Traveling Nodes
      for (const node of orderNodes) {
        const t = ((elapsedTime * node.speed) + node.offset) % 1;
        const pos = node.curve.getPointAt(t);
        node.mesh.position.copy(pos);
      }

      // 6. Update Ambient Micro-Particles
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        positions[i * 3 + 1] += vel.y;
        positions[i * 3] += vel.x;

        // Reset if drifted beyond top
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = -26;
          positions[i * 3] = (Math.random() - 0.5) * 22;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 15. RESOURCE CLEANUP & DISPOSAL
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      disposables.forEach(({ geometry, material, texture }) => {
        if (geometry) geometry.dispose();
        if (texture) texture.dispose();
        if (material) {
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material.dispose();
          }
        }
      });

      scene.clear();
      renderer.dispose();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        zIndex: 1, // Sits directly behind page content (relative z-10) and over base background
        touchAction: 'none',
      }}
      aria-hidden="true"
    />
  );
};

