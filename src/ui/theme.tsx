import { checkExists } from 'base/preconditions';
import type Color from 'colorjs.io';
import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';
import {
  type FontStyle,
  type FontWeight,
  type Typography,
} from './typography';

// TODO using a complex Color object for the theme is inefficient, encourages modification of those
// themed colors and Storybook complains that it can't serialize the Color objects. Colors should
// just be (hex) strings.

export type Theme = {
  foreground: Color,
  background: Color,
  typography: Record<Typography, {
    fontFamily: string,
    fontWeight: FontWeight,
    fontStyle: FontStyle,
  }>,
};

const themeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({
  theme,
  children,
}: PropsWithChildren<{ theme: Theme }>) {
  const { Provider } = themeContext;
  return (
    <Provider value={theme}>
      {children}
    </Provider>
  );
}

export function useTheme() {
  return checkExists(useContext(themeContext), 'no theme context set');
}
