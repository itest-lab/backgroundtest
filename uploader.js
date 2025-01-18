document.getElementById('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const inputUrl = document.getElementById('imageUrl').value;
  const statusElement = document.getElementById('status');
  statusElement.textContent = '画像を処理中...';

  try {
    // GoogleドライブURLを直接ダウンロードリンクに変換
    const fileIdMatch = inputUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!fileIdMatch) {
      throw new Error('GoogleドライブのURLが無効です。正しい形式で入力してください。');
    }
    const fileId = fileIdMatch[1];
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // プロキシサーバー経由で画像を取得
    const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(directDownloadUrl)}`;
    console.log('Proxy URL:', proxyUrl);

    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('プロキシ経由で画像の取得に失敗しました');
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // GitHubにアップロード
    const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
    console.log('GitHub API URL:', githubUrl);

    const uploadResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add image ${fileName}`,
        content: base64Image,
        branch: BRANCH,
      }),
    });

    if (!uploadResponse.ok) {
      const errorDetails = await uploadResponse.json();
      console.error('GitHub API error details:', errorDetails);
      throw new Error(`画像のアップロードに失敗しました: ${errorDetails.message}`);
    }

    const uploadResult = await uploadResponse.json();
    const uploadedUrl = uploadResult.content.download_url;

    // 背景画像として設定
    document.body.style.backgroundImage = `url('${uploadedUrl}')`;
    statusElement.textContent = '画像をアップロードして背景に設定しました!';
  } catch (error) {
    console.error('Error occurred:', error);
    statusElement.textContent = `エラー: ${error.message}`;
  }
});
