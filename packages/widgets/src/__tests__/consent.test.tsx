import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConsentBanner } from '../ConsentBanner.js';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

it('accepts consent and notifies the bridge when iframe storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Sandbox', 'SecurityError');
  });
  const listener = vi.fn();
  window.addEventListener('conversokit:consent', listener);
  try {
    render(
      <ConsentBanner scopes={['personalData']}>
        <p>Ready to submit</p>
      </ConsentBanner>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Accept and continue' }));
    expect(screen.getByText('Ready to submit')).toBeTruthy();
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail.scopes).toEqual([
      'personalData'
    ]);
  } finally {
    window.removeEventListener('conversokit:consent', listener);
  }
});
it('requests acceptance when stored consent does not cover the requested scopes', () => {
  sessionStorage.setItem(
    'conversokit:consent',
    JSON.stringify({ scopes: ['analytics'], acceptedAt: '2026-11-12' })
  );
  render(
    <ConsentBanner scopes={['personalData']}>
      <p>Private form</p>
    </ConsentBanner>
  );
  expect(screen.queryByText('Private form')).toBeNull();
  expect(screen.getByRole('button', { name: 'Accept and continue' })).toBeTruthy();
});
