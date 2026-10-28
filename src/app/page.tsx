import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { leerParams, paramsDe } from "@/lib/tarjeta";
import { Experience } from "./experience";

// La vista previa del enlace muestra la tarjeta de quien lo compartió
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const sp = await searchParams;
  const plano = new URLSearchParams();
  for (const k of ["e", "a"]) {
    const v = sp[k];
    if (typeof v === "string") plano.set(k, v);
  }
  const { estado, edad } = leerParams(plano);
  const q = paramsDe(estado, edad);
  q.set("f", "og");
  const imagen = { url: `/api/tarjeta?${q}`, width: 1200, height: 630 };
  return {
    openGraph: { type: "website", images: [imagen] },
    twitter: { card: "summary_large_image", images: [imagen.url] },
  };
}

// Cada enlace compartido necesita su propia vista previa, así que la página se resuelve por petición
async function PorPeticion() {
  await connection();
  return null;
}

export default function Page() {
  return (
    <>
      <Experience />
      <Suspense>
        <PorPeticion />
      </Suspense>
    </>
  );
}
