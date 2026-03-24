import React, { useEffect, useState } from 'react';
import { validateSignalCognition } from '@/lib/signalStrength';

/**
 * Higher-order component that validates signals pass cognitive test
 * TEST 1: Can direction be understood instantly?
 * TEST 2: Can action be understood instantly?
 * TEST 3: Can strength be perceived visually?
 * 
 * If all pass: render normally
 * If any fail: automatically simplify (reduce text, increase contrast)
 */
export function withSignalValidation(Component) {
  return function ValidatedComponent(props) {
    const [simplified, setSimplified] = useState(null);

    useEffect(() => {
      if (props.signal || props.reaction) {
        const result = validateSignalCognition(props.signal || props.reaction);
        if (!result.pass) {
          setSimplified(true);
        }
      }
    }, [props.signal, props.reaction]);

    // Apply simplification class if needed
    const simplifyClass = simplified ? 'signal-simplified' : '';

    return <div className={simplifyClass}><Component {...props} /></div>;
  };
}

/**
 * Visual validation test component
 * Renders signal with validation feedback (dev-only)
 */
export function SignalValidationTest({ signal }) {
  const result = validateSignalCognition(signal);

  return (
    <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 text-xs space-y-2 font-mono">
      <div className="text-slate-300">Cognitive Validation Results:</div>
      <div className={result.tests.directionClear ? 'text-green-400' : 'text-red-400'}>
        ✓ Direction Clear: {result.tests.directionClear ? 'PASS' : 'FAIL'}
      </div>
      <div className={result.tests.actionClear ? 'text-green-400' : 'text-red-400'}>
        ✓ Action Clear: {result.tests.actionClear ? 'PASS' : 'FAIL'}
      </div>
      <div className={result.tests.strengthPerceivable ? 'text-green-400' : 'text-red-400'}>
        ✓ Strength Perceivable: {result.tests.strengthPerceivable ? 'PASS' : 'FAIL'}
      </div>
      {result.recommendation && (
        <div className="text-yellow-400 mt-2">⚠ {result.recommendation}</div>
      )}
    </div>
  );
}