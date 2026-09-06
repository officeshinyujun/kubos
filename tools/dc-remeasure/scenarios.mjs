// 시나리오 정의 — AI_Scene_Inspector_Report.md §5.1을 KUBOS 에디터가 실제로 만드는
// SceneObject 형태(mesh 필드는 한글 지오메트리 이름)로 옮긴 것.
const V = (x=0,y=0,z=0)=>({x,y,z});
const one = V(1,1,1);
const mesh = (name, m, opt={}) => ({
  name, type:'mesh', mesh:m, shader:'standard',
  locate: opt.locate ?? V(), rotate: opt.rotate ?? V(), scale: opt.scale ?? one,
  ...(opt.color !== undefined ? {color: opt.color} : {})
});
const light = (name, kind, locate=V(5,5,5)) => ({
  name, type:'light', light:kind, color:'#ffffff', intensity:1,
  locate, rotate:V(), scale:one
});
const camera = (name, locate) => ({
  name, type:'camera', camera:'perspective', fov:50,
  locate, rotate:V(), scale:one
});
const group = (name, children) => ({
  name, type:'group', children, locate:V(), rotate:V(), scale:one
});

const grid = (i, cols=10, gap=2.2) => V((i%cols - cols/2)*gap, 0, (Math.floor(i/cols) - 2)*gap);

// A — 소규모 씬: 박스 10 + 구 2, 전부 서로 다른 시그니처(색을 다르게), 방향광 1
const A = (() => {
  const objs = [];
  const palette = ['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe'];
  for (let i=0;i<10;i++) objs.push(mesh(`box-${i}`, '정육면체', {locate:grid(i), color:palette[i]}));
  objs.push(mesh('sphere-0','구',{locate:grid(10), color:'#008080'}));
  objs.push(mesh('sphere-1','구',{locate:grid(11), color:'#9a6324'}));
  objs.push(light('dir-0','directional'));
  return objs;
})();

// B — 중규모 반복 씬: 동일 박스 12 + 동일 구 8, 방향광 2
const B = (() => {
  const objs = [];
  for (let i=0;i<12;i++) objs.push(mesh(`box-${i}`, '정육면체', {locate:grid(i)}));
  for (let i=0;i<8;i++)  objs.push(mesh(`sphere-${i}`, '구', {locate:grid(12+i)}));
  objs.push(light('dir-0','directional', V(5,8,5)));
  objs.push(light('dir-1','directional', V(-5,8,-5)));
  return objs;
})();

// C — 대규모 복합 씬: 혼합 메시 52, 그룹 계층 깊이 5, 광원 6, 카메라 2
//   보고서의 "GLTF 에셋 포함"은 재현할 원본 에셋이 없어 고밀도 절차적 메시(꼬인 도넛)로 대체했다.
const C = (() => {
  const flat = [];
  let n = 0;
  for (let i=0;i<20;i++) flat.push(mesh(`box-${i}`, '정육면체', {locate:grid(n++,12,1.8)}));
  for (let i=0;i<12;i++) flat.push(mesh(`sphere-${i}`, '구', {locate:grid(n++,12,1.8)}));
  for (let i=0;i<8;i++)  flat.push(mesh(`cyl-${i}`, '원기둥', {locate:grid(n++,12,1.8)}));
  const misc = ['도넛','도넛','12면체','12면체','8면체','8면체','20면체','20면체','평면','평면'];
  misc.forEach((m,i)=> flat.push(mesh(`misc-${i}`, m, {locate:grid(n++,12,1.8)})));
  // GLTF 대체분
  flat.push(mesh('asset-0','꼬인 도넛',{locate:grid(n++,12,1.8)}));
  flat.push(mesh('asset-1','꼬인 도넛',{locate:grid(n++,12,1.8)}));

  // 앞 40개는 평면 배치, 뒤 12개는 깊이 5 계층 안으로 넣는다
  const shallow = flat.slice(0, 40);
  const deep = flat.slice(40);
  const nested = group('g1',[group('g2',[group('g3',[group('g4',[group('g5', deep)])])])]);

  return [
    ...shallow, nested,
    light('dir-0','directional', V(6,9,6)),
    light('dir-1','directional', V(-6,9,-6)),
    light('point-0','point', V(0,6,0)),
    light('point-1','point', V(6,4,-6)),
    light('point-2','point', V(-6,4,6)),
    light('amb-0','ambient'),
    camera('cam-0', V(0,6,14)),
    camera('cam-1', V(10,6,10)),
  ];
})();


// D — 보고서 그림 4가 가정한 씬을 그대로 재현: 동일 메시 50개 + 그림자 광원 1개
const D = (() => {
  const objs = [];
  for (let i=0;i<50;i++) objs.push(mesh(`box-${i}`, '정육면체', {locate:grid(i,10,1.6)}));
  objs.push(light('dir-0','directional', V(6,10,6)));
  return objs;
})();

export const SCENARIOS = { A, B, C, D };
