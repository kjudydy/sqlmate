from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any, Literal

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "tmp" / "pdf_sources"
OUT_FILE = ROOT / "lib" / "pdf-extracted-original-bank.ts"
REPORT_FILE = ROOT / "docs" / "PDF_ORIGINAL_EXTRACTION_REPORT.md"
SOURCE_VERSION = "official-pdf-infinite-starter-2026-07-29-v3"

CHOICE_MARKS = ["①", "②", "③", "④"]
CHOICE_MARK_PATTERN = r"[①②③④@©®]"
CHOICE_IDS = ["A", "B", "C", "D"]
CHOICE_ID_BY_MARK = dict(zip(CHOICE_MARKS, CHOICE_IDS))

FORBIDDEN_VISIBLE = [
    "�",
    "sourceDocument",
    "sourceType",
    "generationMode",
    "review_required",
    "original_ready",
    "문항 키",
    "추출 상태",
    "PDF 원문 문항",
    "유사형 문항",
    "㉧",
    "〇",
    "○ G",
    "■",
    "卜",
    "天",
    "及",
    "»",
    "«",
    "타RD",
    "집힙",
    "SELK",
    "FRO M",
    "W H E R E",
    "SQ L",
    "IN況",
    "凶",
    "쏜벋",
    "公",
    "分",
    "往",
    "幻",
    "務",
    "묘의 상태",
    "I八",
    "八)",
    "八3",
    "F R O M",
    "FR O M",
    "U N IO N",
    "SELEC T",
    "PROM TBL",
    "N U LL",
    "V A RCH",
    "A日",
    "SESSIONJD",
    "LOCKJD",
    "PRODJD",
    "STADIUMJD",
    "31正3",
    "◦",
    "ᄋ",
    "테아블",
]

FORBIDDEN_VISIBLE_REGEXES = [
    re.compile(r"[公分往幻務]"),
    re.compile(r"I八|八\)|八3"),
    re.compile(r"\bF\s+R\s+O\s+M\b", re.I),
    re.compile(r"\bFR\s+O\s+M\b", re.I),
    re.compile(r"\bU\s+N\s*I\s*O\s+N\b", re.I),
    re.compile(r"\bSELEC\s+T\b", re.I),
    re.compile(r"\bPROM\s+TBL\b", re.I),
    re.compile(r"\bN\s+U\s+LL\b", re.I),
    re.compile(r"\bV\s+A\s+R\s*CH\s*A?\s*R?2?\b", re.I),
    re.compile(r"부적\s+절|부\s*적\s*절|적\s+절|가\s+장|것\s+은|실\s+행|결\s+과|오\s+류|작\s+성|모\s+델"),
    re.compile(r"SESSIONJ?D|LOCKJ?D|PRODJ?D|STADIUMJ?D", re.I),
]

COLLAPSED_SQL_MATERIAL_KEYWORDS = [
    "CREATE TABLE",
    "ALTER TABLE",
    "INSERT INTO",
    "DELETE FROM",
    "SELECT ",
    " FROM ",
    " WHERE ",
    " GROUP BY ",
    " HAVING ",
    " ORDER BY ",
    " REFERENCES ",
    " ON DELETE ",
    "[SQL]",
    "[테이블",
    "현재 테이블",
    "테이블 명",
    "실행계획",
    "TRACE",
]


SubjectId = Literal["modeling", "sql-basic", "tuning"]


def clean_text(value: str) -> str:
    value = value.replace("\r", "\n")
    value = value.replace("ⓛ", "①").replace("❶", "①").replace("❷", "②").replace("❸", "③").replace("❹", "④")
    value = value.replace("®", "③")
    value = re.sub(r"(?m)^\s*©\s*", "③ ", value)
    value = re.sub(r"(?m)^\s*@\s*", "④ ", value)
    value = re.sub(r"(?m)^\s*O\s+", "① ", value)
    value = re.sub(r"(?m)^\s*〇\s+", "① ", value)
    lines: list[str] = []
    for raw in value.split("\n"):
        line = re.sub(r"\s+", " ", raw).strip()
        if not line:
            continue
        if "SQL 자격검정 실전문제" in line:
            continue
        if line in {"핵심정리", "정답 및 해설", "과 목", "〇", "G", "I", "n", "m", "E", "Q"}:
            continue
        if re.match(r"^\d+\s*SQL\s*기본", line):
            continue
        lines.append(line)
    return "\n".join(lines)


