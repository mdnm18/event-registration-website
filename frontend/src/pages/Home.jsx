import RegistrationForm from "../components/RegistrationForm.jsx";

export default function Home() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Register for the Event</h1>
      <p className="text-gray-600 mb-6">
        Fill out the form below to register. We’ll validate inputs and save your
        registration in later phases.
      </p>
      <RegistrationForm />
    </section>
  );
}
