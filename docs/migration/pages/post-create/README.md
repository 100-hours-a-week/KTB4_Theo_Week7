# 게시글 작성 마이그레이션 문서

게시글 작성 페이지의 Vanilla 동작 기준선과 React 구현 설계를 관리한다.

## 문서 순서

1. [정상 동작 시나리오](./scenario.md)
2. [API 명세](./api-specification.md)
3. [오류 상태별 UI 동작](./error-behaviors.md)
4. [텍스트 UI 기준선](./ui-baseline.md)
5. [Vanilla·React 비교 체크리스트](./checklist.md)
6. [React 컴포넌트 및 Props 설계](./component-design.md)

프로젝트 전체 중복 분석은 [공통 UI 및 로직 분석](../../common/shared-ui-and-logic-analysis.md)을 참고한다.

## 범위 판단

요청된 여섯 문서를 모두 유지한다. 작성 화면은 폼 검증, 이미지 미리보기, 인증 API, 중복 제출 방지와 성공 후 이동이 결합되어 있어 구현 전에 계약을 분리해 기록할 가치가 있다.

화면 캡처는 필수가 아니며 `ui-baseline.md`의 텍스트 기준선을 기본 비교 자료로 사용한다.

## 현재 구현의 중요한 제약

Vanilla 화면은 선택한 이미지 파일을 서버에 업로드하지 않는다. `URL.createObjectURL()`은 브라우저 미리보기에만 사용하고, 작성 요청에는 파일명만 `imageUrls`로 전송한다. React 1차 마이그레이션도 기존 API 계약을 임의로 multipart 업로드로 변경하지 않는다. 실제 이미지 업로드 도입은 백엔드 계약 확인 후 별도 작업으로 다룬다.

