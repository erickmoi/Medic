// Vara de Esculapio: símbolo tradicional de la medicina (dibujo propio, sin derechos de terceros)
export default function SimboloMedico({ size = 28, color = 'currentColor', titulo = 'Símbolo médico' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label={titulo}>
      <rect x="22.4" y="7" width="3.2" height="37" rx="1.6" fill={color} />
      <circle cx="24" cy="6.5" r="2.4" fill={color} />
      <path d="M28.5 12.2C34.6 14 33.6 18 24 19.4 14.6 20.8 14.4 25 24 26.3c9.6 1.4 9.4 5.6 0 7-7.6 1.1-8 4.4-2.2 5.8"
        stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="29.3" cy="11.2" rx="3.2" ry="2.3" transform="rotate(-18 29.3 11.2)" fill={color} />
    </svg>
  )
}
