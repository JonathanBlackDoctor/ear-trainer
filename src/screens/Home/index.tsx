import React from 'react';
import { useDesign } from '../../theme/useDesign';
import { useHomeData } from './useHomeData';
import { HomeDefault } from './shells/HomeDefault';
import { HomeG } from './shells/HomeG';
import { HomeI } from './shells/HomeI';
import { HomeJ } from './shells/HomeJ';
import { HomeM } from './shells/HomeM';

// Picks the per-direction Home shell from the active design theme. `default`
// keeps the original classic layout untouched.
export function Home() {
  const design = useDesign();
  const data = useHomeData();

  switch (design) {
    case 'g':
      return <HomeG data={data} />;
    case 'i':
      return <HomeI data={data} />;
    case 'j':
      return <HomeJ data={data} />;
    case 'm':
      return <HomeM data={data} />;
    default:
      return <HomeDefault data={data} />;
  }
}
