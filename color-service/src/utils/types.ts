export interface ResponseJSON {
  data: any;
  error: boolean;
  message: string;
}

export const PaginateLabels = {
  totalDocs: "totalItems",
  docs: "items",
  limit: "limit",
  page: "page",
  nextPage: "nextPage",
  prevPage: "prevPage",
  totalPages: "totalPages",
  pagingCounter: "pagingCounter",
  meta: "meta",
};
