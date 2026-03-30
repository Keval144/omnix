import { GithubIcon } from "lucide-react";
import Image from "next/image";

import { Logo } from "./logo";

const navLinks = [
  { href: "#", label: "Features" },
  { href: "#", label: "About" },
  { href: "#", label: "Licence" },
];

const socialLinks = [
  {
    href: "https://x.com/kansagra_keval",
    label: "X",
    icon: <XIcon />,
  },
  {
    href: "https://github.com/AtmikDudhagara",
    label: "Github",
    icon: <GithubIcon />,
  },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl *:px-4 *:md:px-6">
      <div className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo size={25} /> Omnix
          </div>
          <div className="flex items-center gap-1">
            {socialLinks.map(({ href, label, icon }) => (
              <a
                key={label}
                aria-label={label}
                className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                href={href}
              >
                {icon}
                <span className="sr-only">{label}</span>
              </a>
            ))}
          </div>
        </div>

        <nav>
          <ul className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground md:gap-6">
            {/* {navLinks.map((link) => (
              <li key={link.label}>
                <a className="hover:text-foreground" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))} */}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Omnix</p>

        <p className="inline-flex flex-wrap items-center gap-1">
          <span>Built by</span>
          <a
            aria-label="x/twitter"
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href="https://x.com/kansagra_keval"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="Keval"
              className="size-4 rounded-full"
              height={16}
              src="https://github.com/keval144.png"
              width={16}
            />
            Keval
          </a>
          and
          <a
            aria-label="github"
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href="https://github.com/AtmikDudhagara"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="Atmik"
              className="size-4 rounded-full"
              height={16}
              src="https://github.com/AtmikDudhagara.png"
              width={16}
            />
            Atmik
          </a>
        </p>
      </div>
    </footer>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-label="X"
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>X</title>
      <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
    </svg>
  );
}
