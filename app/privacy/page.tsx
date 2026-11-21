import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";
import { leadEmail } from "@/data/siteContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Golden Epoxy collects when you ask for an estimate, how we use it, and how to have it changed or deleted.",
};

const UPDATED = "November 21, 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: <p>Golden Epoxy is an owner-operated epoxy flooring business based in Odessa, Florida, working across Tampa Bay. This policy covers our website, our Facebook and Instagram forms, and calls, texts and messages you send us.</p>,
  },
  {
    title: "What we collect",
    body: <>
      <p>Only what you give us when you ask for an estimate or contact us:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Your name, phone number and email address</li>
        <li>Your town or ZIP code and the address of the job</li>
        <li>Details about your project, such as the space, its size, the finish you want and when you want it done</li>
        <li>Photos you choose to send us</li>
      </ul>
    </>,
  },
  {
    title: "How we use it",
    body: <p>We use your information to call or text you back, set up and give your estimate, do the job and honor your warranty. We don&apos;t sell or rent your information, and we don&apos;t share it with other businesses for their marketing.</p>,
  },
  {
    title: "Who else handles it",
    body: <p>Carlos and the Golden Epoxy crew see your request. A few services handle it on our behalf: our email provider delivers website form messages, our web host runs this site, and Meta (Facebook and Instagram) holds the answers you submit on a Facebook or Instagram form until we download them. Meta&apos;s own privacy policy covers what Meta does with your data.</p>,
  },
  {
    title: "Calls and texts",
    body: <p>If you give us your phone number, we may call or text you about your estimate or your job. We won&apos;t add you to marketing texts. Tell us to stop at any time, or reply STOP to a text.</p>,
  },
  {
    title: "Cookies and tracking",
    body: <p>This website doesn&apos;t use advertising or analytics cookies. Like most websites, our host keeps standard server logs, such as IP address and browser type, to keep the site running and secure.</p>,
  },
  {
    title: "How long we keep it",
    body: <p>We keep estimate requests for as long as we need them to follow up, and we keep job records for as long as your warranty and our tax records require.</p>,
  },
  {
    title: "Your choices",
    body: <p>You can ask us what we have about you, ask us to correct it, or ask us to delete it. Email <a className="text-gold-300 underline" href={`mailto:${leadEmail}`}>{leadEmail}</a> or call <a className="text-gold-300 underline" href={PHONE_HREF}>{PHONE_LABEL}</a> and we&apos;ll take care of it.</p>,
  },
  {
    title: "Children",
    body: <p>Our services are for adults. We don&apos;t knowingly collect information from anyone under 18.</p>,
  },
  {
    title: "Changes",
    body: <p>If we change how we handle your information, we&apos;ll update this page and the date at the top.</p>,
  },
];

export default function PrivacyPage() {
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.galleryHero}`}>
        <div className={styles.ruleLabel}><span>Privacy Policy</span><span>Updated {UPDATED}</span></div>
        <p className={styles.eyebrow}>Your information</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.heroCopy}>When you ask for an estimate, you trust us with your name, number and address. Here&apos;s what we keep and what we do with it.</p>
      </section>
      <section className="content-shell pb-20">
        <div className="max-w-3xl space-y-10 text-base leading-relaxed text-white/80">
          {SECTIONS.map(section => <div key={section.title}>
            <h2 className="mb-3 text-xl font-semibold text-white">{section.title}</h2>
            {section.body}
          </div>)}
        </div>
      </section>
    </main><SiteFooter homeLinks={false} /></div>;
}
