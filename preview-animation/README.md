# 음감 훈련 — 웹 앱 미리보기 애니메이션

실제 화면 녹화가 아니라, 앱의 핵심 흐름을 한눈에 보여주는 **연출 애니메이션**입니다.
미니멀·담백한 인디고(`#3730a3`) 팔레트, 16:10, 5초 무한 루프(끊김 없음).

## 한 번의 루프에서 일어나는 일

1. 상단 모드 칩(**인터벌 · 코드 · 진행 · 리듬**)에 은은한 하이라이트가 좌우로 순환.
2. 가운데 건반에서 두 음(C·G = 완전5도)이 눌리며 **'띵'** 음파가 한 번 퍼짐.
3. 보기 중 정답(**완전5도**)이 선택되고 **초록 체크**가 팝업.
4. 우측 **연속 정답 스트릭 링**이 한 칸 채워지며 `+1`.
5. 모든 전환 요소가 부드럽게 사라지고 첫 프레임 상태로 복귀 → 이음새 없는 루프.

## 산출물 (`out/`)

| 파일 | 사양 | 용도 |
|------|------|------|
| `preview.webm` | VP9 · 1000×625 · 30fps · 5s · ~84KB | **우선** (웹 `<video loop>`) |
| `preview.gif`  | 1000×625 · 20fps · 무한 루프 · ~310KB | 폴백 |
| `poster.png`   | 1000×625 (첫 프레임) | 정적 포스터 / `<video poster>` |

```html
<video src="preview.webm" poster="poster.png" autoplay loop muted playsinline></video>
```

## 다시 만들기

```bash
# 1) 프레임 렌더 (Playwright Chromium → 2× PNG, 결정적/이음새 보장)
node render.mjs 30 5            # fps, seconds

# 2) 인코딩 (ffmpeg: webm + gif + poster)
./encode.sh 30                 # fps
```

- 소스는 단일 파일 `scene.html` 입니다. 브라우저로 직접 열면 실시간 루프 미리보기가 돕니다.
  렌더러는 `?static=1` 로 열어 `window.renderFrame(phase)` 를 프레임 단위로 호출합니다.
- `render.mjs` 는 전역 설치된 Playwright를 사용합니다. 모듈을 찾지 못하면
  레포 루트에 심볼릭 링크를 만드세요: `ln -s "$(npm root -g)/playwright" node_modules/playwright`.
- `encode.sh` 는 `imageio-ffmpeg` 가 번들한 ffmpeg를 사용합니다 (`pip install imageio-ffmpeg`).

## 폰트

[Pretendard](https://github.com/orioncactus/pretendard) (SIL Open Font License 1.1) 의
woff2 서브셋을 `fonts/` 에 포함합니다. 미설치 환경에서는 시스템 CJK 폰트로 폴백합니다.
