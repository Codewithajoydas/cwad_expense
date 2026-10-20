import { HealthCard } from "../features/health/HealthCard";

export function HomePage() {
  return (
    <main className="page">
      <div className="container hero">
        <p className="eyebrow">CWAD React + Express</p>
        <h1>Independent frontend. Independent API. One monorepo.</h1>
        <p className="description">
          A serious React and Express foundation with a real HTTP boundary, shared contracts,
          validation, testing, security middleware, logging, Docker, and CI.
        </p>

        <HealthCard />

        <div className="grid">
          <article className="card">
            <h2>React</h2>
            <p>Vite-powered frontend with feature boundaries.</p>
          </article>
          <article className="card">
            <h2>Express</h2>
            <p>Versioned API with middleware, services, and graceful shutdown.</p>
          </article>
          <article className="card">
            <h2>Shared</h2>
            <p>Types and validation are consumed by both applications.</p>
          </article>
        </div>
      </div>
    </main>
  );
}