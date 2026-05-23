// direction-i.jsx — 모눈 / 데이터
// Grid-paper background + monospace-ish tabular nums + chartreuse signal accent.
// Lab notebook / oscilloscope feel. Dense, technical.

const I = {
  bg: '#fbfcfd',
  card: '#ffffff',
  inset: '#f5f7fa',
  ink: '#0f1419',
  inkSoft: '#4a5563',
  inkMute: '#9aa3b0',
  hair: '#e2e7ed',
  hairDark: '#c8d0d9',
  grid: '#eef1f5',
  lime: '#65a30d',       // signal accent
  limeBright: '#84cc16',
  limeSoft: '#ecfccb',
  cyan: '#0e7490',
  cyanBright: '#06b6d4',
  signal: '#ef4444',     // alert
  amber: '#ea580c',
};

// Grid paper background — 12px squares with bolder lines every 60px
const IGrid = ({ style, children }) => (
  <div style={{
    background: `
      linear-gradient(${I.grid} 1px, transparent 1px) 0 0 / 12px 12px,
      linear-gradient(90deg, ${I.grid} 1px, transparent 1px) 0 0 / 12px 12px,
      linear-gradient(${I.hair} 1px, transparent 1px) 0 0 / 60px 60px,
      linear-gradient(90deg, ${I.hair} 1px, transparent 1px) 0 0 / 60px 60px,
      ${I.bg}
    `,
    ...style,
  }}>{children}</div>
);

// Tabular label-value pair, like a lab sheet field
const IField = ({ label, value, valueColor = I.ink, mono = true, size = 'md' }) => (
  <div>
    <div style={{ fontSize: 9, color: I.inkMute, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</div>
    <div className={mono ? 'tnum' : ''} style={{
      fontSize: size === 'lg' ? 28 : size === 'sm' ? 14 : 20,
      fontWeight: 800, color: valueColor, letterSpacing: '-0.03em', marginTop: 2, lineHeight: 1,
      fontVariantNumeric: 'tabular-nums slashed-zero',
    }}>{value}</div>
  </div>
);

// Crosshair corner marks
const ICorners = ({ pad = 6, color = I.hairDark }) => (
  <>
    {[
      {top:pad,left:pad,borderTop:`1.5px solid ${color}`,borderLeft:`1.5px solid ${color}`},
      {top:pad,right:pad,borderTop:`1.5px solid ${color}`,borderRight:`1.5px solid ${color}`},
      {bottom:pad,left:pad,borderBottom:`1.5px solid ${color}`,borderLeft:`1.5px solid ${color}`},
      {bottom:pad,right:pad,borderBottom:`1.5px solid ${color}`,borderRight:`1.5px solid ${color}`},
    ].map((s, i) => (
      <div key={i} style={{ position: 'absolute', width: 10, height: 10, pointerEvents: 'none', ...s }}/>
    ))}
  </>
);

const IChip = ({ children, color = I.lime }) => (
  <span className="tnum" style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', fontSize: 10, fontWeight: 800,
    background: I.card, color, border: `1px solid ${color}`, letterSpacing: 0.5,
  }}>{children}</span>
);

