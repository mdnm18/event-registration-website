import RegistrationsTable from "../components/RegistrationsTable.jsx";

export default function Registrations() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">All Registrations</h1>
      <p className="text-gray-600 mb-6">
        This table will show all submissions fetched from the backend in Phase
        4.
      </p>
      <RegistrationsTable />
    </section>
  );
}
