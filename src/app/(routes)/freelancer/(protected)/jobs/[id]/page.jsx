import JobsClient from "@/components/JobsClient";

export default async function JobsId({ params }) {
  const {id} = await params;

  return (
    <JobsClient id = {id}/> 
  )

}