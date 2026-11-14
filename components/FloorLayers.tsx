import styles from "@/components/collection-pages.module.css";

// Top layer first, the way a cut through the floor reads. Facts from the approved brochure copy.
const LAYERS = [
  { name: "Clear topcoat", detail: "Seals the finish and takes daily wear and hot tires without lifting or peeling." },
  { name: "Your finish", detail: "Metallic pigment poured and worked by hand, or flake broadcast into the wet base coat." },
  { name: "Base coat", detail: "Bonds to the ground concrete and sets the color under your finish." },
  { name: "Your concrete, prepared", detail: "We diamond-grind the slab, fill cracks and joints, and check for moisture before anything goes down." },
];

export default function FloorLayers() {
  return <ol className={styles.layers} aria-label="Layers of a Golden Epoxy floor, top to bottom">
    {LAYERS.map(layer => <li key={layer.name}><strong>{layer.name}</strong><span>{layer.detail}</span></li>)}
  </ol>;
}
