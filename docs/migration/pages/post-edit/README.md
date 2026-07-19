# 게시글 수정 마이그레이션 문서

게시글 수정 페이지의 Vanilla 동작 기준선과 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 범위 판단

수정 화면은 초기 상세 조회, 기존 이미지 보존·교체, 권한 오류와 PATCH 요청이 결합되어 있어 여섯 문서를 모두 유지한다. 화면 캡처가 없더라도 `ui-baseline.md`를 비교 기준으로 사용할 수 있다.

## 작성 페이지와 공유하는 범위

- 공유: `AppLayout`, 인증 상태, 게시글 검증 utility, `useObjectUrls`, API client
- 수정 전용: 초기값이 있는 폼, 기존 이미지 목록, 이미지 보존·전체 교체 규칙, GET/PATCH 오류 이동, 수정 전용 CSS

현재 `PostForm`은 작성 화면의 대형 editor와 하단 고정 action bar에 맞춰져 있다. 수정 화면은 card 형식이고 기존 이미지 영역이 필요하므로 컴포넌트 자체를 그대로 재사용하지 않고 순수 로직을 공유한다.

