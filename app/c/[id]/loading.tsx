export default function LoadingCard() {
  return (
    <main className="wrap pb-16 pt-24">
      <div className="mx-auto w-full max-w-2xl">
        <div
          className="animate-pulse rounded-[1.5rem] bg-card shadow-lg"
          style={{ aspectRatio: "148 / 105" }}
        />
        <div className="mx-auto mt-6 h-4 w-56 animate-pulse rounded-full bg-line" />
      </div>
    </main>
  );
}
