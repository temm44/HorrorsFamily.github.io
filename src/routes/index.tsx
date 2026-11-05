import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, Volume2, VolumeX, Upload, Send, Search } from "lucide-react";
import {
  TELEGRAM_GROUP_URL,
  TELEGRAM_CONTACT_URL,
  MUSIC_URL,
} from "@/config/links";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grand Mobile Horrors Family — официальный сайт семьи" },
      { name: "description", content: "Официальный сайт Grand Mobile Horrors Family (гранд мобайл хоррорс): руководство по рангам, история фамы HORRORS, вступление в группу и связь." },
      { name: "keywords", content: "Grand Mobile Horrors Family, Grand Mobile Horrors, гранд мобайл хоррорс, HORRORS Grand Mobile, Фама HORRORS, Семья HORRORS Grand Mobile" },
      { property: "og:title", content: "Grand Mobile Horrors Family" },
      { property: "og:description", content: "Не просто семья. История, которую мы продолжаем писать." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  ["home", "Главная"],
  ["join", "Вступить в группу"],
  ["leaders", "Руководство"],
  ["history", "История HORRORS"],
  ["shooter", "Лучший стрелок HORRORS"],
  ["gallery", "Галерея"],
] as const;

const RANK9 = ["Antoshka_Horrors","Kenshi_Marshall","Jarret_Horrors","Kai_Horrors","Aqweezon_Horrors","Gambino96","Entonin_Stark","Lala_Develuks","Mqweezz_Horrors","Danskyi_Horrors"];
const RANK8 = ["Apinner_Horrors","Enotik_Horrors","Takimichi_Horrors","Kostya_Illarionov","Lami_Horrors","Artem_Kabanov","Lesia_Uest","Awerone_Horrors","Hanzo_Horrors","Wpotoke_Solokapt","Milady_Rakuzzan","Anisone_Ugiyrelisted","Alenka_Montegra","POLCOVODEC","Petya_Horrors","Aura_Horrors","Anton_Polstyanov"];

function ExtLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (!href)
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); alert("Ссылка скоро будет добавлена."); }} className={className}>
        {children}
      </a>
    );
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}

