/**
 * Safe, zero-dependency mathematical expression evaluator for input fields.
 * Evaluates basic arithmetic (+, -, *, /, ^, parentheses, decimals) without eval() or Function().
 */

type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string | number;
}

/**
 * Tokenizes an arithmetic expression string.
 */
function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimals)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let hasDot = false;
      while (i < len && /[0-9.]/.test(input[i])) {
        if (input[i] === '.') {
          if (hasDot) return null; // Invalid multiple decimals
          hasDot = true;
        }
        numStr += input[i];
        i++;
      }
      const val = parseFloat(numStr);
      if (isNaN(val)) return null;
      tokens.push({ type: 'NUMBER', value: val });
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Operators: +, -, *, /, ^
    if (['+', '-', '*', '/', '^'].includes(ch)) {
      // Check for unary minus: at start of tokens, or right after an operator or '('
      const isUnary =
        ch === '-' &&
        (tokens.length === 0 ||
          tokens[tokens.length - 1].type === 'OPERATOR' ||
          tokens[tokens.length - 1].type === 'LPAREN');

      if (isUnary) {
        // Peek next token: if it's a number, attach it directly
        i++;
        while (i < len && /\s/.test(input[i])) i++;
        if (i < len && /[0-9.]/.test(input[i])) {
          let numStr = '-';
          let hasDot = false;
          while (i < len && /[0-9.]/.test(input[i])) {
            if (input[i] === '.') {
              if (hasDot) return null;
              hasDot = true;
            }
            numStr += input[i];
            i++;
          }
          const val = parseFloat(numStr);
          if (isNaN(val)) return null;
          tokens.push({ type: 'NUMBER', value: val });
          continue;
        }
        return null;
      }

      tokens.push({ type: 'OPERATOR', value: ch });
      i++;
      continue;
    }

    // Unsupported character
    return null;
  }

  return tokens;
}

/**
 * Evaluates tokens using simple Shunting-Yard algorithm & Reverse Polish Notation.
 */
function evaluateTokens(tokens: Token[]): number | null {
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'OPERATOR') {
      const op1 = token.value as string;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'OPERATOR') {
          const op2 = top.value as string;
          const p1 = precedence[op1] || 0;
          const p2 = precedence[op2] || 0;
          // Right-associative exponentiation check
          if (op1 === '^' ? p1 < p2 : p1 <= p2) {
            outputQueue.push(operatorStack.pop()!);
            continue;
          }
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundMatching = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop()!;
        if (top.type === 'LPAREN') {
          foundMatching = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundMatching) return null; // Mismatched parentheses
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') return null;
    outputQueue.push(top);
  }

  // Evaluate RPN queue
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (token.type === 'NUMBER') {
      evalStack.push(token.value as number);
    } else if (token.type === 'OPERATOR') {
      if (evalStack.length < 2) return null;
      const b = evalStack.pop()!;
      const a = evalStack.pop()!;
      let res = 0;

      switch (token.value) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          if (b === 0) return null; // Avoid division by zero
          res = a / b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        default:
          return null;
      }
      evalStack.push(res);
    }
  }

  if (evalStack.length !== 1) return null;
  const result = evalStack[0];
  return isFinite(result) && !isNaN(result) ? result : null;
}

export interface MathEvalResult {
  isValid: boolean;
  value: number | null;
  isExpression: boolean;
  formattedPreview: string | null;
}

/**
 * Public function to inspect an input string, check if it contains math,
 * and calculate the evaluated numerical result safely.
 */
export function evaluateMathExpression(input: string): MathEvalResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, value: null, isExpression: false, formattedPreview: null };
  }

  // Check if expression contains arithmetic operators
  const hasOperator = /[+\-*/^()]/.test(trimmed);
  if (!hasOperator) {
    const num = parseFloat(trimmed);
    if (!isNaN(num) && isFinite(num)) {
      return { isValid: true, value: num, isExpression: false, formattedPreview: null };
    }
    return { isValid: false, value: null, isExpression: false, formattedPreview: null };
  }

  // Reject invalid characters
  if (!/^[0-9+\-*/^().\s]+$/.test(trimmed)) {
    return { isValid: false, value: null, isExpression: true, formattedPreview: null };
  }

  const tokens = tokenize(trimmed);
  if (!tokens || tokens.length === 0) {
    return { isValid: false, value: null, isExpression: true, formattedPreview: null };
  }

  const val = evaluateTokens(tokens);
  if (val === null) {
    return { isValid: false, value: null, isExpression: true, formattedPreview: null };
  }

  // Format preview nicely
  const formattedPreview = Number.isInteger(val)
    ? val.toLocaleString('en-US')
    : parseFloat(val.toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 6 });

  return {
    isValid: true,
    value: val,
    isExpression: true,
    formattedPreview,
  };
}
