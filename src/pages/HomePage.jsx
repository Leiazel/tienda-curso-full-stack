import CautionTape from '../components/CautionTape.jsx'
import FeaturedSection from '../components/FeaturedSection.jsx'
import HeroSection from '../components/HeroSection.jsx'
import LookbookSection from '../components/LookbookSection.jsx'

export default function HomePage({ products = [], onAddToCart, onQuickView }) {
  return (
    <main>
      <HeroSection />
      <div className="home-tape">
        <CautionTape />
      </div>
      <LookbookSection />
      <FeaturedSection
        products={products.filter((product) => !product.extra)}
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
      />
    </main>
  )
}
