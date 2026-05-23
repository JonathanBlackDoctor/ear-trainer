// direction-j.jsx — 카세트 테이프 (Y2K Cassette)
// Hot pink + teal + chrome silver. Tape reel motifs. Nostalgic playful.

const J = {
  bg: '#f5ecdc',            // warm cream
  card: '#ffffff',
  chrome: 'linear-gradient(180deg, #f5f5f7 0%, #d5d8de 50%, #f5f5f7 100%)',
  ink: '#1a0d1f',
  inkSoft: '#5a4860',
  inkMute: '#a899ad',
  hair: '#ddd0c1',
  pink: '#ff3da8',
  pinkDeep: '#c91d80',
  teal: '#00c4b4',
  tealDeep: '#0a8a7d',
  yellow: '#ffd83d',
  silver: '#c0c4cc',
};

// Tape reel — concentric circles with spokes
function JReel({ size = 44, color = J.ink, hubColor = J.pink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ display: 'block' }}>
      <circle cx="22" cy="22" r="20" fill={J.chrome} stroke={color} strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="14" fill="none" stroke={color} strokeWidth="0.8"/>
      {[0, 60, 120, 180, 240, 300].map(a => {
        const rad = a * Math.PI / 180;
        return <line key={a} x1={22 + Math.cos(rad) * 7} y1={22 + Math.sin(rad) * 7}
          x2={22 + Math.cos(rad) * 13} y2={22 + Math.sin(rad) * 13}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      <circle cx="22" cy="22" r="6.5" fill={hubColor} stroke={color} strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="2" fill={color}/>
    </svg>
  );
}

// Diagonal stripe (caution-tape) band
const JStripes = ({ h = 12, c1 = J.pink, c2 = J.yellow }) => (
  <div style={{ height: h, background: `repeating-linear-gradient(45deg, ${c1} 0 14px, ${c2} 14px 28px)`, borderTop: `2px solid ${J.ink}`, borderBottom: `2px solid ${J.ink}` }}/>
);

// Sticker-style chip
const JSticker = ({ children, bg = J.yellow, rot = -2 }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px', background: bg,
    border: `2px solid ${J.ink}`, fontSize: 11, fontWeight: 900, color: J.ink,
    transform: `rotate(${rot}deg)`, boxShadow: `2px 2px 0 ${J.ink}`, letterSpacing: 0.5,
  }}>{children}</span>
);

