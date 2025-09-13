const img = "http://localhost:3845/assets/f8f77fe552941b2b5d43b06df1b7320e79f97564.svg";
const img1 = "http://localhost:3845/assets/00170810af78958778371984fa35705e8a79b428.svg";
const img2 = "http://localhost:3845/assets/d8c0218db36a945e5cf6264da8bba4c6dd504b57.svg";
const img3 = "http://localhost:3845/assets/545b6d2f9a28384d7ca52b7690a4195638fbd36e.svg";
const img4 = "http://localhost:3845/assets/fe4ce9d49c32c6947870d255ac2dfd49ee5f8dee.svg";
const img5 = "http://localhost:3845/assets/92dc03d3d3a4bb7de7f3a89bebecf68058f5d19f.svg";
const img6 = "http://localhost:3845/assets/179200ef30c2499a07c22af66013efd3dd4c8d92.svg";

export default function ToolBar() {
  return (
    <div className="bg-white box-border flex gap-6 items-center justify-start px-6 py-2 rounded-lg shadow-lg border border-gray-200">
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute inset-[16.09%_16.07%_14.41%_14.41%]">
          <img alt="Cursor tool" className="block max-w-none size-full" src={img} />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute inset-[12.5%_15.29%_12.5%_17.95%]">
          <img alt="Pan tool" className="block max-w-none size-full" src={img1} />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute inset-[8.333%]">
          <img alt="Comment tool" className="block max-w-none size-full" src={img2} />
        </div>
      </div>
      <div className="h-6 relative shrink-0 w-0">
        <div className="absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0">
          <img alt="Divider" className="block max-w-none size-full" src={img3} />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute inset-[16.67%_8.33%]">
          <img alt="Note tool" className="block max-w-none size-full" src={img4} />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute h-[22.118px] left-0 top-0 w-[25.067px]">
          <img alt="Prompt tool" className="block max-w-none size-full" src={img5} />
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-6">
        <div className="absolute flex inset-[14.24%_22.57%] items-center justify-center">
          <div className="flex-none h-[17.165px] scale-y-[-100%] w-[13.165px]">
            <div className="relative size-full">
              <img alt="Merge tool" className="block max-w-none size-full" src={img6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}