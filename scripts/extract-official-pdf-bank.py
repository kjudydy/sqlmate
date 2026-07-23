from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


SUBJECT_BY_PAGE_SQL_EXAM = [
    (1, 20, "modeling"),
    (21, 70, "sql-basic"),
    (71, 100, "tuning"),
    (101, 105, "practice"),
    (109, 121, "modeling-answer"),
    (122, 129, "sql-basic-answer"),
    (130, 139, "tuning-answer"),
    (140, 143, "practice-answer"),
]

SUBJECT_LABELS = {
    "modeling": "1과목 데이터 모델링의 이해",
    "sql-basic": "2과목 SQL 기본 및 활용",
    "tuning": "3과목 SQL 고급활용 및 튜닝",
    "practice": "SQL Practice",
}

CIRCLED = {
    "①": "A",
    "②": "B",
    "③": "C",
    "④": "D",
    "➀": "A",
    "➁": "B",
    "➂": "C",
    "➃": "D",
    "󾠮": "A",
    "󾠯": "B",
    "󾠰": "C",
    "󾠱": "D",
}

NUM_TO_CHOICE = {"1": "A", "2": "B", "3": "C", "4": "D"}


@dataclass
class PdfQuestionUnit:
    id: str
    sourceDocument: str
    sourcePage: int
    sourceQuestionNumber: int
    subjectId: str
    subjectName: str
    topic: str
    questionText: str
    passage: str
    code: str
    choices: list[str]
    answerText: str
    answerChoiceId: str | None
    explanation: str
    extractionStatus: str


def clean_text(value: str) -> str:
    value = value.replace("\u00a0", " ")
    value = value.replace("", "(").replace("", ")").replace("", "=").replace("", "-")
    value = value.replace("，", ",").replace("：", ":").replace("；", ";")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def normalize_choice_marker(line: str) -> str:
    stripped = line.strip()
    if not stripped:
        return stripped
    first = stripped[0]
    if first in CIRCLED:
        return f"{CIRCLED[first]}) {stripped[1:].strip()}"
    match = re.match(r"^([1-4])\s*[).]\s*(.+)$", stripped)
    if match:
        return f"{NUM_TO_CHOICE[match.group(1)]}) {match.group(2).strip()}"
    return stripped


def subject_for_sql_exam_page(page: int) -> str:
    for start, end, subject in SUBJECT_BY_PAGE_SQL_EXAM:
        if start <= page <= end:
            return subject
    return "unknown"


def infer_subject_from_recap(text: str, previous: str) -> str:
    if re.search(r"1\s*과목", text):
        return "modeling"
    if re.search(r"2\s*과목", text):
        return "sql-basic"
    if re.search(r"3\s*과목|튜닝|실행계획|옵티마이저|인덱스|Lock", text, re.I):
        return "tuning"
    return previous


def extract_text_pages(path: Path) -> list[str]:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
        pages.append(clean_text(text))
    return pages


ANSWER_SUBJECT_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"과목\s*[ⅠI1]\s*[.·]?\s*데\s*이\s*터\s*모\s*델\s*링|과목\s*[ⅠI1]\s*[.·]?\s*데이터\s*모델링"), "modeling"),
    (re.compile(r"과목\s*[ⅡE2]\s*[.·]?\s*S\s*Q\s*L\s*기본|과목\s*[ⅡE2]\s*[.·]?\s*SQL\s*기본"), "sql-basic"),
    (re.compile(r"과목\s*[ⅢIII3]\s*[.·]?\s*S\s*Q\s*L\s*고급|과목\s*[ⅢIII3]\s*[.·]?\s*SQL\s*고급"), "tuning"),
]


def iter_answer_subject_fragments(text: str, current_subject: str | None) -> Iterable[tuple[str | None, str]]:
    markers: list[tuple[int, int, str]] = []
    for pattern, subject in ANSWER_SUBJECT_PATTERNS:
        for match in pattern.finditer(text):
            markers.append((match.start(), match.end(), subject))
    markers.sort(key=lambda item: item[0])
    if not markers:
        yield current_subject, text
        return
    if markers[0][0] > 0:
        yield current_subject, text[: markers[0][0]]
    for idx, (start, end, subject) in enumerate(markers):
        next_start = markers[idx + 1][0] if idx + 1 < len(markers) else len(text)
        yield subject, text[end:next_start]


