// direction-m.jsx — 오로라 / 홀로그래픽 (Aurora / Holographic)
// Iridescent pearl gradients + glossy white cards. Luxury, prismatic.

const M = {
  bg: 'linear-gradient(135deg, #ede2ff 0%, #d9eaff 22%, #d2f5e9 44%, #fff0d9 66%, #ffd9ec 88%, #e6d9ff 100%)',
  pearl: '#fdfcff',
  ink: '#1a1f3a',
  inkSoft: '#4b5070',
  inkMute: '#9a9ec0',
  hair: 'rgba(26,31,58,0.1)',
  hairSoft: 'rgba(26,31,58,0.05)',
  cyan: '#06b6d4',
  violet: '#a855f7',
  pink: '#ec4899',
  amber: '#f59e0b',
  mint: '#10b981',
  iridescent: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
  iridescentSoft: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.15) 100%)',
};

const MCard = ({ children, style, gloss = false }) => (
  <div style={{
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 22,
    border: `1px solid rgba(255,255,255,0.9)`,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 24px rgba(26,31,58,0.06), 0 1px 3px rgba(26,31,58,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  }}>
    {gloss && (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }}/>
    )}
    {children}
  </div>
);

const MText = ({ children, size, weight = 700, style }) => (
  <span style={{
    fontSize: size, fontWeight: weight, letterSpacing: '-0.02em',
    background: M.iridescent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    ...style,
  }}>{children}</span>
);

const MChip = ({ children, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(10px)',
    color: color || M.inkSoft,
    border: `1px solid rgba(255,255,255,0.9)`,
    boxShadow: '0 2px 6px rgba(26,31,58,0.05)',
  }}>{children}</span>
);

// holographic orb decoration
const MOrb = ({ size = 80, style }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: M.iridescent,
    filter: 'blur(2px)',
    opacity: 0.7,
    ...style,
  }}/>
);

