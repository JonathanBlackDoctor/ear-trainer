import React from 'react';
import { useDesign } from '../../theme/useDesign';
import { useStatsData } from './useStatsData';
import { StatsDefault } from './shells/StatsDefault';
import { StatsG } from './shells/StatsG';
import { StatsI } from './shells/StatsI';
import { StatsJ } from './shells/StatsJ';
import { StatsM } from './shells/StatsM';

export function Stats() {
  const design = useDesign();
  const data = useStatsData();

  switch (design) {
    case 'g':
      return <StatsG data={data} />;
    case 'i':
      return <StatsI data={data} />;
    case 'j':
      return <StatsJ data={data} />;
    case 'm':
      return <StatsM data={data} />;
    default:
      return <StatsDefault data={data} />;
  }
}
