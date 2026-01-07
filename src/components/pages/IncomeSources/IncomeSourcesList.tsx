// import { IncomeCard } from './IncomeCard';

import { IncomeSourceCard } from './IncomeSourceCard';

export const IncomeSourcesList = ({
  sources,
  remove,
  currentUser,
  page,
  setPage,
  totalPages
}: any) => {
  if (!sources.length) {
    return <p className="text-center py-12 text-muted-foreground">No data</p>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {sources.map((s: any) => (
          <IncomeSourceCard
            key={s.id}
            source={s}
            currency={currentUser.currency}
            onDelete={() => remove(s.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? 'bg-primary text-white' : 'bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