// ─────────────────────────────────────────────────────────────
// M.Home
// ─────────────────────────────────────────────────────────────
function M_Home() {
  return (
    <Phone screenBg={M.bg}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <MOrb size={180} style={{ position: 'absolute', top: -60, right: -40, filter: 'blur(30px)', opacity: 0.6 }}/>
        <MOrb size={140} style={{ position: 'absolute', top: 280, left: -40, filter: 'blur(28px)', opacity: 0.5 }}/>

        {/* masthead */}
        <div style={{ padding: '22px 20px 16px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 3 }}>✦ EAR · TRAINING</div>
            <div style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `1px solid rgba(255,255,255,0.9)` }}>⚙</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 30, fontWeight: 700, color: M.ink, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            오늘도 <MText size={30}>다섯 분</MText>
          </div>
        </div>

        {/* rank card — iridescent */}
        <div style={{ padding: '0 20px', position: 'relative' }}>
          <MCard gloss style={{ padding: 0 }}>
            <div style={{ background: M.iridescent, padding: '16px 16px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, opacity: 0.92 }}>현재 등급</div>
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.92 }}>🥈 SILVER</div>
              </div>
              <div className="tnum" style={{ marginTop: 4, fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 1px 4px rgba(26,31,58,0.15)' }}>1,840 XP</div>
              <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                <div style={{ width: '61%', height: '100%', background: '#fff', borderRadius: 3 }}/>
              </div>
              <div className="tnum" style={{ marginTop: 6, fontSize: 11, opacity: 0.95, fontWeight: 700 }}>🥇 골드까지 1,160 XP</div>
            </div>
          </MCard>
        </div>

        {/* summary 3 col */}
        <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, position: 'relative' }}>
          {[
            ['정답률','78','%', M.cyan],
            ['세션','42','', M.violet],
            ['문제','614','', M.mint],
          ].map(([l,v,u,c]) => (
            <MCard key={l} style={{ padding: '12px 10px 14px' }}>
              <div style={{ fontSize: 10, color: M.inkMute, fontWeight: 700, letterSpacing: 0.5 }}>{l}</div>
              <div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: c, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1 }}>{v}<span style={{ fontSize: 12, color: M.inkSoft }}>{u}</span></div>
            </MCard>
          ))}
        </div>

        {/* weakness */}
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 14 }}>✦</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: M.ink, letterSpacing: '-0.01em' }}>오늘의 약점</div>
              <div style={{ flex: 1 }}/>
              <div style={{ fontSize: 11, color: M.pink, fontWeight: 700 }}>전체 →</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['음정', '단7도', 32, M.pink],
                ['코드', '감화음', 41, M.violet],
                ['진행', 'V → vi', 48, M.amber],
              ].map(([m, n, p, c]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}99` }}/>
                  <div style={{ width: 36, fontSize: 10, color: M.inkMute, fontWeight: 700 }}>{m}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: M.ink }}>{n}</div>
                  <div className="tnum" style={{ fontSize: 13, fontWeight: 800, color: c }}>{p}%</div>
                </div>
              ))}
            </div>
          </MCard>
        </div>

        {/* mode grid */}
        <div style={{ padding: '16px 20px 0', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: M.ink, letterSpacing: '-0.01em' }}>훈련 모드</div>
            <div style={{ fontSize: 11, color: M.inkMute, fontWeight: 700 }}>9 모드</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MODES.slice(0, 6).map((m, i) => {
              const rates = [78,64,52,40,71,83];
              const gradients = [
                'linear-gradient(135deg, #06b6d4, #a855f7)',
                'linear-gradient(135deg, #a855f7, #ec4899)',
                'linear-gradient(135deg, #ec4899, #f59e0b)',
                'linear-gradient(135deg, #f59e0b, #10b981)',
                'linear-gradient(135deg, #10b981, #06b6d4)',
                'linear-gradient(135deg, #a855f7, #06b6d4)',
              ];
              return (
                <MCard key={m.id} style={{ padding: '14px 14px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: gradients[i],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    boxShadow: `0 4px 12px rgba(168,85,247,0.25)`,
                  }}>{m.emoji}</div>
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, color: M.ink, letterSpacing: '-0.01em' }}>{m.name}</div>
                  <div style={{ fontSize: 10.5, color: M.inkMute, marginTop: 1 }}>{m.sub}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: M.hairSoft, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${rates[i]}%`, background: gradients[i], borderRadius: 2 }}/>
                    </div>
                    <div className="tnum" style={{ fontSize: 10, color: M.inkSoft, fontWeight: 800 }}>{rates[i]}%</div>
                  </div>
                </MCard>
              );
            })}
          </div>
        </div>

        {/* tab */}
        <div style={{ padding: '20px 20px 24px', position: 'relative' }}>
          <MCard style={{ padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {[['🏠','홈',true],['📊','통계',false],['🏆','업적',false]].map(([icon, label, active]) => (
              <button key={label} style={{
                padding: '10px 0', borderRadius: 16, border: 'none',
                background: active ? M.iridescent : 'transparent',
                color: active ? '#fff' : M.inkSoft, fontSize: 11, fontWeight: 800,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                boxShadow: active ? '0 6px 16px rgba(168,85,247,0.35)' : 'none',
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </MCard>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// M.Setup
// ─────────────────────────────────────────────────────────────
function M_Setup() {
  return (
    <Phone screenBg={M.bg}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <MOrb size={220} style={{ position: 'absolute', top: -80, right: -80, filter: 'blur(36px)' }}/>
        <MOrb size={180} style={{ position: 'absolute', top: 280, left: -80, filter: 'blur(32px)' }}/>

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 16, color: M.ink }}>←</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: M.violet, fontWeight: 800, letterSpacing: 2 }}>SETUP</div>
          <div style={{ width: 38 }}/>
        </div>

        {/* hero — iridescent emblem */}
        <div style={{ padding: '20px 20px 0', position: 'relative' }}>
          <MCard gloss style={{ padding: '26px 18px 22px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', width: 92, height: 92, borderRadius: 28,
              background: M.iridescent,
              alignItems: 'center', justifyContent: 'center', fontSize: 44,
              boxShadow: '0 12px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>🎵</div>
            <div style={{ marginTop: 14, fontSize: 28, fontWeight: 800, color: M.ink, letterSpacing: '-0.02em' }}><MText size={28}>음정 듣기</MText></div>
            <div style={{ fontSize: 12, color: M.inkSoft, marginTop: 4 }}>두 음 사이 간격 식별</div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
              <MChip color={M.pink}>⚡ 약점 집중</MChip>
              <MChip color={M.cyan}>10 문항</MChip>
            </div>
          </MCard>
        </div>

        {/* howto */}
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>사용법</div>
            <div style={{ marginTop: 6, fontSize: 12.5, color: M.ink, lineHeight: 1.55 }}>
              두 음이 차례로 들리면 그 사이의 음정을 보기에서 골라요. 헷갈리면 ▶ 듣기를 다시 누르세요.
            </div>
          </MCard>
        </div>

        {/* level */}
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: M.ink }}>레벨</div>
              <div style={{ fontSize: 11, color: M.pink, fontWeight: 800 }}>Lv 4 · 음역확장</div>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => {
                const active = n === 4, done = n < 4;
                return (
                  <button key={n} className="tnum" style={{
                    height: 42, borderRadius: 14, border: 'none',
                    background: active ? M.iridescent
                      : done ? M.iridescentSoft : 'rgba(26,31,58,0.04)',
                    color: active ? '#fff' : done ? M.violet : M.inkSoft,
                    fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                    boxShadow: active ? '0 6px 14px rgba(168,85,247,0.45)' : 'none',
                  }}>{n}</button>
                );
              })}
            </div>
          </MCard>
        </div>

        {/* toggle */}
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: M.ink }}>절대음감 모드</div>
              <div style={{ fontSize: 11, color: M.inkMute, marginTop: 2 }}>기준음 없이 음이름만 듣기</div>
            </div>
            <div style={{ width: 44, height: 26, borderRadius: 999, background: 'rgba(26,31,58,0.08)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}/>
            </div>
          </MCard>
        </div>

        <div style={{ padding: '20px 20px 28px', position: 'relative' }}>
          <button style={{
            width: '100%', padding: '18px 0', borderRadius: 18, border: 'none',
            background: M.iridescent,
            color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
            boxShadow: '0 16px 32px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>🎵  시작하기</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// M.Training
// ─────────────────────────────────────────────────────────────
function M_Training() {
  return (
    <Phone screenBg={M.bg}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <MOrb size={260} style={{ position: 'absolute', top: 100, right: -100, filter: 'blur(40px)' }}/>
        <MOrb size={200} style={{ position: 'absolute', top: 380, left: -80, filter: 'blur(36px)' }}/>

        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 16 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: M.ink }}>음정 · Lv 4</div>
            <div className="tnum" style={{ fontSize: 10, color: M.inkMute, fontWeight: 700 }}>5 / 10 · ✓ 4</div>
          </div>
          <MChip color={M.violet}>C major</MChip>
        </div>

        {/* progress with gradient on current */}
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {Array.from({length: 10}).map((_,i)=>(
              <div key={i} style={{
                height: 6, borderRadius: 3,
                background: i < 4 ? M.mint
                  : i === 4 ? M.iridescent
                  : i < 5 ? M.pink
                  : 'rgba(26,31,58,0.1)',
              }}/>
            ))}
          </div>
        </div>

        {/* play orb */}
        <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              background: M.iridescent, opacity: 0.6, filter: 'blur(20px)',
            }}/>
            <button style={{
              position: 'relative', width: 144, height: 144, borderRadius: '50%', border: 'none',
              background: M.iridescent,
              color: '#fff', fontSize: 48, fontWeight: 700,
              boxShadow: '0 20px 50px rgba(168,85,247,0.55), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -8px 16px rgba(26,31,58,0.15)',
            }}>▶</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: M.violet, fontWeight: 800, letterSpacing: 3 }}>듣기</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, position: 'relative' }}>
            <MChip>🎹 기준음</MChip>
            <MChip>🐢 느리게</MChip>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: M.ink, letterSpacing: '-0.01em' }}>두 음 사이의 음정은?</div>
        </div>

        {/* choices */}
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {INTERVAL_CHOICES.slice(0, 6).map(([k, sub], i) => {
              const picked = i === 5;
              return (
                <button key={k} style={{
                  position: 'relative', minHeight: 64, padding: '12px 14px',
                  borderRadius: 18,
                  border: picked ? 'none' : '1px solid rgba(255,255,255,0.9)',
                  background: picked ? M.iridescent : 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(15px)',
                  color: picked ? '#fff' : M.ink,
                  textAlign: 'left',
                  boxShadow: picked
                    ? '0 12px 28px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.4)'
                    : '0 4px 12px rgba(26,31,58,0.06)',
                }}>
                  <div className="tnum" style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontWeight: 700, opacity: 0.6 }}>{i+1}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>{k}</div>
                  <div className="tnum" style={{ fontSize: 11, opacity: 0.75, fontWeight: 700, marginTop: 1 }}>{sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '20px 20px 24px', display: 'flex', gap: 10, position: 'relative' }}>
          <button style={{ padding: '14px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', color: M.inkSoft, fontSize: 13, fontWeight: 700 }}>건너뛰기</button>
          <button style={{
            flex: 1, padding: '14px 0', borderRadius: 16, border: 'none',
            background: M.iridescent,
            color: '#fff', fontSize: 14, fontWeight: 800,
            boxShadow: '0 12px 26px rgba(168,85,247,0.5)',
          }}>제출 →</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// M.Result
// ─────────────────────────────────────────────────────────────
function M_Result() {
  return (
    <Phone screenBg={M.bg}>
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100%' }}>
        <MOrb size={300} style={{ position: 'absolute', top: -100, right: -90, filter: 'blur(40px)' }}/>
        <MOrb size={240} style={{ position: 'absolute', top: 260, left: -90, filter: 'blur(36px)' }}/>
        <MOrb size={200} style={{ position: 'absolute', top: 500, right: -80, filter: 'blur(34px)' }}/>

        {/* rank up */}
        <div style={{ padding: '22px 20px 0', position: 'relative' }}>
          <MCard gloss style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 16,
              background: M.iridescent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              boxShadow: '0 8px 20px rgba(168,85,247,0.45)',
            }}>🎊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 2 }}>★ RANK UP</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: M.ink, marginTop: 2, letterSpacing: '-0.02em' }}>실버 → <MText size={17}>골드</MText> 🥇</div>
            </div>
          </MCard>
        </div>

        {/* score hero */}
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard gloss style={{ padding: '22px 18px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <MOrb size={200} style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', filter: 'blur(28px)', opacity: 0.5 }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 50, lineHeight: 1 }}>🏆</div>
              <div className="tnum" style={{
                marginTop: 6, fontSize: 110, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 1,
                background: M.iridescent,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.3))',
              }}>92<span style={{ fontSize: 40 }}>%</span></div>
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: M.ink }}>완벽합니다!</div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <MChip color={M.mint}>✓ 9 정답</MChip>
                <MChip>✗ 1</MChip>
                <MChip color={M.cyan}>2:14</MChip>
                <MChip color={M.pink}>🔥 7</MChip>
              </div>
            </div>
          </MCard>
        </div>

        {/* xp */}
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: M.inkSoft, fontWeight: 700, letterSpacing: 1 }}>이번 세션 + XP</div>
              <div className="tnum" style={{
                fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em',
                background: M.iridescent,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>+248</div>
            </div>
            <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: M.hairSoft, overflow: 'hidden' }}>
              <div style={{ width: '14%', height: '100%', background: M.iridescent, borderRadius: 4 }}/>
            </div>
            <div className="tnum" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.inkMute, fontWeight: 700 }}>
              <span>🥇 골드 3,088</span><span>플래티넘 8,000</span>
            </div>
          </MCard>
        </div>

        {/* badge */}
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: '0 6px 16px rgba(236,72,153,0.4)',
            }}>🔥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: M.pink, fontWeight: 800, letterSpacing: 1.5 }}>NEW · 업적</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: M.ink, marginTop: 2 }}>3연속 정답</div>
            </div>
          </MCard>
        </div>

        <div style={{ padding: '20px 20px 28px', position: 'relative' }}>
          <button style={{
            width: '100%', padding: '16px 0', borderRadius: 18, border: 'none',
            background: M.iridescent,
            color: '#fff', fontSize: 15, fontWeight: 800,
            boxShadow: '0 14px 30px rgba(168,85,247,0.5)',
          }}>한 번 더</button>
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// M.Stats
// ─────────────────────────────────────────────────────────────
function M_Stats() {
  const trend = [52,58,55,63,60,68,72,70,74,69,78,82,77,85,80,88,84,90,87,92];
  return (
    <Phone screenBg={M.bg}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <MOrb size={240} style={{ position: 'absolute', top: -80, left: -60, filter: 'blur(36px)' }}/>
        <MOrb size={220} style={{ position: 'absolute', top: 240, right: -70, filter: 'blur(36px)' }}/>

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 16 }}>←</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 800, color: M.ink }}>📊 통계</div>
          <div style={{ width: 36 }}/>
        </div>

        <div style={{ padding: '16px 20px 0', position: 'relative' }}>
          <MCard gloss style={{ padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
            <MOrb size={180} style={{ position: 'absolute', top: -40, right: -40, filter: 'blur(28px)' }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, color: M.inkSoft, fontWeight: 700, letterSpacing: 1 }}>전체 정답률</div>
              <div className="tnum" style={{
                marginTop: 4, fontSize: 76, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1,
                background: M.iridescent,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>78<span style={{ fontSize: 26 }}>%</span></div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <div><b style={{ fontSize: 14, color: M.ink, fontWeight: 800 }}>42</b> <span style={{ fontSize: 10, color: M.inkMute }}>세션</span></div>
                <div><b style={{ fontSize: 14, color: M.ink, fontWeight: 800 }}>614</b> <span style={{ fontSize: 10, color: M.inkMute }}>문제</span></div>
                <div><b style={{ fontSize: 14, color: M.pink, fontWeight: 800 }}>12일</b> <span style={{ fontSize: 10, color: M.inkMute }}>연속</span></div>
              </div>
            </div>
          </MCard>
        </div>

        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: M.ink }}>세션별 정답률</div>
              <div style={{ fontSize: 11, color: M.inkMute, fontWeight: 700 }}>최근 20회</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <svg width="0" height="0"><defs>
                <linearGradient id="mTrendL" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={M.cyan}/>
                  <stop offset="50%" stopColor={M.violet}/>
                  <stop offset="100%" stopColor={M.pink}/>
                </linearGradient>
                <linearGradient id="mTrendF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={M.violet} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={M.violet} stopOpacity="0"/>
                </linearGradient>
              </defs></svg>
              <MiniSpark points={trend} w={336} h={86} stroke="url(#mTrendL)" strokeWidth={2.4} fill="url(#mTrendF)"/>
            </div>
          </MCard>
        </div>

        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: M.ink, marginBottom: 12 }}>모드별 정답률</div>
            {[
              ['🎵 음정', 84, 'linear-gradient(90deg, #06b6d4, #10b981)'],
              ['🎹 코드', 71, 'linear-gradient(90deg, #a855f7, #ec4899)'],
              ['🎼 계명', 68, 'linear-gradient(90deg, #06b6d4, #a855f7)'],
              ['🎸 진행', 52, 'linear-gradient(90deg, #f59e0b, #ec4899)'],
              ['🥁 리듬', 47, 'linear-gradient(90deg, #ec4899, #f59e0b)'],
            ].map(([n, v, c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ width: 72, fontSize: 12, color: M.ink, fontWeight: 700 }}>{n}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: M.hairSoft, overflow: 'hidden' }}>
                  <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 4 }}/>
                </div>
                <div className="tnum" style={{ width: 36, fontSize: 12, fontWeight: 800, color: M.ink, textAlign: 'right' }}>{v}%</div>
              </div>
            ))}
          </MCard>
        </div>

        <div style={{ padding: '20px 20px 28px', position: 'relative' }}>
          <button style={{
            width: '100%', padding: '16px 0', borderRadius: 18, border: 'none',
            background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
            color: '#fff', fontSize: 14, fontWeight: 800,
            boxShadow: '0 14px 30px rgba(236,72,153,0.45)',
          }}>약점 집중 복습 →</button>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { M_Home, M_Setup, M_Training, M_Result, M_Stats });
