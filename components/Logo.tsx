import Image from "next/image";
import { PRODUCT_NAME } from "@/lib/brand";

export function Logo() {
  return (
    <div className="flex size-9 items-center justify-center rounded-md bg-primary">
      <Image src="/logo.svg" alt={PRODUCT_NAME} width={24} height={24} priority />
    </div>
  );
}
