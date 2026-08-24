import re

floating_elements = """
      {/* Floating Theme Elements */}
      <div className="floating-butterfly" style={{ top: '15%', left: '5%', animationDelay: '1s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '65%', left: '90%', animationDelay: '3s' }}>🌸</div>
      <div className="floating-butterfly" style={{ top: '80%', left: '10%', animationDelay: '6s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '25%', left: '85%', animationDelay: '8s' }}>🌺</div>
"""

for page in ['src/pages/DoctorDashboard.jsx', 'src/pages/AdminDashboard.jsx']:
    with open(page, 'r') as f:
        content = f.read()
    content = content.replace('{/* Header */}', floating_elements + '\n      {/* Header */}')
    with open(page, 'w') as f:
        f.write(content)
