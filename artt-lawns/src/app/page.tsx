import Image from "next/image";
import JobCarousel from "@/components/JobCarousel";

export default function Home() {
  return <>
    <h1 className="home-title">
      <Image src="/images/ARTTLogo.jpg" alt="ARTT" width={700} height={100} priority className="hero-logo" />
      <span>Lawns and Garden Maintenance</span>
    </h1>
    <section className="gallery" aria-label="Before and after garden maintenance">
      <JobCarousel before="Job2.jpg" after="Job1.jpg" job={1} />
      <JobCarousel before="Job6.jpg" after="Job5.jpg" job={2} />
      <JobCarousel before="Job8.jpg" after="Job7.jpg" job={3} />
    </section>
  </>;
}

