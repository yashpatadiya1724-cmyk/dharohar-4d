import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader className="w-8 h-8 text-heritage-gold animate-spin" />
    </div>
  );
}
