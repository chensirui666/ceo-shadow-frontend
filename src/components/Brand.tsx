import fridayMark from '../assets/friday-mark.png'

type BrandProps = {
  className: string
}

export default function Brand({ className }: BrandProps) {
  return (
    <span className={className}>
      <img alt="" className="brand-mark" src={fridayMark} />
      <span>Friday</span>
    </span>
  )
}
