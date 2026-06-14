document.addEventListener('DOMContentLoaded', async () => {
  const btnInstaller = document.getElementById('btn-installer');
  const btnPortable = document.getElementById('btn-portable');
  const actionButtons = document.querySelector('.action-buttons');
  const loadingState = document.getElementById('loading-state');

  try {
    // Fetch the latest release from GitHub API
    const response = await fetch('https://api.github.com/repos/gezada/tbh-easymarket/releases/latest');
    
    if (!response.ok) {
      throw new Error('Failed to fetch release');
    }

    const release = await response.json();
    const assets = release.assets || [];

    // Find the installer and portable assets
    let installerUrl = null;
    let portableUrl = null;

    for (const asset of assets) {
      const name = asset.name;
      // The installer usually contains "Setup"
      if (name.includes('Setup') && name.endsWith('.exe')) {
        installerUrl = asset.browser_download_url;
      }
      // The portable is the other .exe that does not contain Setup or blockmap
      else if (!name.includes('Setup') && !name.includes('blockmap') && name.endsWith('.exe')) {
        portableUrl = asset.browser_download_url;
      }
    }

    // If we couldn't find them directly, fallback to the generic release page
    if (!installerUrl) installerUrl = release.html_url;
    if (!portableUrl) portableUrl = release.html_url;

    // Apply the URLs to the buttons
    btnInstaller.href = installerUrl;
    btnPortable.href = portableUrl;

    // Show the buttons and hide the loading state
    loadingState.style.display = 'none';
    actionButtons.style.opacity = '1';

  } catch (error) {
    console.error('Error fetching release:', error);
    // Fallback if API fails (rate limits, etc)
    const fallbackUrl = 'https://github.com/gezada/tbh-easymarket/releases/latest';
    btnInstaller.href = fallbackUrl;
    btnPortable.href = fallbackUrl;
    
    loadingState.style.display = 'none';
    actionButtons.style.opacity = '1';
  }
});