// ─────────────────────────────────────────────────────────────
// I.Home
// ─────────────────────────────────────────────────────────────
function I_Home() {
  return (
    <Phone screenBg={I.bg}>
      <IGrid style={{ minHeight: '100%' }}>
        {/* masthead */}
        <div style={{ padding: '20px 20px 14px', background: I.bg, borderBottom: `1px solid ${I.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700, letterSpacing: 1.5 }}>SESS·042 · TUE 09:30</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: I.lime }}/>
              <div className="tnum" style={{ fontSize: 10, color: I.lime, fontWeight: 800, letterSpacing: 1 }}>READY</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800, color: I.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
            음감 훈련 <span className="tnum" style={{ fontSize: 18, color: I.inkMute, fontWeight: 600 }}>/ v4.2</span>
          </div>
        </div>

        {/* hero stats grid — 2x2 like a dashboard */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
            <ICorners/>
            <div style={{ padding: '14px 14px', borderRight: `1px solid ${I.hair}`, borderBottom: `1px solid ${I.hair}` }}>
              <IField label="ACC · 정답률" value="78.3%" valueColor={I.lime} size="lg"/>
            </div>
            <div style={{ padding: '14px 14px', borderBottom: `1px solid ${I.hair}` }}>
              <IField label="XP · 누적" value="1,840" size="lg"/>
              <div className="tnum" style={{ fontSize: 9, color: I.inkMute, fontWeight: 600, marginTop: 2 }}>RANK · SILVER · 61%→GOLD</div>
            </div>
            <div style={{ padding: '14px 14px', borderRight: `1px solid ${I.hair}` }}>
              <IField label="N · 세션" value="42" size="md"/>
            </div>
            <div style={{ padding: '14px 14px' }}>
              <IField label="ΣQ · 문제 수" value="614" size="md"/>
            </div>
          </div>
          {/* rank bar */}
          <div style={{ marginTop: 8, background: I.card, border: `1px solid ${I.hair}`, padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700, letterSpacing: 1, width: 40 }}>0</div>
              <div style={{ flex: 1, height: 4, background: I.inset, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '61%', background: I.lime }}/>
                {[20, 40, 60, 80].map(p => (
                  <div key={p} className="tnum" style={{ position: 'absolute', left: `${p}%`, top: -2, bottom: -2, width: 1, background: I.hairDark }}/>
                ))}
              </div>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700, width: 40, textAlign: 'right' }}>3K</div>
            </div>
          </div>
        </div>

        {/* sparkline glance */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px', position: 'relative' }}>
            <ICorners/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="tnum" style={{ fontSize: 10, fontWeight: 700, color: I.lime, letterSpacing: 1.5 }}>SIG · 최근 20세션</div>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>+40.0pp</div>
            </div>
            <MiniSpark points={[52,58,55,63,60,68,72,70,74,69,78,82,77,85,80,88,84,90,87,92]} w={336} h={50} stroke={I.lime} strokeWidth={1.5}/>
          </div>
        </div>

        {/* mode table */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="tnum" style={{ fontSize: 11, fontWeight: 800, color: I.ink, letterSpacing: 2 }}>TABLE · 훈련 모드</div>
            <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>n=9</div>
          </div>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}` }}>
            {/* header */}
            <div className="tnum" style={{
              display: 'grid', gridTemplateColumns: '24px 1fr 60px 50px',
              gap: 8, padding: '6px 12px', fontSize: 9, fontWeight: 800, color: I.inkMute,
              borderBottom: `1px solid ${I.hair}`, letterSpacing: 1, background: I.inset,
            }}>
              <div>#</div><div>MODE</div><div style={{ textAlign: 'right' }}>ACC</div><div style={{ textAlign: 'right' }}>Δ</div>
            </div>
            {MODES.slice(0, 6).map((m, i) => {
              const rates = [78,64,52,40,71,83];
              const deltas = [+5, +2, -3, +8, +1, +12];
              return (
                <div key={m.id} style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr 60px 50px',
                  gap: 8, padding: '9px 12px', alignItems: 'center',
                  borderBottom: i < 5 ? `1px solid ${I.hair}` : 'none',
                }}>
                  <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 16 }}>{m.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: I.ink }}>{m.name}</div>
                  </div>
                  <div className="tnum" style={{ fontSize: 13, fontWeight: 800, color: I.ink, textAlign: 'right', letterSpacing: '-0.02em' }}>{rates[i]}%</div>
                  <div className="tnum" style={{ fontSize: 11, fontWeight: 700, color: deltas[i] > 0 ? I.lime : I.signal, textAlign: 'right' }}>
                    {deltas[i] > 0 ? '+' : ''}{deltas[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* weakness alert */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.signal}`, padding: '10px 12px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="tnum" style={{ fontSize: 10, fontWeight: 800, color: I.signal, letterSpacing: 1.5, background: '#fee2e2', padding: '2px 6px' }}>ALERT · 약점</div>
              <div style={{ flex: 1 }}/>
              <div style={{ fontSize: 10, color: I.signal, fontWeight: 700 }}>전체 →</div>
            </div>
            <div className="tnum" style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '50px 1fr 50px', gap: 6, fontSize: 12, color: I.ink }}>
              {[['음정','단7도','32%'],['코드','감화음','41%'],['진행','V→vi','48%']].map((r, i) => (
                <React.Fragment key={i}>
                  <div style={{ fontSize: 10, color: I.inkMute, fontWeight: 700, paddingTop: 1 }}>{r[0]}</div>
                  <div style={{ fontWeight: 700 }}>{r[1]}</div>
                  <div style={{ color: I.signal, fontWeight: 800, textAlign: 'right' }}>{r[2]}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 24px', display: 'flex', gap: 8 }}>
          <button className="tnum" style={{ flex: 1, padding: '12px 0', border: `1px solid ${I.hairDark}`, background: I.card, color: I.ink, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>📊 STATS</button>
          <button className="tnum" style={{ flex: 1, padding: '12px 0', border: `1px solid ${I.ink}`, background: I.ink, color: I.card, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>⚙ CONFIG</button>
        </div>
      </IGrid>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// I.Setup
// ─────────────────────────────────────────────────────────────
function I_Setup() {
  return (
    <Phone screenBg={I.bg}>
      <IGrid style={{ minHeight: '100%' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: I.bg, borderBottom: `1px solid ${I.hair}` }}>
          <button style={{ width: 28, height: 28, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 14 }}>←</button>
          <div className="tnum" style={{ fontSize: 11, fontWeight: 800, color: I.ink, letterSpacing: 1.5 }}>SETUP · 음정 / interval</div>
          <div style={{ flex: 1 }}/>
          <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>02/13</div>
        </div>

        {/* hero — like a spec card */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '16px 14px', position: 'relative' }}>
            <ICorners/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 80, height: 80, border: `1.5px solid ${I.lime}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
                position: 'relative', background: I.limeSoft,
              }}>🎵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tnum" style={{ fontSize: 10, color: I.lime, fontWeight: 800, letterSpacing: 1.5 }}>MODE · 02 / interval</div>
                <div style={{ marginTop: 2, fontSize: 22, fontWeight: 800, color: I.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}>음정 듣기</div>
                <div style={{ fontSize: 11, color: I.inkSoft, marginTop: 2 }}>두 음 사이 간격 식별</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <IChip color={I.signal}>⚡ FOCUS · 약점</IChip>
              <IChip color={I.cyan}>N=10</IChip>
              <IChip color={I.inkMute}>~3min</IChip>
            </div>
          </div>
        </div>

        {/* howto */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px dashed ${I.hairDark}`, padding: '10px 12px' }}>
            <div className="tnum" style={{ fontSize: 9, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5 }}>// HOWTO</div>
            <div style={{ marginTop: 4, fontSize: 12.5, color: I.ink, lineHeight: 1.55 }}>
              두 음이 차례로 들리면 그 사이의 음정을 보기에서 골라요. 헷갈리면 ▶ 듣기를 다시 누르세요.
            </div>
          </div>
        </div>

        {/* level — slider-like row */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '12px 12px', position: 'relative' }}>
            <ICorners/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1.5 }}>LEVEL · 1—10</div>
              <div className="tnum" style={{ fontSize: 11, fontWeight: 800, color: I.lime }}>Lv 04 · 음역확장</div>
            </div>
            {/* axis */}
            <div className="tnum" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0, fontSize: 9, color: I.inkMute, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}>{n}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0, border: `1px solid ${I.hairDark}` }}>
              {[1,2,3,4,5,6,7,8,9,10].map((n,i) => {
                const active = n === 4, done = n < 4;
                return (
                  <button key={n} style={{
                    height: 28, border: 'none',
                    borderRight: i < 9 ? `1px solid ${I.hair}` : 'none',
                    background: active ? I.lime : done ? I.limeSoft : I.card,
                  }}/>
                );
              })}
            </div>
            <div className="tnum" style={{ marginTop: 8, fontSize: 10.5, color: I.inkSoft, fontWeight: 600 }}>
              <b style={{ color: I.lime }}>Lv 4 · 음역확장</b> — P4 · P5 · 3 · 8도 + 옥타브 확장 ▸ 상행/하행 무작위.
            </div>
          </div>
        </div>

        {/* options */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}` }}>
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${I.hair}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: I.ink }}>절대음감 모드</div>
                <div className="tnum" style={{ fontSize: 10, color: I.inkMute, marginTop: 1 }}>NO_REF</div>
              </div>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 800, padding: '3px 8px', border: `1px solid ${I.hairDark}` }}>OFF</div>
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: I.ink }}>속도</div>
                <div className="tnum" style={{ fontSize: 10, color: I.inkMute, marginTop: 1 }}>PLAYBACK_RATE</div>
              </div>
              <div style={{ display: 'flex', border: `1px solid ${I.hairDark}` }}>
                <button className="tnum" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 800, background: I.ink, color: I.card, border: 'none', letterSpacing: 0.5 }}>1.0×</button>
                <button className="tnum" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 800, background: I.card, color: I.inkSoft, border: 'none', letterSpacing: 0.5, borderLeft: `1px solid ${I.hairDark}` }}>0.5×</button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '20px 20px 24px' }}>
          <button className="tnum" style={{
            width: '100%', padding: '16px 0', border: `1.5px solid ${I.ink}`,
            background: I.lime, color: I.ink,
            fontSize: 15, fontWeight: 800, letterSpacing: 1,
          }}>▶  START · SESSION 042</button>
          <div className="tnum" style={{ marginTop: 8, fontSize: 10, color: I.inkMute, textAlign: 'center', fontWeight: 600 }}>// 첫 시작 시 piano sample 로딩</div>
        </div>
      </IGrid>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// I.Training