def extract_answers_from_sql_exam(pages: list[str]) -> dict[tuple[str, int], tuple[str, str]]:
    answers: dict[tuple[str, int], tuple[str, str]] = {}
    current_subject: str | None = None
    answer_pattern = re.compile(
        r"(?:^|\n)\s*(\d{1,3})\s*[.,]\s*([①②③④󾠮󾠯󾠰󾠱0-9,，、\s]+|[A-Z가-힣_ /]{1,80})(?=\n|$)"
    )
    for page_index, text in enumerate(pages, start=1):
        if page_index < 109 or page_index > 143:
            continue
        for subject, fragment in iter_answer_subject_fragments(text, current_subject):
            if subject:
                current_subject = subject
            if not current_subject:
                continue
            fragment = re.sub(r"(?m)^(\s*)(\d)\s+(\d)\s*([.,])", r"\1\2\3\4", fragment)
            fragment = re.sub(r"(?m)^(\s*)(\d)\s+(\d)\s+(\d)\s*([.,])", r"\1\2\3\4\5", fragment)
            matches = list(answer_pattern.finditer(fragment))
            for idx, match in enumerate(matches):
                number = int(match.group(1))
                answer = clean_text(match.group(2).split("\n")[0])
                if number > 200:
                    continue
                start = match.end()
                end = matches[idx + 1].start() if idx + 1 < len(matches) else min(len(fragment), start + 1400)
                explanation = clean_text(fragment[start:end])
                # Keep the first occurrence inside a subject. Later textbook snippets on the
                # same answer pages can contain unrelated numbered examples.
                answers.setdefault((current_subject, number), (answer, explanation))
    return answers


def choice_id_from_answer(answer: str) -> str | None:
    if not answer:
        return None
    for marker, choice_id in CIRCLED.items():
        if marker in answer:
            return choice_id
    number_match = re.search(r"\b([1-4])\s*번?\b", answer)
    if number_match:
        return NUM_TO_CHOICE[number_match.group(1)]
    plain = re.search(r"^[^\d]*([1-4])(?:\s|$|[,.])", answer.strip())
    if plain:
        return NUM_TO_CHOICE[plain.group(1)]
    return None


def split_question_blocks(text: str) -> Iterable[tuple[int, str]]:
    markers = list(
        re.finditer(
            r"(?:^|\n)\s*(?:■\s*)?(?:문제\s*)?(\d{1,3})\s*[.)]\s+|(?:^|\n)\s*([1-9]\d?)\s+다음",
            text,
        )
    )
    for idx, marker in enumerate(markers):
        number = int(marker.group(1) or marker.group(2))
        start = marker.start()
        end = markers[idx + 1].start() if idx + 1 < len(markers) else len(text)
        block = clean_text(text[start:end])
        if len(block) >= 24:
            yield number, block


def parse_block(block: str) -> tuple[str, str, str, list[str], str, str]:
    lines = [normalize_choice_marker(line) for line in block.splitlines()]
    lines = [line for line in lines if line and not re.match(r"^(SQL 자격검정 실전문제|정답 및 해설|by yunamom|👓)", line, re.I)]
    choices: list[str] = []
    body_lines: list[str] = []
    code_lines: list[str] = []
    answer_text = ""
    explanation = ""
    in_choice = False
    in_code = False
    in_explanation = False

    for line in lines:
        answer_match = re.search(r"(?:정답|<\s*답\s*>|답\s*>)\s*(?:→|:|：)?\s*(.+)$", line)
        if answer_match:
            answer_text = clean_text(answer_match.group(1))
            in_explanation = False
            continue
        if re.match(r"^(해설|문제\s*해설|<\s*해설\s*>)", line):
            explanation = clean_text(re.sub(r"^(해설|문제\s*해설|<\s*해설\s*>)\s*[:：]?", "", line))
            in_explanation = True
            continue
        if in_explanation:
            explanation = clean_text(f"{explanation}\n{line}")
            continue
        if re.match(r"^[A-D]\)\s+", line):
            choices.append(clean_text(re.sub(r"^[A-D]\)\s+", "", line)))
            in_choice = True
            in_code = False
            continue
        if line.upper().startswith(("SELECT ", "WITH ", "UPDATE ", "DELETE ", "INSERT ", "CREATE ", "MERGE ", "FROM ", "WHERE ", "GROUP BY", "ORDER BY", "HAVING ", "CONNECT BY", "START WITH")) or line.startswith("[SQL]"):
            in_code = True
        if in_code:
            code_lines.append(line)
        elif not in_choice:
            body_lines.append(line)
        elif choices:
            # Multi-line choice continuation.
            choices[-1] = clean_text(f"{choices[-1]} {line}")

    question_text = clean_text("\n".join(body_lines))
    code = clean_text("\n".join(code_lines))
    passage = ""
    if "[ 설명 ]" in question_text:
        question_text, passage = question_text.split("[ 설명 ]", 1)
        question_text = clean_text(question_text)
        passage = clean_text(passage)
    return question_text, passage, code, choices[:4], answer_text, explanation


