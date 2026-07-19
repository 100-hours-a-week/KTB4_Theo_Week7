# React 마이그레이션 문서

## 디렉터리 구성

```text
docs/migration/
├── common/
│   └── 프로젝트 전체에서 공유하는 분석과 설계
└── pages/
    └── 페이지별 동작 기준선과 React 컴포넌트 설계
```

### `common/`

여러 페이지 또는 프로젝트 전체에 영향을 주는 내용을 관리한다.

- 전체 페이지 중복 UI 및 로직 분석
- 공통 컴포넌트 설계
- API client와 인증 구조
- 라우팅 구조
- 공통 마이그레이션 결정 및 변경 기록

### `pages/{page-name}/`

특정 페이지의 마이그레이션 준비와 검증 자료를 관리한다.

- `scenario.md`: 기존 정상 동작 시나리오
- `api-specification.md`: 페이지가 사용하는 API 명세
- `error-behaviors.md`: 상태 코드와 message별 UI 동작
- `ui-baseline.md`: 기존 UI의 텍스트 기준선
- `checklist.md`: Vanilla와 React 비교 체크리스트
- `component-design.md`: React 컴포넌트, props, 상태 및 데이터 흐름
- `screenshots/`: 필요한 경우에만 사용하는 선택적 화면 캡처

## 현재 작성된 페이지

- [로그인](./pages/login/)
- [회원가입](./pages/signup/)
- [게시글 목록](./pages/post-list/)
- [게시글 상세](./pages/post-detail/)
- [전체 페이지 중복 UI 및 로직 분석](./common/shared-ui-and-logic-analysis.md)
