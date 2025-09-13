const img = '/cursor-tool.svg';
const img1 = '/pan-tool.svg';
const img2 = '/comment-tool.svg';
const img3 = '/divider.svg';
const img4 = '/note-tool.svg';
const img5 = '/prompt-tool.svg';
const img6 = '/merge-tool.svg';

export default function ToolBar() {
  return (
    <div className='bg-white box-border flex gap-6 items-center justify-start px-6 py-2 rounded-lg shadow-lg border border-gray-200'>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute inset-[16.09%_16.07%_14.41%_14.41%]'>
          <img
            alt='Cursor tool'
            className='block max-w-none size-full'
            src={img}
          />
        </div>
      </div>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute inset-[12.5%_15.29%_12.5%_17.95%]'>
          <img
            alt='Pan tool'
            className='block max-w-none size-full'
            src={img1}
          />
        </div>
      </div>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute inset-[8.333%]'>
          <img
            alt='Comment tool'
            className='block max-w-none size-full'
            src={img2}
          />
        </div>
      </div>
      <div className='h-6 relative shrink-0 w-0'>
        <div className='absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0'>
          <img
            alt='Divider'
            className='block max-w-none size-full'
            src={img3}
          />
        </div>
      </div>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute inset-[16.67%_8.33%]'>
          <img
            alt='Note tool'
            className='block max-w-none size-full'
            src={img4}
          />
        </div>
      </div>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute h-[22.118px] left-0 top-0 w-[25.067px]'>
          <img
            alt='Prompt tool'
            className='block max-w-none size-full'
            src={img5}
          />
        </div>
      </div>
      <div className='overflow-clip relative shrink-0 size-6'>
        <div className='absolute flex inset-[14.24%_22.57%] items-center justify-center'>
          <div className='flex-none h-[17.165px] scale-y-[-100%] w-[13.165px]'>
            <div className='relative size-full'>
              <img
                alt='Merge tool'
                className='block max-w-none size-full'
                src={img6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
