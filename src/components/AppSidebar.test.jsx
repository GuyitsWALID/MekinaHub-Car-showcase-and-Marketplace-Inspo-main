// AppSidebar.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppSidebar from './AppSidebar';
import { BrowserRouter } from 'react-router-dom';

// Mock the AuthContext to provide a fake user and signOut
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@mekina.com', user_metadata: { full_name: 'Test User', avatar_url: '' } },
    signOut: jest.fn(),
  }),
}));

// Mock the mobile hook
jest.mock('../hooks/use-mobile', () => ({
  useIsMobile: () => false,  // treat as desktop by default
}));

// Mock supabase client so fetchUserProfile effect doesn't actually hit a DB
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { full_name: 'Test User', email: 'test@mekina.com', avatar_url: '', role: 'buyer', type: 'buyer' }, error: null }) }) }),
      insert: () => ({ error: null }),
    }),
  },
}));

describe('AppSidebar Component', () => {
  const renderSidebar = () =>
    render(
      <BrowserRouter>
        <AppSidebar />
      </BrowserRouter>
    );

  test('renders common navigation items', async () => {
    renderSidebar();

    // Common items should be present
    expect(await screen.findByText(/Show Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/Compare/i)).toBeInTheDocument();
    expect(screen.getByText(/Messages/i)).toBeInTheDocument();
  });

  test('renders user info footer when expanded', async () => {
    renderSidebar();

    // The user's full name should appear
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    // The user's email should appear
    expect(screen.getByText('test@mekina.com')).toBeInTheDocument();
    // Role badge
    expect(screen.getByText('buyer')).toBeInTheDocument();
  });

  test('collapse and expand toggle works', async () => {
    renderSidebar();

    // Initially expanded: label is visible
    expect(screen.getByText(/Show Room/i)).toBeInTheDocument();

    // Click collapse button (aria-label="Collapse menu")
    const collapseButton = screen.getByLabelText(/Collapse menu/i);
    fireEvent.click(collapseButton);

    // After collapse: labels should be hidden; icons still rendered (test by querying one icon button)
    expect(screen.queryByText(/Show Room/i)).not.toBeInTheDocument();
    // The expand button now has aria-label="Expand menu"
    expect(screen.getByLabelText(/Expand menu/i)).toBeInTheDocument();
  });

  test('mobile hamburger appears when isMobile is true', async () => {
    // Override mobile hook to true for this test
    jest.doMock('../hooks/use-mobile', () => ({ useIsMobile: () => true }));
    // Rerender with mobile = true
    const { rerender } = renderSidebar();
    rerender(
      <BrowserRouter>
        <AppSidebar />
      </BrowserRouter>
    );

    // The hamburger menu button (aria-label="Open menu") should appear
    expect(screen.getByLabelText(/Open menu/i)).toBeInTheDocument();
  });
});