def inline(value: str) -> str:
    value = re.sub(r"^(?:핵\s*심\s*정\s*리|핵심정리)\s*", "", value.strip())
    value = re.sub(r"^\d{1,3}\s*[_\.\|]*\s*", "", value)
    value = re.sub(r"^[\s_\|Iils〇ᄋ]+(?=(다음|아래|표준|업무|공통))", "", value)
    replacements = {
        "타RD": "ERD",
        "집힙": "집합",
        "SELKTT": "SELECT",
        "SELKCT": "SELECT",
        "SQ L": "SQL",
        "FRO M": "FROM",
        "W H E R E": "WHERE",
        "W H ERE": "WHERE",
        "VA及CHAR": "VARCHAR",
        "VAECHAR": "VARCHAR",
        "몰바른": "올바른",
        "비절치적": "비절차적",
        "시용": "사용",
        "아 래": "아래",
        "FR O M": "FROM",
        "F R O M": "FROM",
        "U N IO N": "UNION",
        "SELEC T": "SELECT",
        "N U LL": "NULL",
    }
    for before, after in replacements.items():
        value = value.replace(before, after)
    return re.sub(r"\s+", " ", value.replace("\n", " ")).strip()


def visible_is_clean(*values: str) -> bool:
    visible = " ".join(values)
    if any(pattern in visible for pattern in FORBIDDEN_VISIBLE):
        return False
    if any(pattern.search(visible) for pattern in FORBIDDEN_VISIBLE_REGEXES):
        return False
    if "핵심정리" in visible or "SQL 자격검정 실전문제" in visible:
        return False
    if re.search(r"\[[^\]]+\.pdf\s+p\.", visible, flags=re.I):
        return False
    return True


def stem_has_collapsed_material(stem: str) -> bool:
    upper_stem = stem.upper()
    material_hits = sum(1 for keyword in COLLAPSED_SQL_MATERIAL_KEYWORDS if keyword in upper_stem)
    if material_hits >= 2:
        return True
    if "CREATE TABLE" in upper_stem:
        return True
    if "[SQL]" in upper_stem and ("SELECT " in upper_stem or "FROM " in upper_stem):
        return True
    if any(token in stem for token in ["[테이블", "현재 테이블", "테이블 명"]) and len(stem) > 120:
        return True
    if re.search(r"\bSELECT\b.+\bFROM\b", upper_stem) and len(stem) > 140:
        return True
    return False


def choice_block_is_clean(choices: list[str]) -> bool:
    for choice in choices:
        if any(token in choice for token in ["•", "다음 중", "아래", "정답", "해설", "핵심정리", "과 목"]):
            return False
        if re.search(r"\b[I1]\s*[sS]\s+다음", choice):
            return False
        if len(choice) > 220:
            return False
    return True


def strip_pdf_footer(value: str) -> str:
    lines = []
    for line in value.splitlines():
        if "SQLP Subject" in line or "SQLP Qualification" in line:
            continue
        if re.match(r"^\s*\d+\s*/\s*\d+\s*$", line):
            continue
        lines.append(line)
    return "\n".join(lines).strip()


def source_hash(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:8]


def extract_half(page: pdfplumber.page.Page, side: Literal["L", "R"], *, content_only: bool = False) -> str:
    width = page.width
    height = page.height
    half_width = width / 2
    if side == "L":
        left, right = 0, half_width
    else:
        left, right = half_width, width
    if content_only:
        # The large practice PDF is a two-page spread. Each book page also has a
        # left-side "핵심정리" column; crop it out for question extraction so
        # side notes do not leak into stems or choices.
        left += 132
        right -= 12
    bbox = (left, 0, right, height)
    text = page.crop(bbox).extract_text(x_tolerance=1, y_tolerance=3) or ""
    return clean_text(text)


ANSWER_LINE = re.compile(r"^\s*(\d{1,3})\s*[\.,]\s*([①②③④@©®]+(?:\s*[,，]\s*[①②③④@©®]+)?)\s*[:：]?\s*(.*)$")


