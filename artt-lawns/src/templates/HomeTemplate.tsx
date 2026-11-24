import Image from "next/image";
import JobCarousel from "@/components/JobCarousel";
import QuoteForm from "@/components/QuoteForm";

export default function HomeTemplate() {
  return (
    <div className="garden-home">
      {/* Main introduction: edit the headline and introduction here. */}
      <section className="garden-hero" aria-labelledby="garden-title">
        <div className="garden-hero-copy">
          <p className="garden-eyebrow">ARTT Lawns &amp; Garden Maintenance</p>
          <h1 id="garden-title">A little care.<br />A greener <em>outlook.</em></h1>
          <p id="about" className="garden-intro">
            ARTT Lawns and Garden Maintenance cares for lawns, gardens and
            outdoor spaces. Make room for more time outdoors with a garden
            that looks tidy and feels inviting.
          </p>
          <div className="garden-actions">
            <a className="garden-button" href="#get-a-quote">Get a Quote <span aria-hidden="true">↗</span></a>
            <a className="garden-text-link" href="#our-work">Explore our work <span aria-hidden="true">↓</span></a>
          </div>
          <div className="garden-hero-note"><span aria-hidden="true">✳</span> Lawns. Gardens. Outdoor spaces.</div>
        </div>
        <figure className="garden-hero-photo">
          <Image src="/images/Job1.jpg" alt="Maintained garden beds alongside a timber deck" fill priority sizes="(max-width: 767px) 100vw, 55vw" />
          <figcaption><span>From our garden to yours</span><strong>A closer look at our work</strong></figcaption>
        </figure>
      </section>

      {/* Service overview: confirm specific offerings with the business owner. */}
      <section className="garden-services" aria-labelledby="services-title">
        <div className="garden-section-heading">
          <div><p className="garden-eyebrow">Room to grow</p><h2 id="services-title">Care for the spaces<br />you love.</h2></div>
          <p>From the front lawn to the garden beds, a well-kept outdoor space makes all the difference.</p>
        </div>
        <div className="garden-service-list">
          <article><span className="garden-service-number">01 /</span><h3>Lawn maintenance</h3><p>A greener welcome home, with a lawn that looks cared for.</p></article>
          <article><span className="garden-service-number">02 /</span><h3>Garden maintenance</h3><p>Give your garden beds and greenery the attention they deserve.</p></article>
          <article><span className="garden-service-number">03 /</span><h3>Your outdoor space</h3><p>Have something in mind? Include the details in your quote request below.</p></article>
        </div>
      </section>

      <section id="our-work" className="garden-work" aria-labelledby="work-title">
        <div className="garden-section-heading">
          <div><p className="garden-eyebrow">See the difference</p><h2 id="work-title">A fresh start, outside.</h2></div>
          <p>Explore our before-and-after photos. Use the controls to take a closer look at each transformation.</p>
        </div>
        <div className="gallery">
          <JobCarousel before="Job2.jpg" after="Job1.jpg" job={1} />
          <JobCarousel before="Job6.jpg" after="Job5.jpg" job={2} />
          <JobCarousel before="Job8.jpg" after="Job7.jpg" job={3} />
        </div>
      </section>

      <QuoteForm />
    </div>
  );
}
