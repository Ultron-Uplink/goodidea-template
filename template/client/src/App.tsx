import { strings } from "./strings";

export function App() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">{strings.appName}</h1>
      <p className="mt-2">{strings.tagline}</p>
    </main>
  );
}