def parse_answer_entries(doc: pdfplumber.PDF, ranges: list[tuple[int, Literal["L", "R"]]]) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for page_number, side in ranges:
        text = extract_half(doc.pages[page_number - 1], side)
        for line in text.split("\n"):
            match = ANSWER_LINE.match(line)
            if match:
                if current:
                    entries.append(current)
                current = {
                    "q": int(match.group(1)),
                    "answer_raw": match.group(2).replace("@", "④").replace("©", "③").replace("®", "③").replace("，", ","),
                    "explanation": [match.group(3).strip()] if match.group(3).strip() else [],
                }
            elif current:
                current["explanation"].append(line)
    if current:
        entries.append(current)

    answer_entries: list[dict[str, Any]] = []
    for entry in entries:
        parts = re.split(r"[,，]", re.sub(r"\s+", "", entry["answer_raw"]))
        mapped = [CHOICE_ID_BY_MARK.get(part) for part in parts]
        mapped = [item for item in mapped if item]
        explanation = "\n".join(entry["explanation"]).strip()
        if not visible_is_clean(explanation):
            explanation = re.sub(r"SQL 자격검정 실전문제.*", "", explanation).strip()
        answer_entries.append({"q": int(entry["q"]), "answers": mapped, "explanation": explanation})
    return answer_entries


def parse_answer_map(doc: pdfplumber.PDF, ranges: list[tuple[int, Literal["L", "R"]]]) -> dict[int, dict[str, str]]:
    entries = parse_answer_entries(doc, ranges)
    answers: dict[int, dict[str, str]] = {}
    for entry in entries:
        if len(entry["answers"]) != 1:
            continue
        answers[int(entry["q"])] = {"answer": entry["answers"][0], "explanation": entry["explanation"]}
    return answers


QUESTION_KEYWORDS = [
    "다음",
    "아래",
    "표준 SQL",
    "업무에서",
    "공통기술팀",
]


def parse_question_number(prefix: str) -> int | None:
    compact = prefix.strip()
    if not compact:
        return None
    if re.search(r"[가-힣]", compact):
        return None
    if re.fullmatch(r"[\s_\.\-\|Iil]+", compact):
        return None
    compact = compact.replace("ᄋ", "0").replace("〇", "0").replace("Ｏ", "0").replace("O", "0")
    compact = compact.replace("｜", "|")
    compact = compact.replace("I s", "13").replace("I S", "13").replace("l s", "13").replace("l S", "13")
    compact = compact.replace("I", "1").replace("l", "1").replace("|", "1")
    tokens = re.findall(r"\d{1,3}", compact)
    if not tokens:
        return None
    if len(tokens) >= 3 and len(tokens[-2]) == 2:
        qno = int(tokens[-2])
    elif len(tokens) >= 2 and tokens[-1] == "0" and len(tokens[-2]) == 2:
        qno = int(tokens[-2] + tokens[-1])
    elif len(tokens) >= 2 and len(tokens[-2]) == 1 and len(tokens[-1]) == 1:
        qno = int(tokens[-2] + tokens[-1])
    else:
        qno = int(tokens[-1])
    return qno if 1 <= qno <= 200 else None


def question_starts(text: str) -> list[tuple[int, int | None]]:
    starts: list[tuple[int, int | None]] = []
    offset = 0
    for line in text.split("\n"):
        stripped = line.strip()
        line_offset = offset
        offset += len(line) + 1
        if any(mark in stripped for mark in CHOICE_MARKS):
            continue
        found = False
        for keyword in QUESTION_KEYWORDS:
            idx = stripped.find(keyword)
            if idx < 0:
                continue
            prefix = stripped[:idx].strip()
            # Do not treat numbers inside tables/FD examples as question numbers.
            if len(prefix) > 16:
                continue
            qno = parse_question_number(prefix)
            if qno:
                digit_match = list(re.finditer(r"[\dIil|〇ＯOᄋsS]+", stripped[:idx]))
                pos = digit_match[-1].start() if digit_match else 0
                starts.append((line_offset + max(pos, 0), qno))
                found = True
                break
        if found:
            continue
        if re.match(r"^[_\s]*(다음 중|아래와 같이|아래 테이블|표준 SQL)", stripped):
            starts.append((line_offset, None))
            continue
        match = re.match(r"^(?:[A-Z]\s*)?(\d{1,3})\s+(.+)$", stripped)
        if match and 1 <= int(match.group(1)) <= 200:
            rest = match.group(2)
            if any(keyword in rest for keyword in QUESTION_KEYWORDS):
                starts.append((line_offset + match.start(1), int(match.group(1))))
    return sorted(set(starts))


def parse_choice_markers(block: str) -> list[re.Match[str]]:
    return list(re.finditer(CHOICE_MARK_PATTERN, block))


