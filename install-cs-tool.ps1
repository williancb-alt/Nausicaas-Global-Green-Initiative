# Variables
$version = if ($args.Count -gt 0) { $args[0] } else { "latest" }
$artifact = "cs"
$url = "https://downloads.codescene.io/enterprise/cli/$artifact-windows-amd64-$version.zip"
$zipPath = "$env:TEMP\$artifact.zip"
$unzipPath = "$env:TEMP\$artifact"
$exeName = "cs.exe"
$runtimeDll = "vcruntime140.dll"
$destPath = "$env:USERPROFILE\AppData\Local\Programs\CodeScene"

Write-Host "Installing CodeScene $artifact version $version"

try {
    # Download the zip file
    Invoke-WebRequest -Uri $url -OutFile $zipPath

    # Unzip the file
    Expand-Archive -LiteralPath $zipPath -DestinationPath $unzipPath

    # Ensure the destination folder exists
    if (-not (Test-Path -LiteralPath $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force
    }

    # Move the binary and dll to the destination folder
    Move-Item -LiteralPath "$unzipPath\$exeName" -Destination "$destPath\$exeName" -Force
    Move-Item -LiteralPath "$unzipPath\$runtimeDll" -Destination "$destPath\$runtimeDll" -Force

    # Add to path
    $paths = $env:Path -split ';'
    if ($destPath -notin $paths) {
        $env:Path += ";$destPath"
        [Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
    }

    # Clean up the downloaded zip file and extracted folder
    Remove-Item -LiteralPath $zipPath
    Remove-Item -LiteralPath $unzipPath -Recurse

    # Print a success message
    Write-Host "The CodeScene CLI has been installed! $exeName was moved to $destPath and added to your PATH. You may need to restart your terminal." -ForegroundColor Green
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}
