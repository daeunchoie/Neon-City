// Pure data: palettes + default city (v3). No rendering code here.
export const PAL = {
  body:    [['Wine',0x2a1020],['Indigo',0x1c1a3d],['Teal',0x10353b],['Brown',0x3a2218],['Plum',0x3d1650],['Slate',0x232838]],
  win:     [['Amber',0xffb347],['Cyan',0x56f5e0],['Pink',0xff5fa8],['Lime',0xc6ff5a],['Cream',0xfff0cf],['Coral',0xff6b4a]],
  neon:    [['Hot Pink',0xff2d7a],['Cyan',0x2bf6ff],['Lime',0xa7ff2b],['Orange',0xff8a2b],['Violet',0xa66bff],['Red',0xff3b3b]],
  vehicle: [['Red',0xff3b5c],['Cyan',0x2bf6ff],['Yellow',0xffd23b],['Violet',0xa66bff],['Lime',0xa7ff2b],['White',0xe8f0ff]],
  lamp:    [['Amber',0xffb347],['Cyan',0x2bf6ff],['Pink',0xff5fa8],['White',0xfff0cf],['Lime',0xc6ff5a],['Violet',0xa66bff]],
};
export const STYLES = ['Tower', 'Pagoda', 'Shophouse', 'Block', 'Hotel', 'Curve', 'Spire'];
export const SIGNS = ['酒場', 'ホテル', '별빛', '카페', '夜市', '霓虹', '月光', '拉麺'];
export const DESIGNS = ['Idol', 'Android', 'Sun', 'Wave'];
export const MEGA_DESIGNS = ['Portrait', 'Synthwave', 'Slogan'];
export const VTYPES = ['Hovercar', 'Pod', 'Blimp', 'Drone'];
export const CSTYLES = ['Visor', 'Hood', 'Cape', 'Cyborg'];
// [name, top, middle, horizon]
export const SKIES = [['Neon Dusk',0x070a2e,0x4b1d8f,0xff5aa5],['Cyber Aurora',0x041a3a,0x2a5cd8,0xb44cff],['Crimson Haze',0x14061f,0x5a1040,0xff3a52],['Teal Dusk',0x04141f,0x0b4a6a,0x30b5a0]];

export const defaultCity = () => ({
  v: 3, sky: 0, lamp: 0,
  buildings: [
    {style:2,body:0,win:0,neon:0,sign:0,signColor:0},
    {style:4,body:1,win:1,neon:1,sign:2,signColor:1},
    {style:1,body:3,win:4,neon:3,sign:3,signColor:3},
    {style:5,body:4,win:2,neon:4,sign:6,signColor:4},
    {style:6,body:2,win:3,neon:2,sign:7,signColor:2}],
  billboards: [{design:0,color:0},{design:1,color:1}],
  mega: {design:0,color:0,text:6},
  bridge: {neon:1,car:0},
  citizens: [{style:0,color:1},{style:1,color:0},{style:2,color:4},{style:3,color:3}],
  vehicles: [{type:2,color:3},{type:0,color:0},{type:1,color:1},{type:3,color:2}],
});
