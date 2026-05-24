import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDesign } from '../../theme/useDesign';
import { useResultData } from './useResultData';
import { ResultDefault } from './shells/ResultDefault';
import { ResultG } from './shells/ResultG';
import { ResultI } from './shells/ResultI';
import { ResultJ } from './shells/ResultJ';
import { ResultM } from './shells/ResultM';

export function Result() {
  const data = useResultData();
  const design = useDesign();

  if (!data) return <Navigate to="/" replace />;

  switch (design) {
    case 'g':
      return <ResultG data={data} />;
    case 'i':
      return <ResultI data={data} />;
    case 'j':
      return <ResultJ data={data} />;
    case 'm':
      return <ResultM data={data} />;
    default:
      return <ResultDefault data={data} />;
  }
}
