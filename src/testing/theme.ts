import Color from 'colorjs.io';
import { type Theme } from 'ui/theme';
import {
  FontStyle,
  FontWeight,
  Typography,
} from 'ui/typography';

export const testTheme: Theme = {
  foreground: new Color('black'),
  background: new Color('white'),
  typography: {
    [Typography.Body]: {
      fontFamily: 'sans-serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Regular,
    },
    [Typography.Subheading]: {
      fontFamily: 'serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Bold,
    },
    [Typography.Heading]: {
      fontFamily: 'serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Bold,
    },
  },
};
