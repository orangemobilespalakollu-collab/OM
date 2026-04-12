export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
      <div className="h-full bg-orange-500 w-1/3 animate-[pulse_1s_ease-in-out_infinite]"></div>
    </div>
  );
}
