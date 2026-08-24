import re

with open('src/index.css', 'r') as f:
    css = f.read()

# Replace the variables
css = re.sub(
    r'--color-background: .*?;',
    '--color-background: #fff0f5;',
    css
)
css = re.sub(
    r'--color-foreground: .*?;',
    '--color-foreground: #5a315d;',
    css
)
css = re.sub(
    r'--color-primary: .*?;',
    '--color-primary: #ff69b4;',
    css
)
css = re.sub(
    r'--color-primary-hover: .*?;',
    '--color-primary-hover: #ff1493;',
    css
)
css = re.sub(
    r'--color-primary-light: .*?;',
    '--color-primary-light: #ffe4e1;',
    css
)
css = re.sub(
    r'--color-secondary: .*?;',
    '--color-secondary: #dda0dd;',
    css
)
css = re.sub(
    r'--color-secondary-light: .*?;',
    '--color-secondary-light: #f8f0fc;',
    css
)
css = re.sub(
    r'--color-blush: .*?;',
    '--color-blush: #ffb6c1;',
    css
)

# Replace background image
new_bg = """    background-image: 
      radial-gradient(at 10% 20%, rgba(255, 182, 193, 0.4) 0px, transparent 50%),
      radial-gradient(at 90% 10%, rgba(221, 160, 221, 0.4) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(255, 209, 220, 0.5) 0px, transparent 50%),
      url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c-5 0-10-5-10-10s5-10 10-10 10 5 10 10-5 10-10 10zm0 0c0-5 5-10 10-10s10 5 10 10-5 10-10 10-10-5-10-10zm0 0c5 0 10 5 10 10s-5 10-10 10-10-5-10-10 5-10 10-10zm0 0c0 5-5 10-10 10s-10-5-10-10 5-10 10-10 10 5 10 10z' fill='%23ff69b4' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");"""

css = re.sub(
    r'background-image:.*?background-attachment: fixed;',
    new_bg + '\n    background-attachment: fixed;',
    css,
    flags=re.DOTALL
)

with open('src/index.css', 'w') as f:
    f.write(css)

