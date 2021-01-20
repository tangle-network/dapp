export type CouncilType = 'general' | 'honzon' | 'homa' | 'tech';

export interface CouncilColorConfig {
  background: string;
  backgroundActive: string;
  text: string;
  shadow: string;
}

export const CouncilsColor = new Map<CouncilType, CouncilColorConfig>([
  [
    'general',
    {
      background: 'rgba(247, 181, 0, 0.1)',
      backgroundActive: '#f7b500',
      shadow: 'rgba(247, 181, 0, 0.4)',
      text: '#f7b500'
    }
  ],
  [
    'honzon',
    {
      background: 'rgba(250, 0, 0, 0.1)',
      backgroundActive: '#fa0000',
      shadow: 'rgba(250, 0, 0, 0.4)',
      text: '#fa0000'
    }
  ],
  [
    'homa',
    {
      background: 'rgba(98, 54, 2550, 0.1)',
      backgroundActive: '#6236FF',
      shadow: 'rgba(98, 54, 255, 0.4)',
      text: '#6236FF'
    }
  ],
  [
    'tech',
    {
      background: 'rgba(143, 206, 101, 0.1)',
      backgroundActive: '#8FCE65',
      shadow: 'rgba(143, 206, 101, 0.4)',
      text: '#8FCE65'
    }
  ]
]);
