/**
 * DTO para Issue (Edição de Revista)
 */
class IssueDTO {
  /**
   * Converte entidade Issue para DTO completo
   */
  static toFull(issue) {
    if (!issue) return null;

    return {
      id: issue.id,
      issueNumber: issue.issue_number,
      publicationYear: issue.publication_year,
      description: issue.description,
      coverImageUrl: issue.cover_image_url,
      pdfFileUrl: issue.pdf_file_url,
      pageCount: issue.page_count,
      author: issue.author,
      artist: issue.artist,
      title: issue.title_name ? {
        id: issue.title_id,
        name: issue.title_name,
        genre: issue.genre
      } : null,
      publisher: issue.publisher_name ? {
        name: issue.publisher_name
      } : null,
      rating: {
        average: parseFloat(issue.average_rating) || 0,
        count: parseInt(issue.rating_count) || 0
      },
      createdAt: issue.created_at,
      updatedAt: issue.updated_at
    };
  }

  /**
   * DTO de lista (menos detalhes)
   */
  static toList(issue) {
    if (!issue) return null;

    return {
      id: issue.id,
      issueNumber: issue.issue_number,
      publicationYear: issue.publication_year,
      coverImageUrl: issue.cover_image_url,
      title: {
        name: issue.title_name
      },
      publisher: {
        name: issue.publisher_name
      },
      rating: {
        average: parseFloat(issue.average_rating) || 0,
        count: parseInt(issue.rating_count) || 0
      }
    };
  }

  /**
   * DTO mínimo (para relacionamentos)
   */
  static toMinimal(issue) {
    if (!issue) return null;

    return {
      id: issue.id,
      issueNumber: issue.issue_number,
      coverImageUrl: issue.cover_image_url,
      title: issue.title_name,
      rating: parseFloat(issue.average_rating) || 0
    };
  }

  /**
   * Converte lista de issues
   */
  static toFullList(issues) {
    return issues.map(issue => this.toFull(issue));
  }

  /**
   * Converte lista de issues (formato lista)
   */
  static toListArray(issues) {
    return issues.map(issue => this.toList(issue));
  }

  /**
   * Converte lista de issues (formato mínimo)
   */
  static toMinimalList(issues) {
    return issues.map(issue => this.toMinimal(issue));
  }
}

module.exports = IssueDTO;
