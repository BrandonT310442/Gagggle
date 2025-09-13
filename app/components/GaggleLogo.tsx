const img = '/gaggle-logo.svg';

export default function GaggleLogo() {
  return (
    <div className='relative size-full'>
      <img alt='Gaggle Logo' className='block max-w-none size-full' src={img} />
    </div>
  );
}
