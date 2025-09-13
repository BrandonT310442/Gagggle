const img = "http://localhost:3845/assets/8fae141b5e08c9fee0285e03a79fc81d7afc2f61.svg";

export default function GaggleLogo() {
  return (
    <div className="relative size-full">
      <img alt="Gaggle Logo" className="block max-w-none size-full" src={img} />
    </div>
  );
}