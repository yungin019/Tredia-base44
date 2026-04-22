import React, { createContext, useContext, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TAB_ROOTS = ['/Home', '/Markets', '/AIInsights', '/Portfolio', '/Settings'];

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  // Each tab maintains its own stack of paths
  const tabStacks = useRef({
    '/Home':       ['/Home'],
    '/Markets':    ['/Markets'],
    '/AIInsights': ['/AIInsights'],
    '/Portfolio':  ['/Portfolio'],
    '/Settings':   ['/Settings'],
  });

  const activeTab = useRef('/Home');
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve which tab root a given path belongs to
  const getTabForPath = useCallback((path) => {
    // Exact match first, then prefix match (for sub-pages like /Asset/:symbol)
    return TAB_ROOTS.find(root => path === root || path.startsWith(root + '/')) || '/Home';
  }, []);

  // Push a new path onto the current tab's stack
  const push = useCallback((path) => {
    const tab = getTabForPath(path);
    activeTab.current = tab;
    const stack = tabStacks.current[tab];
    if (stack[stack.length - 1] !== path) {
      tabStacks.current[tab] = [...stack, path];
    }
    navigate(path);
  }, [navigate, getTabForPath]);

  // Sync external navigations (via useNavigate()) into the tab stacks
  // Called by AppShell on every location change
  const syncExternalNavigation = useCallback((path) => {
    const tab = getTabForPath(path);
    activeTab.current = tab;
    const stack = tabStacks.current[tab];
    if (stack[stack.length - 1] !== path) {
      tabStacks.current[tab] = [...stack, path];
    }
  }, [getTabForPath]);

  // Go back within the current tab stack
  const goBack = useCallback(() => {
    const tab = activeTab.current;
    const stack = tabStacks.current[tab];
    if (stack.length > 1) {
      const newStack = stack.slice(0, -1);
      tabStacks.current[tab] = newStack;
      navigate(newStack[newStack.length - 1]);
    }
  }, [navigate]);

  // Switch to a tab root — restores that tab's last position
  const switchTab = useCallback((tabRoot) => {
    activeTab.current = tabRoot;
    const stack = tabStacks.current[tabRoot];
    navigate(stack[stack.length - 1]);
  }, [navigate]);

  // Can go back within current tab?
  const canGoBack = useCallback(() => {
    const tab = getTabForPath(location.pathname);
    return tabStacks.current[tab]?.length > 1;
  }, [location.pathname, getTabForPath]);

  // Sync active tab when location changes externally
  const currentTab = getTabForPath(location.pathname);
  activeTab.current = currentTab;

  return (
    <NavigationContext.Provider value={{ push, goBack, switchTab, canGoBack, getTabForPath, activeTab, syncExternalNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}