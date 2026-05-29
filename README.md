# 🎵 음감 훈련 웹앱

교회 건반 반주자를 위한 상대음감 훈련 앱입니다.

## 훈련 모드

- 🎼 **계명(이동도)** — 기준음 대비 음을 듣고 도/레/미/파/솔/라/시 맞히기
- 🎵 **음정 듣기** — 두 음 사이 간격 식별 (완전5도, 장3도 등)
- 🎹 **코드 듣기** — 장/단/감/증 화음 및 7화음 식별
- 🎸 **코드 진행** — 다이어토닉/찬양 패턴 진행 받아적기 (넘버/로마 표기)
- 🎶 **멜로디 받아적기** — 건반으로 멜로디 음 입력
- 🔄 **조옮김 연습** — 다른 조에서도 같은 도수 인식
- 🥁 **리듬 받아치기** — 리듬 패턴 탭으로 따라치기
- ⚔️ **온라인 1대1 대결** — 같은 문제로 친구와 실시간 정확도·속도 경쟁 ([설정](#온라인-1대1-대결-supabase-설정))

## 시작하기

### 사전 요구사항

- [Node.js](https://nodejs.org) 18 이상
- npm 9 이상

### 설치 및 실행

```bash
cd ear-trainer
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열면 앱이 실행됩니다.

### 빌드 (배포용)

```bash
npm run build
```

`dist/` 폴더가 생성됩니다.

## Vercel 배포

1. [GitHub](https://github.com)에 이 폴더를 새 저장소로 push
2. [Vercel](https://vercel.com)에서 해당 저장소 import
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. 배포 완료 후 `프로젝트명.vercel.app` 주소로 휴대폰에서 접속
4. (온라인 1대1 대결을 쓰려면) **Settings → Environment Variables**에 아래 두 값을 추가하고 재배포 — [Supabase 설정](#온라인-1대1-대결-supabase-설정) 참고
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 온라인 1대1 대결 (Supabase 설정)

두 사람이 **같은 문제 시퀀스**를 받아 실시간으로 정확도·속도를 겨루는 기능입니다.
홈 화면의 **"친구와 1대1 대결"** 카드 또는 `#/battle` 경로로 진입하며,
호스트가 "방 만들기"로 6자리 코드를 만들어 공유하면 상대가 "코드로 입장"해 대결합니다.

### 동작 방식 (백엔드 없이도 동작)

- **환경변수 미설정 시:** `BroadcastChannel` 폴백으로 동작 — **같은 브라우저의 여러 탭끼리만** 연결됩니다(로컬 테스트용). 다른 기기/사람과는 대결할 수 없습니다.
- **Supabase 환경변수 설정 시:** Supabase Realtime을 통해 **서로 다른 기기·브라우저 간** 실시간 대결이 됩니다.

코드 변경은 필요 없습니다 — 환경변수 유무에 따라 `createTransport()`가 자동으로 전환합니다
(`src/net/transport.ts`).

### Supabase 설정 단계

1. [supabase.com](https://supabase.com)에서 무료 프로젝트를 생성합니다.
2. 프로젝트 대시보드 → **Settings → API**에서 다음 두 값을 복사합니다.
   - **Project URL** → `VITE_SUPABASE_URL` (`https://<project-ref>.supabase.co`)
   - **Project API keys**의 **anon / public** 키 → `VITE_SUPABASE_ANON_KEY`
   - ⚠️ `service_role` 키는 사용하지 마세요(서버 전용·비공개). `anon`(public) 키는 원래 브라우저에 노출되도록 설계된 공개 키라 클라이언트 번들에 포함되어도 안전합니다.
3. **로컬 개발:** `.env.example`을 복사해 `.env`(또는 `.env.local`)를 만들고 두 값을 채웁니다.
   ```bash
   cp .env.example .env
   # .env 파일을 열어 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 입력
   npm run dev
   ```
   (`.env`, `.env.local`은 `.gitignore`에 있어 커밋되지 않습니다.)
4. **Vercel 배포:** 프로젝트 → **Settings → Environment Variables**에 같은 두 변수를 추가하고 재배포합니다.
5. **GitHub Pages 배포:** 저장소 → **Settings → Secrets and variables → Actions**에 두 값을 시크릿으로 추가하면 배포 워크플로(`.github/workflows/deploy.yml`)가 빌드 시 주입합니다.

### 추가 Supabase 설정이 필요한가요?

**아니요.** 이 기능은 Realtime **Broadcast/Presence**만 사용하며, Realtime은 신규 프로젝트에서 기본 활성화됩니다.
- 데이터베이스 테이블 생성 불필요
- RLS 정책 설정 불필요
- Supabase Auth(로그인) 불필요 — 플레이어 신원은 익명 닉네임(로컬 저장)으로 처리됩니다.
- 룸 접근 통제는 추측 불가능한 6자리 룸 코드가 담당합니다(Jackbox 방식).

### 설정 확인

`.env`에 값을 넣고 `npm run dev` 실행 후, 서로 다른 두 기기(또는 시크릿 창)에서 접속해
한쪽이 방을 만들고 다른 쪽이 코드로 입장하면 대결이 시작됩니다.
값이 비어 있으면 같은 브라우저 탭끼리만 연결되는 폴백 모드로 동작합니다.

## 기술 스택

| 영역 | 라이브러리 |
|------|-----------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite |
| 스타일 | Tailwind CSS |
| 오디오 | Tone.js + Salamander Grand Piano 샘플 |
| 음악 이론 | tonal |
| 악보 | VexFlow |
| 실시간 대결 | Supabase Realtime (Broadcast/Presence), BroadcastChannel 폴백 |
| 상태 관리 | Zustand (localStorage persist) |
| 라우팅 | React Router v6 |
| 차트 | Recharts |

## 데이터 저장

모든 학습 기록은 브라우저의 **localStorage**에 JSON으로 저장됩니다. 서버 없이 작동하며, 설정 > 기록 관리에서 JSON으로 내보내기/가져오기가 가능합니다. 온라인 대결의 실시간 통신에만 Supabase를 사용하고, 학습 기록은 여전히 로컬에만 저장됩니다.
