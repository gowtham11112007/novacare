import os
import glob

replacements = {
    '#FF6F61': '#FF69B4',
    '#FF8E72': '#DDA0DD',
    '#FFA07A': '#E6E6FA',
    '#FFF9F8': '#FFF0F5'
}

files = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.js', recursive=True) + glob.glob('src/**/*.css', recursive=True)

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        # Also handle lowercase variants if any
        content = content.replace(old.lower(), new)
        
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
            
print("Replaced colors successfully.")
