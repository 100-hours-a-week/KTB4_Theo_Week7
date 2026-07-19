# 회원정보 수정 마이그레이션 문서

회원정보 수정과 같은 화면의 회원 탈퇴 기능에 대한 Vanilla 동작 기준선 및 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 범위 판단

요청된 여섯 문서를 모두 유지한다. 이 페이지는 현재 사용자 조회, 닉네임·프로필 변경, Header 사용자 동기화, Object URL, 완료 toast와 회원 탈퇴 modal/API가 결합되어 있어 계약 분리가 필요하다.

화면 캡처는 필수가 아니며 `ui-baseline.md`를 텍스트 비교 기준으로 사용한다.

## 주요 전제

- 프로필 이미지 파일 자체는 업로드하지 않고 선택한 `File.name`만 PATCH한다.
- 새 파일을 선택하지 않으면 기존 `profileImage` 문자열을 유지한다.
- 이메일은 표시만 하고 수정할 수 없다.
- 회원 탈퇴도 같은 페이지 범위로 구현한다.

