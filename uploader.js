// GitHub Personal Access Token とリポジトリ情報
const GITHUB_TOKEN = 'your_github_personal_access_token'; // ← トークンをここに設定
const REPO_OWNER = 'your_username';                      // ← ユーザー名
const REPO_NAME = 'your_repository';                     // ← リポジトリ名
const BRANCH = 'main';                                   // ← ブランチ名

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const imageUrl = document.getElementById('imageUrl').value;
  const statusElement = document.getElementById('status');
  statusElement.textContent = '画像を処理中...';

  try {
    // 1. 画像を取得
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('画像の取得に失敗しました');
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // 2. GitHub APIでアップロード
    const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;
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

    if (!uploadResponse.ok) throw new Error('画像のアップロードに失敗しました');
    const uploadResult = await uploadResponse.json();
    const uploadedUrl = uploadResult.content.download_url;

    // 3. 背景画像として設定
    document.body.style.backgroundImage = `url('${uploadedUrl}')`;
    statusElement.textContent = '画像をアップロードして背景に設定しました!';
  } catch (error) {
    console.error(error);
    statusElement.textContent = `エラー: ${error.message}`;
  }
});
