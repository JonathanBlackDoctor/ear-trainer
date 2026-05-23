// direction-g.jsx — 네오 브루탈리즘
// Thick black borders + hard offset shadows + candy block colors.

const G = {
  bg: '#fffef0',
  card: '#ffffff',
  ink: '#0a0a0a',
  inkSoft: '#3a3a3a',
  inkMute: '#7a7a7a',
  // candy palette
  pink: '#ff5a8c',
  mustard: '#f5d142',
  mint: '#5af2c2',
  lavender: '#a497ff',
  sky: '#7fc6ff',
  orange: '#fb923c',
  green: '#7ce26c',
  red: '#ff5b4a',
  shadow: '6px 6px 0 #0a0a0a',
  shadowS: '4px 4px 0 #0a0a0a',
  shadowL: '8px 8px 0 #0a0a0a',
  border: '3px solid #0a0a0a',
  borderT: '4px solid #0a0a0a',
};

// reusable block with hard offset
const GBlock = ({ bg = G.card, sh = G.shadow, style, children }) => (
  <div style={{ background: bg, border: G.border, boxShadow: sh, ...style }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────
// G.Home
// ─────────────────────────────────────────────────────────────
function G_Home() {
  return (
    <Phone screenBg={G.bg}>
      {/* masthead */}
      <div style={{ padding: '22px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-block', background: G.mustard, border: G.border, padding: '4px 10px', fontSize: 11, fontWeight: 900, letterSpacing: 2, transform: 'rotate(-2deg)' }}>EAR TRAINING ★</div>
          <div style={{ width: 36, height: 36, background: G.pink, border: G.border, boxShadow: G.shadowS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚙</div>
        </div>
        <div style={{ marginTop: 16, fontSize: 52, fontWeight: 900, color: G.ink, letterSpacing: '-0.05em', lineHeight: 0.9 }}>
          음감<br/>훈련 <span style={{ display: 'inline-block', fontSize: 32, padding: '0 8px', background: G.lavender, border: G.border, transform: 'rotate(3deg)' }}>!</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: G.inkSoft, fontWeight: 700 }}>매일 5분, 듣고 맞히고 약점 깨부수기.</div>
      </div>

      {/* rank — big pink block */}
      <div style={{ padding: '0 20px' }}>
        <GBlock bg={G.pink} sh={G.shadow} style={{ padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, background: G.mustard, border: G.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🥈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: G.ink, letterSpacing: 2 }}>현재 등급</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>SILVER</div>
            </div>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 900, color: G.ink, letterSpacing: '-0.03em' }}>1,840 XP</div>
          </div>
          <div style={{ marginTop: 12, height: 16, background: G.card, border: G.border, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '61%', background: G.mint, borderRight: G.border }}/>
          </div>
        </GBlock>
      </div>

      {/* stats row */}
      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          ['정답률','78','%', G.mint],
          ['세션','42','', G.sky],
          ['문제','614','', G.lavender],
        ].map(([l,v,u,c])=>(
          <GBlock key={l} bg={c} sh={G.shadowS} style={{ padding: '10px 10px 12px' }}>
            <div style={{ fontSize: 9, color: G.ink, fontWeight: 900, letterSpacing: 1 }}>{l}</div>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 900, color: G.ink, letterSpacing: '-0.04em', marginTop: 2, lineHeight: 1 }}>{v}<span style={{ fontSize: 12 }}>{u}</span></div>
          </GBlock>
        ))}
      </div>

      {/* weakness — orange block */}
      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.orange} style={{ padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: G.ink, color: G.mustard, padding: '4px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>⚡ 약점</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 11, fontWeight: 900, color: G.ink }}>전체 →</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['음정', '단7도', 32], ['코드', '감화음', 41], ['진행', 'V→vi', 48]].map(([m, n, p]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, background: G.card, border: `2px solid ${G.ink}`, padding: '6px 10px' }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: G.inkMute, width: 28 }}>{m}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 900, color: G.ink }}>{n}</div>
                <div className="tnum" style={{ fontSize: 14, fontWeight: 900, color: G.red }}>{p}%</div>
              </div>
            ))}
          </div>
        </GBlock>
      </div>

      {/* mode grid */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em' }}>훈련 모드</div>
          <div style={{ background: G.mint, border: `2px solid ${G.ink}`, padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>9</div>
          <div style={{ flex: 1 }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {MODES.slice(0, 6).map((m, i) => {
            const rates = [78,64,52,40,71,83];
            const bgs = [G.mint, G.sky, G.lavender, G.pink, G.mustard, G.orange];
            return (
              <GBlock key={m.id} bg={bgs[i]} sh={G.shadowS} style={{ padding: '12px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 26 }}>{m.emoji}</div>
                  <div className="tnum" style={{ fontSize: 11, fontWeight: 900, color: G.ink, background: G.card, border: `2px solid ${G.ink}`, padding: '1px 6px' }}>{rates[i]}%</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: G.ink, fontWeight: 700, opacity: 0.7 }}>{m.sub}</div>
              </GBlock>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 28px', display: 'flex', gap: 10 }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ flex: 1, padding: '14px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: G.ink }}>📊 통계</div>
        </GBlock>
        <GBlock bg={G.ink} sh="6px 6px 0 #ff5a8c" style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderColor: G.ink }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: G.mustard }}>⚙ 설정</div>
        </GBlock>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// G.Setup
// ─────────────────────────────────────────────────────────────
function G_Setup() {
  return (
    <Phone screenBg={G.bg}>
      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>←</GBlock>
        <div style={{ background: G.mustard, border: G.border, padding: '4px 8px', fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>SETUP</div>
        <div style={{ flex: 1 }}/>
        <div className="tnum" style={{ fontSize: 11, color: G.inkSoft, fontWeight: 900 }}>02/13</div>
      </div>

      {/* hero block */}
      <div style={{ padding: '22px 20px 0' }}>
        <GBlock bg={G.mint} sh={G.shadowL} style={{ padding: '20px 18px' }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>🎵</div>
          <div style={{ marginTop: 8, fontSize: 36, fontWeight: 900, color: G.ink, letterSpacing: '-0.04em', lineHeight: 0.95 }}>음정 듣기</div>
          <div style={{ marginTop: 4, fontSize: 13, color: G.ink, fontWeight: 700 }}>두 음 사이 간격 식별</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            <div style={{ background: G.ink, color: G.mustard, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>⚡ 약점 집중</div>
            <div style={{ background: G.card, border: `2px solid ${G.ink}`, color: G.ink, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>10 문항</div>
          </div>
        </GBlock>
      </div>

      {/* howto */}
      <div style={{ padding: '22px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '14px 14px' }}>
          <div style={{ display: 'inline-block', background: G.lavender, border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>사용법</div>
          <div style={{ marginTop: 8, fontSize: 13, color: G.ink, lineHeight: 1.5, fontWeight: 600 }}>
            두 음이 차례로 들리면 그 사이의 음정을 보기에서 고르세요. 헷갈리면 ▶ 듣기를 또 누르면 돼요.
          </div>
        </GBlock>
      </div>

      {/* level */}
      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: G.ink }}>레벨</div>
            <div style={{ flex: 1 }}/>
            <div style={{ background: G.pink, border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>Lv 4 · 음역확장</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => {
              const active = n === 4, done = n < 4;
              return (
                <button key={n} className="tnum" style={{
                  height: 46, fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em',
                  border: `2.5px solid ${G.ink}`,
                  background: active ? G.ink : done ? G.mint : G.card,
                  color: active ? G.mustard : G.ink,
                  boxShadow: active ? '3px 3px 0 #ff5a8c' : 'none',
                }}>{n}</button>
              );
            })}
          </div>
        </GBlock>
      </div>

      {/* toggle */}
      <div style={{ padding: '14px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: G.ink }}>절대음감 모드</div>
            <div style={{ fontSize: 11, color: G.inkSoft, fontWeight: 600, marginTop: 2 }}>기준음 없이 음이름만 듣기</div>
          </div>
          <div style={{ width: 52, height: 28, border: `2.5px solid ${G.ink}`, background: G.card, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 1, left: 1, width: 22, height: 22, background: G.inkMute, border: `2px solid ${G.ink}` }}/>
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '22px 20px 28px' }}>
        <GBlock bg={G.pink} sh={G.shadowL} style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em' }}>🎵  시작하기  →</div>
        </GBlock>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// G.Training
// ─────────────────────────────────────────────────────────────
function G_Training() {
  return (
    <Phone screenBg={G.bg}>
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>←</GBlock>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: G.ink }}>음정 · Lv 4</div>
          <div className="tnum" style={{ fontSize: 10, color: G.inkMute, fontWeight: 900 }}>5/10 · ✓ 4</div>
        </div>
        <div style={{ background: G.lavender, border: G.border, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>C major</div>
      </div>

      {/* progress as 10 chunky blocks */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
          {Array.from({length: 10}).map((_,i)=>(
            <div key={i} style={{
              height: 14, border: `2px solid ${G.ink}`,
              background: i < 4 ? G.green : i === 4 ? G.mustard : i < 5 ? G.red : G.card,
            }}/>
          ))}
        </div>
      </div>

      {/* play */}
      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.mustard} sh={G.shadow} style={{ padding: '18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ width: 56, height: 56, border: `2.5px solid ${G.ink}`, background: G.card, fontSize: 22, fontWeight: 900, boxShadow: '3px 3px 0 #0a0a0a' }}>🎹</button>
            <button style={{
              flex: 1, height: 64, border: `3px solid ${G.ink}`,
              background: G.pink, color: G.ink, fontSize: 22, fontWeight: 900,
              letterSpacing: '-0.02em', boxShadow: '4px 4px 0 #0a0a0a',
            }}>▶  듣기</button>
            <button style={{ width: 56, height: 56, border: `2.5px solid ${G.ink}`, background: G.card, fontSize: 20, boxShadow: '3px 3px 0 #0a0a0a' }}>🐢</button>
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em' }}>두 음 사이의 음정은?</div>
      </div>

      {/* choices */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {INTERVAL_CHOICES.slice(0, 6).map(([k, sub], i) => {
            const picked = i === 5;
            const bgs = [G.card, G.card, G.card, G.card, G.card, G.mint];
            return (
              <GBlock key={k} bg={bgs[i]} sh={picked ? '5px 5px 0 #0a0a0a' : G.shadowS}
                style={{ position: 'relative', minHeight: 72, padding: '12px 12px', textAlign: 'left' }}>
                <div className="tnum" style={{ position: 'absolute', top: 6, right: 10, fontSize: 10, fontWeight: 900, color: G.inkMute }}>{i+1}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em', marginTop: 6 }}>{k}</div>
                <div className="tnum" style={{ fontSize: 11, color: G.inkSoft, fontWeight: 700 }}>{sub}</div>
              </GBlock>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 24px', display: 'flex', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: G.inkSoft }}>건너뛰기</div>
        </GBlock>
        <GBlock bg={G.pink} sh={G.shadow} style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: G.ink, letterSpacing: '-0.01em' }}>제출 →</div>
        </GBlock>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// G.Result
// ─────────────────────────────────────────────────────────────
function G_Result() {
  return (
    <Phone screenBg={G.bg}>
      {/* rank up */}
      <div style={{ padding: '18px 20px 0' }}>
        <GBlock bg={G.mustard} sh={G.shadow} style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 34 }}>🎊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: G.ink, letterSpacing: 3 }}>★ RANK UP ★</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em' }}>SILVER → GOLD</div>
          </div>
          <div style={{ fontSize: 34, transform: 'rotate(8deg)' }}>🥇</div>
        </GBlock>
      </div>

      {/* score */}
      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.mint} sh={G.shadowL} style={{ padding: '20px 18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 50, lineHeight: 1 }}>🏆</div>
          <div className="tnum" style={{ marginTop: 6, fontSize: 120, fontWeight: 900, color: G.ink, letterSpacing: '-0.07em', lineHeight: 0.85 }}>92<span style={{ fontSize: 36 }}>%</span></div>
          <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, color: G.ink, letterSpacing: '-0.01em' }}>완벽합니다!</div>
        </GBlock>
      </div>

      {/* stats row */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          ['정답','9', G.green],
          ['오답','1', G.red],
          ['콤보','7', G.pink],
          ['시간','2:14', G.sky],
        ].map(([l,v, c]) => (
          <GBlock key={l} bg={c} sh="3px 3px 0 #0a0a0a" style={{ padding: '8px 6px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: G.ink, letterSpacing: 1 }}>{l}</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 900, color: G.ink, letterSpacing: '-0.03em', marginTop: 2 }}>{v}</div>
          </GBlock>
        ))}
      </div>

      {/* xp */}
      <div style={{ padding: '16px 20px 0' }}>
        <GBlock bg={G.pink} sh={G.shadow} style={{ padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: G.ink, letterSpacing: 2 }}>+ XP EARNED</div>
            <div className="tnum" style={{ fontSize: 30, fontWeight: 900, color: G.ink, letterSpacing: '-0.03em' }}>+248</div>
          </div>
          <div style={{ marginTop: 10, height: 14, background: G.card, border: G.border, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '14%', background: G.mustard, borderRight: G.border }}/>
          </div>
        </GBlock>
      </div>

      {/* badge */}
      <div style={{ padding: '14px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: G.lavender, border: G.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🔥</div>
          <div style={{ flex: 1 }}>
            <div style={{ background: G.ink, color: G.mustard, padding: '2px 6px', fontSize: 9, fontWeight: 900, letterSpacing: 1.5, display: 'inline-block' }}>NEW</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: G.ink, marginTop: 4 }}>3연속 정답</div>
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '18px 20px 24px' }}>
        <GBlock bg={G.ink} sh="6px 6px 0 #ff5a8c" style={{ padding: '16px 0', textAlign: 'center', borderColor: G.ink }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: G.mustard, letterSpacing: '-0.01em' }}>한 번 더 →</div>
        </GBlock>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: G.ink }}>🏆 업적</div>
          </GBlock>
          <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: G.ink }}>홈으로</div>
          </GBlock>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// G.Stats
// ─────────────────────────────────────────────────────────────
function G_Stats() {
  const trend = [52,58,55,63,60,68,72,70,74,69,78,82,77,85,80,88,84,90,87,92];
  return (
    <Phone screenBg={G.bg}>
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>←</GBlock>
        <div style={{ background: G.mustard, border: G.border, padding: '4px 10px', fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>STATS</div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <GBlock bg={G.sky} sh={G.shadow} style={{ padding: '18px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: G.ink, letterSpacing: 2 }}>전체 정답률</div>
          <div className="tnum" style={{ fontSize: 100, fontWeight: 900, color: G.ink, letterSpacing: '-0.06em', lineHeight: 0.85, marginTop: 4 }}>
            78<span style={{ fontSize: 32, color: G.ink, background: G.mustard, padding: '0 6px', border: G.border, marginLeft: 4 }}>%</span>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <div className="tnum"><b style={{ fontSize: 14, fontWeight: 900 }}>42</b> <span style={{ fontSize: 10, fontWeight: 700 }}>세션</span></div>
            <div className="tnum"><b style={{ fontSize: 14, fontWeight: 900 }}>614</b> <span style={{ fontSize: 10, fontWeight: 700 }}>문제</span></div>
            <div className="tnum"><b style={{ fontSize: 14, fontWeight: 900 }}>12일</b> <span style={{ fontSize: 10, fontWeight: 700 }}>연속</span></div>
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: G.ink }}>세션별 정답률</div>
            <div style={{ fontSize: 10, color: G.inkMute, fontWeight: 700 }}>최근 20회</div>
          </div>
          <div style={{ background: G.mint, border: `2.5px solid ${G.ink}`, padding: '6px 6px' }}>
            <MiniSpark points={trend} w={324} h={82} stroke={G.ink} strokeWidth={3}/>
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: G.ink, marginBottom: 10 }}>모드별 정답률</div>
          {[
            ['🎵 음정', 84, G.green],
            ['🎹 코드', 71, G.sky],
            ['🎼 계명', 68, G.lavender],
            ['🎸 진행', 52, G.orange],
            ['🥁 리듬', 47, G.red],
          ].map(([n, v, c]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
              <div style={{ width: 72, fontSize: 12, color: G.ink, fontWeight: 900 }}>{n}</div>
              <div style={{ flex: 1, height: 14, border: `2px solid ${G.ink}`, background: G.card }}>
                <div style={{ height: '100%', width: `${v}%`, background: c, borderRight: `2px solid ${G.ink}` }}/>
              </div>
              <div className="tnum" style={{ width: 36, fontSize: 13, fontWeight: 900, color: G.ink, textAlign: 'right' }}>{v}</div>
            </div>
          ))}
        </GBlock>
      </div>

      <div style={{ padding: '18px 20px 24px' }}>
        <GBlock bg={G.red} sh={G.shadow} style={{ padding: '14px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: G.card, letterSpacing: '-0.01em' }}>약점 집중 복습 →</div>
        </GBlock>
      </div>
    </Phone>
  );
}

Object.assign(window, { G_Home, G_Setup, G_Training, G_Result, G_Stats });
