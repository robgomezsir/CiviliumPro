import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
  height?: number;
};

export function CiviliumLogo({ href = "/painel", className, height = 32 }: Props) {
  const imagem = (
    <Image
      src="/civilium-logo.png"
      alt="civilium"
      width={Math.round(height * 3.38)}
      height={height}
      priority
      className={cn("h-auto w-auto", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (!href) return imagem;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center rounded-lg">
      {imagem}
    </Link>
  );
}
