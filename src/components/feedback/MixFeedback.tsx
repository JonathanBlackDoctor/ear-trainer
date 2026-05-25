import React from 'react';
import type { Question, MixEffect } from '../../types';
import type { MixJudgeDetails } from '../../engine/judge';
import { getMixChoices } from '../../modes/mixModes';

interface Props {
  question: Question;
  details: MixJudgeDetails;
}

const EFFECT_LABEL: Record<MixEffect, string> = {
  'eq-freq': '주파수 대역',
  'eq-boostcut': '부스트 / 컷',
  'filter': '필터',
  'compression': '컴프레션',
  'reverb-amount': '리버브 양',
  'reverb-type': '리버브 종류',
  'delay-time': '딜레이 타임',
  'pan': '팬 위치',
  'width': '스테레오 폭',
  'level': '레벨 차이',
  'distortion': '디스토션',
  'modulation': '모듈레이션',
};

export function MixFeedback({ question, details }: Props) {
  const { effect, userAnswer, correctAnswer, detail } = details;
  const isCorrect = userAnswer === correctAnswer;
  const labels: Record<string, string> = Object.fromEntries(
    getMixChoices(effect, question.level).map((c) => [c.value, c.label]),
  );

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-sm">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 text-center">
        {EFFECT_LABEL[effect]} 식별
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">정답</div>
          <div className="font-bold text-emerald-700">{labels[correctAnswer] ?? correctAnswer}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 답</div>
          <div className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {labels[userAnswer] ?? userAnswer ?? '—'}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500">{detail}</div>
    </div>
  );
}
