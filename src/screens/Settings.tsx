import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from '../store/useToast';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { refreshToLatest } from '../sw-update';
import { MODE_REGISTRY, resolveModeOrder } from '../modes/registry';
import type { ModeKey } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetData, exportData, importData } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { canInstall, isStandalone, isIOS, promptInstall } = usePwaInstall();

  async function handleRefresh() {
    setRefreshing(true);
    toast.info('최신 버전을 확인하고 있어요…');
    try {
      await refreshToLatest();
    } catch {
      setRefreshing(false);
      toast.error('새로고침에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function handleInstall() {
    if (isIOS) {
      toast.info("Safari 하단의 공유 메뉴를 눌러 '홈 화면에 추가'를 선택해 주세요.", 6000);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === 'accepted') toast.success('앱 설치가 시작되었어요.');
    else if (outcome === 'unavailable') {
      toast.info('지금은 설치할 수 없어요. 브라우저 메뉴에서 설치를 시도해 보세요.', 5000);
    }
  }

  function handleExport() {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ear-trainer-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('백업 파일을 내려받았습니다.');
    } catch {
      toast.error('백업 파일을 만들지 못했습니다.');
    }
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const ok = importData(json);
      if (ok) toast.success('데이터 가져오기를 완료했어요.');
      else toast.error('파일 형식이 올바르지 않습니다.');
    };
    reader.onerror = () => toast.error('파일을 읽지 못했습니다.');
    reader.readAsText(file);
    // input value 초기화 — 같은 파일 다시 선택 시에도 onChange 트리거되게.
    e.target.value = '';
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      // 5초 안에 한 번 더 누르면 실행 — 모달 없이 안전한 더블 컨펌.
      window.setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    resetData();
    setConfirmReset(false);
    toast.success('학습 기록을 초기화했습니다.');
  }

  const modeOrder = resolveModeOrder(settings.modeOrder);
  function moveMode(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= modeOrder.length) return;
    const next = [...modeOrder];
    [next[index], next[target]] = [next[target], next[index]];
    updateSettings({ modeOrder: next });
  }
  function resetModeOrder() {
    updateSettings({ modeOrder: undefined });
    toast.success('훈련 순서를 기본값으로 되돌렸어요.');
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost focus-ring" onClick={() => navigate('/')} aria-label="홈으로 돌아가기">← 뒤로</button>
          <h1 className="font-semibold text-slate-700">⚙️ 설정</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-4">
        {/* App update — force-fetch the latest deployed build. */}
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-600">최신 버전으로 새로고침</div>
              <div className="text-xs text-slate-400 mt-0.5">
                업데이트가 배포되었다면 즉시 받아옵니다.
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary text-sm whitespace-nowrap focus-ring disabled:opacity-60"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '확인 중…' : '🔄 새로고침'}
            </button>
          </div>
        </div>

        {/* PWA install — standalone 모드에서는 숨김. 그 외엔 항상 노출하고
            네이티브 프롬프트가 아직 준비되지 않았으면 click 시 안내한다. */}
        {!isStandalone && (
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-600">앱으로 설치</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isIOS
                    ? '홈 화면에 추가하면 앱처럼 빠르게 열려요.'
                    : '홈 화면/시작 메뉴에 추가하고 오프라인에서 사용해요.'}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary text-sm whitespace-nowrap focus-ring"
                onClick={handleInstall}
              >
                📲 앱으로 설치
              </button>
            </div>
          </div>
        )}

        {/* Notation */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">코드 표기 방식</div>
          <div className="flex gap-2">
            {[
              { value: 'number', label: '넘버 (1, 4, 5)' },
              { value: 'roman', label: '로마 (I, IV, V)' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  settings.notation === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => updateSettings({ notation: opt.value as 'number' | 'roman' })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Training order — reorder the mode cards on the Home screen */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold text-slate-600">훈련 순서</div>
            <button
              type="button"
              className="text-xs text-primary-600 font-semibold focus-ring"
              onClick={resetModeOrder}
            >
              기본값
            </button>
          </div>
          <div className="text-xs text-slate-400 mb-3">
            홈 화면에 표시되는 훈련 카드의 순서를 바꿉니다.
          </div>
          <ul className="space-y-1.5">
            {modeOrder.map((key, i) => {
              const info = MODE_REGISTRY[key as ModeKey];
              if (!info) return null;
              return (
                <li
                  key={key}
                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                >
                  <span className="text-lg" aria-hidden>{info.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700 leading-tight">
                    {info.name}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-400 w-5 text-right">{i + 1}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 focus-ring active:scale-95"
                    onClick={() => moveMode(i, -1)}
                    disabled={i === 0}
                    aria-label={`${info.name} 위로`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 focus-ring active:scale-95"
                    onClick={() => moveMode(i, 1)}
                    disabled={i === modeOrder.length - 1}
                    aria-label={`${info.name} 아래로`}
                  >
                    ↓
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reference tone */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">기준음 재생</div>
          <div className="flex flex-col gap-2">
            {[
              { value: 'off', label: '끄기' },
              { value: 'perQuestion', label: '매 문제마다' },
              { value: 'perSession', label: '세션 시작 시 1회' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`py-2 px-4 rounded-lg text-sm font-semibold text-left transition-colors ${
                  settings.referenceTone === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => updateSettings({ referenceTone: opt.value as any })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key mode */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">조성 설정</div>
          <div className="flex gap-2 mb-3">
            {[
              { value: 'random', label: '무작위' },
              { value: 'fixed', label: '고정' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  settings.keyMode === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => updateSettings({ keyMode: opt.value as any })}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {settings.keyMode === 'fixed' && (
            <div className="grid grid-cols-4 gap-2">
              {['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'Ab'].map((k) => (
                <button
                  key={k}
                  className={`py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    settings.fixedKey === k
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => updateSettings({ fixedKey: k })}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Questions per session */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            세션 문항 수: <span className="text-primary-600 font-bold">{settings.questionsPerSession}</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={settings.questionsPerSession}
            onChange={(e) => updateSettings({ questionsPerSession: Number(e.target.value) })}
            className="w-full accent-primary-600"
            aria-label="세션 문항 수"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
          </div>
        </div>

        {/* Weak-session length */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">
            약점 집중 세션 문항 수: <span className="text-accent-600 font-bold">{settings.weakSessionLength}</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={5}
            value={settings.weakSessionLength}
            onChange={(e) => updateSettings({ weakSessionLength: Number(e.target.value) })}
            className="w-full accent-accent-500"
            aria-label="약점 집중 세션 문항 수"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5</span><span>10</span><span>15</span><span>20</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            홈 화면에서 약점 항목을 누르면 이 길이만큼 집중 연습합니다.
          </p>
        </div>

        {/* Difficulty */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">난이도 모드</div>
          <div className="flex gap-2">
            {[
              { value: 'adaptive', label: '🤖 자동(적응형)' },
              { value: 'manual', label: '✋ 수동 선택' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  settings.difficultyMode === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => updateSettings({ difficultyMode: opt.value as any })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff feedback */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-600">악보 피드백</div>
              <div className="text-xs text-slate-400 mt-0.5">정답을 오선보로 표시</div>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.showStaffFeedback ? 'bg-primary-500' : 'bg-slate-200'
              }`}
              onClick={() => updateSettings({ showStaffFeedback: !settings.showStaffFeedback })}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
                  settings.showStaffFeedback ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data management */}
        <div className="card">
          <div className="text-sm font-semibold text-slate-600 mb-3">기록 관리</div>
          <div className="space-y-2">
            <button className="w-full btn-secondary text-sm" onClick={handleExport}>
              📤 기록 내보내기 (JSON)
            </button>
            <button className="w-full btn-secondary text-sm" onClick={handleImportClick}>
              📥 기록 가져오기 (JSON)
            </button>
            <button
              className={`w-full rounded-xl py-3 text-sm font-semibold border-2 transition-colors focus-ring ${
                confirmReset
                  ? 'bg-danger-500 text-white border-danger-600 animate-pulse motion-reduce:animate-none'
                  : 'text-danger-600 border-danger-200 bg-danger-50 hover:bg-danger-100'
              }`}
              onClick={handleReset}
              aria-label={confirmReset ? '한 번 더 눌러 초기화 확정' : '학습 기록 초기화'}
            >
              {confirmReset ? '⚠️ 한 번 더 눌러 확정 (5초)' : '🗑️ 기록 초기화'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            기록은 이 기기의 브라우저에만 저장됩니다. 브라우저 데이터 삭제 시 기록도 사라집니다.
          </p>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
