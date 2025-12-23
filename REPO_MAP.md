# REPO MAP

> **목적**: 이 문서는 전체 시스템의 구조와 데이터 흐름을 빠르게 파악하고, 특정 기능의 디버깅 또는 개발 시작점을 찾는 것을 돕는 기술 요약 지도입니다.

## 1. 시스템 아키텍처 (개요)

이 시스템은 다음과 같이 두 개의 주요 파트로 구성된 모놀리식(Monolithic) 저장소 내의 클라이언트/서버 아키텍처를 따릅니다.

- **Frontend**: `React (Vite + TypeScript)` 기반의 싱글 페이지 애플리케이션(SPA)으로, 사용자 인터페이스와 클라이언트 측 상태 관리를 담당합니다.
- **Backend**: `Spring Boot (Java)` 기반의 API 서버로, 비즈니스 로직, 데이터베이스 상호작용, 그리고 사용자 인증을 처리합니다.
- **Database**: `PostgreSQL`을 사용하여 사용자 계정, 인증 정보, 지원 현황 등의 데이터를 영구 저장합니다.

---

## 2. 핵심 데이터 흐름

### 2.1. 사용자 인증 (WebAuthn Passkey)

1.  **[FE] 등록/로그인 UI**: `AuthView.tsx`에서 사용자 이름 입력 후 "등록" 또는 "로그인" 버튼 클릭.
2.  **[FE] 인증 Hook**: `useAuth.ts`의 `registerPasskey` 또는 `loginPasskey` 함수 호출.
3.  **[FE] API 요청**: `webauthn.ts` 유틸리티를 사용하여 백엔드 `/api/auth/webauthn/*` 엔드포인트에 옵션 요청 및 검증 요청.
4.  **[BE] 인증 컨트롤러**: `AuthController.java`가 요청을 수신하여 `WebAuthnService`로 전달.
5.  **[BE] WebAuthn 서비스**: `WebAuthnService.java`는 `yubico/webauthn-server-core` 라이브러리를 통해 Passkey 생성/검증 로직 수행.
    - **입력**: 사용자 이름, `requestId`, `credential` 객체
    - **처리**: WebAuthn 프로토콜에 따른 암호학적 검증.
    - **출력**: `UserAccount` 엔티티 (성공 시) 또는 예외 (실패 시).
6.  **[BE] 세션 관리**: `SessionService.java`가 `HttpSession`에 `userId`를 저장하여 로그인 상태 유지.
7.  **[FE] 상태 전환**: 인증 성공 시 `App.tsx`는 `status`를 `'authenticated'`로 변경하고 메인 대시보드(`CareerOS`)를 렌더링.

### 2.2. 구직 활동 대시보드

- **초기 진입**: 로그인 성공 후 `App.tsx`는 `CareerOS` 컴포넌트를 렌더링합니다.
- **레이아웃**: `react-resizable-panels`로 구성된 다중 패널 레이아웃.
  - **좌측**: `Sidebar.tsx` (네비게이션 메뉴)
  - **중앙**: 메인 콘텐츠 영역 (선택된 탭에 따라 뷰 변경)
  - **우측**: `EditorWidget.tsx` (선택적 이력서 편집기)
- **상태 관리**: `hooks/index.ts`의 커스텀 훅들이 대부분의 상태를 관리합니다.
  - `useAuth`: 인증 관련 상태 및 API 호출.
  - `useCareerOS`: 전역 UI 상태(현재 뷰, 사이드바 상태, 모달 등).
  - `useApplications`: 지원 현황 데이터(칸반보드) 관리.
  - `useResumes`: 회사별 이력서 데이터 관리.
- **데이터 시각화 및 상호작용**:
  - **지도**: `MapWidget.tsx` (`react-leaflet`)은 지도 위에 회사 위치를 표시.
  - **칸반 보드**: `KanbanView.tsx` (`@dnd-kit`)는 지원 현황을 드래그-앤-드롭으로 관리.
  - **이력서 편집**: `EditorWidget.tsx`는 회사별 맞춤 이력서 작성을 지원.

---

## 3. 주요 모듈 상세

### 3.1. Frontend (`/frontend`)

