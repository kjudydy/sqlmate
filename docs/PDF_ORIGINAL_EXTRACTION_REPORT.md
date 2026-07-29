# PDF Original Extraction Report

- Generated objective questions: 114
- 1과목: 28
- 2과목: 34
- 3과목: 52
- SQL Practice labs: 7

## Rule

- PDF에서 본문, 선택지, 정답, 해설이 함께 추출된 단일 정답 객관식만 Objective pool에 포함했다.
- 복수정답, 주관식, 선택지 구조가 깨진 문항은 현재 객관식 UI에 넣지 않았다.
- 깨진 문자, 관리자 메타데이터, PDF 출처 설명 문구가 사용자 표시 필드에 있으면 제외했다.
- SQL Practice는 PDF의 실기/서술형 문항 중 모범 답안이 확인되는 항목만 포함했다.
