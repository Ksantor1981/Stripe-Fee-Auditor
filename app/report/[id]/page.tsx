export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p className="text-gray-500">Report {params.id} — Day 4</p>
    </main>
  );
}
