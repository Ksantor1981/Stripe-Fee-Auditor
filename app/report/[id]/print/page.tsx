export default function ReportPrintPage({ params }: { params: { id: string } }) {
  return (
    <main className="p-12">
      <p className="text-gray-500">PDF template for report {params.id} — Day 5</p>
    </main>
  );
}
