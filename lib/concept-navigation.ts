import type { ConceptArticle, SubjectId } from "@/lib/types";

export type RelatedConceptNavigation = {
  section: "concepts";
  activeConceptSubject: SubjectId;
  activeConceptMajor: string;
  selectedConceptId: string;
};

export function resolveRelatedConceptNavigation(
  conceptId: string | undefined,
  articles: ConceptArticle[]
): RelatedConceptNavigation | null {
  if (!conceptId) return null;

  const concept = articles.find((article) => article.id === conceptId);
  if (!concept) return null;

  return {
    section: "concepts",
    activeConceptSubject: concept.subjectId,
    activeConceptMajor: concept.majorTopic,
    selectedConceptId: concept.id
  };
}