def build_question_from_block(
    block: str,
    answer: dict[str, Any],
) -> tuple[str, list[str]] | None:
    markers = parse_choice_markers(block)
    if len(markers) < 4:
        return None
    markers = markers[:4]
    stem = inline(block[: markers[0].start()])
    choices: list[str] = []
    for choice_index, marker in enumerate(markers):
        choice_start = marker.end()
        choice_end = markers[choice_index + 1].start() if choice_index + 1 < len(markers) else len(block)
        choices.append(inline(block[choice_start:choice_end]))
    if len(stem) < 8 or any(len(choice) < 2 for choice in choices):
        return None
    explanation = inline(answer["explanation"].strip())
    if len(explanation) < 6:
        return None
    if stem_has_collapsed_material(stem):
        return None
    if not choice_block_is_clean(choices):
        return None
    if not visible_is_clean(stem, explanation, *choices):
        return None
    return stem, choices


def parse_cert_questions_by_sequence(
    doc: pdfplumber.PDF,
    subject_id: SubjectId,
    ranges: list[tuple[int, Literal["L", "R"]]],
    answer_entries: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    parsed: list[dict[str, Any]] = []
    answer_index = 0

    for page_number, side in ranges:
        text = extract_half(doc.pages[page_number - 1], side, content_only=True)
        starts = question_starts(text)
        if not starts:
            continue
        starts.append((len(text), None))
        for index in range(len(starts) - 1):
            start, qno = starts[index]
            end = starts[index + 1][0]
            block = text[start:end].strip()
            if not block:
                continue
            if len(parse_choice_markers(block)) < 4:
                continue

            if qno and answer_index < len(answer_entries) and qno < int(answer_entries[answer_index]["q"]):
                qno = None

            if qno:
                while answer_index < len(answer_entries) and answer_entries[answer_index]["q"] < qno:
                    answer_index += 1
                if answer_index >= len(answer_entries) or answer_entries[answer_index]["q"] != qno:
                    continue
                matched_qno = qno
            else:
                if answer_index >= len(answer_entries):
                    continue
                matched_qno = int(answer_entries[answer_index]["q"])

            answer = answer_entries[answer_index]
            if len(answer["answers"]) != 1:
                answer_index += 1
                continue

            built = build_question_from_block(block, answer)
            answer_index += 1
            if not built:
                continue
            stem, choices = built
            parsed.append(
                {
                    "sourceDocument": "SQL-자격검정-실전문제.pdf",
                    "sourcePage": page_number,
                    "sourceQuestionNumber": matched_qno,
                    "subjectId": subject_id,
                    "stem": stem,
                    "choices": choices,
                    "answer": answer["answers"][0],
                    "explanation": answer["explanation"],
                }
            )
    return parsed


def parse_cert_questions(
    doc: pdfplumber.PDF,
    subject_id: SubjectId,
    ranges: list[tuple[int, Literal["L", "R"]]],
    answers: dict[int, dict[str, str]],
) -> list[dict[str, Any]]:
    parsed: list[dict[str, Any]] = []
    last_seen_question_number = 0
    for page_number, side in ranges:
        text = extract_half(doc.pages[page_number - 1], side, content_only=True)
        starts = question_starts(text)
        if not starts:
            continue
        starts.append((len(text), -1))
        for index in range(len(starts) - 1):
            start, qno = starts[index]
            end = starts[index + 1][0]
            block = text[start:end].strip()
            if qno < last_seen_question_number:
                continue
            answer = answers.get(qno)
            markers = list(re.finditer(r"[①②③④]", block))
            if len(markers) < 4:
                continue
            last_seen_question_number = max(last_seen_question_number, qno)
            if not answer:
                continue
            markers = markers[:4]
            if "".join(marker.group(0) for marker in markers) != "①②③④":
                continue
            stem = inline(block[: markers[0].start()])
            choices: list[str] = []
            for choice_index, marker in enumerate(markers):
                choice_start = marker.end()
                choice_end = markers[choice_index + 1].start() if choice_index + 1 < len(markers) else len(block)
                choices.append(inline(block[choice_start:choice_end]))
            if len(stem) < 8 or any(len(choice) < 2 for choice in choices):
                continue
            explanation = answer["explanation"].strip()
            if len(explanation) < 6:
                continue
            if not choice_block_is_clean(choices):
                continue
            if not visible_is_clean(stem, explanation, *choices):
                continue
            parsed.append(
                {
                    "sourceDocument": "SQL-자격검정-실전문제.pdf",
                    "sourcePage": page_number,
                    "sourceQuestionNumber": qno,
                    "subjectId": subject_id,
                    "stem": stem,
                    "choices": choices,
                    "answer": answer["answer"],
                    "explanation": explanation,
                }
            )
    by_question: dict[int, dict[str, Any]] = {}
    for item in parsed:
        by_question.setdefault(int(item["sourceQuestionNumber"]), item)
    return [by_question[key] for key in sorted(by_question)]


def topic_for(subject_id: SubjectId, source_question_number: int, stem: str) -> tuple[str, str, str, str]:
    if subject_id == "modeling":
        if source_question_number <= 10:
            return ("데이터 모델링의 이해", "모델링의 이해", "데이터 모델링 기본 원리", "modeling-data-model")
        if source_question_number <= 22:
            return ("데이터 모델링의 이해", "엔터티·속성·관계", "엔터티와 관계 식별", "modeling-entity")
        if source_question_number <= 36:
            return ("데이터 모델링의 이해", "식별자와 정규화", "식별자·정규화 판단", "modeling-identifier")
        return ("데이터 모델과 성능", "성능 데이터 모델링", "반정규화와 성능 모델링", "modeling-normalization")
    if subject_id == "sql-basic":
        if source_question_number <= 20:
            return ("SQL 기본 및 활용", "SQL 기본", "DDL·DML·TCL·제약조건", "sql-where")
        if source_question_number <= 70:
            return ("SQL 기본 및 활용", "SQL 활용", "조인·서브쿼리·집합연산", "sql-standard-join")
        if source_question_number <= 115:
            return ("SQL 기본 및 활용", "고급 SQL", "그룹 함수·윈도우 함수·계층형 질의", "sql-group-having")
        return ("SQL 기본 및 활용", "관리 구문", "DML·MERGE·트랜잭션", "sql-functions")
    if "Trace" in stem or "TKPROF" in stem:
        return ("SQL 고급활용 및 튜닝", "SQL Trace", "Trace와 실행계획 분석", "tuning-sql-trace")
    if "Join" in stem or "조인" in stem:
        return ("SQL 고급활용 및 튜닝", "조인 튜닝", "조인 방식 판단", "tuning-nl-join")
    if "인덱스" in stem or "Index" in stem:
        return ("SQL 고급활용 및 튜닝", "인덱스 튜닝", "인덱스 스캔 효율화", "tuning-index-scan-efficiency")
    return ("SQL 고급활용 및 튜닝", "옵티마이저와 실행계획", "튜닝 원리 판단", "tuning-index-scan-efficiency")


def difficulty_for(subject_id: SubjectId, source_question_number: int) -> str:
    if subject_id == "modeling":
        return "기본" if source_question_number <= 10 else "중급" if source_question_number <= 32 else "상급"
    if subject_id == "sql-basic":
        return "중급" if source_question_number <= 70 else "상급"
    return "상급" if source_question_number <= 50 else "실전"


def make_objective(item: dict[str, Any], running_number: int) -> dict[str, Any]:
    subject_id: SubjectId = item["subjectId"]
    major_topic, middle_topic, topic, concept_id = topic_for(subject_id, int(item["sourceQuestionNumber"]), item["stem"])
    content_base = json.dumps(
        {
            "subject": subject_id,
            "stem": item["stem"],
            "choices": item["choices"],
            "answer": item["answer"],
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    question_id = f"pdf-original-{subject_id}-{item['sourceDocument'].split('.')[0].replace('SQL-', 'sql-').replace(' ', '-')}-{item['sourceQuestionNumber']:03d}"
    choices = [{"id": choice_id, "text": text} for choice_id, text in zip(CHOICE_IDS, item["choices"])]
    why_wrong = {
        choice_id: (
            "정답 선택지입니다. PDF 해설의 핵심 근거와 일치합니다."
            if choice_id == item["answer"]
            else "PDF 원문에는 선택지별 개별 해설이 분리되어 있지 않습니다. 전체 해설과 정답 선택지를 기준으로 오답 근거를 확인하세요."
        )
        for choice_id in CHOICE_IDS
    }
    return {
        "id": question_id,
        "number": running_number,
        "subjectId": subject_id,
        "subjectName": {"modeling": "1과목", "sql-basic": "2과목", "tuning": "3과목"}[subject_id],
        "majorTopic": major_topic,
        "middleTopic": middle_topic,
        "topic": topic,
        "difficulty": difficulty_for(subject_id, int(item["sourceQuestionNumber"])),
        "questionType": "객관식",
        "stem": item["stem"],
        "choices": choices,
        "answer": item["answer"],
        "relatedConceptId": concept_id,
        "hint": "1단계: 문제에서 묻는 개념과 예외 조건을 먼저 분리하세요.\n2단계: 보기마다 원문 조건과 충돌하는 표현이 있는지 확인하세요.\n3단계: 정답은 PDF 해설의 핵심 근거와 가장 직접적으로 연결됩니다.",
        "explanation": item["explanation"],
        "whyWrong": why_wrong,
        "sourceDocument": item["sourceDocument"],
        "sourceVersion": SOURCE_VERSION,
        "sourcePage": item["sourcePage"],
        "sourceQuestionNumber": item["sourceQuestionNumber"],
        "sourceType": "owner_pdf",
        "generationMode": "original",
        "parentQuestionId": None,
        "variantGroupId": f"{subject_id}-original-{item['sourceDocument']}-{item['sourceQuestionNumber']}",
        "contentHash": source_hash(content_base),
        "semanticFingerprint": source_hash(item["stem"]),
        "batchId": f"pdf-original-{subject_id}-v1",
        "reviewStatus": "approved",
        "validationStatus": "validated",
        "estimatedTime": 120 if subject_id != "tuning" else 180,
        "tags": [subject_id, major_topic, middle_topic, topic, "original"],
        "duplicationCheck": "PDF 원문에서 본문·선택지·정답·해설이 함께 추출되고 금지 패턴 검사를 통과한 문항입니다.",
    }


SMALL_OBJECTIVE = re.compile(
    r"문제\s+(\d{1,2})\s*\|\s*([^\n]+)\n(?P<body>.*?)(?=\n문제\s+\d{1,2}\s*\||\nPART\s+2\.|\Z)",
    re.S,
)


def parse_small_objectives(path: Path, source_document: str, subject_id: SubjectId = "tuning") -> list[dict[str, Any]]:
    text_parts: list[str] = []
    with pdfplumber.open(path) as doc:
        for page in doc.pages:
            text_parts.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    text = "\n".join(text_parts)
    parsed: list[dict[str, Any]] = []
    for match in SMALL_OBJECTIVE.finditer(text):
        qno = int(match.group(1))
        title = inline(match.group(2))
        body = match.group("body").strip()
        if "정답:" not in body:
            continue
        body, rest = body.split("정답:", 1)
        answer_mark = rest.strip()[:1]
        if answer_mark not in CHOICE_ID_BY_MARK:
            continue
        explanation = ""
        if "[해설]" in rest:
            explanation = strip_pdf_footer(rest.split("[해설]", 1)[1].strip())
        markers = list(re.finditer(r"[①②③④]", body))
        if len(markers) != 4:
            continue
        stem = inline(body[: markers[0].start()])
        choices: list[str] = []
        for index, marker in enumerate(markers):
            start = marker.end()
            end = markers[index + 1].start() if index + 1 < len(markers) else len(body)
            choices.append(inline(body[start:end]))
        if not visible_is_clean(stem, explanation, *choices):
            continue
        if not choice_block_is_clean(choices):
            continue
        parsed.append(
            {
                "sourceDocument": source_document,
                "sourcePage": None,
                "sourceQuestionNumber": qno,
                "subjectId": subject_id,
                "stem": stem,
                "choices": choices,
                "answer": CHOICE_ID_BY_MARK[answer_mark],
                "explanation": explanation,
                "title": title,
            }
        )
    return parsed


LAB_PATTERN = re.compile(r"(?:실기|문제)\s+(\d{1,2})\s*\|\s*([^\n]+)\n(?P<body>.*?)(?=\n(?:실기|문제)\s+\d{1,2}\s*\||\Z)", re.S)


def parse_labs(path: Path, source_document: str) -> list[dict[str, Any]]:
    text_parts: list[str] = []
    with pdfplumber.open(path) as doc:
        for page in doc.pages:
            text_parts.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    text = "\n".join(text_parts)
    if "PART 2." in text:
        text = text.split("PART 2.", 1)[1]
    labs: list[dict[str, Any]] = []
    for match in LAB_PATTERN.finditer(text):
        qno = int(match.group(1))
        title = inline(match.group(2))
        body = match.group("body").strip()
        if not any(marker in f"{title}\n{body}" for marker in ["실기", "주관식", "모범 답안", "튜닝 모범 답안"]):
            continue
        answer_split = re.split(r"정답 및 모범 답안:|정답 및 모범 답안|튜닝 모범 답안:|튜닝 모범 답안", body, maxsplit=1)
        if len(answer_split) != 2:
            continue
        before_answer, answer_part = answer_split
        explanation = ""
        expected_sql = answer_part.strip()
        for marker in ["[해설 및 서술]", "[해설]"]:
            if marker in expected_sql:
                expected_sql, explanation = expected_sql.split(marker, 1)
                break
        existing_sql = ""
        if "-- [기존 SQL]" in before_answer:
            existing_sql = before_answer.split("-- [기존 SQL]", 1)[1].strip()
        prompt = inline(before_answer.split("-- [기존 SQL]", 1)[0])
        labs.append(
            {
                "sourceDocument": source_document,
                "sourceQuestionNumber": qno,
                "title": title,
                "prompt": prompt,
                "existingSql": existing_sql,
                "expectedSql": expected_sql.strip(),
                "explanation": explanation.strip(),
            }
        )
    return labs


def make_lab(item: dict[str, Any], number: int) -> dict[str, Any]:
    topic = item["title"].split()[0] if item["title"] else "SQL 튜닝"
    return {
        "id": f"pdf-original-lab-{number:03d}",
        "number": number,
        "title": item["title"],
        "difficulty": "실전",
        "topic": topic,
        "scenario": item["prompt"],
        "schemaSql": "문제 PDF에서 제공된 테이블 구조와 조건을 기준으로 풀이합니다. 실제 Oracle 실행 환경은 아직 연결되지 않았습니다.",
        "seedSql": "PDF 원문 문제에 포함된 샘플 데이터 또는 조건만 사용합니다.",
        "prompt": item["prompt"],
        "expectedSql": item["expectedSql"],
        "targetPlan": ["PDF 원문 요구사항을 만족하는 SQL Rewrite", "불필요한 반복 Scan 또는 Sort 제거", "실제 Oracle 실행 전 정적 검토 필요"],
        "targetPlanExplanations": [
            {"operation": "SQL Rewrite", "korean": "SQL 재작성", "note": "원문 SQL의 병목을 제거하는 방향으로 작성해야 합니다."},
            {"operation": "Static Review", "korean": "정적 검토", "note": "현재 사이트는 실제 Oracle 실행 결과가 아니라 모범 답안 비교와 해설 중심으로 검토합니다."},
        ],
        "oracleNotes": [
            item["explanation"] or "PDF 원문 해설을 기준으로 요구사항 보존과 성능 개선 근거를 확인합니다.",
            "실제 Oracle 실행계획과 Trace는 사이트에 Oracle 샌드박스가 연결된 뒤 검증해야 합니다.",
        ],
        "hints": [
            "1단계: 기존 SQL에서 반복 Scan, 좌변 변형, DISTINCT, Sort 등 병목 원인을 찾으세요.",
            "2단계: 결과 의미를 바꾸지 않으면서 읽는 범위와 반복 횟수를 줄이는 방향을 선택하세요.",
            "3단계: 모범 SQL과 다른 표현이어도 요구 결과와 성능 개선 원리가 같으면 대안 답안이 될 수 있습니다.",
        ],
        "rubric": [
            "업무 요구 결과를 보존했는가",
            "PDF 원문에서 지적한 병목 원인을 제거했는가",
            "SQL 문법이 Oracle 기준으로 타당한가",
            "성능 개선 근거를 설명할 수 있는가",
        ],
        "simulationNotice": "이 실습은 PDF 기반 정적 학습 모드입니다. 실제 Oracle 실행 결과로 표시하지 않습니다.",
        "relatedConceptIds": ["tuning-query-transformation", "tuning-sql-trace"],
        "sourceDocument": item["sourceDocument"],
        "sourceVersion": SOURCE_VERSION,
        "sourceQuestionNumber": item["sourceQuestionNumber"],
        "sourceType": "owner_pdf",
        "generationMode": "original",
        "variantGroupId": f"lab-original-{item['sourceDocument']}-{item['sourceQuestionNumber']}",
        "contentHash": source_hash(item["prompt"] + item["expectedSql"]),
        "semanticFingerprint": source_hash(item["title"] + item["prompt"]),
        "batchId": "pdf-original-lab-v1",
        "reviewStatus": "approved",
        "validationStatus": "validated",
        "estimatedTime": 900,
        "tags": ["sql-practice", "original", topic],
    }


def strip_none(value: Any) -> Any:
    if isinstance(value, list):
        return [strip_none(item) for item in value]
    if isinstance(value, dict):
        return {key: strip_none(item) for key, item in value.items() if item is not None}
    return value


def main() -> None:
    cert = PDF_DIR / "sql_cert_practice.pdf"
    objectives_raw: list[dict[str, Any]] = []
    with pdfplumber.open(cert) as doc:
        modeling_answers = parse_answer_entries(doc, [(109, "R")] + [(p, s) for p in range(110, 114) for s in ("L", "R")] + [(114, "L")])
        sql_answers = parse_answer_entries(doc, [(114, "R")] + [(p, s) for p in range(115, 130) for s in ("L", "R")] + [(130, "L")])
        tuning_answers = parse_answer_entries(doc, [(130, "R")] + [(p, s) for p in range(131, 137) for s in ("L", "R")])

        objectives_raw.extend(
            parse_cert_questions_by_sequence(doc, "modeling", [(6, "R")] + [(p, s) for p in range(7, 20) for s in ("L", "R")], modeling_answers)
        )
        objectives_raw.extend(
            parse_cert_questions_by_sequence(doc, "sql-basic", [(22, "R")] + [(p, s) for p in range(23, 71) for s in ("L", "R")], sql_answers)
        )
        objectives_raw.extend(
            parse_cert_questions_by_sequence(doc, "tuning", [(73, "L"), (73, "R")] + [(p, s) for p in range(74, 101) for s in ("L", "R")], tuning_answers)
        )

    objectives_raw.extend(parse_small_objectives(PDF_DIR / "sqlp_subject3_full.pdf", "sqlp_subject3_full.pdf", "tuning"))
    objectives_raw.extend(parse_small_objectives(PDF_DIR / "sqlp_exam_questions.pdf", "sqlp_exam_questions.pdf", "tuning"))

    seen = set()
    objectives: list[dict[str, Any]] = []
    for item in objectives_raw:
        signature = source_hash(json.dumps([item["subjectId"], item["stem"], item["choices"]], ensure_ascii=False))
        if signature in seen:
            continue
        seen.add(signature)
        objectives.append(make_objective(item, len(objectives) + 1))

    lab_items = parse_labs(PDF_DIR / "sqlp_subject3_full.pdf", "sqlp_subject3_full.pdf")
    lab_items.extend(parse_labs(PDF_DIR / "sqlp_exam_questions.pdf", "sqlp_exam_questions.pdf"))
    labs = [make_lab(item, index + 1) for index, item in enumerate(lab_items)]

    ts = [
        'import type { LabQuestion, ObjectiveQuestion } from "@/lib/types";',
        "",
        "// Auto-generated by scripts/extract_pdf_original_bank.py.",
        "// Only PDF items with readable text, mapped answer, and clean user-visible fields are exported here.",
        "",
        f"export const pdfExtractedObjectiveQuestions: ObjectiveQuestion[] = {json.dumps(strip_none(objectives), ensure_ascii=False, indent=2)};",
        "",
        f"export const pdfExtractedLabQuestions: LabQuestion[] = {json.dumps(strip_none(labs), ensure_ascii=False, indent=2)};",
        "",
    ]
    OUT_FILE.write_text("\n".join(ts), encoding="utf-8")

    counts: dict[str, int] = {"modeling": 0, "sql-basic": 0, "tuning": 0}
    for question in objectives:
        counts[question["subjectId"]] += 1
    report = [
        "# PDF Original Extraction Report",
        "",
        f"- Generated objective questions: {len(objectives)}",
        f"- 1과목: {counts['modeling']}",
        f"- 2과목: {counts['sql-basic']}",
        f"- 3과목: {counts['tuning']}",
        f"- SQL Practice labs: {len(labs)}",
        "",
        "## Rule",
        "",
        "- PDF에서 본문, 선택지, 정답, 해설이 함께 추출된 단일 정답 객관식만 Objective pool에 포함했다.",
        "- 복수정답, 주관식, 선택지 구조가 깨진 문항은 현재 객관식 UI에 넣지 않았다.",
        "- 깨진 문자, 관리자 메타데이터, PDF 출처 설명 문구가 사용자 표시 필드에 있으면 제외했다.",
        "- SQL Practice는 PDF의 실기/서술형 문항 중 모범 답안이 확인되는 항목만 포함했다.",
        "",
    ]
    REPORT_FILE.write_text("\n".join(report), encoding="utf-8")
    print(json.dumps({"objective": len(objectives), "bySubject": counts, "labs": len(labs)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
