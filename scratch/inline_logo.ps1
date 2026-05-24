# Read the optimized logo.png and convert to Base64
$logoPath = "public\logo.png"
if (Test-Path $logoPath) {
    $bytes = [IO.File]::ReadAllBytes($logoPath)
    $base64 = [Convert]::ToBase64String($bytes)
    $dataUri = "data:image/png;base64,$base64"

    # Read index.html
    $htmlPath = "index.html"
    $html = [IO.File]::ReadAllText($htmlPath)

    # Replace the img tag src with the Data URI
    # Target: <img src="/logo.png" alt="GharKharch Logo" class="boot-logo" onerror="this.style.display='none'" />
    $oldTag = '<img src="/logo.png" alt="GharKharch Logo" class="boot-logo" onerror="this.style.display=''none''" />'
    $newTag = '<img src="' + $dataUri + '" alt="GharKharch Logo" class="boot-logo" onerror="this.style.display=''none''" />'

    if ($html.Contains($oldTag)) {
        $html = $html.Replace($oldTag, $newTag)
        [IO.File]::WriteAllText($htmlPath, $html)
        Write-Host "Successfully inlined logo.png as Base64 inside index.html!"
    } else {
        Write-Host "Error: Could not find target img tag in index.html."
    }
} else {
    Write-Host "Error: logo.png not found at $logoPath"
}
