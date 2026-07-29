# PDF Original Extraction Report

- Generated objective questions: 36
- 1과목: 11
- 2과목: 6
- 3과목: 19
- SQL Practice labs: 7

## Rule

- PDF에서 본문, 선택지, 정답, 해설이 함께 추출된 단일 정답 객관식만 Objective pool에 포함했다.
- 복수정답, 주관식, 선택지 구조가 깨진 문항은 현재 객관식 UI에 넣지 않았다.
- 깨진 문자, 관리자 메타데이터, PDF 출처 설명 문구가 사용자 표시 필드에 있으면 제외했다.
- SQL Practice는 PDF의 실기/서술형 문항 중 모범 답안이 확인되는 항목만 포함했다.
- v3부터 SQL, DDL, 표, 실행계획, Trace가 문제 본문에 한 덩어리로 눌려 들어간 문항은 공개 풀에서 제외한다.
- v3부터 `公`, `I八`, `F R O M`, `U N IO N`, `N U LL`, `묘의 상태`, 음절 단위로 깨진 질문 표현 등 OCR 잔여 패턴이 사용자 표시 필드에 있으면 공개를 차단한다.
- 자동 추출로 제외된 문항은 원본 페이지를 보며 본문, SQL, 표, 선택지를 수동으로 복원한 뒤 별도 검수 세트로 등록해야 한다.
