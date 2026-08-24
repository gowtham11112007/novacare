import re

with open('src/pages/Auth.jsx', 'r') as f:
    content = f.read()

# Add the floating elements just after the background image div or before the form panel
floating_elements = """
      {/* Girly Floating Elements */}
      <div className="floating-butterfly" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '40%', left: '80%', animationDelay: '2s' }}>🌸</div>
      <div className="floating-butterfly" style={{ top: '70%', left: '30%', animationDelay: '5s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '80%', left: '70%', animationDelay: '7s' }}>🌺</div>
      <div className="floating-butterfly" style={{ top: '30%', left: '60%', animationDelay: '4s' }}>🦋</div>
"""

content = content.replace('{/* Right Panel - Auth Form */}', floating_elements + '\n      {/* Right Panel - Auth Form */}')

with open('src/pages/Auth.jsx', 'w') as f:
    f.write(content)
