import Skull from './Skull.jsx'

export default function CautionTape({
  text = 'TOP SECRET',
  count = 10,
  ariaLabel = 'Cinta de lanzamiento Top Secret',
}) {
  const tape = Array.from({ length: count }, (_, index) => (
    <span className="tape-item" key={index}>
      <Skull />
      <span>{text}</span>
    </span>
  ))

  return (
    <div className="top-secret-tape-wrap" aria-label={ariaLabel}>
      <div className="marquee-track-fast">
        <div className="tape-track">{tape}</div>
        <div className="tape-track" aria-hidden="true">
          {tape}
        </div>
      </div>
    </div>
  )
}
