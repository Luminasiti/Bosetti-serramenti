import { BosettiLogo } from "@/components/ui/BosettiLogo";
import { companyData } from "@/data/company";

export function Footer() {
  return (
    <footer className="bg-graphite text-white/75 pb-24 md:pb-0">
      <div className="container-site py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <BosettiLogo variant="dark-bg" className="h-11 w-auto" />
          <p className="max-w-sm text-[0.9375rem]">
            Serramenti in alluminio fatti da noi, a Montichiari. Da padre in figli, {companyData.foundedText}.
          </p>
        </div>

        <div className="space-y-2 text-[0.9375rem]">
          <p className="font-semibold text-white">Laboratorio e ufficio</p>
          <p>{companyData.address.full}</p>
          <a href={`mailto:${companyData.email}`} className="block hover:text-white underline-offset-4 hover:underline">
            {companyData.email}
          </a>
        </div>

        <div className="space-y-2 text-[0.9375rem]">
          <p className="font-semibold text-white">Seguici</p>
          <a href={companyData.socials.facebook} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
            Facebook
          </a>
          <a href={companyData.socials.instagram} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
            Instagram
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-wrap justify-between gap-3 text-sm text-alu">
          <p>© {companyData.name} · Montichiari (BS) · P. IVA 03281480982</p>
          <a href="#" className="hover:text-white">
            Privacy e cookie
          </a>
        </div>
      </div>
    </footer>
  );
}