def topic_from_text(subject: str, text: str) -> str:
    checks = [
        ("비유연성", "데이터 모델링 유의점"),
        ("중복성", "데이터 모델링 유의점"),
        ("비일관성", "데이터 모델링 유의점"),
        ("외부스키마", "외부·개념·내부 스키마"),
        ("개념스키마", "외부·개념·내부 스키마"),
        ("내부스키마", "외부·개념·내부 스키마"),
        ("기본 엔터티", "기본 엔터티"),
        ("중심 엔터티", "중심 엔터티"),
        ("행위 엔터티", "행위 엔터티"),
        ("도메인", "도메인"),
        ("파생", "파생 속성"),
        ("속성의 명칭", "속성 명명 규칙"),
        ("관계차수", "관계 차수"),
        ("관계 차수", "관계 차수"),
        ("선택사양", "관계 선택성"),
        ("관계연결", "관계 도출 기준"),
        ("비식별자", "식별·비식별 관계"),
        ("주식별자", "주식별자 도출 기준"),
        ("최소성", "식별자의 최소성"),
        ("정규", "정규화"),
        ("1차 정규", "제1정규형"),
        ("2차 정규", "제2정규형"),
        ("3차 정규", "제3정규형"),
        ("반정규", "반정규화"),
        ("성능데이터", "성능 데이터 모델링"),
        ("슈퍼타입", "슈퍼타입·서브타입"),
        ("분산데이터", "분산 데이터베이스"),
        ("식별", "식별자"),
        ("엔터티", "엔터티"),
        ("속성", "속성"),
        ("관계", "관계"),
        ("ERD", "ERD 해석"),
        ("DDL", "DDL"),
        ("DML", "DML"),
        ("DCL", "DCL"),
        ("TCL", "TCL"),
        ("제약조건", "제약조건"),
        ("PRIMARY KEY", "제약조건"),
        ("FOREIGN KEY", "참조 무결성"),
        ("DISTINCT", "DISTINCT"),
        ("CASE", "CASE 표현식"),
        ("NVL", "NVL과 COALESCE"),
        ("COALESCE", "NVL과 COALESCE"),
        ("JOIN", "JOIN"),
        ("조인", "JOIN"),
        ("GROUP", "GROUP BY"),
        ("ROLLUP", "ROLLUP"),
        ("CUBE", "CUBE"),
        ("WINDOW", "윈도우 함수"),
        ("LAG", "윈도우 함수"),
        ("LEAD", "윈도우 함수"),
        ("CONNECT BY", "계층형 질의"),
        ("START WITH", "계층형 질의"),
        ("UNION", "집합 연산"),
        ("INTERSECT", "집합 연산"),
        ("MINUS", "집합 연산"),
        ("SUBQUERY", "서브쿼리"),
        ("서브쿼리", "서브쿼리"),
        ("Top-N", "Top-N"),
        ("NULL", "NULL"),
        ("SUBSTR", "문자 함수"),
        ("LENGTH", "문자 함수"),
        ("CHR", "문자 함수"),
        ("ROUND", "숫자 함수"),
        ("TO_DATE", "날짜 함수"),
        ("날짜", "날짜 함수"),
        ("GRANT", "DCL"),
        ("REVOKE", "DCL"),
        ("ROLLBACK", "TCL"),
        ("실행계획", "실행계획"),
        ("Rows", "SQL Trace"),
        ("Loop", "SQL Trace"),
        ("CR", "SQL Trace"),
        ("PR", "SQL Trace"),
        ("Trace", "SQL Trace"),
        ("TKPROF", "SQL Trace"),
        ("Nested", "NL Join"),
        ("NESTED", "NL Join"),
        ("NL", "NL Join"),
        ("HASH", "Hash Join"),
        ("SORT MERGE", "Sort Merge Join"),
        ("인덱스", "인덱스"),
        ("클러스터링", "클러스터링 팩터"),
        ("카디널리티", "카디널리티"),
        ("선택도", "선택도"),
        ("옵티마이저", "옵티마이저"),
        ("힌트", "힌트"),
        ("Lock", "Lock과 동시성"),
        ("락", "Lock과 동시성"),
        ("동시성", "Lock과 동시성"),
        ("파티션", "파티션"),
        ("View Merging", "쿼리 변환"),
        ("Predicate", "Predicate"),
    ]
    upper = text.upper()
    for needle, topic in checks:
        if needle.upper() in upper:
            return topic
    if subject == "modeling":
        return "데이터 모델링"
    if subject == "sql-basic":
        return "SQL 기본 및 활용"
    if subject == "tuning":
        return "SQL 튜닝"
    return "SQL Practice"


