interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number | ((prev: number) => number)) => void;
}

export const ExpensePagination = ({ page, totalPages, setPage }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        disabled={page === 1}
        onClick={() => setPage(p => p - 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(p => p + 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
