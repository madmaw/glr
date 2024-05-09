import {
  type Meta,
  type StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import {
  ExpressionInput,
  type ExpressionInputProps,
} from 'app/pages/example/expression/input';
import { LocaleConsumer } from 'app/pages/example/testing/storybook';
import { createPartialComponent } from 'base/react/partial';

const LocalizedExpressionInput = createPartialComponent(LocaleConsumer<ExpressionInputProps>, {
  StorybookComponent: ExpressionInput,
});

const meta: Meta<typeof LocalizedExpressionInput> = {
  component: LocalizedExpressionInput,
};
export default meta;

type Story = StoryObj<typeof LocalizedExpressionInput>;

export const Static: Story = {
  args: {
    disabled: false,
    expression: '',
    onChangeExpression: fn(),
    onEvaluateExpression: fn(),
  },
};