// Декоративная надпись: просто текст, не ссылка, не кнопка.
function FamilyLink() {
  return (
    <div className="font-display text-lg tracking-[0.25em] text-foreground grand-inscription sm:text-2xl">
      Grand Mobile Family Horrors
    </div>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (el.classList.add("in"), io.disconnect()), { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Fog() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><div className="fog absolute -inset-1/4 opacity-70" /></div>;
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mb-12 text-center">
      <h2 className="font-display text-3xl font-bold tracking-[0.15em] sm:text-5xl">{children}</h2>
      <div className="mx-auto mt-5 h-px w-24 bg-primary glow" />
    </Reveal>
  );
}

// Ambient drone synthesized in-browser (no vocals) — used when MUSIC_URL is empty.
function useAmbient() {
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const start = () => {
    if (!ctx.current) {
      const c = new AudioContext(); ctx.current = c;
      const g = c.createGain(); g.gain.value = 0; g.connect(c.destination); master.current = g;
      const filter = c.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 600; filter.connect(g);
      [55, 82.4, 110.3, 164.8].forEach((f, i) => {
        const o = c.createOscillator(); o.type = i % 2 ? "sawtooth" : "sine"; o.frequency.value = f;
        const og = c.createGain(); og.gain.value = i % 2 ? 0.04 : 0.12;
        const lfo = c.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03;
        const lg = c.createGain(); lg.gain.value = 0.05; lfo.connect(lg); lg.connect(og.gain); lfo.start();
        o.connect(og); og.connect(filter); o.start();
      });
    }
    ctx.current.resume();
    master.current!.gain.linearRampToValueAtTime(0.5, ctx.current.currentTime + 3);
  };
  const stop = () => { if (ctx.current && master.current) master.current.gain.linearRampToValueAtTime(0, ctx.current.currentTime + 1); };
  return { start, stop };
}

function MusicControl() {
  const [on, setOn] = useState(false);
  const [src, setSrc] = useState(MUSIC_URL);
  const audio = useRef<HTMLAudioElement>(null);
  const amb = useAmbient();
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = () => {
    if (on) { audio.current?.pause(); amb.stop(); setOn(false); return; }
    if (src && audio.current) { audio.current.volume = 0.5; audio.current.play().catch(() => {}); } else amb.start();
    setOn(true);
  };
  const onFile = (f?: File) => {
    if (!f) return; amb.stop(); setSrc(URL.createObjectURL(f));
    setTimeout(() => { audio.current?.play().catch(() => {}); setOn(true); }, 50);
  };
  return (
    <div className="fixed bottom-5 right-5 z-50 flex gap-2">
      <audio ref={audio} src={src || undefined} loop />
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <button aria-label="Загрузить свою музыку" title="Загрузить аудиофайл" onClick={() => fileRef.current?.click()} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur transition hover:text-foreground hover:glow">
        <Upload size={16} />
      </button>
      <button aria-label={on ? "Выключить музыку" : "Включить музыку"} onClick={toggle} className="grid h-11 w-11 place-items-center rounded-full border border-primary bg-card/80 text-primary-glow backdrop-blur transition hover:glow">
        {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
}

function Splash({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 text-center transition-opacity duration-1000 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <Fog />
      <h1 className="animate-rise relative font-display text-3xl font-black tracking-[0.12em] text-glow sm:text-6xl md:text-7xl">GRAND MOBILE HORRORS</h1>
      <p className="animate-rise relative mt-6 text-sm uppercase tracking-[0.4em] text-muted-foreground [animation-delay:.4s]">Добро пожаловать в Grand Mobile Horrors</p>
      <button onClick={() => { setLeaving(true); setTimeout(onEnter, 1000); }} className="btn-blood animate-rise relative mt-12 [animation-delay:.8s]">Продолжить</button>
    </div>
  );
}

// ── Поиск: по введённому тексту открываются оба официальных названия сайта ───
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim().replace(/\s+/g, " ");

const NAME_KEYS = ["grand", "mobile", "horrors", "семья", "гранд", "мобайл", "хоррорс", "хоррор", "хо"];
const hitName = (q: string) => {
  const n = norm(q);
  return n.length >= 2 && NAME_KEYS.some((k) => k.startsWith(n) || n.startsWith(k) || k.includes(n));
};

type Hit = { id: string; label: string; hint: string };

const NAME_HITS: Hit[] = [
  { id: "home", label: "гранд мобайл хоррорс", hint: "Открыть сайт" },
  { id: "home", label: "Grand Mobile Horrors", hint: "Открыть сайт" },
];

const SEARCH_SECTIONS: Hit[] = [
  ...NAV.map(([id, l]) => ({ id, label: l, hint: "Перейти" })),
  { id: "contact", label: "Связь с HORRORS", hint: "Перейти" },
];

function openSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SearchBox({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const [boxOpen, setBoxOpen] = useState(false);
  const hits = !boxOpen
    ? []
    : norm(q) === ""
      ? NAME_HITS
      : [
          ...(hitName(q) ? NAME_HITS : []),
          ...SEARCH_SECTIONS.filter((h) => norm(h.label).includes(norm(q)) || norm(q).includes(norm(h.label))),
        ];
  const go = (h: Hit) => { openSection(h.id); setQ(""); setBoxOpen(false); };
  return (
    <div
      className={`relative ${className}`}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setBoxOpen(false); }}
    >
      <label className="flex items-center gap-2 border border-border bg-card/80 px-3 py-2 transition focus-within:border-primary focus-within:glow">
        <Search size={14} aria-hidden className="shrink-0 text-primary-glow" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setBoxOpen(true); }}
          onFocus={() => setBoxOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) go(hits[0]);
            if (e.key === "Escape") { setBoxOpen(false); setQ(""); }
          }}
          placeholder="Поиск: введите текст"
          aria-label="Поиск по сайту"
          className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      {hits.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[260px] border border-primary/40 bg-card/95 p-1 backdrop-blur glow">
          {norm(q) === "" && (
            <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Названия сайта</div>
          )}
          {hits.map((h) => (
            <button
              key={`${h.id}-${h.label}`}
              type="button"
              onClick={() => go(h)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-primary/15"
            >
              <span className="font-display text-sm tracking-wide text-foreground">{h.label}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-primary-glow">{h.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5">
        <a href="#home" className="whitespace-nowrap font-display text-base font-black tracking-[0.1em] text-primary-glow sm:text-lg">Grand Mobile Horrors Family</a>
        <nav className="hidden gap-5 whitespace-nowrap 2xl:flex">
          {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground">{l}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <SearchBox className="hidden w-44 sm:block lg:w-56" />
          <button className="2xl:hidden" aria-label="Меню" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-border bg-background px-5 py-4 2xl:hidden">
          <SearchBox className="mb-3 sm:hidden" />
          {NAV.map(([id, l]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">{l}</a>)}
        </nav>
      )}
    </header>
  );
}

function Card({ name, rank }: { name: string; rank: string }) {
  return (
    <div className="border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary hover:glow">
      <div className="text-[10px] uppercase tracking-[0.3em] text-primary-glow">{rank}</div>
      <div className="mt-2 break-words font-display text-base tracking-wide">{name}</div>
    </div>
  );
}

const P = ({ children }: { children: ReactNode }) => <Reveal><p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{children}</p></Reveal>;

function Index() {
  const [entered, setEntered] = useState(false);
  return (
    <>
      {!entered && <Splash onEnter={() => setEntered(true)} />}
      <Header />
      <MusicControl />
      <main>
        <section id="home" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
          <Fog />
          <h1 className="animate-rise relative font-display text-4xl font-black tracking-[0.08em] text-glow sm:text-6xl md:text-8xl">GRAND MOBILE HORRORS</h1>
          <p className="animate-rise relative mt-6 max-w-xl text-base text-muted-foreground sm:text-xl [animation-delay:.3s]">Не просто семья. История, которую мы продолжаем писать.</p>
          <div className="animate-rise relative mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:.6s]">
            <ExtLink href={TELEGRAM_GROUP_URL || TELEGRAM_CONTACT_URL} className="btn-blood px-10 py-5 text-base sm:text-lg">ВСТУПИТЬ В ГРУППУ</ExtLink>
            <a href="#history" className="btn-ghost-blood">История HORRORS</a>
          </div>
          <div className="animate-rise relative mt-10 [animation-delay:.9s]"><FamilyLink /></div>
        </section>

        <section id="join" className="relative overflow-hidden px-6 py-28">
          <Title>СТАНЬ ЧАСТЬЮ HORRORS</Title>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">HORRORS — это наша история, наша команда и наш общий путь. Если ты хочешь стать частью семьи, переходи в нашу официальную группу.</p>
            <ExtLink href={TELEGRAM_GROUP_URL || TELEGRAM_CONTACT_URL} className="btn-blood mt-10 px-10 py-5 text-base">Перейти в группу</ExtLink>
          </Reveal>
        </section>

        <section id="leaders" className="mx-auto max-w-6xl px-6 py-28">
          <Title>РУКОВОДСТВО HORRORS</Title>
          <Reveal className="mx-auto mb-16 max-w-md border border-primary bg-card p-10 text-center glow">
            <div className="text-xs uppercase tracking-[0.4em] text-primary-glow">Ранг 10 — Лидер</div>
            <div className="mt-4 break-words font-display text-2xl font-bold tracking-wider sm:text-3xl">Morok_Horrors</div>
          </Reveal>
          <Reveal><h3 className="mb-6 font-display text-xl tracking-[0.2em]">Ранг 9 — Заместители</h3></Reveal>
          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{RANK9.map((n) => <Card key={n} name={n} rank="Ранг 9" />)}</div>
          <Reveal><h3 className="mb-6 font-display text-xl tracking-[0.2em]">Ранг 8 — Старший состав</h3></Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{RANK8.map((n) => <Card key={n} name={n} rank="Ранг 8" />)}</div>
        </section>

        <section id="history" className="relative overflow-hidden px-6 py-28">
          <Title>ИСТОРИЯ HORRORS</Title>
          <article className="relative mx-auto max-w-3xl">
            <Reveal><h3 className="mb-8 font-display text-2xl tracking-[0.15em] text-primary-glow">Глава I. Начало</h3></Reveal>
            <P>История нашей фамы началась с нуля. Её основателем стал Danskyi_Horrors (Xam_Mansory). В те времена фама носила название Mansory.</P>
            <P>С самого начала рядом с основателем находился его заместитель — Morok_Horrors (Tyson_Horrors), которому он доверял больше всего. Вместе они начали строить будущее фамы, постепенно развивая её и укрепляя состав.</P>
            <P>Поначалу у Mansory было немного участников и возможностей, но это не помешало нам двигаться вперёд. Фама постепенно развивалась: мы приобретали дорогие автомобили, старались улучшать положение и создавать достойную основу для дальнейшего роста.</P>
            <P>Важную роль в развитии сыграли заместители, которые помогали руководству и вносили свой вклад в общее дело. Благодаря совместным усилиям фама постепенно становилась сильнее и увереннее двигалась к своим целям.</P>
            <P>Спустя несколько месяцев основатель принял решение передать лидерство Morok_Horrors (Tyson_Horrors), которому доверял и которого считал подходящим человеком для дальнейшего развития фамы.</P>
            <P>После передачи лидерства прошло ещё несколько месяцев. За это время фама продолжила свой путь, и лидер принял решение изменить её название. Так, вместо прежнего Mansory появилось название Mansory The Horrors.</P>
            <div className="my-14 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <Reveal><h3 className="mb-8 font-display text-2xl tracking-[0.15em] text-primary-glow">Глава II. Рождение HORRORS</h3></Reveal>
            <P>Позже по решению лидера название Mansory The Horrors было сокращено до Horrors.</P>
            <P>Так появилось имя, под которым семья продолжила свой путь. За этим названием стоит история, начавшаяся с нуля, пройденные испытания и люди, которые внесли свой вклад в развитие семьи.</P>
            <P>Но на этом история не заканчивается. HORRORS продолжает свой путь, создаёт новые воспоминания и пишет следующие страницы своей истории.</P>
            <Reveal><p className="mt-16 text-center font-display text-3xl font-bold tracking-[0.12em] text-glow sm:text-5xl">ИСТОРИЯ HORRORS ПРОДОЛЖАЕТСЯ…</p></Reveal>
          </article>
        </section>

        {[["shooter", "ЛУЧШИЙ СТРЕЛОК HORRORS"], ["gallery", "ГАЛЕРЕЯ HORRORS"]].map(([id, t]) => (
          <section key={id} id={id} className="relative overflow-hidden border-t border-border px-6 py-32 text-center">
            <Fog />
            <div className="relative"><Title>{t}</Title>
              <Reveal><p className="font-display text-2xl tracking-[0.4em] text-primary-glow text-glow">СКОРО БУДЕТ…</p></Reveal>
            </div>
          </section>
        ))}

        <section id="contact" className="border-t border-border px-6 py-28 text-center">
          <Title>СВЯЗЬ С HORRORS</Title>
          <Reveal>
            <p className="text-lg text-muted-foreground">Есть вопросы? Свяжись с нами в Telegram.</p>
            <p className="mt-3 font-display text-xl tracking-widest">@awarano</p>
            <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="btn-blood mt-8"><Send size={16} /> НАПИСАТЬ В TELEGRAM</a>
          </Reveal>
        </section>
      </main>
      <footer className="border-t border-border px-6 py-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <div className="font-display text-base text-foreground">GRAND MOBILE HORRORS © 2026</div>
        <div className="mt-2">GRAND MOBILE FAMILY</div>
        <div className="mt-2 normal-case tracking-widest">Telegram: <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">@awarano</a></div>
        <div className="mt-5"><FamilyLink /></div>
      </footer>
    </>
  );
}
