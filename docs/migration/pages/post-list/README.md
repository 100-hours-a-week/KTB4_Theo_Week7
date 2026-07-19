# 게시글 목록 마이그레이션 문서

게시글 목록 페이지의 기존 동작 기준선과 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 문서 구성 판단

요청된 여섯 항목을 모두 유지한다. 게시글 목록은 인증 페이지와 달리 서버 데이터, 커서 페이지네이션, 무한 스크롤, 공통 Header가 함께 동작하므로 시나리오와 체크리스트를 분리해 두는 편이 구현 검증에 유리하다.

- API 명세에는 목록 조회뿐 아니라 화면 진입 시 실행되는 사용자 조회, 토큰 재발급, 로그아웃도 기록한다.
- 빈 목록과 로딩 상태는 기존 Vanilla에 별도 UI가 없다. React에서 임의로 추가하지 않고 설계 변경 후보로 기록한다.
- 화면 캡처 문서는 별도로 만들지 않는다. 구조와 반응형 상태는 `ui-baseline.md`로 기록하고, 픽셀 비교가 필요할 때만 캡처를 보조 자료로 사용한다.