def extraction_status(choices: list[str], answer: str, explanation: str) -> str:
    if len(choices) >= 4 and answer and explanation:
        return "original_ready"
    if len(choices) >= 4 and answer:
        return "answer_ready"
    if answer:
        return "recall_answer_only"
    return "review_required"


def extract_units(paths: list[Path]) -> list[PdfQuestionUnit]:
    units: list[PdfQuestionUnit] = []
    seen = set()
    for path in paths:
        pages = extract_text_pages(path)
        answer_map = extract_answers_from_sql_exam(pages) if path.name.startswith("SQL-") else {}
        recap_subject = "modeling"
        for page_index, page_text in enumerate(pages, start=1):
            if not page_text:
                continue
            if path.name.startswith("SQL-"):
                subject = subject_for_sql_exam_page(page_index)
                if subject.endswith("-answer") or subject == "unknown":
                    continue
            else:
                recap_subject = infer_subject_from_recap(page_text, recap_subject)
                subject = recap_subject
            for number, block in split_question_blocks(page_text):
                question_text, passage, code, choices, inline_answer, inline_explanation = parse_block(block)
                answer_text, explanation = inline_answer, inline_explanation
                mapped = answer_map.get((subject, number))
                if mapped:
                    answer_text = answer_text or mapped[0]
                    explanation = explanation or mapped[1]
                if len(question_text) < 12:
                    continue
                key = (path.name, page_index, number, question_text[:80])
                if key in seen:
                    continue
                seen.add(key)
                text_for_topic = " ".join([question_text, passage, code, inline_answer, explanation])
                unit = PdfQuestionUnit(
                    id=f"{path.stem}-{page_index:03d}-{number:03d}-{len(units)+1:04d}",
                    sourceDocument=path.name,
                    sourcePage=page_index,
                    sourceQuestionNumber=number,
                    subjectId=subject,
                    subjectName=SUBJECT_LABELS.get(subject, subject),
                    topic=topic_from_text(subject, text_for_topic),
                    questionText=question_text,
                    passage=passage,
                    code=code,
                    choices=choices,
                    answerText=answer_text,
                    answerChoiceId=choice_id_from_answer(answer_text),
                    explanation=explanation,
                    extractionStatus=extraction_status(choices, answer_text, explanation),
                )
                units.append(unit)
    return units


def find_pdf_paths() -> list[Path]:
    home = Path.home()
    paths = list((home / "Downloads").glob("SQL-*.pdf"))
    study_dirs = list(home.glob("OneDrive*/바탕 화면/study"))
    if not study_dirs:
        study_dirs = list(home.glob("OneDrive*/**/study"))
    for study in study_dirs:
        for n in range(45, 51):
            paths.extend(study.glob(f"{n}회_기출문제.pdf"))
    deduped: list[Path] = []
    for path in paths:
        if path.exists() and path not in deduped:
            deduped.append(path)
    return deduped


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "data"
    out_dir.mkdir(exist_ok=True)
    paths = find_pdf_paths()
    units = extract_units(paths)
    payload = {
        "version": "official-pdf-extracted-2026-07-23",
        "sourceFiles": [{"name": path.name, "path": str(path), "pages": len(PdfReader(str(path)).pages)} for path in paths],
        "units": [asdict(unit) for unit in units],
    }
    (out_dir / "official-pdf-question-units.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    by_subject: dict[str, int] = {}
    by_status: dict[str, int] = {}
    for unit in units:
        by_subject[unit.subjectId] = by_subject.get(unit.subjectId, 0) + 1
        by_status[unit.extractionStatus] = by_status.get(unit.extractionStatus, 0) + 1
    print(json.dumps({"files": [p.name for p in paths], "units": len(units), "bySubject": by_subject, "byStatus": by_status}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
