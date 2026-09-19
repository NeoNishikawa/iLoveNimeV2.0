const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function initScene() {
  const canvas = document.querySelector("#motionField");
  if (!canvas || (reducedMotion.matches && !window.desktopApp?.isDesktop)) return;
  canvas.classList.add("motion-canvas-ready");
  if (window.desktopApp?.isDesktop) return initDesktopScene(canvas);
  return initNativeScene(canvas);
}

function initNativeScene(canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  const stars = Array.from({ length: 100 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .25, a: Math.random() * .7 + .2 }));
  const orbits = [{ rx: .22, ry: .07, tilt: -.34, color: "#90ded4", speed: .22 }, { rx: .29, ry: .11, tilt: .52, color: "#b9b5ff", speed: -.14 }, { rx: .37, ry: .16, tilt: -.08, color: "#ffb45f", speed: .1 }, { rx: .46, ry: .21, tilt: .28, color: "#ff7657", speed: -.065 }];
  const resize = () => { const ratio = Math.min(window.devicePixelRatio || 1, 1.25); const box = canvas.getBoundingClientRect(); canvas.width = Math.max(1, Math.floor(box.width * ratio)); canvas.height = Math.max(1, Math.floor(box.height * ratio)); context.setTransform(ratio, 0, 0, ratio, 0, 0); };
  const draw = (time) => { const box = canvas.getBoundingClientRect(); const w = box.width; const h = box.height; const t = time * .001; context.clearRect(0, 0, w, h); context.fillStyle = "rgba(255,255,255,.7)"; stars.forEach((star) => { context.globalAlpha = star.a * (.65 + Math.sin(t * .7 + star.x * 8) * .2); context.beginPath(); context.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2); context.fill(); }); context.globalAlpha = 1; const cx = w * .61; const cy = h * .48; const scale = Math.min(w, h); orbits.forEach((orbit, index) => { context.save(); context.translate(cx, cy); context.rotate(orbit.tilt); context.strokeStyle = orbit.color; context.globalAlpha = .45; context.lineWidth = 1.2; context.beginPath(); context.ellipse(0, 0, scale * orbit.rx, scale * orbit.ry, 0, 0, Math.PI * 2); context.stroke(); const angle = t * orbit.speed + index * 1.9; context.fillStyle = orbit.color; context.globalAlpha = 1; context.beginPath(); context.arc(Math.cos(angle) * scale * orbit.rx, Math.sin(angle) * scale * orbit.ry, 4 + index, 0, Math.PI * 2); context.fill(); context.restore(); }); context.fillStyle = "#fff4cb"; context.beginPath(); context.arc(cx, cy, 11, 0, Math.PI * 2); context.fill(); requestAnimationFrame(draw); };
  resize(); window.addEventListener("resize", resize, { passive: true }); requestAnimationFrame(draw);
}

async function initDesktopScene(canvas) {
  try {
    const THREE = await import("/vendor/three/three.module.js");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "default", preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42, 1, .1, 100); camera.position.set(0, 0, 8);
    const world = new THREE.Group(); world.position.set(1.6, .15, 0); scene.add(world);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 2), new THREE.MeshBasicMaterial({ color: 0xffd36f, transparent: true, opacity: .95, wireframe: true })); world.add(core);
    const rings = []; [[1.15,.9,.16,0x90ded4],[1.6,1.05,-.42,0xb9b5ff],[2.08,1.3,.35,0xff7657],[2.55,1.5,-.18,0xffb45f]].forEach(([rx,ry,tilt,color]) => { const curve = new THREE.EllipseCurve(0,0,rx,ry,0,Math.PI*2,false,0); const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160).map((point) => new THREE.Vector3(point.x, point.y, 0))); const ring = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .78, blending: THREE.AdditiveBlending })); ring.rotation.set(tilt, tilt * .7, tilt); world.add(ring); rings.push(ring); });
    const starGeometry = new THREE.BufferGeometry(); const positions = []; for (let i=0;i<260;i+=1) positions.push((Math.random()-.5)*9,(Math.random()-.5)*6,(Math.random()-.5)*2); starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions,3)); world.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xdad7ff,size:.035,transparent:true,opacity:.86})));
    const resize = () => { const box = canvas.getBoundingClientRect(); const width = Math.max(1, box.width || window.innerWidth); const height = Math.max(1, box.height || window.innerHeight); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }; const draw = (time) => { const t = time * .001; world.rotation.y = t * .12; world.rotation.x = Math.sin(t * .16) * .08; core.rotation.x = t * .3; core.rotation.y = t * .45; rings.forEach((ring, index) => { ring.rotation.z += [.002,-.0014,.001,.0007][index]; }); renderer.render(scene, camera); requestAnimationFrame(draw); }; resize(); window.addEventListener("resize", resize, { passive: true }); requestAnimationFrame(draw);
  } catch (error) { canvas.dataset.sceneFallback = "canvas-2d"; initNativeScene(canvas); }
}
