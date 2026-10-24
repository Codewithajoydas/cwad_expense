
export default function SessionSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[205px] border-r bg-white md:flex md:flex-col">
        <div className="flex h-[53px] items-center gap-3 border-b px-4">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />

          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-2 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="flex-1 space-y-7 overflow-hidden p-4">
          {[
            { title: "OVERVIEW", count: 1 },
            { title: "TRANSACTIONS", count: 5 },
            { title: "MANAGEMENT", count: 6 },
            { title: "INSIGHTS", count: 3 },
          ].map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="h-2 w-20 animate-pulse rounded bg-muted" />

              {Array.from({ length: section.count }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                  <div
                    className="h-3 animate-pulse rounded bg-muted"
                    style={{
                      width: `${70 + ((index * 17) % 45)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </aside>

      {/* Main application */}
      <main className="min-w-0 md:pl-[205px]">
        {/* Header */}
        <header className="flex h-[53px] items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />

            <div className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-36 max-w-full animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-8 w-40 animate-pulse rounded-lg bg-muted sm:block" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="hidden space-y-1.5 sm:block">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-2 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </header>

        {/* Dashboard skeleton */}
        <section className="space-y-6 p-4 md:p-6">
          {/* Page heading and actions */}
          <div className="flex min-h-7 items-center justify-between gap-4">
            <div className="h-5 w-28 animate-pulse rounded bg-muted" />

            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                </div>

                <div className="mt-5 h-7 w-28 animate-pulse rounded bg-muted" />

                <div className="mt-4 flex items-center gap-2">
                  <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts and breakdown */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
            {/* Cash flow chart */}
            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 max-w-full animate-pulse rounded bg-muted" />
                </div>

                <div className="h-6 w-6 animate-pulse rounded bg-muted" />
              </div>

              <div className="mt-6 flex items-center gap-5">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>

              <div className="mt-5 flex h-44 items-end justify-around border-b px-2">
                {[20, 35, 28, 52, 42, 78, 62, 88, 70, 55, 94, 76].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="w-3 max-w-[5%] animate-pulse rounded-t-sm bg-muted sm:w-5"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="mt-3 flex justify-between">
                {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(
                  (month) => (
                    <div
                      key={month}
                      className="h-3 w-7 animate-pulse rounded bg-muted"
                    />
                  )
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-3 w-full max-w-24 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            {/* Spending breakdown */}
            <div className="rounded-xl border bg-white p-5">
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-44 max-w-full animate-pulse rounded bg-muted" />

              <div className="mt-6 h-7 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />

              <div className="mt-6 h-2 w-full animate-pulse rounded-full bg-muted" />

              <div className="mt-6 space-y-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
