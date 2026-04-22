import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Files to update with their new content inline
const FILE_UPDATES = {
  'src/index.css': null,        // will be read from GitHub then patched
  'src/components/layout/AppShell.jsx': null,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const owner = 'yungin019';
    const repo = 'Tredia-base44';
    const branch = 'main';
    const commitMessage = 'TREDIO - App Store ready final';

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };

    // 1. Get branch tip SHA
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    if (!branchRes.ok) {
      const err = await branchRes.text();
      return Response.json({ error: `Branch fetch failed: ${err}` }, { status: 500 });
    }
    const branchData = await branchRes.json();
    const latestCommitSha = branchData.object.sha;

    // 2. Get commit tree SHA
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Fetch current file contents from GitHub and apply patches
    const patches = [
      {
        path: 'src/index.css',
        // Add user-select: none to buttons/nav (App Store fix)
        patchFn: (content) => {
          if (content.includes('-webkit-user-select: none;') && content.includes('nav, label')) return content;
          return content.replace(
            'button, a, [role="button"] {\n  -webkit-tap-highlight-color: transparent;\n  touch-action: manipulation;\n  min-height: 44px;\n  min-width: 44px;\n  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}',
            'button, a, [role="button"], nav, label, .tab-bar {\n  -webkit-tap-highlight-color: transparent;\n  touch-action: manipulation;\n  -webkit-user-select: none;\n  user-select: none;\n}\n\nbutton, a, [role="button"] {\n  min-height: 44px;\n  min-width: 44px;\n  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}'
          );
        }
      },
      {
        path: 'src/components/layout/AppShell.jsx',
        // Add safe area inset to header
        patchFn: (content) => {
          if (content.includes('safe-area-inset-top')) return content;
          return content.replace(
            '<header className="glass-dark border-b border-white/[0.06] px-4 lg:px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-50">',
            '<header className="glass-dark border-b border-white/[0.06] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50"\n        style={{ paddingTop: \'env(safe-area-inset-top)\', minHeight: \'calc(56px + env(safe-area-inset-top))\' }}>'
          );
        }
      }
    ];

    const treeItems = [];

    for (const patch of patches) {
      // Fetch current file from GitHub
      const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${patch.path}?ref=${branch}`, { headers });
      if (!fileRes.ok) {
        console.log(`Skipping ${patch.path} - not found`);
        continue;
      }
      const fileData = await fileRes.json();
      const currentContent = atob(fileData.content.replace(/\n/g, ''));
      const newContent = patch.patchFn(currentContent);

      // Create blob
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: newContent, encoding: 'utf-8' }),
      });
      const blob = await blobRes.json();
      treeItems.push({ path: patch.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    if (treeItems.length === 0) {
      return Response.json({ success: true, message: 'No changes needed — files already patched', skipped: true });
    }

    // 4. Create new tree
    const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    const newTree = await newTreeRes.json();

    // 5. Create commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [latestCommitSha] }),
    });
    const newCommit = await newCommitRes.json();

    // 6. Update branch ref
    await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    return Response.json({
      success: true,
      commit: newCommit.sha,
      message: commitMessage,
      files: treeItems.map(t => t.path),
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});