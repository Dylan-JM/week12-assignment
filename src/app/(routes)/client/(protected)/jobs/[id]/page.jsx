export default async function ClientJobPage({ params }) {
  const { id } = await params;
  return (
    <div>
      <h1>Job</h1>
      <p>Job ID: {id}</p>
    </div>
  );
}
