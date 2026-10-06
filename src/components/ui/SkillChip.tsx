import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { RawSkill } from '../../context/PortfolioDataContext'
import { useLang } from '../../hooks/useLang'

const LEVEL_LABEL: Record<number, { en: string; es: string }> = {
  1: { en: 'Basic',      es: 'Básico' },
  2: { en: 'Familiar',   es: 'Conocimiento' },
  3: { en: 'Proficient', es: 'Competente' },
  4: { en: 'Advanced',   es: 'Avanzado' },
  5: { en: 'Expert',     es: 'Experto' },
}

const CAT_LABEL: Record<string, { en: string; es: string }> = {
  languages:     { en: 'Language',    es: 'Lenguaje' },
  frameworks:    { en: 'Framework',   es: 'Framework' },
  tools:         { en: 'Tool',        es: 'Herramienta' },
  databases:     { en: 'Database',    es: 'Base de datos' },
  cloud:         { en: 'Cloud',       es: 'Cloud' },
  architecture:  { en: 'Architecture',es: 'Arquitectura' },
  methodologies: { en: 'Methodology', es: 'Metodología' },
  ai:            { en: 'AI',          es: 'IA' },
  ides:          { en: 'IDE',         es: 'IDE' },
  os:            { en: 'OS',          es: 'SO' },
}

/** Gap kept between the tooltip and the viewport edges (px). */
const EDGE = 8

interface Props {
  skill: RawSkill
  chipClass: string
}

export default function SkillChip({ skill, chipClass }: Props) {
  const lang = useLang()
  const [imgOk, setImgOk] = useState(true)
  const [show, setShow] = useState(false)
  const chipRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const pointerType = useRef('mouse')

  const levelLabel = LEVEL_LABEL[skill.level]?.[lang] ?? ''
  const catLabel   = CAT_LABEL[skill.category]?.[lang] ?? skill.category

  // The tooltip is portalled to <body> and placed in viewport coordinates, so it is never
  // clipped by a card or a scrolling modal, and it is clamped so it never leaves the screen.
  // Placement writes straight to the DOM before paint (no extra render).
  useLayoutEffect(() => {
    const tipEl = tipRef.current
    const chip = chipRef.current?.getBoundingClientRect()
    if (!show || !tipEl || !chip) return
    const tip = tipEl.getBoundingClientRect()
    const centre = chip.left + chip.width / 2
    const left = Math.min(Math.max(centre - tip.width / 2, EDGE), window.innerWidth - tip.width - EDGE)
    const below = chip.top - tip.height - 10 < EDGE
    tipEl.style.left = `${left}px`
    tipEl.style.top = `${below ? chip.bottom + 10 : chip.top - tip.height - 10}px`
    tipEl.style.visibility = 'visible'
    const arrow = arrowRef.current
    if (arrow) {
      arrow.style.left = `${centre - left}px`
      arrow.className = `absolute -translate-x-1/2 border-[5px] border-transparent ${below ? 'bottom-full -mb-px border-b-slate-900' : 'top-full -mt-px border-t-slate-900'}`
    }
  }, [show])

  // Touch: a tap elsewhere, a scroll or a resize closes the open tooltip
  useEffect(() => {
    if (!show) return
    const close = (e: Event) => {
      if (e.type === 'pointerdown' && chipRef.current?.contains(e.target as Node)) return
      setShow(false)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [show])

  return (
    <span
      ref={chipRef}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium select-none cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 hover:shadow-md max-w-full ${chipClass}`}
      // Hover only for real mice: on touch the emulated hover fired before the click and the
      // click's toggle closed the tooltip straight away
      onPointerEnter={e => { if (e.pointerType === 'mouse') setShow(true) }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') setShow(false) }}
      onPointerDown={e => { pointerType.current = e.pointerType }}
      // A mouse already opened it on hover, so its click keeps it open; touch and pen toggle
      onClick={e => { e.stopPropagation(); setShow(s => pointerType.current === 'mouse' || !s) }}
    >
      {/* Icon */}
      {skill.iconUrl && imgOk ? (
        <img
          src={skill.iconUrl}
          alt=""
          className="w-4 h-4 object-contain shrink-0"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0 bg-current/10">
          {skill.name.charAt(0)}
        </span>
      )}

      <span className="truncate min-w-0">{skill.name}</span>

      {/* Level dots */}
      <span className="flex gap-0.5 ml-0.5 shrink-0" aria-hidden>
        {[1, 2, 3, 4].map(i => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= skill.level ? 'bg-current opacity-70' : 'bg-current opacity-15'}`}
          />
        ))}
      </span>

      {/* Floating tooltip */}
      {show && createPortal(
        <span
          ref={tipRef}
          role="tooltip"
          className="pointer-events-none fixed z-[300] bg-slate-900 text-white rounded-xl px-3 py-2.5 shadow-2xl
                     border border-slate-700/50 whitespace-nowrap min-w-[140px]"
          style={{ fontSize: '11px', left: 0, top: 0, visibility: 'hidden' }}
        >
          {/* Name */}
          <span className="block font-semibold text-white text-xs mb-1.5">{skill.name}</span>

          {/* Level bar */}
          <span className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <span
                key={i}
                className={`inline-block w-5 h-1.5 rounded-full ${i <= skill.level ? 'bg-violet-400' : 'bg-slate-700'}`}
              />
            ))}
          </span>

          {/* Level label + category */}
          <span className="block text-slate-400" style={{ fontSize: '10px' }}>
            {levelLabel} · {catLabel}
          </span>

          {/* Arrow, kept under the chip even when the tooltip is clamped to an edge */}
          <span ref={arrowRef} />
        </span>,
        document.body,
      )}
    </span>
  )
}
