import re

with open('src/pages/PatientDashboard.jsx', 'r') as f:
    content = f.read()

floating_elements = """
      {/* Floating Theme Elements */}
      <div className="floating-butterfly" style={{ top: '15%', left: '5%', animationDelay: '1s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '65%', left: '90%', animationDelay: '3s' }}>🌸</div>
      <div className="floating-butterfly" style={{ top: '80%', left: '10%', animationDelay: '6s' }}>🦋</div>
      <div className="floating-flower" style={{ top: '25%', left: '85%', animationDelay: '8s' }}>🌺</div>
"""

content = content.replace('{/* Top Header with Behance-inspired greeting */}', floating_elements + '\n      {/* Top Header with Behance-inspired greeting */}')

with open('src/pages/PatientDashboard.jsx', 'w') as f:
    f.write(content)
