$dir = (Get-Location).Path
$files = [System.IO.Directory]::GetFiles("$dir\src", "*.tsx", [System.IO.SearchOption]::AllDirectories) + 
         [System.IO.Directory]::GetFiles("$dir\src", "*.ts",  [System.IO.SearchOption]::AllDirectories)

foreach ($filePath in $files) {
    $content = [System.IO.File]::ReadAllText($filePath)

    $newContent = $content

    # Replace SymbolView import with AppIcon import
    $newContent = $newContent -replace [regex]::Escape("import { SymbolView } from 'expo-symbols';"), "import { AppIcon } from '@/components/AppIcon';"

    # Replace JSX usage
    $newContent = $newContent -replace '<SymbolView\b', '<AppIcon'
    $newContent = $newContent -replace '</SymbolView>', '</AppIcon>'

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($filePath, $newContent)
        Write-Host "Updated: $(Split-Path $filePath -Leaf)"
    }
}
Write-Host "Done replacing all SymbolView usages."
