type Success<Type extends string, Value> = {
  type: Type,
  value: Value,
};

export type Result =
  | Success<'string', string>
  | Success<'number', number>
  | Success<'boolean', boolean>
  | {
    type: 'bad_expression',
    expression: string,
  }
  | {
    type: 'unexpected_result',
    resultType: string,
  };

export type ExpressionService = {
  evaluateExpression(expression: string): Promise<Result>,
};
