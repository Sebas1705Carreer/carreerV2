import { motion } from 'framer-motion'

interface DecoItem {
  content: string
  left?: string
  right?: string
  top?: string
  bottom?: string
  fontSize: string        // desktop
  fontSizeSm: string      // tablet/mobile
  opacity: number
  rotate: number
  delay: number
  floatX: number
  floatY: number
  duration: number
}

const DECOR: Record<string, DecoItem[]> = {
  hero: [
    { content: '</>', left: '5%',  top: '12%',    fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.055, rotate: -18, delay: 0,   floatX: 14,  floatY: -14, duration: 14 },
    { content: '{ }', right: '6%', top: '15%',    fontSize: '4rem',   fontSizeSm: '2rem',   opacity: 0.045, rotate: 12,  delay: 1.5, floatX: -10, floatY: 10,  duration: 18 },
    { content: '=>',  left: '7%',  bottom: '20%', fontSize: '3rem',   fontSizeSm: '1.5rem', opacity: 0.06,  rotate: 6,   delay: 3,   floatX: 10,  floatY: -8,  duration: 11 },
    { content: '[ ]', right: '7%', bottom: '18%', fontSize: '4rem',   fontSizeSm: '2rem',   opacity: 0.04,  rotate: -8,  delay: 2,   floatX: -8,  floatY: -12, duration: 16 },
    { content: '~$',  left: '42%', bottom: '10%', fontSize: '2.5rem', fontSizeSm: '1.2rem', opacity: 0.035, rotate: 0,   delay: 4,   floatX: 5,   floatY: -6,  duration: 20 },
    { content: '01',  left: '2%',  top: '45%',    fontSize: '2rem',   fontSizeSm: '1rem',   opacity: 0.04,  rotate: -90, delay: 2.5, floatX: 0,   floatY: -10, duration: 22 },
  ],
  about: [
    { content: '◆', left: '4%',   top: '13%',    fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.05,  rotate: 18,  delay: 0,   floatX: 8,   floatY: -10, duration: 16 },
    { content: '◇', right: '5%',  top: '17%',    fontSize: '6rem',   fontSizeSm: '3rem',   opacity: 0.04,  rotate: -22, delay: 2,   floatX: -12, floatY: 8,   duration: 21 },
    { content: '○', left: '2%',   bottom: '22%', fontSize: '8rem',   fontSizeSm: '4rem',   opacity: 0.03,  rotate: 0,   delay: 1,   floatX: 10,  floatY: 14,  duration: 24 },
    { content: '△', right: '4%',  bottom: '20%', fontSize: '5.5rem', fontSizeSm: '2.8rem', opacity: 0.045, rotate: 5,   delay: 3,   floatX: -8,  floatY: -12, duration: 19 },
    { content: '⬡', left: '44%',  top: '8%',     fontSize: '3.5rem', fontSizeSm: '1.8rem', opacity: 0.04,  rotate: 10,  delay: 1.5, floatX: 6,   floatY: -6,  duration: 17 },
  ],
  skills: [
    { content: '<>',   left: '3%',  top: '10%',    fontSize: '6rem',   fontSizeSm: '3rem',   opacity: 0.055, rotate: -12, delay: 0,   floatX: 12,  floatY: -10, duration: 14 },
    { content: '&&',   right: '4%', top: '14%',    fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.05,  rotate: 8,   delay: 1,   floatX: -10, floatY: 12,  duration: 18 },
    { content: '::',   left: '5%',  bottom: '16%', fontSize: '4.5rem', fontSizeSm: '2.2rem', opacity: 0.06,  rotate: 5,   delay: 2,   floatX: 8,   floatY: -14, duration: 12 },
    { content: '{ }',  right: '3%', bottom: '18%', fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.045, rotate: -10, delay: 3,   floatX: -14, floatY: -8,  duration: 16 },
    { content: '/**/', left: '43%', bottom: '7%',  fontSize: '2.5rem', fontSizeSm: '1.2rem', opacity: 0.035, rotate: 0,   delay: 4,   floatX: 5,   floatY: -5,  duration: 20 },
  ],
  experience: [
    { content: '★', left: '4%',   top: '12%',    fontSize: '5.5rem', fontSizeSm: '2.8rem', opacity: 0.055, rotate: 12,  delay: 0,   floatX: 10,  floatY: -8,  duration: 15 },
    { content: '▶', right: '5%',  top: '17%',    fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.045, rotate: -6,  delay: 1,   floatX: -8,  floatY: 10,  duration: 20 },
    { content: '◉', left: '2%',   bottom: '20%', fontSize: '7rem',   fontSizeSm: '3.5rem', opacity: 0.035, rotate: 0,   delay: 2,   floatX: 12,  floatY: 5,   duration: 26 },
    { content: '■', right: '3%',  bottom: '18%', fontSize: '5.5rem', fontSizeSm: '2.8rem', opacity: 0.04,  rotate: 15,  delay: 3,   floatX: -10, floatY: -10, duration: 19 },
    { content: '≥', left: '43%',  top: '8%',     fontSize: '3rem',   fontSizeSm: '1.5rem', opacity: 0.04,  rotate: 0,   delay: 1.5, floatX: 5,   floatY: -8,  duration: 16 },
  ],
  projects: [
    { content: '</>', left: '3%',  top: '11%',    fontSize: '5.5rem', fontSizeSm: '2.8rem', opacity: 0.055, rotate: -14, delay: 0,   floatX: 10,  floatY: -12, duration: 13 },
    { content: '{ }', right: '4%', top: '14%',    fontSize: '5rem',   fontSizeSm: '2.5rem', opacity: 0.045, rotate: 8,   delay: 1,   floatX: -12, floatY: 10,  duration: 17 },
    { content: '[ ]', left: '4%',  bottom: '16%', fontSize: '6rem',   fontSizeSm: '3rem',   opacity: 0.04,  rotate: 5,   delay: 2,   floatX: 8,   floatY: -8,  duration: 22 },
    { content: '≡',   right: '3%', bottom: '18%', fontSize: '7rem',   fontSizeSm: '3.5rem', opacity: 0.045, rotate: 0,   delay: 3,   floatX: -8,  floatY: -14, duration: 16 },
    { content: '#',   left: '43%', bottom: '8%',  fontSize: '3rem',   fontSizeSm: '1.5rem', opacity: 0.04,  rotate: 5,   delay: 4,   floatX: 4,   floatY: -5,  duration: 19 },
  ],
  education: [
    { content: 'Σ', left: '4%',   top: '11%',    fontSize: '6.5rem', fontSizeSm: '3.2rem', opacity: 0.065, rotate: 0,   delay: 0,   floatX: 8,   floatY: -10, duration: 16 },
    { content: '∞', right: '4%',  top: '15%',    fontSize: '6rem',   fontSizeSm: '3rem',   opacity: 0.055, rotate: 5,   delay: 1,   floatX: -10, floatY: 12,  duration: 21 },
    { content: 'π', left: '3%',   bottom: '18%', fontSize: '7rem',   fontSizeSm: '3.5rem', opacity: 0.065, rotate: -8,  delay: 2,   floatX: 12,  floatY: 8,   duration: 14 },
    { content: '∂', right: '4%',  bottom: '16%', fontSize: '7rem',   fontSizeSm: '3.5rem', opacity: 0.055, rotate: 10,  delay: 3,   floatX: -8,  floatY: -12, duration: 18 },
    { content: '∫', left: '44%',  bottom: '7%',  fontSize: '4rem',   fontSizeSm: '2rem',   opacity: 0.05,  rotate: 0,   delay: 4,   floatX: 6,   floatY: -6,  duration: 22 },
    { content: 'Δ', left: '43%',  top: '7%',     fontSize: '3.5rem', fontSizeSm: '1.8rem', opacity: 0.045, rotate: 0,   delay: 1.5, floatX: -5,  floatY: -8,  duration: 18 },
  ],
  contact: [
    { content: '@', left: '4%',   top: '11%',    fontSize: '7rem',   fontSizeSm: '3.5rem', opacity: 0.065, rotate: -8,  delay: 0,   floatX: 10,  floatY: -12, duration: 15 },
    { content: '#', right: '4%',  top: '15%',    fontSize: '6.5rem', fontSizeSm: '3.2rem', opacity: 0.055, rotate: 6,   delay: 1,   floatX: -8,  floatY: 10,  duration: 20 },
    { content: '→', left: '2%',   bottom: '20%', fontSize: '6rem',   fontSizeSm: '3rem',   opacity: 0.055, rotate: 0,   delay: 2,   floatX: 14,  floatY: 5,   duration: 12 },
    { content: '✦', right: '4%',  bottom: '18%', fontSize: '5.5rem', fontSizeSm: '2.8rem', opacity: 0.05,  rotate: 15,  delay: 3,   floatX: -10, floatY: -8,  duration: 18 },
    { content: '⌘', left: '43%',  top: '8%',     fontSize: '3.5rem', fontSizeSm: '1.8rem', opacity: 0.04,  rotate: 0,   delay: 2.5, floatX: 5,   floatY: -6,  duration: 22 },
  ],
}

interface Props { sectionKey: string }

export default function SectionDecor({ sectionKey }: Props) {
  const items = DECOR[sectionKey]
  if (!items) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {items.map((item, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, item.floatX, 0], y: [0, item.floatY, 0] }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: item.left,
            right: item.right,
            top: item.top,
            bottom: item.bottom,
            // Responsive font size via CSS clamp
            fontSize: `clamp(${item.fontSizeSm}, 4vw + 0.5rem, ${item.fontSize})`,
            opacity: item.opacity,
            rotate: `${item.rotate}deg`,
            lineHeight: 1,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontWeight: 700,
            color: '#4A5AF0',
          }}
          className="dark:brightness-150"
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  )
}
