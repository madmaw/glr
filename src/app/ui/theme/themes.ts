import Color from 'colorjs.io';
import { type Theme } from 'ui/theme';
import {
  FontStyle,
  FontWeight,
  Typography,
} from 'ui/typography';

export const lightTheme: Theme = {
  foreground: new Color('black'),
  background: new Color('white'),
  disabled: new Color('gray'),
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

export const darkTheme: Theme = {
  ...lightTheme,
  foreground: new Color('white'),
  background: new Color('black'),
};
