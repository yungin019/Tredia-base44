import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * pushToGitHub
 * 
 * Accepts a payload of { files: { "path/in/repo": "file content" } }
 * and commits them all in one commit to yungin019/Tredia-base44 on main.
 * 
 * Called from Admin page with the actual file contents.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const files = body.files; // { "src/pages/Home.jsx": "..content.." }
    const commitMessage = body.message || `TREDIO update — ${new Date().toISOString().slice(0, 10)}`;

    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      return Response.json({ error: 'No files provided in payload' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const owner = 'yungin019';
    const repo = 'Tredia-base44';
    const branch = 'main';

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

    // 2. Get base tree SHA
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Create blobs for all files in parallel
    const treeItems = await Promise.all(
      Object.entries(files).map(async ([path, content]) => {
        const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content, encoding: 'utf-8' }),
        });
        if (!blobRes.ok) {
          const err = await blobRes.text();
          throw new Error(`Blob creation failed for ${path}: ${err}`);
        }
        const blob = await blobRes.json();
        console.log(`[Push] Blob created for ${path}: ${blob.sha}`);
        return { path, mode: '100644', type: 'blob', sha: blob.sha };
      })
    );

    // 4. Create new tree
    const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    if (!newTreeRes.ok) {
      const err = await newTreeRes.text();
      return Response.json({ error: `Tree creation failed: ${err}` }, { status: 500 });
    }
    const newTree = await newTreeRes.json();

    // 5. Create commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [latestCommitSha] }),
    });
    if (!newCommitRes.ok) {
      const err = await newCommitRes.text();
      return Response.json({ error: `Commit creation failed: ${err}` }, { status: 500 });
    }
    const newCommit = await newCommitRes.json();

    // 6. Update branch ref
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });
    if (!updateRes.ok) {
      const err = await updateRes.text();
      return Response.json({ error: `Branch update failed: ${err}` }, { status: 500 });
    }

    console.log(`[Push] ✅ Committed ${treeItems.length} files: ${newCommit.sha}`);

    return Response.json({
      success: true,
      commit: newCommit.sha,
      message: commitMessage,
      files: treeItems.map(t => t.path),
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    });

  } catch (error) {
    console.error('[Push] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});