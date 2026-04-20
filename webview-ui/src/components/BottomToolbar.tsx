import { useEffect, useRef, useState } from 'react';

import type { ProviderInfo, WorkspaceFolder } from '../hooks/useExtensionMessages.js';
import { vscode } from '../vscodeApi.js';
import { Button } from './ui/Button.js';
import { Dropdown, DropdownItem } from './ui/Dropdown.js';

interface AgentButtonProps {
  provider: ProviderInfo;
  workspaceFolders: WorkspaceFolder[];
}

function AgentButton({ provider, workspaceFolders }: AgentButtonProps) {
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [isBypassMenuOpen, setIsBypassMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingBypassRef = useRef(false);

  useEffect(() => {
    if (!isFolderPickerOpen && !isBypassMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFolderPickerOpen(false);
        setIsBypassMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isFolderPickerOpen, isBypassMenuOpen]);

  const hasMultipleFolders = workspaceFolders.length > 1;

  const handleClick = () => {
    setIsBypassMenuOpen(false);
    pendingBypassRef.current = false;
    if (hasMultipleFolders) {
      setIsFolderPickerOpen((v) => !v);
    } else {
      vscode.postMessage({ type: 'openAgent', providerId: provider.id });
    }
  };

  const handleHover = () => {
    if (!isFolderPickerOpen) setIsBypassMenuOpen(true);
  };

  const handleLeave = () => {
    if (!isFolderPickerOpen) setIsBypassMenuOpen(false);
  };

  const handleFolderSelect = (folder: WorkspaceFolder) => {
    setIsFolderPickerOpen(false);
    const bypassPermissions = pendingBypassRef.current;
    pendingBypassRef.current = false;
    vscode.postMessage({
      type: 'openAgent',
      providerId: provider.id,
      folderPath: folder.path,
      bypassPermissions,
    });
  };

  const handleBypassSelect = (bypassPermissions: boolean) => {
    setIsBypassMenuOpen(false);
    if (hasMultipleFolders) {
      pendingBypassRef.current = bypassPermissions;
      setIsFolderPickerOpen(true);
    } else {
      vscode.postMessage({ type: 'openAgent', providerId: provider.id, bypassPermissions });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <Button
        variant="accent"
        onClick={handleClick}
        className={
          isFolderPickerOpen || isBypassMenuOpen
            ? 'bg-accent-bright'
            : 'bg-accent hover:bg-accent-bright'
        }
      >
        + {provider.displayName}
      </Button>
      <Dropdown isOpen={isBypassMenuOpen}>
        <DropdownItem onClick={() => handleBypassSelect(true)}>
          Skip permissions mode <span className="text-2xs text-warning">⚠</span>
        </DropdownItem>
      </Dropdown>
      <Dropdown isOpen={isFolderPickerOpen} className="min-w-128">
        {workspaceFolders.map((folder) => (
          <DropdownItem
            key={folder.path}
            onClick={() => handleFolderSelect(folder)}
            className="text-base"
          >
            {folder.name}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

interface BottomToolbarProps {
  isEditMode: boolean;
  onOpenAgent: (providerId: string) => void;
  onToggleEditMode: () => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  workspaceFolders: WorkspaceFolder[];
  availableProviders: ProviderInfo[];
}

export function BottomToolbar({
  isEditMode,
  onToggleEditMode,
  isSettingsOpen,
  onToggleSettings,
  workspaceFolders,
  availableProviders,
}: Omit<BottomToolbarProps, 'onOpenAgent'> & Pick<BottomToolbarProps, 'onOpenAgent'>) {
  const providers =
    availableProviders.length > 0
      ? availableProviders
      : [{ id: 'claude', displayName: 'Claude Code' }];

  return (
    <div className="absolute bottom-10 left-10 z-20 flex items-center gap-4 pixel-panel p-4">
      {providers.map((provider) => (
        <AgentButton key={provider.id} provider={provider} workspaceFolders={workspaceFolders} />
      ))}
      <Button
        variant={isEditMode ? 'active' : 'default'}
        onClick={onToggleEditMode}
        title="Edit office layout"
      >
        Layout
      </Button>
      <Button
        variant={isSettingsOpen ? 'active' : 'default'}
        onClick={onToggleSettings}
        title="Settings"
      >
        Settings
      </Button>
    </div>
  );
}
