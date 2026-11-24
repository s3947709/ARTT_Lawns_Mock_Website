// Edit these placeholders when the remaining business details are available.
const businessDetails = [
  { title: "Our story", prompt: "Add how ARTT started, when the business began and what inspired it." },
  { title: "Meet the team", prompt: "Add the owner's name, a short introduction and any team details." },
  { title: "Where we work", prompt: "Add the suburbs or regions covered and any service area restrictions." },
  { title: "Experience & qualifications", prompt: "Add confirmed experience, relevant qualifications and insurance details." },
];

// The About section lives on the homepage, rather than a separate page.
export default function AboutTemplate() {
  return (
    <section id="about" className="about-details" aria-labelledby="about-title">
      <p className="garden-eyebrow">About ARTT</p>
      <h2 id="about-title">Our story, still growing.</h2>
      <p className="about-summary">ARTT Lawns and Garden Maintenance is a lawn and garden maintenance business focused on caring for outdoor spaces.</p>
      <p className="about-draft-note">Business details to be added. The sections below are placeholders for the owner to complete.</p>
      <div className="about-detail-grid">
        {businessDetails.map(({ title, prompt }) => (
          <article key={title}>
            <span className="about-placeholder-label">To be added</span>
            <h3>{title}</h3>
            <p>{prompt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
