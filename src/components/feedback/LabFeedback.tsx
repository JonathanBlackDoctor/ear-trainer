import React from 'react';
import type { LabJudgeDetails } from '../../engine/judge';

interface Props {
  details: LabJudgeDetails;
}

const CATEGORY_LABEL: Record<LabJudgeDetails['category'], string> = {
  scale: '스케일',
  cadence: '종지',
  key: '조성',
  inversion: '전위',
  'interval-compare': '음정 크기',
  'odd-note': '틀린 음',
  contour: '멜로디 윤곽',
  tuning: '음정 정확도',
  function: '화성 기능',
  extended: '확장 화음',
  bass: '베이스',
  tension: '텐션',
};

export function LabFeedback({ details }: Props) {
  const { category, userAnswer, correctAnswer } = details;
  const isCorrect = userAnswer === correctAnswer;
  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-sm">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 text-center">
        {CATEGORY_LABEL[category]} 식별
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">정답</div>
          <div className="font-bold text-emerald-700">{correctAnswer}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 답</div>
          <div className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {userAnswer || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
