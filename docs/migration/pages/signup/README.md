# 회원가입 마이그레이션 문서

회원가입 페이지의 기존 동작 기준선과 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 문서 구성 판단

요청된 여섯 항목은 모두 유지한다.

- 정상 시나리오는 이벤트 순서와 성공 흐름의 기준이다.
- API 명세는 프론트엔드가 실제 사용하는 요청·응답 계약의 기준이다.
- 오류 문서는 서버 status/message별 UI 분기를 빠뜨리지 않기 위해 필요하다.
- UI 기준선은 캡처 없이 기존 화면 상태를 비교하기 위해 필요하다.
- 체크리스트는 Vanilla와 React의 동등성을 판정하기 위해 필요하다.
- 컴포넌트 설계는 로그인에서 만든 공통 UI를 어떤 범위까지 확장할지 결정하기 위해 필요하다.

별도 화면 캡처 문서는 만들지 않는다. 시각적 상태는 `ui-baseline.md`로 대체하며, 픽셀 단위 비교가 필요할 때만 선택적으로 캡처한다.

