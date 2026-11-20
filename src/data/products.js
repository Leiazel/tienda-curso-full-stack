import heroSneakers from '../../images/dich/hero-sneakers.png'
import concreteRunner from '../../images/dich/shoe-concrete.jpg'
import mostro from '../../images/dich/shoe-mostro.jpg'
import xPerks from '../../images/dich/shoe-xperks.jpg'
import sunlightLow from '../../images/dich/sneakers-topdown.jpg'
import limitedModel from '../../images/dich/model-limited.jpg'
import skateOllie from '../../images/dich/skate-ollie.jpg'
import topdownSneakers from '../../images/dich/sneakers-topdown.jpg'

const sizes = ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11']

export const products = [
  {
    id: 'mostro-dark-vibe',
    badge: 'DISPONIBLE 25/250',
    title: 'A$AP ROCKY MOSTRO',
    subtitle: 'DARK VIBE',
    price: 245,
    image: mostro,
    sizes,
    defaultSize: 'US 9.5',
    description:
      'Silueta retro-futurista robusta confeccionada en gamuza color crema natural, malla negra transpirable y entresuela esculpida en rosa coral con ensamblado local en pequeñas partidas.',
    extra: false,
  },
  {
    id: 'x-perks-mix',
    badge: 'DISPONIBLE 34/250',
    title: 'X PERKS',
    subtitle: 'MIX',
    price: 285,
    image: xPerks,
    sizes,
    defaultSize: 'US 9.5',
    description:
      'Edición skate de corte bajo en gamuza rosa coral con branding lateral L&D DOPE estarcido a mano, suela vulcanizada tipo waffle negra y parche acolchado en la lengüeta.',
    extra: false,
  },
  {
    id: 'ld-concrete-teal',
    badge: 'DISPONIBLE 67/250',
    title: 'L&D® CONCRETE RUNNER',
    subtitle: 'CYBER TEAL',
    price: 260,
    image: concreteRunner,
    sizes,
    defaultSize: 'US 10',
    description:
      'Zapatilla técnica de inspiración trail que combina nubuck crema, superposiciones espresso, detalles en cinta naranja y suela estriada en turquesa.',
    extra: false,
  },
  {
    id: 'ld-archive-04',
    badge: 'DISPONIBLE 14/250',
    title: 'L&D® SUNLIGHT LOW',
    subtitle: 'RAW CORDUROY',
    price: 220,
    image: sunlightLow,
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 9',
    description:
      'Calzado clásico de corte bajo acabado con lona orgánica blanco tiza, ribetes carmesí y amarillo solar, y suela de caucho natural reciclado.',
    extra: true,
  },
]

export const lookbookSlides = [
  {
    image: limitedModel,
    line1: 'SOLO 1500 PIEZAS',
    line2: 'PARA ESTE DROP',
  },
  {
    image: skateOllie,
    line1: 'HECHO PARA EL ASFALTO',
    line2: 'CERO COMPROMISOS',
  },
  {
    image: topdownSneakers,
    line1: 'SERIE NUMERADA',
    line2: 'PRODUCCIÓN LOCAL',
  },
]

export const heroImage = heroSneakers
