const PromoMessage = ({ message }) => (
  <>
    <span>{message}</span>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFE200" aria-hidden="true">
      <path d="M12 1L14.8 8.2L22.5 7.5L16.8 13L21 20L13.5 16.5L10.5 23L9.5 15.5L2 16L7.8 11L4 4.5L11 8L12 1Z" />
    </svg>
  </>
)

export default function PromoBar({
  message = 'SUSCRIBITE Y OBTENÉ 15% OFF EN TU PRIMERA COMPRA',
  ariaLabel = 'Banner promocional',
}) {
  return (
    <div className="promo-bar" aria-label={ariaLabel}>
      <div className="marquee-track">
        <div className="promo-group">
          {Array.from({ length: 4 }, (_, index) => (
            <PromoMessage key={index} message={message} />
          ))}
        </div>
        <div className="promo-group" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <PromoMessage key={index} message={message} />
          ))}
        </div>
      </div>
    </div>
  )
}
