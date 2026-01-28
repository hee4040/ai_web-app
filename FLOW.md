# envrecipe 서비스 흐름도

## 서비스 아키텍처 및 페이지 구조
```markdown
```mermaid
flowchart TD
    A[Landing Page] --> B{로그인 여부}
    B -- No --> C[Google Login]
    C --> D[Home]

    B -- Yes --> D[Home]

    D --> E[Recipe List Page]
    D --> F[Create Recipe Page]

    E --> G[Recipe Detail Page]
    G --> H[AI Assist Result]

    F --> I[Recipe Form]
    I --> J[Submit Recipe]
    J --> D

    %% Backend
    subgraph Supabase
        DB[(PostgreSQL)]
        Storage[(Image Storage)]
        Auth[(Auth)]
    end

    C --> Auth
    I --> DB
    J --> DB
    I --> Storage
    E --> DB
    G --> DB



## 사용자 여종 및 로직 흐름
```mermaid
sequenceDiagram
    actor User
    participant UI as Web UI (Next.js / V0)
    participant Auth as Supabase Auth
    participant DB as Supabase DB
    participant Storage as Supabase Storage
    participant AI as AI Assist (Phase 1: Mock or API)

    User ->> UI: 서비스 접속
    UI ->> Auth: 로그인 요청 (Google OAuth)
    Auth -->> UI: 인증 토큰(user_id)

    User ->> UI: 레시피 작성 페이지 이동
    UI ->> DB: 카테고리 목록 조회
    DB -->> UI: 카테고리 데이터

    User ->> UI: 레시피 작성 (텍스트 + Steps)
    User ->> UI: Step 이미지 업로드
    UI ->> Storage: 이미지 업로드
    Storage -->> UI: 이미지 URL

    UI ->> DB: 레시피 저장 (Recipe + Steps)
    DB -->> UI: 저장 완료

    User ->> UI: 레시피 탐색
    UI ->> DB: 레시피 리스트 조회 (카테고리/정렬)
    DB -->> UI: 레시피 목록

    User ->> UI: 레시피 상세 조회
    UI ->> DB: 레시피 상세 데이터 요청
    DB -->> UI: 레시피 + Steps

    User ->> UI: AI 보조 버튼 클릭
    UI ->> AI: 레시피 컨텍스트 전달
    AI -->> UI: 환경 설정 요약 / 주의사항
