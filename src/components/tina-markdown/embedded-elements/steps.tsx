export default function Steps(data: {
  stepBlock: {
    description: string;
  }[];
}) {
  return (
    <div className="pl-8 flex flex-col gap-3">
      {data.stepBlock.map((step, index) => (
        <div key={index} className="flex gap-2">
          <div className="text-brand-primary brand-glass-gradient rounded-sm shadow-md px-2 h-6">{index + 1}</div>
          <div className="">
            {step.description}
          </div>
        </div>
      ))}
    </div>
  );
}