| 파일/폴더 | 역할 | 입력 | 출력 | 주요 기술/라이브러리 |
| :--- | :--- | :--- | :--- | :--- |
| **`App.tsx`** | **애플리케이션 루트**. 인증 상태에 따라 `AuthView` 또는 `CareerOS` 렌더링. | `useAuth()`의 인증 상태 | UI 렌더링 | React |
| **`hooks/useAuth.ts`** | 인증 관련 로직(회원가입, 로그인, 로그아웃, 복구코드) 처리. | 사용자 입력 이벤트 | API 요청, 인증 상태/결과 | - |
| **`hooks/useCareerOS.ts`** | 메인 대시보드의 전역 UI 상태 관리. | 사용자 상호작용 | UI 상태 변경 | React Hooks |
| **`components/views/`** | 사이드바 탭에 따라 렌더링되는 **메인 화면들**. | `props` (상태와 핸들러) | JSX | - |
| `KanbanView.tsx` | 지원 현황을 관리하는 칸반 보드 뷰. | `applications` 데이터 | 상태 업데이트 콜백 | `@dnd-kit/core` |
| **`components/widgets/`** | 재사용 가능한 **UI 조각들**. | `props` | JSX | - |
| `MapWidget.tsx` | 지도 위에 회사 정보를 시각화하는 위젯. | `companies` 데이터 | 지도 마커, 노드 클릭 이벤트 | `react-leaflet` |
| `EditorWidget.tsx` | 회사별 이력서를 작성하는 텍스트 에디터 위젯. | `contentBlocks` 데이터 | 콘텐츠 변경 콜백 | - |
| **`utils/webauthn.ts`** | WebAuthn API의 복잡한 요청/응답을 처리하는 유틸리티. | 백엔드 옵션, 사용자 기기 응답 | API 요청에 필요한 형식으로 변환된 데이터 | - |

### 3.2. Backend (`/backend`)

| 파일/폴더 | 역할 | 입력 (HTTP) | 출력 (HTTP) | 주요 기술/라이브러리 |
| :--- | :--- | :--- | :--- | :--- |
| **`AuthController.java`** | **인증 관련 모든 API 엔드포인트** 정의. | `POST /api/auth/webauthn/*`<br>`POST /api/auth/recovery/*`<br>`GET /api/auth/me` | `200 OK` (JSON), `401/403` 오류 | Spring Web MVC |
| **`WebAuthnService.java`** | **Passkey 핵심 로직**. 등록/인증 절차를 처리. | `requestId`, `credential` | `UserAccount` 객체 | `yubico/webauthn-server-core` |
| **`SessionService.java`** | **세션 관리**. `HttpSession`을 이용해 로그인 상태 유지. | `userId` | `HttpSession` 변경 | Spring, Jakarta Servlet |
| **`RecoveryCodeService.java`** | **복구 코드** 생성, 저장(해시), 사용 처리. | `username`, `code` | `UserAccount` (성공 시) | `java.security` |
| **`UserAccount.java`** | **사용자 계정 JPA 엔티티**. | - | DB 테이블 `user_account` | Jakarta Persistence |
| **`WebAuthnCredential.java`**| **Passkey 크리덴셜 JPA 엔티티**. | - | DB 테이블 `web_authn_credential` | Jakarta Persistence |
| **`application.yml`** | **애플리케이션 설정**. DB 연결, WebAuthn Relying Party(RP) 정보 등. | 환경 변수 | Spring 컨텍스트 설정 | Spring Boot |

---

## 4. 디버깅 시작점

- **"로그인이 안돼요"**:
  1.  브라우저 개발자 도구 네트워크 탭에서 `/api/auth/webauthn/login/verify` 요청 확인.
  2.  `AuthController.java`의 `finishAuthentication` 메소드에 브레이크포인트 설정.
  3.  `WebAuthnService.java`의 `finishAuthentication` 내부 로직 추적. `AssertionFailedException` 발생 여부 확인.

- **"칸반 보드에 아이템이 안 움직여요"**:
  1.  `KanbanView.tsx`에서 `@dnd-kit`의 `onDragEnd` 이벤트 핸들러 확인.
  2.  `hooks/useApplications.ts`의 `updateStatus` 함수가 정상적으로 호출되는지, `applications` 상태가 업데이트되는지 React DevTools로 확인.

- **"이력서 저장이 안돼요"**:
  1.  `EditorWidget.tsx`의 `setContentBlocks`가 호출되는지 확인.
  2.  `App.tsx`의 `updateResumeBlocksWrapper`가 `resumes` 상태를 올바르게 업데이트하는지 확인 (현재는 클라이언트 측 저장만 구현됨).