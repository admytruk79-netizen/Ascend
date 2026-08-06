import { ImageSourcePropType } from 'react-native';

// Real card art, keyed by card id. Metro needs static `require()` calls, so
// this can't be generated from a loop — add a line here as each new asset
// lands in ../../assets/cards/. Cards without an entry fall back to the
// placeholder tile in DeckScreen/HomeScreen.
//
// All 42 cards came from images the user attached in chat (Canva export is
// blocked by this environment's network policy — see mobile/README.md).
// Order follows send order, which the user confirmed matches card number
// (checkpoints at 13, 21, 22, 27, 29, 42 all lined up).
export const CARD_IMAGES: Record<string, ImageSourcePropType> = {
  '1': require('../../assets/cards/1.webp'),
  '2': require('../../assets/cards/2.webp'),
  '3': require('../../assets/cards/3.webp'),
  '4': require('../../assets/cards/4.webp'),
  '5': require('../../assets/cards/5.webp'),
  '6': require('../../assets/cards/6.webp'),
  '7': require('../../assets/cards/7.webp'),
  '8': require('../../assets/cards/8.webp'),
  '9': require('../../assets/cards/9.webp'),
  '10': require('../../assets/cards/10.webp'),
  '11': require('../../assets/cards/11.webp'),
  '12': require('../../assets/cards/12.webp'),
  '13': require('../../assets/cards/13.webp'),
  '14': require('../../assets/cards/14.webp'),
  '15': require('../../assets/cards/15.webp'),
  '16': require('../../assets/cards/16.webp'),
  '17': require('../../assets/cards/17.webp'),
  '18': require('../../assets/cards/18.webp'),
  '19': require('../../assets/cards/19.webp'),
  '20': require('../../assets/cards/20.webp'),
  '21': require('../../assets/cards/21.webp'),
  '22': require('../../assets/cards/22.webp'),
  '23': require('../../assets/cards/23.webp'),
  '24': require('../../assets/cards/24.webp'),
  '25': require('../../assets/cards/25.webp'),
  '26': require('../../assets/cards/26.webp'),
  '27': require('../../assets/cards/27.webp'),
  '28': require('../../assets/cards/28.webp'),
  '29': require('../../assets/cards/29.webp'),
  '30': require('../../assets/cards/30.webp'),
  '31': require('../../assets/cards/31.webp'),
  '32': require('../../assets/cards/32.webp'),
  '33': require('../../assets/cards/33.webp'),
  '34': require('../../assets/cards/34.webp'),
  '35': require('../../assets/cards/35.webp'),
  '36': require('../../assets/cards/36.webp'),
  '37': require('../../assets/cards/37.webp'),
  '38': require('../../assets/cards/38.webp'),
  '39': require('../../assets/cards/39.webp'),
  '40': require('../../assets/cards/40.webp'),
  '41': require('../../assets/cards/41.webp'),
  '42': require('../../assets/cards/42.webp'),
};
