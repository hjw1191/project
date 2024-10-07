# 당근 마차 (Carrot Carriage)

[주요기능](https://private-user-images.githubusercontent.com/75131851/374029518-185a5b4d-7866-4feb-8589-70bd5e91d3c4.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjgyNzYyMzAsIm5iZiI6MTcyODI3NTkzMCwicGF0aCI6Ii83NTEzMTg1MS8zNzQwMjk1MTgtMTg1YTViNGQtNzg2Ni00ZmViLTg1ODktNzBiZDVlOTFkM2M0LmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUz)

## 프로젝트 개요
당근 마차는 당근 마켓 앱을 모티브로 한 근거리 카풀 및 택시 나눠타기 서비스입니다. 이 웹 애플리케이션을 통해 사용자들은 운전자, 탑승자, 또는 택시로 등록하여 카풀을 공유하고 예약할 수 있습니다.

## 주요 기능

1. **카풀 관리 (Main.js)**
   - 최근 게시글 목록 표시
   - 유형별 필터링 (전체, 택시, 운전자, 탑승자)
   - 검색 기능 (출발지, 도착지, 날짜)
   - 새 카풀 등록
   - 카풀 상세 정보 확인 및 수정

2. **카풀 정보 편집 (Editor.js)**
   - 카풀 유형 선택 (탑승자, 운전자, 택시)
   - 출발 시간 및 날짜 설정
   - 성별 선호도 설정 (성별무관, 동성)
   - 예약 기능 (예약하기/예약 취소, 예약 마감 처리)
   - 포인트 기반 결제 시스템
   - 실시간 채팅 기능

## 기술 스택
- Frontend: React.js
- 상태 관리: React Hooks (useState, useEffect)
- API 통신: Axios
- 지도 서비스: kaokao map, T map API
- 실시간 통신: Socket.io API

## 주요 컴포넌트
1. Main.js (메인 페이지)
- 카풀 목록 관리 및 표시
- 필터링 및 검색 기능
- 새 카풀 등록 및 편집 모달 관리
- 사용자 정보 및 예약 상태 관리

2. 알림 시스템
- Editor.js (카풀 정보 편집)
- 카풀 정보 수정 및 삭제
- 예약 생성 및 취소 기능
- 결제 처리 시스템
- 채팅 기능 연동
- 사용자 권한에 따른 UI 조정
  
3. Map.js (지도 및 경로 관리)
- 카카오맵 API 통합
- 장소 검색 및 마커 설정
- T map API를 이용한 경로 계산
- 비용 추정 (기름값, 택시비)
- 경유지 관리
- 동적 제목 생성

## 이용 방법

1. **회원가입 및 로그인**
2. **카풀 검색**
   - 출발지, 도착지, 날짜로 검색
   - 유형별 필터링 가능
3. ** 카풀 등록**
   - '+' 버튼으로 새 카풀 등록
   - 유형, 시간, 날짜, 성별 선호도 등 정보 입력
4. **예약하기**
   - 원하는 카풀 선택 후 예약
5. **채팅 이용**
   - 예약 완료 후 채팅방 참여 가능
6. **카풀 완료 및 결제**
   - 카풀 후 포인트로 결제 진행

## 결제 시스템
1. 게시물 작성: 사용자가 "탑승자", "운전자", 또는 "택시" 유형의 게시물을 작성
2. 예약 과정:
   - 탑승자 게시물: 다른 사용자가 예약, 작성자가 예약 마감
   - 운전자/택시 게시물: 다른 사용자가 예약
3. 결제하기 버튼 표시 조건:
   - 탑승자 게시물: 예약 마감 후 작성자에게 표시
   - 운전자/택시 게시물: 예약한 사용자에게 표시

### 주의사항
- 일회성 결제
- 예약 필수 (탑승자 등록 카풀의 경우)
- 결제 취소 및 환불 기능 미구현 (고객 지원 센터 통해 해결)

## 보안 및 인증
- 토큰 기반 인증 시스템
- 사용자 권한에 따른 기능 접근 제어

## 프로젝트 상태
현재 구현 중인 프로젝트로, 지속적인 업데이트와 기능 개선이 진행될 예정입니다.

### 일반적인 오류와 해결 방법

#### 1. 무결성 오류
- 해결:
  1. npm 캐시 정리: `npm cache clean --force`
  2. `node_modules` 폴더와 `package-lock.json` 파일 삭제
  3. 의존성 재설치: `npm install`

#### 2. 400번대 오류 

#### 400 Bad Request
- 설명: 클라이언트가 잘못된 요청을 보냈음을 나타냅니다.
- 일반적인 원인:
  - 잘못된 요청 구문
  - 유효하지 않은 요청 메시지 프레이밍
  - 잘못된 요청 라우팅
- 해결 방법:
  - 요청 파라미터와 본문을 확인
  - API 문서를 참조하여 올바른 요청 형식 확인
  - 클라이언트 측 유효성 검사 강화

#### 401 Unauthorized
- 설명: 인증이 필요한 리소스에 대해 인증되지 않은 요청을 나타냅니다.
- 일반적인 원인:
  - 인증 토큰 누락
  - 만료된 인증 토큰
  - 유효하지 않은 인증 정보
- 해결 방법:
  - 인증 토큰이 요청 헤더에 포함되어 있는지 확인
  - 토큰 갱신 메커니즘 구현
  - 로그인 상태 및 세션 관리 로직 검토

#### 404 Not Found
- 설명: 요청한 리소스를 서버에서 찾을 수 없음을 나타냅니다.
- 일반적인 원인:
  - 잘못된 URL
  - 삭제되거나 이동된 리소스
  - 서버 측 라우팅 오류
- 해결 방법:
  - API 엔드포인트 URL 철자와 형식 확인
  - 백엔드 라우팅 설정 검토
  - 리소스의 존재 여부 확인
  - 적절한 에러 핸들링 및 사용자 피드백 구현

#### 3. CORS (Cross-Origin Resource Sharing) 오류
- 증상: "Access to XMLHttpRequest at 'http://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy"
- 해결:
  1. 백엔드에서 CORS 설정 확인
  2. 프록시 설정 (개발 환경)
  3. 올바른 Origin 헤더 설정

#### 4. 'module not found' 오류
- 증상: "Module not found: Can't resolve 'some-module'"
- 해결:
  1. `npm install some-module` 실행
  2. `package.json`에 모듈이 올바르게 리스트되어 있는지 확인
  3. `node_modules` 폴더 삭제 후 `npm install` 재실행

#### 5. 환경 변수 관련 오류
- 증상: "process is not defined" 또는 환경 변수 값이 undefined
- 해결:
  1. `.env` 파일이 올바른 위치에 있는지 확인
  2. `dotenv` 패키지가 설치되어 있고 올바르게 구성되었는지 확인
  3. 환경 변수 이름이 올바른지 확인 (대소문자 구분)

#### 6. 버전 불일치 오류
- 증상: "This version of node"
- 해결:
  1. `package.json`에서 의존성 버전 확인
  2. 호환되는 버전으로 업데이트 또는 다운그레이드
  3. `npm update` 또는 특정 패키지 재설치

#### 7.API 요청 실패
- 증상: "Failed to fetch" 또는 특정 HTTP 상태 코드 (예: 404, 500)
- 해결:
  1. API 엔드포인트 URL 확인
  2. 네트워크 연결 상태 확인
  3. API 서버 상태 확인
  4. 요청 헤더 및 본문 데이터 확인