// ─────────────────────────────────────────────────────────────
function I_Training() {
  return (
    <Phone screenBg={I.bg}>
      <IGrid style={{ minHeight: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${I.hair}`, display: 'flex', alignItems: 'center', gap: 10, background: I.bg }}>
          <button style={{ width: 28, height: 28, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 14 }}>←</button>
          <div className="tnum" style={{ fontSize: 11, fontWeight: 800, color: I.ink, letterSpacing: 1.5 }}>RUN · interval / Lv04</div>
          <div style={{ flex: 1 }}/>
          <IChip color={I.cyan}>C-major</IChip>
        </div>

        {/* progress with axis */}
        <div style={{ padding: '12px 20px 0' }}>
          <div className="tnum" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 10, color: I.inkMute, fontWeight: 700, letterSpacing: 1 }}>
            <span>Q · 05 / 10</span>
            <span style={{ color: I.lime }}>✓ 04 · ✗ 01 · — 00</span>
          </div>
          <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0, border: `1px solid ${I.hairDark}` }}>
            {Array.from({length: 10}).map((_,i)=>(
              <div key={i} style={{
                height: 10,
                background: i < 4 ? I.lime : i === 4 ? I.limeBright : i < 5 ? I.signal : I.card,
                borderRight: i < 9 ? `1px solid ${I.hair}` : 'none',
              }}/>
            ))}
          </div>
        </div>

        {/* signal scope — oscilloscope-style waveform */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px', position: 'relative' }}>
            <ICorners/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="tnum" style={{ fontSize: 10, fontWeight: 800, color: I.lime, letterSpacing: 1.5 }}>SCOPE · A4 → ? Hz</div>
              <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>2.0s</div>
            </div>
            {/* tiny scope grid */}
            <div style={{ marginTop: 8, height: 70, position: 'relative', background: `
              linear-gradient(${I.hair} 1px, transparent 1px) 0 0 / 100% 14px,
              linear-gradient(90deg, ${I.hair} 1px, transparent 1px) 0 0 / 16.66% 100%,
              ${I.inset}` }}>
              <svg width="100%" height="70" viewBox="0 0 340 70" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
                <path d="M0,35 Q20,5 40,35 T80,35 Q100,55 120,35 T160,35 Q180,15 200,35 T240,35 Q260,55 280,35 T340,35"
                  fill="none" stroke={I.lime} strokeWidth="1.6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* play row */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 50px', gap: 6 }}>
            <button className="tnum" style={{ height: 50, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 18 }}>🎹</button>
            <button className="tnum" style={{
              height: 50, border: `1.5px solid ${I.ink}`,
              background: I.ink, color: I.lime,
              fontSize: 16, fontWeight: 800, letterSpacing: 1,
            }}>▶  PLAY / 듣기</button>
            <button style={{ height: 50, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 18 }}>🐢</button>
          </div>
        </div>

        {/* question */}
        <div style={{ padding: '14px 20px 0' }}>
          <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1.5 }}>Q · 05</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: I.ink, letterSpacing: '-0.01em', marginTop: 2 }}>두 음 사이의 음정은?</div>
        </div>

        {/* choices */}
        <div style={{ padding: '10px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${I.hairDark}` }}>
            {INTERVAL_CHOICES.slice(0, 6).map(([k, sub], i) => {
              const col = i % 2, row = Math.floor(i/2);
              const picked = i === 5;
              return (
                <button key={k} className="tnum" style={{
                  position: 'relative', minHeight: 60, padding: '10px 12px',
                  border: 'none',
                  borderRight: col === 0 ? `1px solid ${I.hair}` : 'none',
                  borderBottom: row < 2 ? `1px solid ${I.hair}` : 'none',
                  background: picked ? I.lime : I.card,
                  color: I.ink, textAlign: 'left',
                }}>
                  <div style={{ position: 'absolute', top: 6, right: 10, fontSize: 9, fontWeight: 800, color: I.inkMute }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>{k}</div>
                  <div style={{ fontSize: 10, color: I.inkSoft, fontWeight: 700 }}>{sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '16px 20px 24px', display: 'flex', gap: 8 }}>
          <button className="tnum" style={{ padding: '12px 18px', border: `1px solid ${I.hairDark}`, background: I.card, color: I.inkSoft, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>SKIP</button>
          <button className="tnum" style={{
            flex: 1, padding: '12px 0', border: `1.5px solid ${I.ink}`,
            background: I.ink, color: I.lime, fontSize: 13, fontWeight: 800, letterSpacing: 1,
          }}>SUBMIT →</button>
        </div>
      </IGrid>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// I.Result
// ─────────────────────────────────────────────────────────────
function I_Result() {
  return (
    <Phone screenBg={I.bg}>
      <IGrid style={{ minHeight: '100%' }}>
        {/* rank up */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ background: I.lime, border: `1.5px solid ${I.ink}`, padding: '10px 12px', position: 'relative' }}>
            <div className="tnum" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, color: I.ink, fontWeight: 800, letterSpacing: 2, background: I.ink, color: I.lime, padding: '2px 8px' }}>RANK · UP</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: I.ink, letterSpacing: '-0.01em' }}>SILVER → GOLD 🥇</div>
            </div>
          </div>
        </div>

        {/* score plaque */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '16px 14px', position: 'relative' }}>
            <ICorners color={I.lime}/>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div className="tnum" style={{ fontSize: 96, fontWeight: 800, color: I.ink, letterSpacing: '-0.06em', lineHeight: 0.85 }}>92.0<span style={{ fontSize: 28, color: I.lime }}>%</span></div>
              <div style={{ paddingBottom: 8, flex: 1 }}>
                <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1.5 }}>SCORE / RESULT</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: I.ink, marginTop: 4 }}>완벽합니다! 🏆</div>
                <div className="tnum" style={{ fontSize: 10, color: I.inkSoft, marginTop: 2 }}>10 → 9 ✓ / 1 ✗</div>
              </div>
            </div>
          </div>
        </div>

        {/* stat row */}
        <div style={{ padding: '12px 20px 0' }}>
          <div className="tnum" style={{ background: I.card, border: `1px solid ${I.hairDark}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            {[
              ['+XP', '+248', I.lime],
              ['COMBO', '7', I.signal],
              ['TIME', '2:14', I.cyan],
              ['AVG', '2.3s', I.amber],
            ].map(([l,v,c], i) => (
              <div key={l} style={{ padding: '10px 8px 12px', borderRight: i < 3 ? `1px solid ${I.hair}` : 'none', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c }}/>
                <IField label={l} value={v} valueColor={I.ink} size="md"/>
              </div>
            ))}
          </div>
        </div>

        {/* xp */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px' }}>
            <div className="tnum" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5 }}>RANK PROG · GOLD</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: I.ink, letterSpacing: '-0.02em' }}>3,088 <span style={{ color: I.inkMute }}>/ 8,000</span></div>
            </div>
            <div style={{ marginTop: 8, height: 6, background: I.inset, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '14%', background: I.lime }}/>
              {[20, 40, 60, 80].map(p => (
                <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: I.hairDark }}/>
              ))}
            </div>
          </div>
        </div>

        {/* badge */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.lime}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, border: `1.5px solid ${I.ink}`, background: I.limeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔥</div>
            <div style={{ flex: 1 }}>
              <div className="tnum" style={{ fontSize: 9, fontWeight: 800, color: I.lime, letterSpacing: 1.5 }}>BADGE · UNLOCKED</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: I.ink, marginTop: 1 }}>3연속 정답 / streak.3</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          <button className="tnum" style={{
            width: '100%', padding: '14px 0', border: `1.5px solid ${I.ink}`,
            background: I.ink, color: I.lime,
            fontSize: 14, fontWeight: 800, letterSpacing: 1,
          }}>▶  RETRY · 한 번 더</button>
          <div className="tnum" style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {['🏆 BADGES','📊 STATS','🏠 HOME'].map(l => (
              <button key={l} style={{ padding: '10px 0', border: `1px solid ${I.hairDark}`, background: I.card, color: I.ink, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>{l}</button>
            ))}
          </div>
        </div>
      </IGrid>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// I.Stats
// ─────────────────────────────────────────────────────────────
function I_Stats() {
  const trend = [52,58,55,63,60,68,72,70,74,69,78,82,77,85,80,88,84,90,87,92];
  return (
    <Phone screenBg={I.bg}>
      <IGrid style={{ minHeight: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${I.hair}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ width: 28, height: 28, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 14 }}>←</button>
          <div className="tnum" style={{ fontSize: 11, fontWeight: 800, color: I.ink, letterSpacing: 1.5 }}>STATS · DASHBOARD</div>
        </div>

        {/* kpi block */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '14px 14px', position: 'relative' }}>
            <ICorners/>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div className="tnum" style={{ fontSize: 64, fontWeight: 800, color: I.ink, letterSpacing: '-0.05em', lineHeight: 0.85 }}>78.3<span style={{ fontSize: 22, color: I.lime }}>%</span></div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div className="tnum" style={{ fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1 }}>OVERALL ACCURACY</div>
                <div className="tnum" style={{ fontSize: 11, color: I.lime, fontWeight: 800, marginTop: 4 }}>↑ +6.2pp (30d)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 col mini stats */}
        <div style={{ padding: '8px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[['N · 세션','42'],['Q · 문제','614'],['STREAK','12 일']].map(([l,v]) => (
            <div key={l} style={{ background: I.card, border: `1px solid ${I.hair}`, padding: '8px 10px' }}>
              <IField label={l} value={v} size="sm"/>
            </div>
          ))}
        </div>

        {/* trend with axis */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px 6px', position: 'relative' }}>
            <ICorners/>
            <div className="tnum" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: I.lime, letterSpacing: 1.5 }}>TREND · ACC × SESSION</div>
              <div style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>n=20</div>
            </div>
            <div style={{ marginTop: 8, position: 'relative', background: `
              linear-gradient(${I.hair} 1px, transparent 1px) 0 0 / 100% 25%,
              linear-gradient(90deg, ${I.hair} 1px, transparent 1px) 0 0 / 10% 100%
            ` }}>
              <MiniSpark points={trend} w={324} h={92} stroke={I.lime} strokeWidth={1.8}/>
              <div className="tnum" style={{ position: 'absolute', top: 0, left: -16, fontSize: 8, color: I.inkMute, fontWeight: 700 }}>100</div>
              <div className="tnum" style={{ position: 'absolute', bottom: 0, left: -10, fontSize: 8, color: I.inkMute, fontWeight: 700 }}>50</div>
            </div>
          </div>
        </div>

        {/* mode bars */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '12px 12px' }}>
            <div className="tnum" style={{ fontSize: 10, fontWeight: 800, color: I.ink, letterSpacing: 1.5, marginBottom: 8 }}>BY MODE</div>
            {[
              ['🎵 음정', 84, I.lime],
              ['🎹 코드', 71, I.cyan],
              ['🎼 계명', 68, I.cyan],
              ['🎸 진행', 52, I.amber],
              ['🥁 리듬', 47, I.signal],
            ].map(([n, v, c], i) => (
              <div key={n} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 36px',
                gap: 8, padding: '5px 0', alignItems: 'center',
                borderTop: i > 0 ? `1px dashed ${I.hair}` : 'none',
              }}>
                <div style={{ fontSize: 12, color: I.ink, fontWeight: 700 }}>{n}</div>
                <div style={{ height: 8, background: I.inset, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: c }}/>
                  {[25,50,75].map(p => (
                    <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: I.hairDark }}/>
                  ))}
                </div>
                <div className="tnum" style={{ fontSize: 12, fontWeight: 800, color: I.ink, textAlign: 'right' }}>{v}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 20px 24px' }}>
          <button className="tnum" style={{
            width: '100%', padding: '14px 0', border: `1.5px solid ${I.ink}`,
            background: I.signal, color: I.card,
            fontSize: 13, fontWeight: 800, letterSpacing: 1,
          }}>▶  FOCUS WEAK · 약점 집중 복습</button>
        </div>
      </IGrid>
    </Phone>
  );
}

Object.assign(window, { I_Home, I_Setup, I_Training, I_Result, I_Stats });
