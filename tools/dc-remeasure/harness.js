// KUBOS Draw Call 재측정 하네스
// engine/drawCallAnalyzer.ts 의 추정값과 실제 renderer.info.render.calls 를 나란히 잰다.
// 사용법: 저장소 루트에서  node tools/dc-remeasure/serve.mjs  → 브라우저로 안내된 주소 열기
import * as THREE from '/node_modules/three/build/three.module.min.js';

const W = 1280, H = 720;

// components/Work/model/GeometryFactory/index.tsx 의 인자를 그대로 옮긴 것
function makeGeometry(name) {
  switch (name) {
    case '정육면체':  return new THREE.BoxGeometry(1, 1, 1);
    case '구':        return new THREE.SphereGeometry(1, 32, 32);
    case '평면':      return new THREE.PlaneGeometry(1, 1);
    case '원판':      return new THREE.CircleGeometry(1, 32);
    case '원기둥':    return new THREE.CylinderGeometry(1, 1, 2, 32);
    case '도넛':      return new THREE.TorusGeometry(1, 0.3, 16, 100);
    case '꼬인 도넛': return new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    case '12면체':    return new THREE.DodecahedronGeometry(1);
    case '8면체':     return new THREE.OctahedronGeometry(1);
    case '20면체':    return new THREE.IcosahedronGeometry(1);
    default:          return new THREE.BoxGeometry(1, 1, 1);
  }
}
// components/Work/model/MaterialFactory/index.tsx: shader 'standard', color 기본 #ffffff
const makeMaterial = (o) =>
  new THREE.MeshStandardMaterial({ color: o.color ?? '#ffffff', metalness: 0, roughness: 1 });

const flat = (objs, kind, out = []) => {
  for (const o of objs) {
    if (o.type === kind) out.push(o);
    else if (o.type === 'group') flat(o.children, kind, out);
  }
  return out;
};

function addLights(scene, objs) {
  for (const l of flat(objs, 'light')) {
    let n = null;
    if (l.light === 'ambient') n = new THREE.AmbientLight(l.color, l.intensity);
    else if (l.light === 'directional') n = new THREE.DirectionalLight(l.color, l.intensity);
    else if (l.light === 'point') n = new THREE.PointLight(l.color, l.intensity);
    else if (l.light === 'spot') n = new THREE.SpotLight(l.color, l.intensity, undefined, l.angle ?? 0.1);
    if (!n) continue;
    n.position.set(l.locate.x, l.locate.y, l.locate.z);
    // KUBOS 는 그림자를 켜지 않는다: Canvas 에 shadows 없음, 메시에 castShadow 없음
    scene.add(n);
  }
}

function geoBytes(g) {
  let b = 0;
  for (const k of ['position', 'normal', 'uv']) if (g.attributes[k]) b += g.attributes[k].array.byteLength;
  if (g.index) b += g.index.array.byteLength;
  return b;
}
const place = (n, o) => {
  n.position.set(o.locate.x, o.locate.y, o.locate.z);
  n.rotation.set(o.rotate.x, o.rotate.y, o.rotate.z);
  n.scale.set(o.scale.x, o.scale.y, o.scale.z);
};

function buildBefore(objs) {
  const scene = new THREE.Scene(); let bytes = 0;
  for (const m of flat(objs, 'mesh')) {
    const g = makeGeometry(m.mesh); bytes += geoBytes(g);
    const mesh = new THREE.Mesh(g, makeMaterial(m)); place(mesh, m); scene.add(mesh);
  }
  addLights(scene, objs);
  return { scene, bytes };
}

function buildAfter(objs, candidates) {
  const scene = new THREE.Scene(); let bytes = 0;
  const done = new Set();
  for (const c of candidates) for (const i of c.instances) done.add(i.name);

  for (const c of candidates) {
    const g = makeGeometry(c.geometryType); bytes += geoBytes(g);
    const mat = new THREE.MeshStandardMaterial({
      color: c.color === 'default-color' ? '#ffffff' : c.color, metalness: 0, roughness: 1 });
    const im = new THREE.InstancedMesh(g, mat, c.instances.length);
    const mtx = new THREE.Matrix4(), p = new THREE.Vector3(), e = new THREE.Euler(),
          q = new THREE.Quaternion(), s = new THREE.Vector3();
    c.instances.forEach((inst, i) => {
      p.set(...inst.position); e.set(...inst.rotation); q.setFromEuler(e); s.set(...inst.scale);
      mtx.compose(p, q, s); im.setMatrixAt(i, mtx);
    });
    im.instanceMatrix.needsUpdate = true;
    bytes += im.instanceMatrix.array.byteLength; // 인스턴스 행렬도 GPU 로 올라간다
    scene.add(im);
  }
  for (const m of flat(objs, 'mesh')) {
    if (done.has(m.name)) continue;
    const g = makeGeometry(m.mesh); bytes += geoBytes(g);
    const mesh = new THREE.Mesh(g, makeMaterial(m)); place(mesh, m); scene.add(mesh);
  }
  addLights(scene, objs);
  return { scene, bytes };
}

const shot = (r, sc, cam) => { r.info.reset(); r.render(sc, cam); return r.info.render.calls; };

export async function run(DATA) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
  cam.position.set(0, 14, 26); cam.lookAt(0, 0, 0);

  const gl = renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const env = {
    three: THREE.REVISION,
    gl: gl.getParameter(gl.VERSION),
    gpu: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a',
    viewport: `${W}x${H}`,
    ua: navigator.userAgent,
  };

  const rows = [];
  for (const [key, objs] of Object.entries(DATA.scenarios)) {
    const cands = DATA.candidates[key];
    const before = buildBefore(objs), after = buildAfter(objs, cands);
    for (let i = 0; i < 3; i++) { renderer.render(before.scene, cam); renderer.render(after.scene, cam); }
    const b = [], a = [];
    for (let i = 0; i < 5; i++) { b.push(shot(renderer, before.scene, cam)); a.push(shot(renderer, after.scene, cam)); }
    const med = (x) => [...x].sort((p, q) => p - q)[Math.floor(x.length / 2)];
    rows.push({
      key,
      meshes: flat(objs, 'mesh').length,
      lights: flat(objs, 'light').length,
      est: DATA.analysis[key].estimatedDrawCalls,
      estAfter: DATA.analysis[key].optimizedEstimate,
      estSavings: DATA.analysis[key].savings,
      before: med(b), after: med(a),
      bytesBefore: before.bytes, bytesAfter: after.bytes,
      samples: { before: b, after: a },
    });
  }
  return { env, rows };
}