// ─────────────────────────────────────────────────────────────
// J.Home
// ─────────────────────────────────────────────────────────────
function J_Home() {
  return (
    <Phone screenBg={J.bg}>
      <JStripes h={10}/>

      {/* masthead with cassette label */}
      <div style={{ padding: '18px 20px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <JSticker bg={J.teal} rot={-3}>★ MIXTAPE</JSticker>
          <JSticker bg={J.yellow} rot={2}>SIDE A · TUE</JSticker>
        </div>
        <div style={{ marginTop: 14, fontSize: 40, fontWeight: 900, color: J.ink, letterSpacing: '-0.04em', lineHeight: 0.95 }}>
          음감 훈련<span style={{ color: J.pink }}>♪</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: J.inkSoft, fontWeight: 700 }}>듣고 · 맞히고 · 다시 감기</div>
      </div>

      {/* cassette body — rank card */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: J.chrome, border: `2.5px solid ${J.ink}`,
          padding: '14px 14px', boxShadow: `4px 4px 0 ${J.ink}`, position: 'relative',
        }}>
          {/* corner screws */}
          {[[6,6],[6,'auto'],['auto',6],['auto','auto']].map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: p[0] === 'auto' ? 'auto' : p[0], bottom: p[0] === 'auto' ? 6 : 'auto',
              left: p[1] === 'auto' ? 'auto' : p[1], right: p[1] === 'auto' ? 6 : 'auto',
              width: 6, height: 6, borderRadius: '50%', background: J.ink,
            }}/>
          ))}
          {/* tape window */}
          <div style={{
            background: '#2a1c2f', border: `2px solid ${J.ink}`, borderRadius: 6,
            padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <JReel hubColor={J.pink}/>
            {/* tape between reels */}
            <div style={{ flex: 1, height: 3, background: J.pink, margin: '0 10px' }}/>
            <JReel hubColor={J.teal}/>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 11, color: J.pinkDeep, fontWeight: 900, letterSpacing: 1.5 }}>NOW PLAYING ►</div>
            <div style={{ flex: 1 }}/>
            <div className="tnum" style={{ fontSize: 16, fontWeight: 900, color: J.ink, letterSpacing: '-0.02em' }}>🥈 1,840 XP</div>
          </div>
          <div style={{ marginTop: 6, height: 10, background: '#fff', border: `2px solid ${J.ink}`, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '61%', background: J.pink, borderRight: `2px solid ${J.ink}` }}/>
          </div>
        </div>
      </div>

      {/* stats — VU meter style */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          ['ACC','78','%', J.pink],
          ['REC','42','', J.teal],
          ['HRS','614','', J.yellow],
        ].map(([l,v,u,c]) => (
          <div key={l} style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `2px 2px 0 ${J.ink}`, padding: '8px 10px 10px' }}>
            <div className="tnum" style={{ fontSize: 9, color: J.inkMute, fontWeight: 900, letterSpacing: 1 }}>{l}</div>
            <div className="tnum" style={{ fontSize: 24, fontWeight: 900, color: c, letterSpacing: '-0.03em', marginTop: 2 }}>{v}<span style={{ fontSize: 12, color: J.ink }}>{u}</span></div>
          </div>
        ))}
      </div>

      {/* tracks (modes) */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ background: J.ink, color: J.yellow, padding: '3px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>TRACK LIST</div>
          <div style={{ flex: 1, height: 2, background: J.ink }}/>
        </div>
        <div style={{ background: J.card, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}` }}>
          {MODES.slice(0, 6).map((m, i) => {
            const rates = [78,64,52,40,71,83];
            const colors = [J.pink, J.teal, J.yellow, J.pink, J.teal, J.yellow];
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderBottom: i < 5 ? `1.5px solid ${J.ink}` : 'none',
                background: i % 2 === 0 ? J.card : '#fff8eb',
              }}>
                <div className="tnum" style={{ fontSize: 10, color: J.inkMute, fontWeight: 900, width: 24 }}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ fontSize: 20 }}>{m.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: J.ink, letterSpacing: '-0.01em' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: J.inkMute, fontWeight: 700 }}>{m.sub}</div>
                </div>
                <div style={{ width: 44, height: 4, background: '#fff', border: `1.5px solid ${J.ink}` }}>
                  <div style={{ width: `${rates[i]}%`, height: '100%', background: colors[i] }}/>
                </div>
                <div className="tnum" style={{ width: 28, fontSize: 11, color: J.ink, fontWeight: 900, textAlign: 'right' }}>{rates[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* transport buttons */}
      <div style={{ padding: '18px 20px 24px' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: '10px 10px', display: 'flex', gap: 6 }}>
          {[['◀◀','REW'],['▶','PLAY',true],['◾','STOP'],['▶▶','FF']].map(([sym, l, active]) => (
            <button key={l} className="tnum" style={{
              flex: 1, padding: '10px 0', border: `2px solid ${J.ink}`,
              background: active ? J.pink : J.card,
              color: active ? '#fff' : J.ink,
              fontSize: 11, fontWeight: 900, letterSpacing: 1,
            }}><div style={{ fontSize: 14 }}>{sym}</div>{l}</button>
          ))}
        </div>
      </div>
      <JStripes h={10} c1={J.teal} c2={J.pink}/>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// J.Setup
// ─────────────────────────────────────────────────────────────
function J_Setup() {
  return (
    <Phone screenBg={J.bg}>
      <JStripes h={8}/>
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 36, height: 36, border: `2px solid ${J.ink}`, background: J.card, fontSize: 16, boxShadow: `2px 2px 0 ${J.ink}` }}>◀</button>
        <JSticker bg={J.teal} rot={-2}>SETUP / B-02</JSticker>
        <div style={{ flex: 1 }}/>
      </div>

      {/* hero — like a cassette label */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{
          background: J.yellow, border: `2.5px solid ${J.ink}`, boxShadow: `5px 5px 0 ${J.ink}`,
          padding: '16px 16px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <JReel size={36} hubColor={J.pink}/>
          </div>
          <div className="tnum" style={{ fontSize: 10, color: J.pinkDeep, fontWeight: 900, letterSpacing: 2 }}>TRACK 02 · SIDE A</div>
          <div style={{ marginTop: 4, fontSize: 32, fontWeight: 900, color: J.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>음정 듣기</div>
          <div style={{ fontSize: 13, color: J.ink, fontWeight: 700, marginTop: 4 }}>두 음 사이 간격 식별</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            <JSticker bg={J.pink} rot={-2}>⚡ FOCUS</JSticker>
            <JSticker bg={J.card} rot={1}>10 곡</JSticker>
          </div>
        </div>
      </div>

      {/* howto */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '12px 14px' }}>
          <div className="tnum" style={{ fontSize: 9, color: J.pinkDeep, fontWeight: 900, letterSpacing: 2 }}>// LINER NOTES</div>
          <div style={{ marginTop: 6, fontSize: 13, color: J.ink, lineHeight: 1.55, fontWeight: 700 }}>
            두 음이 차례로 들리면 그 사이의 음정을 보기에서 골라요. 헷갈리면 REW 눌러서 다시.
          </div>
        </div>
      </div>

      {/* level dial */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: '12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: J.ink, color: J.yellow, padding: '3px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>LEVEL</div>
            <div style={{ flex: 1 }}/>
            <div className="tnum" style={{ fontSize: 12, fontWeight: 900, color: J.pinkDeep }}>Lv 04 · 음역확장</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => {
              const active = n === 4, done = n < 4;
              return (
                <button key={n} className="tnum" style={{
                  height: 44, border: `2px solid ${J.ink}`, fontSize: 14, fontWeight: 900,
                  background: active ? J.pink : done ? '#ffe1f1' : J.card,
                  color: active ? '#fff' : J.ink,
                  boxShadow: active ? `2px 2px 0 ${J.ink}` : 'none',
                }}>{n}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* toggle */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: J.ink }}>NO_REF · 절대음감</div>
            <div style={{ fontSize: 10.5, color: J.inkMute, fontWeight: 700 }}>기준음 없이 진행</div>
          </div>
          <div style={{ width: 48, height: 24, border: `2px solid ${J.ink}`, background: J.card, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, background: J.inkMute, border: `1.5px solid ${J.ink}` }}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 24px' }}>
        <button style={{
          width: '100%', padding: '18px 0', border: `2.5px solid ${J.ink}`,
          background: J.pink, color: '#fff', fontSize: 17, fontWeight: 900,
          letterSpacing: '-0.01em', boxShadow: `5px 5px 0 ${J.ink}`,
        }}>▶  PLAY / 시작하기</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// J.Training
// ─────────────────────────────────────────────────────────────
function J_Training() {
  return (
    <Phone screenBg={J.bg}>
      <JStripes h={6}/>
      <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 32, height: 32, border: `2px solid ${J.ink}`, background: J.card, fontSize: 14, boxShadow: `2px 2px 0 ${J.ink}` }}>◀</button>
        <div className="tnum" style={{ fontSize: 11, fontWeight: 900, color: J.ink, letterSpacing: 1.5 }}>TRK·02 / Lv04</div>
        <div style={{ flex: 1 }}/>
        <JSticker bg={J.teal} rot={2}>C major</JSticker>
      </div>

      {/* tape window with reels */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, padding: '12px 12px', boxShadow: `4px 4px 0 ${J.ink}` }}>
          <div style={{
            background: '#2a1c2f', border: `2px solid ${J.ink}`,
            padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <JReel size={52} hubColor={J.pink}/>
            <div style={{ flex: 1, height: 4, background: J.pink, margin: '0 10px', position: 'relative' }}>
              {/* progress dots */}
              <div style={{ position: 'absolute', left: '50%', top: -6, fontSize: 14 }}>♪</div>
            </div>
            <JReel size={52} hubColor={J.teal}/>
          </div>
          {/* counter */}
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
            {Array.from({length: 10}).map((_,i)=>(
              <div key={i} style={{
                height: 8, border: `1.5px solid ${J.ink}`,
                background: i < 4 ? J.teal : i === 4 ? J.yellow : i < 5 ? J.pink : J.card,
              }}/>
            ))}
          </div>
          <div className="tnum" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, color: J.ink, letterSpacing: 1 }}>
            <span>05 / 10</span>
            <span style={{ color: J.tealDeep }}>✓ 4</span>
          </div>
        </div>
      </div>

      {/* transport */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: 8 }}>
          <button style={{ height: 56, border: `2px solid ${J.ink}`, background: J.card, fontSize: 18, boxShadow: `2px 2px 0 ${J.ink}` }}>🎹</button>
          <button style={{ height: 56, border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 18, fontWeight: 900, boxShadow: `3px 3px 0 ${J.ink}`, letterSpacing: '-0.01em' }}>▶  REPLAY</button>
          <button style={{ height: 56, border: `2px solid ${J.ink}`, background: J.card, fontSize: 18, boxShadow: `2px 2px 0 ${J.ink}` }}>🐢</button>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: J.ink, letterSpacing: '-0.01em' }}>두 음 사이의 음정은?</div>
      </div>

      {/* choice buttons — sticker style */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {INTERVAL_CHOICES.slice(0, 6).map(([k, sub], i) => {
            const picked = i === 5;
            return (
              <button key={k} style={{
                position: 'relative', minHeight: 64, padding: '10px 12px',
                border: `2px solid ${J.ink}`,
                background: picked ? J.teal : J.card, color: picked ? '#fff' : J.ink,
                boxShadow: picked ? `4px 4px 0 ${J.ink}` : `2px 2px 0 ${J.ink}`,
                textAlign: 'left',
                transform: picked ? 'rotate(-1deg)' : 'none',
              }}>
                <div className="tnum" style={{ position: 'absolute', top: 6, right: 10, fontSize: 9, fontWeight: 900, opacity: 0.6 }}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4, letterSpacing: '-0.02em' }}>{k}</div>
                <div className="tnum" style={{ fontSize: 11, opacity: 0.7, fontWeight: 700 }}>{sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '18px 20px 24px', display: 'flex', gap: 8 }}>
        <button style={{ padding: '12px 16px', border: `2px solid ${J.ink}`, background: J.card, color: J.inkSoft, fontSize: 12, fontWeight: 900, boxShadow: `2px 2px 0 ${J.ink}` }}>SKIP</button>
        <button style={{ flex: 1, padding: '12px 0', border: `2.5px solid ${J.ink}`, background: J.yellow, color: J.ink, fontSize: 15, fontWeight: 900, boxShadow: `4px 4px 0 ${J.ink}` }}>SUBMIT ►</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// J.Result
// ─────────────────────────────────────────────────────────────
function J_Result() {
  return (
    <Phone screenBg={J.bg}>
      <JStripes h={10} c1={J.pink} c2={J.yellow}/>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: J.pink, border: `2.5px solid ${J.ink}`, padding: '12px 14px',
          boxShadow: `4px 4px 0 ${J.ink}`, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 28 }}>🎊</div>
          <div style={{ flex: 1, color: '#fff' }}>
            <div className="tnum" style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2, color: J.yellow }}>★ SIDE B UNLOCKED ★</div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 2 }}>SILVER → GOLD 🥇</div>
          </div>
        </div>
      </div>

      {/* big score */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: J.yellow, border: `2.5px solid ${J.ink}`, padding: '20px 16px',
          boxShadow: `6px 6px 0 ${J.ink}`, textAlign: 'center', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 12, left: 12 }}><JReel size={28}/></div>
          <div style={{ position: 'absolute', top: 12, right: 12 }}><JReel size={28} hubColor={J.teal}/></div>
          <div style={{ fontSize: 46, lineHeight: 1 }}>🏆</div>
          <div className="tnum" style={{ marginTop: 4, fontSize: 96, fontWeight: 900, color: J.ink, letterSpacing: '-0.06em', lineHeight: 0.9 }}>92<span style={{ fontSize: 30, color: J.pinkDeep }}>%</span></div>
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: J.ink }}>완벽한 한 곡!</div>
        </div>
      </div>

      {/* stats */}
      <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
        {[['✓','9',J.teal],['✗','1',J.pink],['🔥','7',J.pink],['⏱','2:14',J.teal]].map(([l,v,c], i) => (
          <div key={i} style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `2px 2px 0 ${J.ink}`, padding: '8px 4px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{l}</div>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 900, color: c, letterSpacing: '-0.02em', marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* xp */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.teal, border: `2.5px solid ${J.ink}`, padding: '12px 14px', boxShadow: `4px 4px 0 ${J.ink}` }}>
          <div className="tnum" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>+ XP BONUS</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>+248</div>
          </div>
          <div style={{ marginTop: 10, height: 12, background: J.card, border: `2px solid ${J.ink}` }}>
            <div style={{ width: '14%', height: '100%', background: J.yellow, borderRight: `2px solid ${J.ink}` }}/>
          </div>
        </div>
      </div>

      {/* badge */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: J.pink, border: `2px solid ${J.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔥</div>
          <div style={{ flex: 1 }}>
            <JSticker bg={J.yellow} rot={-2}>NEW</JSticker>
            <div style={{ fontSize: 14, fontWeight: 900, color: J.ink, marginTop: 4 }}>3연속 정답</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px 24px' }}>
        <button style={{ width: '100%', padding: '14px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 14, fontWeight: 900, boxShadow: `4px 4px 0 ${J.ink}` }}>◁◁ REW · 한 번 더</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────
// J.Stats
// ─────────────────────────────────────────────────────────────
function J_Stats() {
  const trend = [52,58,55,63,60,68,72,70,74,69,78,82,77,85,80,88,84,90,87,92];
  return (
    <Phone screenBg={J.bg}>
      <JStripes h={8}/>
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 32, height: 32, border: `2px solid ${J.ink}`, background: J.card, fontSize: 14, boxShadow: `2px 2px 0 ${J.ink}` }}>◀</button>
        <JSticker bg={J.teal} rot={-2}>STATS · 통계</JSticker>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, padding: '14px 14px', boxShadow: `4px 4px 0 ${J.ink}` }}>
          <div className="tnum" style={{ fontSize: 11, fontWeight: 900, color: J.pinkDeep, letterSpacing: 2 }}>TOTAL ACC</div>
          <div className="tnum" style={{ fontSize: 80, fontWeight: 900, color: J.ink, letterSpacing: '-0.06em', lineHeight: 0.9, marginTop: 4 }}>78<span style={{ fontSize: 26, color: J.pink }}>%</span></div>
          {/* mini VU bars */}
          <div style={{ marginTop: 12, display: 'flex', gap: 3, height: 24, alignItems: 'flex-end' }}>
            {[3,5,6,7,5,8,9,8,10,9,11,12,11,13,12,14,13,15,14,16].map((v,i)=>(
              <div key={i} style={{ flex: 1, height: `${v*5}%`, background: i > 14 ? J.pink : J.teal, border: `1px solid ${J.ink}` }}/>
            ))}
          </div>
          <div className="tnum" style={{ marginTop: 6, fontSize: 10, fontWeight: 900, color: J.ink, letterSpacing: 1 }}>SESSION ◁ 23 ▷ 42 · +40pp</div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[['N · 세션','42'],['Q · 문제','614'],['🔥 연속','12']].map(([l,v],i) => (
          <div key={i} style={{ background: J.card, border: `2px solid ${J.ink}`, padding: '8px 8px 10px', boxShadow: `2px 2px 0 ${J.ink}` }}>
            <div style={{ fontSize: 9, color: J.inkMute, fontWeight: 900 }}>{l}</div>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 900, color: J.ink, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.card, border: `2px solid ${J.ink}`, padding: '10px 12px', boxShadow: `3px 3px 0 ${J.ink}` }}>
          <div className="tnum" style={{ fontSize: 10, color: J.ink, fontWeight: 900, marginBottom: 6, letterSpacing: 1.5 }}>TRACK PERFORMANCE</div>
          {[
            ['🎵 음정', 84, J.teal],
            ['🎹 코드', 71, J.pink],
            ['🎼 계명', 68, J.yellow],
            ['🎸 진행', 52, J.pink],
            ['🥁 리듬', 47, J.pink],
          ].map(([n, v, c]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ width: 70, fontSize: 11, fontWeight: 900, color: J.ink }}>{n}</div>
              <div style={{ flex: 1, height: 10, background: '#fff', border: `1.5px solid ${J.ink}` }}>
                <div style={{ width: `${v}%`, height: '100%', background: c }}/>
              </div>
              <div className="tnum" style={{ width: 32, fontSize: 11, fontWeight: 900, color: J.ink, textAlign: 'right' }}>{v}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '18px 20px 24px' }}>
        <button style={{ width: '100%', padding: '14px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 14, fontWeight: 900, boxShadow: `4px 4px 0 ${J.ink}` }}>약점 집중 REC ●</button>
      </div>
    </Phone>
  );
}

Object.assign(window, { J_Home, J_Setup, J_Training, J_Result, J_Stats });
