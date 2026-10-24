// Pure data: palettes + default city. No rendering code here.
export const PAL = {
  body:    [['Midnight',0x1b1740],['Violet',0x2d1b69],['Steel',0x1f3550],['Plum',0x4a1d5c],['Charcoal',0x22222e],['Teal',0x12404a]],
  win:     [['Amber',0xffc857],['Cyan',0x4df3ff],['Pink',0xff4fd8],['Lime',0xb6ff4d],['White',0xe8f0ff],['Orange',0xff8a2b]],
  neon:    [['Pink',0xff2bd6],['Cyan',0x2bf6ff],['Lime',0xa7ff2b],['Orange',0xff8a2b],['Purple',0x9b5cff],['Red',0xff3b5c]],
  vehicle: [['Red',0xff3b5c],['Cyan',0x2bf6ff],['Yellow',0xffd23b],['Violet',0x9b5cff],['Lime',0xa7ff2b],['White',0xe8f0ff]],
};
export const DESIGNS = ['Stripes', 'Sun', 'Equalizer', 'Grid'];
export const SKIES = [['Midnight',0x07041a,0x2a0b4a],['Magenta',0x12042e,0x7a1260],['Teal',0x020f1f,0x0d5560]];

export const defaultCity = () => ({
  v: 1, sky: 0,
  buildings: [
    {body:0,win:0,neon:0},{body:1,win:1,neon:1},{body:2,win:2,neon:3},{body:3,win:0,neon:4},{body:4,win:3,neon:2}],
  billboards: [{design:0,color:0},{design:1,color:1}],
  vehicles: [{color:0},{color:1},{color:2}],
});
