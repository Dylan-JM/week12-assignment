export default async function FreelancerProfilePage({ params }) {
  const { id } = await params;
  return (
    <div>
      <h1>Profile</h1>
      <p>Profile ID: {id}</p>
    </div>
  );
}
