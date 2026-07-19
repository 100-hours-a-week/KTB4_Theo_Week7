# 비밀번호 수정 마이그레이션 문서

비밀번호 수정 페이지의 Vanilla 동작 기준선과 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 범위 판단

비밀번호 형식·확인 검증, 보호 API, 중복 제출 차단과 성공 후 폼·toast 초기화가 결합되어 있어 요청된 여섯 문서를 모두 유지한다. 화면 캡처 대신 `ui-baseline.md`를 기본 비교 자료로 사용할 수 있다.

## 주요 전제

- 현재 비밀번호 입력 필드는 없다.
- 새 비밀번호와 확인 값만 서버에 전달한다.
- 성공 후 인증 상태를 유지하고 현재 페이지에 머문다.
- 성공하면 두 입력과 helper를 비우고 2초 toast를 표시한다.

