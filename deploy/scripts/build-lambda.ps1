$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
$packageDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
$archivePath = Join-Path $scriptDir 'lambda.zip'

try {
    New-Item -ItemType Directory -Path $packageDir | Out-Null

    python -m pip install `
        --platform manylinux2014_x86_64 `
        --implementation cp `
        --python-version 3.12 `
        --only-binary=:all: `
        --no-compile `
        --target $packageDir `
        --requirement (Join-Path $scriptDir 'requirements.txt')
    if ($LASTEXITCODE -ne 0) {
        throw "pip install failed with exit code $LASTEXITCODE"
    }

    Copy-Item (Join-Path $scriptDir 'scripts.py') $packageDir
    Copy-Item (Join-Path $scriptDir 'schema.sql') $packageDir
    Invoke-WebRequest `
        -Uri 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem' `
        -OutFile (Join-Path $packageDir 'global-bundle.pem')

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if (Test-Path $archivePath) {
        Remove-Item $archivePath
    }

    $archive = [System.IO.Compression.ZipFile]::Open(
        $archivePath,
        [System.IO.Compression.ZipArchiveMode]::Create
    )
    try {
        Get-ChildItem -Path $packageDir -File -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($packageDir.Length).TrimStart('\', '/') -replace '\\', '/'
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $_.FullName,
                $relativePath,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $archive.Dispose()
    }

    Write-Output "Created $archivePath"
}
finally {
    if (Test-Path $packageDir) {
        Remove-Item -Path $packageDir -Recurse -Force
    }
}
